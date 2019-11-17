import App from './SkynetApp';
import attachWebServer from '../aven-web/attachWebServer';
import { IS_DEV } from '../aven-web/config';
import startPostgresStorageSource from '../cloud-postgres/startPostgresStorageSource';
import createMemoryStorageSource from '../cloud-core/createMemoryStorageSource';
import scrapeAirTable from './scrapeAirTable';
import {
  createSessionClient,
  createReducerStream,
  createReducedDoc,
  createSyntheticDoc,
} from '../cloud-core/Kite';
import { CloudContext } from '../cloud-core/KiteReact';
import createFSClient from '../cloud-server/createFSClient';

import { getConnectionToken, capturePayment } from '../stripe-server/Stripe';
import OrderReducer from '../logic/OrderReducer';
import DevicesReducer from '../logic/DevicesReducer';

import sendReceipt from './sendReceipt';
import refundOrder from './refundOrder';
import { hashSecureString } from '../cloud-utils/Crypto';
import EmailAgent from '../email-agent-sendgrid/EmailAgent';
import SMSAgent from '../sms-agent-twilio/SMSAgent';
import SMSAuthProvider from '../cloud-auth-sms/SMSAuthProvider';
import EmailAuthProvider from '../cloud-auth-email/EmailAuthProvider';
import RootAuthProvider from '../cloud-auth-root/RootAuthProvider';
import createProtectedSource from '../cloud-auth/createProtectedSource';
import submitFeedback from './submitFeedback';
import validatePromoCode from './validatePromoCode';
import { HostContext } from '../components/AirtableImage';
import { companyConfigToKitchenConfig } from '../logic/MachineLogic';
import RecentOrders from '../logic/RecentOrders';
import { companyConfigToMenu } from '../logic/configLogic';
import {
  streamOfValue,
  combineStreams,
} from '../cloud-core/createMemoryStream';
import { Storage } from '@google-cloud/storage';
import { log, trace, error, setLogger } from '../logger/logger';
import { logElastic } from './ElasticLogger';

if (process.env.NODE_ENV === 'production') {
  setLogger(logElastic);
}

const path = require('path');
const pathJoin = require('path').join;
const md5 = require('crypto-js/md5');
const geoip = require('geoip-lite');

const fs = require('fs');
const getEnv = c => process.env[c];

const gTokenPath = pathJoin(__dirname, 'gToken.json');
fs.writeFileSync(gTokenPath, Buffer.from(getEnv('GCS_TOKEN'), 'base64'));

const gcsStorage = new Storage({
  keyFilename: gTokenPath,
});
const gcsBucket = gcsStorage.bucket(getEnv('GCS_BUCKET'));

const ONO_ROOT_PASSWORD = getEnv('ONO_ROOT_PASSWORD');

export default async function startSkynetServer(httpServer) {
  log('WillStartServer', {
    serverType: 'skynet',
    nodeEnv: process.env.NODE_ENV,
  });

  const domain = 'onofood.co';

  const pgConfig = {
    ssl: true,
    user: getEnv('SQL_USER'),
    password: getEnv('SQL_PASSWORD'),
    database: getEnv('SQL_DATABASE'),
    host: getEnv('SQL_HOST'),
  };

  // const storageSource = createMemoryStorageSource({ domain });

  const storageSource = await startPostgresStorageSource({
    domains: [domain],
    config: {
      client: 'pg',
      connection: pgConfig,
    },
    onLargeBlockSave: async (value, id, size, blockData) => {
      let fileValue = blockData;
      if (value.type === 'BinaryFileHex') {
        fileValue = Buffer.from(value.data, 'hex');
      }
      const theFile = gcsBucket.file(id);
      try {
        await theFile.save(fileValue, { contentType: value.contentType });
      } catch (e) {
        if (
          e.errors &&
          e.errors.length === 1 &&
          e.errors[0].reason === 'forbidden'
        ) {
          // known case, re-uploading duplicate is fine
        } else {
          console.error(
            `Failed to upload "${id}" block to google cloud, but continuing anyway!`,
          );
          console.error(e);
          // throw e;
        }
      }
    },
    onLargeBlockGet: async (id, domain, name) => {
      const theFile = gcsBucket.file(id);
      const [metadata] = await theFile.getMetadata();
      const [content] = await theFile.download();
      return {
        id,
        value: {
          type: 'BinaryFileHex',
          contentType: metadata.contentType,
          data: content.toString('hex'),
        },
      };
    },
  });

  const emailAgent = EmailAgent({
    defaultFromEmail: 'Ono Blends <aloha@onofood.co>',
    config: {
      sendgridAPIKey: getEnv('SENDGRID_API_KEY'),
    },
  });

  const smsAgent = SMSAgent({
    defaultFromNumber: getEnv('TWILIO_FROM_NUMBER'),
    config: {
      accountSid: getEnv('TWILIO_ACCOUNT_SID'),
      authToken: getEnv('TWILIO_AUTH_TOKEN'),
    },
  });

  const smsAuthProvider = SMSAuthProvider({
    agent: smsAgent,
    getMessage: (authCode, verifyInfo, accountId) => {
      if (verifyInfo.context === 'AppUpsell') {
        return `Welcome to Ono Blends. For a free Blend on your next visit, get the app here: https://onofood.co/app?v=${authCode}&a=${accountId}`;
      }
      return `ono authentication: ${authCode}`;
    },
  });

  const emailAuthProvider = EmailAuthProvider({
    agent: emailAgent,
    getMessage: async (authCode, verifyInfo, accountId) => {
      const subject = 'Welcome to Ono Blends';

      const message = `To log in, your code is ${authCode}`;

      return { subject, message };
    },
  });

  const rootAuthProvider = RootAuthProvider({
    rootPasswordHash: await hashSecureString(ONO_ROOT_PASSWORD),
  });

  const cloud = createSessionClient({
    source: storageSource,
    domain: 'onofood.co',
    auth: null,
  });

  cloud.docs.setOverride(
    'OrderState',
    createSyntheticDoc({
      onCreateChild: orderId => {
        return createReducedDoc({
          actions: cloudOrders.children.get(orderId),
          reducer: OrderReducer,
          onGetName: () => `OrderState/${orderId}`,
          domain: 'onofood.co',
        });
      },
    }),
  );

  const airtableFolder = cloud.docs.get('Airtable');
  const companyConfigStream = airtableFolder.value.stream
    .map(folder => {
      if (!folder) {
        return streamOfValue(null);
      }
      const blockId = folder.files['db.json'].id;
      const directoryBlockId = folder.files['files'].id;
      const block = airtableFolder.getBlock(blockId);
      const directoryBlock = airtableFolder.getBlock(directoryBlockId);
      return combineStreams({
        atData: block.value.stream,
        directory: directoryBlock.value.stream,
      }).map(({ atData, directory }) => {
        // below, we inject block refs for our Airtable images, by referring to the files directory
        const baseTables = Object.fromEntries(
          Object.entries(atData.baseTables).map(([tableName, table]) => {
            const tableWithRefs = Object.fromEntries(
              Object.entries(table).map(([rowId, row]) => {
                const rowWithRefs = Object.fromEntries(
                  Object.entries(row).map(([colName, cell]) => {
                    if (Array.isArray(cell) && cell[0] && cell[0].url) {
                      // ok, this is an image!
                      const cellWithRefs = cell.map(image => {
                        const ext = path.extname(image.url);
                        const fileName = `${md5(image.url).toString()}${ext}`;
                        const ref = directory.files[fileName];
                        return {
                          ...image,
                          ref,
                        };
                      });
                      return [colName, cellWithRefs];
                    }
                    return [colName, cell];
                  }),
                );
                return [rowId, rowWithRefs];
              }),
            );
            return [tableName, tableWithRefs];
          }),
        );
        return { ...atData, baseTables, directory };
      });
    })
    .flatten();
  const companyConfig = cloud.docs.setOverrideValueStream(
    'CompanyConfig',
    companyConfigStream,
  );

  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const DAY_NAMES = {
    Sun: 'Sunday',
    Mon: 'Monday',
    Tue: 'Tuesday',
    Wed: 'Wednesday',
    Thu: 'Thursday',
    Fri: 'Friday',
    Sat: 'Saturday',
  };
  cloud.docs.setOverrideValueStream(
    'RestaurantSchedule',
    companyConfigStream.map(config => {
      const schedule =
        config && config.baseTables && config.baseTables['Routing Schedule'];
      if (!schedule) {
        return [];
      }
      const days = {};
      Object.values(schedule).forEach(scheduleRow => {
        const { Enabled, Address, DaysOfWeek, Name } = scheduleRow;
        if (!Enabled) return;
        DAYS.forEach(dayId => {
          days[dayId] = { key: dayId, name: DAY_NAMES[dayId], stops: [] };
        });
        DaysOfWeek.forEach(dayId => {
          const start = new Date(scheduleRow['Start Time']);
          const end = new Date(scheduleRow['End Time']);
          const startHours = start.getHours() % 12;
          const startMinutes = `${start.getMinutes()}`.padStart(2, '0');
          const startAMPM = start.getHours() > 12 ? 'PM' : 'AM';
          const endHours = end.getHours() % 12;
          const endMinutes = `${end.getMinutes()}`.padStart(2, '0');
          const endAMPM = end.getHours() > 12 ? 'PM' : 'AM';
          days[dayId].stops.push({
            id: scheduleRow.id,
            name: Name,
            address: Address,
            start: scheduleRow['Start Time'],
            end: scheduleRow['End Time'],
            addressLink: scheduleRow['Maps Link'],
            timeText: `${startHours}:${startMinutes} ${startAMPM} - ${endHours}:${endMinutes} ${endAMPM}`,
          });
        });
      });
      return DAYS.map(dayId => days[dayId]);
    }),
  );

  const companyActivity = cloud.docs.get('CompanyActivity');

  const cloudOrders = cloud.get('Orders');

  cloudOrders.handleReports((reportType, report) => {
    trace('OrdersDataReport', reportType, report);
    if (reportType === 'PutDoc') {
      const doc = cloudOrders.children.get(report.name);
      doc.idAndValue
        .load()
        .then(orderDocState => {
          if (orderDocState.value.on === null) {
            // this is a new order
            const { order } = orderDocState.value.value;
            return {
              type: 'KioskOrder',
              confirmedOrder: order,
            };
          }
          return null;
        })
        .then(async action => {
          if (action) {
            await companyActivity.putTransactionValue(action);
          }
        })
        .catch(e => {
          error('OrderActivityError', { code: e.message, ...report });
        });
    }
  });

  cloud.setReducer('RecentOrders', {
    actionsDoc: companyActivity,
    reducer: RecentOrders,
    snapshotInterval: 10,
    snapshotsDoc: cloud.get('RecentOrdersSnapshot'),
  });

  const kitchenConfig = cloud.docs.setOverrideValueStream(
    'KitchenConfig',
    companyConfigStream.map(companyConfig => {
      return companyConfigToKitchenConfig(companyConfig);
    }),
  );

  const menu = cloud.docs.setOverrideValueStream(
    'Menu',
    companyConfigStream.map(companyConfigToMenu),
  );

  cloud.setReducer('DevicesState', {
    actionsDoc: cloud.get('DeviceActions'),
    reducer: DevicesReducer,
    snapshotInterval: 10,
    snapshotsDoc: cloud.get('DevicesStateSnapshot'),
  });

  // const deviceActions = cloud.get('DeviceActions');
  // const devicesState = cloud.docs.setOverrideStream(
  //   'DevicesState',
  //   createReducerStream(
  //     deviceActions,
  //     DevicesReducer.reducerFn,
  //     DevicesReducer.initialState,
  //   ),
  // );

  const protectedSource = createProtectedSource({
    source: cloud,
    staticPermissions: {
      'onofood.co': {
        CompanyConfig: { defaultRule: { canRead: true } },
        KitchenConfig: { defaultRule: { canRead: true } },
        DeviceActions: { defaultRule: { canWrite: true } },
        Menu: { defaultRule: { canRead: true } },
        PendingOrders: {
          defaultRule: {
            canPost: true,
            canWrite: true, // todo, disable write, very dangerous. posted docs are owned by original poster and should allow writes
          },
        },
        Airtable: { defaultRule: { canRead: true } },
        ConfirmedOrders: { defaultRule: { canRead: true } },
        RequestedLocations: { defaultRule: { canWrite: true } }, // todo, refactor to canTransact!!
        CustomerFeedback: { defaultRule: { canPost: true } },
      },
    },
    providers: [smsAuthProvider, emailAuthProvider, rootAuthProvider],
  });

  const fsClient = createFSClient({ client: cloud });

  const context = new Map();
  context.set(CloudContext, cloud); // bad idea, must have independent client for authentication!!!
  context.set(HostContext, { authority: 'onoblends.co', useSSL: !IS_DEV });

  async function placeOrder({ orderId }) {
    throw new Error('Cannot place order on skynet! Use verse');
  }

  let shouldUploadImmediately = false;
  // shouldUploadImmediately = true;

  const startAirtableScrape = () => {
    console.log('Updating Airtable..');
    console.log(
      (process.memoryUsage().heapUsed / 1000000).toFixed(2) +
        'MB Memory Consumption',
    );
    scrapeAirTable(fsClient)
      .then(() => {
        console.log('Airtable Update complete!');
        console.log(
          (process.memoryUsage().heapUsed / 1000000).toFixed(2) +
            'MB Memory Consumption',
        );
      })
      .catch(e => {
        console.error('Error Updating Airtable!');
        console.log(
          (process.memoryUsage().heapUsed / 1000000).toFixed(2) +
            'MB Memory Consumption',
        );

        console.error(e);
      });
  };
  shouldUploadImmediately && startAirtableScrape();
  setInterval(
    startAirtableScrape,
    10 * 60 * 1000, // 10 minutes
  );

  const bookingRequests = cloud.get('BookingRequests');
  async function requestBooking(action) {
    await bookingRequests.putTransactionValue(action);
    const {
      firstName,
      lastName,
      email,
      eventType,
      date,
      address,
      comments,
    } = action.request;
    await emailAgent.actions.SendEmail({
      to: 'aloha@onofood.co',
      subject: 'New booking request on onoblends.co',
      message: `
Name: ${firstName} ${lastName}

Email: ${email}

Event Type: ${eventType}

Date: ${date}

Place: ${address}


Comments: ${comments}


Any issues with this report? Contact eric@onofood.co

Debug: ${JSON.stringify(action)}
`,
    });
  }
  async function silentDispatch(action) {
    switch (action.type) {
      case 'SendReceipt':
        return await sendReceipt({
          cloud: cloud,
          smsAgent,
          emailAgent,
          action,
        });
      case 'RefundOrder': // todo check for root/employee auth. right now this is top secret!
        return await refundOrder({
          cloud: cloud,
          smsAgent,
          emailAgent,
          action,
        });
      case 'RequestBooking':
        return requestBooking(action);
      case 'PlaceOrder':
        return placeOrder(action);
      case 'StripeGetConnectionToken':
        return getConnectionToken(action);
      case 'StripeCapturePayment':
        return capturePayment(action);
      case 'ValidatePromoCode':
        return validatePromoCode(cloud, action);
      case 'SubmitFeedback':
        return submitFeedback(cloud, emailAgent, action);
      case 'UpdateAirtable': {
        scrapeAirTable(fsClient)
          .then(() => {
            console.log('Done with user-requested Airtable update');
          })
          .catch(e => {
            console.error('Error updating Airtable!', e);
          });
        return {};
      }
      default:
        return await cloud.dispatch(action);
      // return await protectedSource.dispatch(action);
    }
  }

  async function dispatch(action) {
    try {
      const response = await silentDispatch(action);
      log('DispatchedAction', {
        actionType: action.type,
        hasResponse: !!response,
      });
      return response;
    } catch (e) {
      error('DispatchedAction', { action, error: e.message, stack: e.stack });
      throw e;
    }
  }

  const serverListenLocation = getEnv('PORT');
  const webService = await attachWebServer({
    httpServer,
    context,
    screenProps: { cloud },
    mainDomain: domain,
    App,
    source: {
      // ...protectedSource,
      ...cloud,
      dispatch,
    },
    expressRouting: app => {
      app.use((req, res, next) => {
        if (req.headers.host === 'onofood.co') {
          res.redirect(`https://onoblends.co/${req.originalUrl}`);
          return;
        }
        next();
      });
    },
    augmentRequestDispatchAction: (req, action) => {
      const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
      return {
        ...action,
        geoip: geoip.lookup(ip),
      };
    },
    serverListenLocation,
    assets: require(process.env.RAZZLE_ASSETS_MANIFEST),
  });
  console.log('☁️️ Web Ready 🕸');

  return {
    ...webService,
    close: async () => {
      await protectedSource.close();
      await cloud.close();
      await webService.close();
    },
  };
}
