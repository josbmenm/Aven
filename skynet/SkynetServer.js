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
  createStreamDoc,
  createSyntheticDoc,
} from '../cloud-core/Kite';
import { CloudContext } from '../cloud-core/KiteReact';
import createFSClient from '../cloud-server/createFSClient';

import { getConnectionToken, capturePayment } from '../stripe-server/Stripe';
import OrderReducer from '../logic/OrderReducer';
import DevicesReducer from '../logic/DevicesReducer';
import getIdOfValue from '../cloud-utils/getIdOfValue';

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
import { HostContext } from '../cloud-core/HostContext';
import { companyConfigToKitchenConfig } from '../logic/MachineLogic';
import RecentOrders from '../logic/RecentOrders';
import DropScheduler from '../logic/DropScheduler';
import HistoricalTransactions from '../logic/HistoricalTransactions';
import { defineCloudReducer } from '../cloud-core/KiteReact';
import { companyConfigToMenu } from '../logic/configLogic';
import {
  streamOfValue,
  createProducerStream,
  combineStreams,
  combineLoadedStreams,
} from '../cloud-core/createMemoryStream';
import { Storage } from '@google-cloud/storage';
import { log, trace, error, setLogger } from '../logger/logger';
import { logElastic } from './ElasticLogger';

if (process.env.NODE_ENV === 'production') {
  setLogger(logElastic);
}

const NOTIF_EMAIL =
  process.env.NODE_ENV === 'production'
    ? 'aloha@onofood.co'
    : 'eric@onofood.co';
const EXTERN_HOST =
  process.env.NODE_ENV === 'production'
    ? 'https://onoblends.co'
    : 'http://localhost:8840';
const path = require('path');
const pathJoin = require('path').join;
const md5 = require('crypto-js/md5');
const geoip = require('geoip-lite');

const fs = require('fs');
const getEnv = c => process.env[c];

function getMemoryConsumptionMB() {
  return (process.memoryUsage().heapUsed / 1000000).toFixed(2);
}
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
    acceptableEmailRegex: /.*@onofood.co$/,
    getMessage: async (authCode, verifyInfo, accountId) => {
      const subject = 'Welcome to Ono Blends';

      const message = `To log in, your code is ${authCode}`;

      return { subject, message };
    },
  });

  const rootAuthProvider = RootAuthProvider({
    rootPasswordHash: await hashSecureString(ONO_ROOT_PASSWORD),
  });

  const internalCloud = createSessionClient({
    source: storageSource,
    domain: 'onofood.co',
    auth: null,
  });

  internalCloud.docs.setOverride(
    'OrderState',
    createSyntheticDoc({
      onCreateChild: orderId => {
        return createReducedDoc({
          actions: cloudOrders.children.get(orderId),
          reducer: OrderReducer,
          onGetName: () => `OrderState/${orderId}`,
          domain: 'onofood.co',
          onCreateChild: childName => {
            return null;
          },
        });
      },
    }),
  );

  const airtableFolder = internalCloud.docs.get('Airtable');
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
  const companyConfig = internalCloud.docs.setOverrideValueStream(
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
  internalCloud.docs.setOverrideValueStream(
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

  const companyActivity = internalCloud.docs.get('CompanyActivity');

  const cloudOrders = internalCloud.get('Orders');

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

  const historicalCompanyActivity = internalCloud.setReducer(
    'CompanyActivityHistorical',
    {
      actionsDoc: companyActivity,
      reducer: HistoricalTransactions,
      snapshotInterval: 10,
      snapshotsDoc: internalCloud.get('CompanyActivityHistorical-Snapshot'),
    },
  );

  internalCloud.docs.setOverride(
    'CompanyActivityDays',
    createSyntheticDoc({
      onCreateChild: dateStr => {
        const matchedDate = dateStr.match(/^(\d\d\d\d)-(\d\d)-(\d\d)$/);
        if (!matchedDate) {
          return null;
        }
        const year = matchedDate[1];
        const month = matchedDate[2];
        const day = matchedDate[3];
        return createStreamDoc(
          historicalCompanyActivity.idAndValue.map(histState => {
            const y = histState.value && histState.value[year];
            const m = y && y[month];
            const d = m && m[day];
            return d;
          }),
          'onofood.co',
          () => `CompanyActivityDays/${dateStr}`,
          () => null,
        );
      },
    }),
  );

  internalCloud.docs.setOverride(
    'OrderDays',
    createSyntheticDoc({
      onCreateChild: dateStr => {
        const matchedDate = dateStr.match(/^(\d\d\d\d)-(\d\d)-(\d\d)$/);
        if (!matchedDate) {
          return null;
        }
        const dayActivities = internalCloud.docs.get(
          `CompanyActivityDays/${dateStr}`,
        );
        return createStreamDoc(
          dayActivities.idAndValue
            .map(dayEvents => {
              const valueStreams = {};
              let i = 0;
              if (!dayEvents) return streamOfValue({ id: null, value: null });
              dayEvents.forEach(evt => {
                valueStreams[i] = companyActivity.getBlock(evt.actionDoc.id);
                i += 1;
              });
              return combineLoadedStreams(valueStreams).map(results => {
                return { id: getIdOfValue(results).id, value: results };
              });
            })
            .flatten(),
          'onofood.co',
          () => `OrderDays/${dateStr}`,
          () => null,
        );
      },
    }),
  );

  function accumulateOrderRevenue(action, bucket) {
    if (action.type !== 'KioskOrder') {
      return;
    }
    const total = action.confirmedOrder.total;

    bucket.count = bucket.count ? bucket.count + 1 : 1;
    bucket.revenue = bucket.revenue ? bucket.revenue + total : total;
  }
  function createMagicWhenDoc({ name, from, aggregate, extract, domain }) {
    const resultWhenDoc = createSyntheticDoc({
      onCreateChild: dateStr => {
        const matchedDate = dateStr.match(/^(\d\d\d\d)-(\d\d)-(\d\d)$/);
        if (matchedDate) {
          return createDayStreamDoc(dateStr);
        }
        const matchedMonth = dateStr.match(/^(\d\d\d\d)-(\d\d)$/);
        if (matchedMonth) {
          return createMonthStreamDoc(matchedMonth[1], matchedMonth[2]);
        }
        const matchedYear = dateStr.match(/^(\d\d\d\d)$/);
        if (matchedYear) {
          return createYearStreamDoc(matchedYear[1]);
        }
        return null;
      },
    });

    function createDayStreamDoc(dateStr) {
      const dailyResults = from.children.get(dateStr);
      return createStreamDoc(
        dailyResults.idAndValue.map(activities => {
          const results = { dateStr };
          activities.value &&
            Object.values(activities.value).forEach(actionDocValue => {
              const action = actionDocValue.value;
              if (!action) return; // todo, figure out these empty values
              extract(results, action.value, action.id, dateStr);
            });
          return { id: getIdOfValue(results).id, value: results };
        }),
        domain,
        () => `${name}/${dateStr}`,
        () => null,
      );
    }
    function createMonthStreamDoc(yearStr, monthStr) {
      let date = 1;
      const dayStreams = {};
      while (
        !Number.isNaN(
          new Date(
            `${yearStr}-${monthStr}-${String(date).padStart(2, '0')}`,
          ).getMonth(),
        )
      ) {
        dayStreams[date] = resultWhenDoc.children.get(
          `${yearStr}-${monthStr}-${String(date).padStart(2, '0')}`,
        ).idAndValue;
        date += 1;
      }
      const values = combineLoadedStreams(dayStreams);
      const streamIdAndValue = values.map(streamResults => {
        const results = {};
        Object.values(streamResults).forEach(dayIdAndValue => {
          aggregate(results, dayIdAndValue.value, dayIdAndValue.id, 'month');
        });
        return {
          value: results,
          id: getIdOfValue(results).id,
        };
      });
      return createStreamDoc(streamIdAndValue);
    }

    function createYearStreamDoc(yearStr) {
      let month = 1;
      const monthStreams = {};
      while (month <= 12) {
        monthStreams[month] = resultWhenDoc.children.get(
          `${yearStr}-${String(month).padStart(2, '0')}`,
        ).idAndValue;
        month += 1;
      }
      const values = combineLoadedStreams(monthStreams);
      const streamIdAndValue = values.map(streamResults => {
        const results = {};
        Object.values(streamResults).forEach(monthIdAndValue => {
          aggregate(results, monthIdAndValue.value, monthIdAndValue.id, 'year');
        });
        return {
          value: results,
          id: getIdOfValue(results).id,
        };
      });
      return createStreamDoc(streamIdAndValue);
    }

    return resultWhenDoc;
  }

  internalCloud.docs.setOverride(
    'OrdersWhen',
    createMagicWhenDoc({
      name: 'OrdersWhen',
      from: internalCloud.docs.get('OrderDays'),
      domain: 'onofood.co',
      aggregate: (results, event, _actionId) => {
        if (!results.orders) {
          results.orders = [];
        }
        event.orders &&
          event.orders.forEach(o => {
            results.orders.push(o);
          });
      },
      extract: (results, action, _actionId) => {
        if (action.type !== 'KioskOrder') return;
        const orderId = action.confirmedOrderDocName;
        const { total, totalBeforeDiscount } = action.confirmedOrder;
        const promoCode =
          action.confirmedOrder.promo && action.confirmedOrder.promo.promoCode;
        const { firstName, lastName } = action.confirmedOrder.orderName;
        const cardFingerprint =
          action.confirmedOrder.stripeIntent &&
          action.confirmedOrder.stripeIntent.cardFingerprint;
        const items = action.confirmedOrder.items.map(i => ({
          name: i.displayName,
          type: i.type,
          menuItemId: i.menuItemId,
          quantity: i.quantity,
          itemPrice: i.itemPrice,
        }));
        if (!results.orders) {
          results.orders = [];
        }
        results.orders.push({
          time: action.dispatchTime,
          orderId,
          items,
          totalBeforeDiscount,
          total,
          promoCode,
          cardFingerprint,
          name: `${firstName} ${lastName}`,
        });
      },
    }),
  );

  const dayDuration = 24 * 60 * 60 * 1000;
  const hourDuration = 60 * 60 * 1000;
  internalCloud.docs.setOverride(
    'RevenueWhen',
    createMagicWhenDoc({
      name: 'RevenueWhen',
      from: internalCloud.docs.get('OrderDays'),
      domain: 'onofood.co',
      aggregate: (results, event, _actionId, whenName) => {
        const intervals = results.intervals || (results.intervals = []);
        intervals.push({
          ...event.totals,
          time: event.time,
          whenName: event.whenName,
        });
        // if (!results.totals) {
        //   results.totals = {};
        // }
      },
      extract: (results, action, _actionId, dateStr) => {
        if (!results.totals) {
          results.totals = {};
        }
        accumulateOrderRevenue(action, results.totals);
        const dayStart = new Date(dateStr).getTime();
        if (!results.time) {
          results.time = dayStart;
        }
        results.whenName = 'day';
        if (!results.intervals) {
          results.intervals = [];
          let walkTimeInterval = dayStart;
          while (walkTimeInterval < dayStart + dayDuration) {
            results.intervals.push({
              whenName: 'hour',
              time: walkTimeInterval,
            });
            walkTimeInterval += hourDuration;
          }
        }
        const time = new Date(action.dispatchTime);
        if (
          time.getTime() > dayDuration + dayStart ||
          time.getTime() < dayStart
        ) {
          error('Event is in wrong day');
          return;
        }

        const timeOfDay = time.getTime() - dayStart;
        const intervalIndex = Math.floor(timeOfDay / hourDuration);
        const interval = results.intervals[intervalIndex];
        if (!interval) {
          error('Unknown interval', intervalIndex, time.getTime(), {
            dayStart,
            hourDuration,
            time: time.getTime(),
          });
          return;
        }
        accumulateOrderRevenue(action, interval);
      },
    }),
  );

  internalCloud.setReducer('RecentOrders', {
    actionsDoc: companyActivity,
    reducer: RecentOrders,
    snapshotInterval: 10,
    snapshotsDoc: internalCloud.get('RecentOrdersSnapshot'),
  });

  const dropScheduleActions = internalCloud.get('Drops/ScheduleActions');

  function idAndValueStream(valueStream) {
    return valueStream.map(value => ({
      id: getIdOfValue(value).id,
      value,
    }));
  }

  const dropScheduleDoc = internalCloud.setReducer('DropSchedule', {
    actionsDoc: dropScheduleActions,
    reducer: DropScheduler,
    snapshotInterval: 10,
    snapshotsDoc: internalCloud.get('DropScheduleSnapshot'),
  });

  internalCloud.docs.setOverride(
    'DropSpotSchedule',
    createSyntheticDoc({
      onCreateChild: spotId => {
        if (spotId === '_auth') return null;
        return createStreamDoc(
          idAndValueStream(
            dropScheduleDoc.value.map(dropSchedule => {
              return {
                scheduled: dropSchedule.scheduled.filter(
                  drop => drop.spotId === spotId,
                ),
              };
            }),
          ),
          'onofood.co',
          () => `DropSpotSchedule/${spotId}`,
        );
      },
    }),
  );

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

  const jobApplications = internalCloud.docs.get('JobApplications');
  jobApplications.handleReports((reportType, report) => {
    if (reportType === 'PutDoc') {
      jobApplications
        .getBlock(report.id)
        .value.load()
        .then(blockValue => {
          const action = blockValue.value;
          emailAgent.actions.SendEmail({
            to: NOTIF_EMAIL,
            subject: `Job application for ${action.role.roleName}`,
            messageHTML: `
<p>Name: ${action.name}</p>
<p>Email: ${action.email}</p>
<p>Phone: ${action.phone}</p>
<hr />
<p>Resume: </p>
${action.files
  .map(
    file => `
<p><a clicktracking=off href="${EXTERN_HOST}/_/onofood.co/JobApplications:${file.fileData.id}">${file.fileName}</a></p>
`,
  )
  .join('')}
<hr />
<p>GitHub URL: <a clicktracking=off href="${action.github}">${
              action.github
            }</a></p>
<p>LinkedIn URL: <a clicktracking=off href="${action.linkedin}">${
              action.linkedin
            }</a></p>
<p>Portfolio URL: <a clicktracking=off href="${action.portfolio}">${
              action.portfolio
            }</a></p>
<hr />
<p>Comments:</p>
<p>${action.comments}</p>
<hr />
Debug: ${JSON.stringify(blockValue)}
      `,
          });
        })
        .then(() => {
          log('JobAppSent');
        })
        .catch(err => {
          console.error(err);
        });
    }
  });
  // function getBrokenPromoStream() {
  //   let runningNotifier = null;
  //   let workTimeout = null;
  //   let currentJob = null;
  //   let currentActivity = null;
  //   const jobs = [];
  //   const badOrders = [];
  //   function scheduleOrderLookup(orderTx) {
  //     if (orderTx.on && orderTx.on.id) {
  //       scheduleWork({ type: 'lookup', id: orderTx.on.id });
  //     } else {
  //       console.log('DONE!!');
  //     }
  //     const order = orderTx.value.confirmedOrder;
  //     const { total, stripeIntent } = order;
  //     if (!stripeIntent) return;
  //     const charge = stripeIntent.charges.data[0];
  //     if (charge.amount === total) {
  //       // console.log('---- ' + order.id);
  //     } else {
  //       badOrders.push(order);
  //       console.log('!!!! ' + order.id + ' ' + stripeIntent.id);
  //     }
  //   }
  //   async function doWorkStep(job) {
  //     if (job.type === 'start') {
  //       currentActivity = await companyActivity.value.load();
  //       scheduleOrderLookup(currentActivity);
  //     } else if (job.type === 'lookup') {
  //       const activityBlock = await companyActivity
  //         .getBlock(job.id)
  //         .value.load();
  //       scheduleOrderLookup(activityBlock);
  //     }
  //     const update = {
  //       badOrders,
  //     };
  //     runningNotifier && runningNotifier.next(update);
  //   }
  //   function doWork() {
  //     if (!runningNotifier) return;
  //     const job = jobs.shift();
  //     if (!job) return;
  //     currentJob = doWorkStep(job);
  //     currentJob.then(() => {
  //       clearTimeout(workTimeout);
  //       workTimeout = setTimeout(doWork, 0);
  //     });
  //   }
  //   function scheduleWork(job) {
  //     if (!runningNotifier) return;
  //     jobs.push(job);
  //     clearTimeout(workTimeout);
  //     workTimeout = setTimeout(doWork, 0);
  //   }
  //   const brokenPromoStream = createProducerStream({
  //     crumb: 'brokeomoso',
  //     start: notify => {
  //       runningNotifier = notify;
  //       scheduleWork({ type: 'start' });
  //     },
  //     stop: () => {
  //       // runningNotifier = null;
  //     },
  //   });
  //   return brokenPromoStream;
  // }
  // internalCloud.docs.setOverrideValueStream(
  //   'BrokenPromos',
  //   getBrokenPromoStream(),
  // );

  internalCloud.setReducer('FeedbackSummary', {
    actionsDoc: companyActivity,
    reducer: defineCloudReducer(
      'FeedbackSummary_a03',
      (prevState = {}, action) => {
        const lastCount = prevState.feedbackCount || 0;
        const allFeedback = { ...prevState.allFeedback } || {};
        if (action.type === 'CustomerFeedback') {
          if (action.email.match(/\@onofood.co$/)) {
            return prevState;
          }
          const t = new Date(action.time);
          const { year, month, date } = timeIntToPSTDate(action.time);
          const dayString = `${year}-${month}-${date}`;
          const day = allFeedback[dayString] || {
            year,
            month,
            date,
          };
          const sums = day.sums ? { ...day.sums } : {};
          Object.entries(action.feedback).map(([feedbackTagName, value]) => {
            if (feedbackTagName === 'tags') return;
            if (sums[feedbackTagName]) {
              sums[feedbackTagName] += value;
            } else {
              sums[feedbackTagName] = value;
            }
          });
          allFeedback[dayString] = {
            ...day,
            sums,
            dayCount: 1 + (day.dayCount || 0),
            feedbacks: [
              ...(day.feedbacks || []),
              { ...action.feedback, email: action.email, time: action.time },
            ],
          };
          return { ...prevState, feedbackCount: lastCount + 1, allFeedback };
        }
        return prevState;
      },
      {},
    ),
    snapshotInterval: 10,
    snapshotsDoc: internalCloud.get('FeedbackSummarySnapshot-a02'),
  });

  const kitchenConfig = internalCloud.docs.setOverrideValueStream(
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
  const menu = internalCloud.docs.setOverrideValueStream(
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

  internalCloud.setReducer('DevicesState', {
    actionsDoc: internalCloud.get('DeviceActions'),
    reducer: DevicesReducer,
    snapshotInterval: 10,
    snapshotsDoc: internalCloud.get('DevicesStateSnapshot'),
  });

  const onoEmployeeSelector = {
    type: 'EmailRegex',
    emailRegexMatch: '.*@onofood.co$',
  };
  const canReadRule = { canRead: true };
  const canAdminRule = { canAdmin: true };
  const onoEmployeeCanReadSelector = {
    ...onoEmployeeSelector,
    rule: canReadRule,
  };
  const protectedSource = createProtectedSource({
    source: internalCloud,
    staticPermissions: {
      'onofood.co': {
        CompanyActivityHistorical: {
          selector: onoEmployeeCanReadSelector,
        },
        CompanyConfig: {
          selector: onoEmployeeCanReadSelector,
        },
        Menu: {
          selector: {
            ...onoEmployeeSelector,
            rule: { canWrite: true, canRead: true },
          },
        },
        Drops: {
          selector: {
            ...onoEmployeeSelector,
            rule: { canAdmin: true },
          },
        },
        DropSchedule: {
          selector: onoEmployeeCanReadSelector,
        },
        DropSpotSchedule: {
          children: {
            selector: onoEmployeeCanReadSelector,
          },
        },
        DropSpots: {
          selector: {
            ...onoEmployeeSelector,
            rule: { canAdmin: true },
          },
        },
        CompanyActivityDays: {
          children: {
            selector: onoEmployeeCanReadSelector,
          },
        },
        OrdersWhen: {
          children: {
            selector: onoEmployeeCanReadSelector,
          },
        },
        RevenueWhen: {
          children: {
            selector: onoEmployeeCanReadSelector,
          },
        },
        OrderDays: {
          children: {
            selector: onoEmployeeCanReadSelector,
          },
        },
        JobApplications: { defaultRule: { canRead: true, canTransact: true } },
        WebMenu: { defaultRule: canReadRule },
        DevicesState: { defaultRule: canReadRule },
        Devices: {
          children: {
            defaultRule: canReadRule,
          },
        },
        DeviceActions: { defaultRule: { canTransact: true } },
        // KitchenConfig: { ono: { canRead: true } },
        OrderState: {
          children: { defaultRule: canReadRule },
        },
        FeedbackSummary: {
          selector: {
            ...onoEmployeeSelector,
            rule: canAdminRule,
          },
        },
        HistoricalOrders: {},
      },
    },
    providers: [smsAuthProvider, emailAuthProvider, rootAuthProvider],
  });

  const fsClient = createFSClient({ client: internalCloud });

  const context = new Map();
  context.set(HostContext, { authority: 'onoblends.co', useSSL: !IS_DEV });

  async function placeOrder({ orderId }) {
    throw new Error('Cannot place order on skynet! Use verse');
  }

  let shouldUploadImmediately = false;
  // shouldUploadImmediately = true;

  const startAirtableScrape = () => {
    log('WillUpdateAirtable', {
      serviceHeapSizeMB: getMemoryConsumptionMB(),
    });
    scrapeAirTable(fsClient)
      .then(() => {
        log('DidUpdateAirtable', {
          serviceHeapSizeMB: getMemoryConsumptionMB(),
        });
      })
      .catch(e => {
        console.error(e);
        error('AirtableUpdateError', {
          serviceHeapSizeMB: getMemoryConsumptionMB(),
          error: e,
        });
      });
  };
  shouldUploadImmediately && startAirtableScrape();
  setInterval(
    startAirtableScrape,
    10 * 60 * 1000, // 10 minutes
  );

  const bookingRequests = internalCloud.get('BookingRequests');
  async function requestBooking(action) {
    await bookingRequests.putTransactionValue(action);
    const {
      firstName,
      lastName,
      email,
      attendance,
      date,
      address,
      comments,
      duration,
    } = action.request;
    await emailAgent.actions.SendEmail({
      to: NOTIF_EMAIL,
      subject: 'New booking request on onoblends.co',
      message: `
Name: ${firstName} ${lastName}

Email: ${email}

Attendance: ${attendance}

Date: ${date}

Duration: ${duration}

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
          cloud: internalCloud,
          smsAgent,
          emailAgent,
          action,
        });
      case 'RefundOrder': // todo check for root/employee auth. right now this is top secret!
        return await refundOrder({
          cloud: internalCloud,
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
        return validatePromoCode(internalCloud, action);
      case 'SubmitFeedback':
        return submitFeedback(internalCloud, emailAgent, action);
      case 'UpdateAirtable': {
        scrapeAirTable(fsClient)
          .then(() => {})
          .catch(e => {
            console.error(e);
            error('AirtableUpdateError', {
              serviceHeapSizeMB: getMemoryConsumptionMB(),
              error: e,
            });
          });
        return {};
      }
      default:
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
    mainDomain: domain,
    App,
    source: {
      ...protectedSource,
      dispatch,
    },
    sourceDomain: 'onofood.co',
    expressRouting: app => {
      app.use((req, res, next) => {
        if (
          req.headers.host === 'onofood.co' ||
          req.headers.host === 'skynet.onoblends.co'
        ) {
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
  log('WebServerReady', { serverListenLocation });

  return {
    ...webService,
    close: async () => {
      await protectedSource.close();
      await internalCloud.close();
      await webService.close();
    },
  };
}
