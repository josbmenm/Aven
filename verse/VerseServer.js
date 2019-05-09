import App from './App';
import WebServer from '../aven-web/WebServer';
import startPostgresStorageSource from '../cloud-postgres/startPostgresStorageSource';
// import createNodeNetworkSource from '../cloud-server/createNodeNetworkSource';
import createCloudClient from '../cloud-core/createCloudClient';
import createFSClient from '../cloud-server/createFSClient';
import CloudContext from '../cloud-core/CloudContext';
import { getSecretConfig, IS_DEV } from '../aven-web/config';
import scrapeAirTable from '../skynet/scrapeAirTable';
import { createReducerLambda } from '../cloud-core/useCloudReducer';
import KitchenCommands from '../logic/KitchenCommands';
import { hashSecureString } from '../cloud-utils/Crypto';
import EmailAgent from '../email-agent-sendgrid/EmailAgent';
import SMSAgent from '../sms-agent-twilio/SMSAgent';
import SMSAuthProvider from '../cloud-auth-sms/SMSAuthProvider';
import EmailAuthProvider from '../cloud-auth-email/EmailAuthProvider';
import createEvalSource from '../cloud-core/createEvalSource';
import RootAuthProvider from '../cloud-auth-root/RootAuthProvider';
import createProtectedSource from '../cloud-auth/createProtectedSource';
import sendReceipt from '../skynet/sendReceipt';
import RestaurantReducer from '../logic/RestaurantReducer';

import startKitchen, { computeKitchenConfig } from './startKitchen';
import { handleStripeAction } from '../stripe-server/Stripe';
import { computeNextStep } from '../logic/KitchenSequence';
import {
  companyConfigToBlendMenu,
  getOrderSummary,
  displayNameOfOrderItem,
  getSelectedIngredients,
} from '../logic/configLogic';

const COUNT_MAX = 2147483640; // near the maximum unsigned dint

let tagCounter = Math.floor(Math.random() * COUNT_MAX);

function getFreshTag() {
  tagCounter += 1;
  if (tagCounter > COUNT_MAX) {
    tagCounter = 0;
  }
  return tagCounter;
}

let lastT = null;
function logBehavior(msg) {
  const t = Date.now();
  let outMsg = `${t} `;
  if (lastT) {
    const deltaT = t - lastT;
    outMsg += `(${deltaT} ms since last) `;
  }
  outMsg += ' - ' + msg;
  lastT = t;
  console.log(outMsg);
}

const getEnv = c => process.env[c];

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const ROOT_PASSWORD = getEnv('ONO_ROOT_PASSWORD');

const startVerseServer = async () => {
  console.log('☁️ Starting Restaurant Server 💨 ');

  const pgConfig = {
    ssl: !!getEnv('SQL_USE_SSL'),
    user: getEnv('SQL_USER'),
    password: getEnv('SQL_PASSWORD'),
    database: getEnv('SQL_DATABASE'),
    host: getEnv('SQL_HOST'),
  };

  const storageSource = await startPostgresStorageSource({
    domains: ['onofood.co'],
    config: {
      client: 'pg',
      connection: pgConfig,
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
    rootPasswordHash: await hashSecureString(ROOT_PASSWORD),
  });

  const evalSource = createEvalSource({
    source: storageSource,
    domain: 'onofood.co',
    functions: [RestaurantReducer],
  });

  const cloud = createCloudClient({
    source: evalSource,
    domain: 'onofood.co',
  });

  const protectedSource = createProtectedSource({
    source: evalSource,
    providers: [smsAuthProvider, emailAuthProvider, rootAuthProvider],
  });

  const rootAuth = {
    accountId: 'root',
    verificationInfo: {},
    verificationResponse: { password: ROOT_PASSWORD },
  };

  async function putPermission({ name, defaultRule }) {
    await protectedSource.dispatch({
      domain: 'onofood.co',
      type: 'PutPermissionRules',
      auth: rootAuth,
      defaultRule,
      name,
    });
  }

  await putPermission({
    defaultRule: { canRead: true },
    name: 'Airtable',
  });

  await putPermission({
    defaultRule: { canWrite: true, canRead: true },
    name: 'RestaurantActions',
  });

  await putPermission({
    defaultRule: { canWrite: true, canRead: true },
    name: 'RestaurantReducer',
  });

  await putPermission({
    defaultRule: { canRead: true },
    name: 'RestaurantActions^RestaurantReducer',
  });

  await putPermission({
    defaultRule: { canRead: true },
    name: 'RestaurantSequencer',
  });

  await putPermission({
    defaultRule: { canRead: true },
    name: 'KitchenState',
  });

  await putPermission({
    defaultRule: { canRead: true },
    name: 'KitchenConfig',
  });

  await putPermission({
    defaultRule: { canRead: true, canTransact: true },
    name: 'KitchenActions',
  });

  await putPermission({
    defaultRule: { canRead: true, canTransact: true },
    name: 'KitchenLog',
  });

  await putPermission({
    defaultRule: { canPost: true },
    name: 'Orders',
  });

  await putPermission({
    defaultRule: { canWrite: true },
    name: 'Restaurant',
  });

  await putPermission({
    defaultRule: { canWrite: true },
    name: 'PendingOrder',
  });

  await putPermission({
    defaultRule: { canWrite: true },
    name: 'StatusDisplay',
  });

  await putPermission({
    defaultRule: { canWrite: true },
    name: 'StatusDisplay/reducer',
  });

  await putPermission({
    // todo, offer better auth for kiosk state
    defaultRule: { canWrite: true },
    name: 'Kiosk/Left',
  });
  await putPermission({
    // todo, offer better auth for kiosk state
    defaultRule: { canWrite: true },
    name: 'Kiosk/Right',
  });

  const fsClient = createFSClient({ client: cloud });
  await new Promise(resolve => setTimeout(resolve, 3000));
  computeKitchenConfig(cloud);

  let kitchen = null;
  if (!process.env.DISABLE_ONO_KITCHEN) {
    kitchen = startKitchen({
      logBehavior,
      client: cloud,
      plcIP: '192.168.1.122',
    });
  }

  async function kitchenAction(action) {
    if (!kitchen) {
      throw new Error('No kitchen right now');
    }
    const commandType = KitchenCommands[action.command];

    if (!commandType) {
      throw new Error(`Unknown kitchen command "${action.command}"`);
    }
    const { valueParamNames, pulse, subsystem } = commandType;
    const values = { ...commandType.values };
    valueParamNames &&
      Object.keys(valueParamNames).forEach(valueCommandName => {
        const provided =
          action.params && action.params[valueParamNames[valueCommandName]];
        if (provided != null) {
          values[valueCommandName] = provided;
        }
      });
    const tag = getFreshTag();
    logBehavior(`Start Action ${tag} : ${JSON.stringify(action)}`);

    const command = {
      tag,
      type: 'KitchenCommand',
      subsystem,
      pulse,
      values,
    };
    kitchen.dispatchCommand(command);
    await new Promise((resolve, reject) => {
      let isSystemIdle = null;
      let isTagReceived = null;
      let currentTag = null;
      let noFaults = true;
      let sub = cloud.get('KitchenState').observeValue.subscribe({
        next: state => {
          if (!state) {
            return;
          }
          noFaults = state[`${subsystem}_NoFaults_READ`];
          currentTag = state[`${subsystem}_ActionIdOut_READ`];
          isSystemIdle = state[`${subsystem}_PrgStep_READ`] === 0;
          isTagReceived = currentTag === tag;

          if (isSystemIdle && isTagReceived) {
            logBehavior(`${noFaults ? 'Done with' : 'FAULTED on'} ${tag}`);
            sub && sub.unsubscribe();
            if (noFaults === false) {
              reject(new Error(`System "${subsystem}" has faulted`));
            } else {
              resolve();
            }
          }
        },
        error: reject,
      });
      setTimeout(() => {
        sub && sub.unsubscribe();
        if (!isSystemIdle) {
          return reject(new Error(`After 30sec, "${subsystem}" is not idle!`));
        }
        if (!isTagReceived) {
          return reject(
            new Error(
              `After 30sec, ActionIdOut of "${subsystem}" is "${currentTag}" but we expected "${tag}"!`,
            ),
          );
        }
        reject(new Error('Unknown timeout waiting for kitchen state..'));
      }, 30000);
    });
    return command;
  }

  let restaurantState = null;
  let kitchenState = null;
  let kitchenConfig = null;
  let currentStepPromise = null;

  let kitchenStateAtLastStepStart = null;
  function handleStateUpdates() {
    if (
      !kitchen ||
      !restaurantState ||
      !kitchenState ||
      !kitchenConfig ||
      !restaurantState.isAutoRunning ||
      currentStepPromise
    ) {
      return;
    }
    const nextStep = computeNextStep(
      restaurantState,
      kitchenConfig,
      kitchenState,
    );
    if (!nextStep) {
      return;
    }
    if (kitchenStateAtLastStepStart === kitchenState) {
      console.error(
        'Woah! We are attempting to perform a new kitchen action, but the current state is the same as it was before the previous action!',
      );
      return;
    }
    console.log('Next Step:', nextStep.description);
    kitchenStateAtLastStepStart = kitchenState;
    currentStepPromise = nextStep.perform(cloud, kitchenAction);

    currentStepPromise
      .then(() => {
        currentStepPromise = null;
        console.log(`Done with ${nextStep.description}`);
        setTimeout(() => {
          handleStateUpdates();
        }, 150);
      })
      .catch(e => {
        currentStepPromise = null;
        console.error(
          `Failed to perform Kitchen Action: ${
            nextStep.description
          }. JS is basically faulted now??`,
          e,
        );
      });
  }

  cloud.get('KitchenState').observeValue.subscribe({
    next: state => {
      kitchenState = state;
      handleStateUpdates();
    },
  });

  cloud.get('KitchenConfig').observeValue.subscribe({
    next: state => {
      kitchenConfig = state;
      handleStateUpdates();
    },
  });

  (await evalSource.observeDoc(
    'onofood.co',
    'RestaurantActions^RestaurantReducer',
  )).subscribe({
    next: update => {
      restaurantState = update.value;
      handleStateUpdates();
    },
  });

  async function placeOrder({ orderId }) {
    console.log('placing order..', orderId);

    const orderResult = await cloud.dispatch({
      type: 'GetDocValue',
      name: `Orders/${orderId}`,
      domain: 'onofood.co',
    });

    const at = cloud.get('Airtable').expand((folder, doc) => {
      if (!folder) {
        return null;
      }
      return doc.getBlock(folder.files['db.json']);
    });
    await at.fetchValue();
    const companyConfig = at.getValue();
    const blends = companyConfigToBlendMenu(companyConfig);
    const order = orderResult.value;
    const summary = getOrderSummary(order, companyConfig);
    await summary.items.reduce(async (last, item, index) => {
      await last;
      if (item.type !== 'blend') {
        return;
      }
      const { menuItemId } = item;
      const menuItem = blends.find(b => b.id === menuItemId);
      const { ingredients } = getSelectedIngredients(
        menuItem,
        item,
        companyConfig,
      );

      const KitchenSlots = companyConfig.baseTables.KitchenSlots;
      const KitchenSystems = companyConfig.baseTables.KitchenSystems;
      const requestedFills = ingredients.map(ing => {
        const kitchenSlotId = Object.keys(KitchenSlots).find(slotId => {
          const slot = KitchenSlots[slotId];
          return slot.Ingredient && ing.id === slot.Ingredient[0];
        });
        const kitchenSlot = kitchenSlotId && KitchenSlots[kitchenSlotId];
        if (!kitchenSlot) {
          return {
            ingredientId: ing.id,
            ingredientName: ing.Name,
            invalid: 'NoSlot',
          };
        }
        const kitchenSystemId =
          kitchenSlot.KitchenSystem && kitchenSlot.KitchenSystem[0];
        const kitchenSystem =
          kitchenSystemId && KitchenSystems[kitchenSystemId];
        if (!kitchenSystem) {
          return {
            ingredientId: ing.id,
            ingredientName: ing.Name,
            slotId: kitchenSlotId,
            invalid: 'NoSystem',
          };
        }
        return {
          ingredientId: ing.id,
          ingredientName: ing.Name,
          slotId: kitchenSlotId,
          systemId: kitchenSystemId,
          slot: kitchenSlot.Slot,
          system: kitchenSystem.FillSystemID,
          invalid: null,
        };

        return { kitchenSlot, slotId: kitchenSlotId };
      });
      const orderName =
        order.orderName.firstName + ' ' + order.orderName.lastName;
      const blendName = displayNameOfOrderItem(item, item.menuItem);
      console.log('ORDERING ITEM!', {
        requestedFills,
        orderName,
        blendName,
      });

      // await cloud.get('RestaurantActions').putTransaction({
      //   type: 'PlaceOrder',
      //   order: {
      //     id: orderId,
      //     name: ,
      //     blendName: ,
      //     fills: [
      //       { system: 3, slot: 0, amount: 2 },
      //       { system: 3, slot: 1, amount: 3 },
      //       { system: 0, slot: 0, amount: 1 },
      //     ],
      //   },
      // });
    }, Promise.resolve());

    return {};
  }

  const dispatch = async action => {
    let stripeResponse = handleStripeAction(action);
    if (stripeResponse) {
      return stripeResponse;
    }
    switch (action.type) {
      case 'KitchenCommand': {
        // low level thing
        if (!kitchen) {
          throw new Error('no kitchen');
        }
        // subsystem (eg 'IOSystem'), pulse (eg ['home']), values (eg: foo: 123)
        return await kitchen.dispatchCommand(action);
      }
      case 'SendReceipt':
        return await sendReceipt({ smsAgent, emailAgent, action });
      case 'KitchenAction':
        return await kitchenAction(action);
      case 'UpdateAirtable':
        return await scrapeAirTable(fsClient);
      case 'PlaceOrder':
        return placeOrder(action);
      default:
        return await protectedSource.dispatch(action);
    }
  };

  // scrapeAirTable(fsClient)
  //   .then(() => {
  //     console.log('Airtable Updated');
  //   })
  //   .catch(console.error);

  const serverListenLocation = getEnv('PORT');

  const context = new Map();

  context.set(CloudContext, cloud); // bad idea, must have independent client for authentication!!!
  const webService = await WebServer({
    App,
    context,
    source: {
      ...protectedSource,
      dispatch,
    },
    serverListenLocation,
    assets: require(process.env.RAZZLE_ASSETS_MANIFEST),
  });
  console.log('☁️️ Web Ready 🕸');

  return {
    close: async () => {
      await protectedSource.close();
      await storageSource.close();
      await webService.close();
      kitchen && (await kitchen.close());
      console.log('😵 Server Closed');
    },
  };
};

export default startVerseServer;
