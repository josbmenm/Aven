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
import { defineCloudReducer } from '../cloud-core/KiteReact';
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

const gTokenPath = pathJoin('gToken.json');
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
    ssl: getEnv('SQL_USE_SSL')
      ? {
          rejectUnauthorized: false,
        }
      : false,
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
  const companyConfigStream = airtableFolder.value
    .map(folder => {
      if (!folder) {
        return streamOfValue(null);
      }
      const blockId = folder.files['db.json'].id;
      const directoryBlockId = folder.files['files'].id;
      const block = airtableFolder.getBlock(blockId);
      const directoryBlock = airtableFolder.getBlock(directoryBlockId);
      return combineStreams({
        atData: block.value,
        directory: directoryBlock.value,
      }).map(({ atData, directory }) => {
        if (!atData || !directory) {
          return null;
        }
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
          days[dayId] = days[dayId] || {
            key: dayId,
            name: DAY_NAMES[dayId],
            stops: [],
          };
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
              confirmedOrderId: orderDocState.id,
              confirmedOrderDocName: report.name,
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

  function timeIntToPSTDate(timeInt) {
    const tDefault = new Date(timeInt);
    const pstMinuteOffset = 480 - tDefault.getTimezoneOffset();
    const pstTime = new Date(timeInt - pstMinuteOffset * 1000 * 60);
    return {
      year: pstTime.getFullYear(),
      month: pstTime.getMonth() + 1,
      date: pstTime.getDate(),
    };
  }

  // cloud.setReducer('FeedbackSummary', {
  //   actionsDoc: companyActivity,
  //   reducer: defineCloudReducer(
  //     'FeedbackSummary_a03',
  //     (prevState = {}, action) => {
  //       const lastCount = prevState.feedbackCount || 0;
  //       const allFeedback = { ...prevState.allFeedback } || {};
  //       if (action.type === 'CustomerFeedback') {
  //         if (action.email.match(/\@onofood.co$/)) {
  //           return prevState;
  //         }
  //         const t = new Date(action.time);
  //         const { year, month, date } = timeIntToPSTDate(action.time);
  //         const dayString = `${year}-${month}-${date}`;
  //         const day = allFeedback[dayString] || {
  //           year,
  //           month,
  //           date,
  //         };
  //         const sums = day.sums ? { ...day.sums } : {};
  //         Object.entries(action.feedback).map(([feedbackTagName, value]) => {
  //           if (feedbackTagName === 'tags') return;
  //           if (sums[feedbackTagName]) {
  //             sums[feedbackTagName] += value;
  //           } else {
  //             sums[feedbackTagName] = value;
  //           }
  //         });
  //         allFeedback[dayString] = {
  //           ...day,
  //           sums,
  //           dayCount: 1 + (day.dayCount || 0),
  //           feedbacks: [
  //             ...(day.feedbacks || []),
  //             { ...action.feedback, email: action.email, time: action.time },
  //           ],
  //         };
  //         return { ...prevState, feedbackCount: lastCount + 1, allFeedback };
  //       }
  //       return prevState;
  //     },
  //     {},
  //   ),
  //   snapshotInterval: 10,
  //   snapshotsDoc: cloud.get('FeedbackSummarySnapshot-a02'),
  // });

  const kitchenConfig = cloud.docs.setOverrideValueStream(
    'KitchenConfig',
    companyConfigStream.map(companyConfig => {
      return companyConfigToKitchenConfig(companyConfig);
    }),
  );

  function unique(arr) {
    const out = [];
    arr.forEach(item => {
      if (out.indexOf(item) === -1) out.push(item);
    });
    return out;
  }
  const menu = cloud.docs.setOverrideValueStream(
    'WebMenu',
    companyConfigStream.map(companyConfig => {
      if (!companyConfig) return null;
      const { baseTables, baseFiles } = companyConfig;
      function prepareImage(img) {
        if (!img) return null;
        const { ref } = img[0];
        return [{ ref }];
      }
      const blends = Object.entries(baseTables.KioskBlendMenu)
        .filter(([_, menuItem]) => {
          return !!menuItem['Available on Website'];
        })
        .map(([_, menuItem]) => {
          const baseRecipe = baseTables.Recipes[menuItem.Recipe[0]];
          function prepareBenefit(bId) {
            if (!bId) return null;
            const baseBenefit = baseTables.Benefits[bId];
            const benefit = {
              id: baseBenefit.id,
              name: baseBenefit.Name,
              description: baseBenefit.Description,
              icon: prepareImage(baseBenefit.Icon),
            };
            return benefit;
          }
          const defaultBenefitId =
            baseRecipe.DefaultBenefit && baseRecipe.DefaultBenefit[0];
          const defaultBenefit =
            defaultBenefitId && baseTables.Benefits[defaultBenefitId];
          const defaultBenefitIngredientId =
            defaultBenefit &&
            defaultBenefit['Benefit Ingredient'] &&
            defaultBenefit['Benefit Ingredient'][0];
          const allBenefits = defaultBenefitId ? [defaultBenefitId] : [];
          const ingredientIds = unique([
            defaultBenefitIngredientId,
            ...baseRecipe.Ingredients.map(recIngId => {
              const recipeIng = baseTables.RecipeIngredients[recIngId];
              const ingredientId =
                recipeIng.Ingredient && recipeIng.Ingredient[0];
              return ingredientId;
            }).filter(Boolean),
            baseRecipe.LiquidBaseIngredient[0],
          ]);
          const ingredients = ingredientIds.map(ingredientId => {
            const ing = baseTables.Ingredients[ingredientId];
            ing['Benefits'] &&
              ing['Benefits'].forEach(benefitId => {
                if (allBenefits.indexOf(benefitId) === -1) {
                  allBenefits.push(benefitId);
                }
              });
            const { Name, Image } = ing;
            return { Name, Image: prepareImage(Image) };
          });
          const dietaryInfos = Object.entries(baseTables.Dietary)
            .filter(([dietId, diet]) => {
              if (diet['Applies To All Ingredients']) {
                return true;
              }
              if (!diet.Ingredients) {
                return false;
              }
              if (
                ingredientIds.find(
                  ingId => diet.Ingredients.indexOf(ingId) === -1,
                )
              ) {
                return false;
              }
              return true;
            })
            .map(([dietId, diet]) => {
              return {
                id: diet.id,
                Icon: prepareImage(diet.Icon),
                Name: diet.Name,
              };
            });

          return {
            name: menuItem['Display Name'],
            description: menuItem['Display Description'],
            slug: menuItem.Slug,
            id: menuItem.id,
            nutrition: baseRecipe['Nutrition Detail'],
            calories: baseRecipe['DisplayCalories'],
            color: baseRecipe['Color'],
            image: prepareImage(baseRecipe['Recipe Image']),
            decorImage: prepareImage(baseRecipe['DecorationImage']),
            aloneImage: prepareImage(baseRecipe['StandaloneImage']),
            benefit: prepareBenefit(defaultBenefitId),
            allBenefits: allBenefits.map(prepareBenefit),
            ingredients,
            dietaryInfos,
          };
        });
      return {
        blends,
      };
    }),
  );

  cloud.setReducer('DevicesState', {
    actionsDoc: cloud.get('DeviceActions'),
    reducer: DevicesReducer,
    snapshotInterval: 10,
    snapshotsDoc: cloud.get('DevicesStateSnapshot'),
  });

  const protectedSource = createProtectedSource({
    source: cloud,
    staticPermissions: {
      'onofood.co': {
        WebMenu: { defaultRule: { canRead: true } },
        DevicesState: { defaultRule: { canRead: true } },
        DeviceActions: { defaultRule: { canTransact: true } },
        OrderState: {
          children: { defaultRule: { canRead: true } },
        },
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
      to: 'eric@onofood.co',
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
        // return await cloud.dispatch(action);
        return await protectedSource.dispatch(action);
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

  const serverListenLocation = getEnv('LISTEN_PATH')
    ? {
        path: getEnv('LISTEN_PATH'),
      }
    : {
        host: getEnv('LISTEN_HOST'),
        port: getEnv('LISTEN_PORT') || getEnv('PORT'),
      };

  const webService = await attachWebServer({
    httpServer,
    context,
    screenProps: { cloud },
    mainDomain: domain,
    App,
    source: {
      ...protectedSource,
      // ...cloud,
      dispatch,
    },
    expressRouting: app => {
      app.use((req, res, next) => {
        if (req.headers.host === 'onofood.co') {
          res.redirect(`https://onoblends.co${req.originalUrl}`);
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
    publicDir: `${__dirname}/public`,
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
