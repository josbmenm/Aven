import { useEffect } from 'react';
import { NativeModules, NativeEventEmitter } from 'react-native';
import useCloud from '../aven-cloud/useCloud';
import { BehaviorSubject, Subject } from 'rxjs';

const CardReaderManager = NativeModules.CardReaderManager;

const AppEmitter = new NativeEventEmitter(
  NativeModules.ReactNativeEventEmitter,
);

let cloudDispatch = null;

export const readerIsWaitingForInput = new BehaviorSubject(false);
export const readerHasCardInserted = new BehaviorSubject(false);
export const readerAllowedPaymentOptions = new BehaviorSubject([]);
export const readerPrompt = new BehaviorSubject(null);
export const readerStatus = new BehaviorSubject('Unknown');
export const readerErrors = new Subject();

AppEmitter.addListener('CardReaderTokenRequested', () => {
  if (!cloudDispatch) {
    throw new Error(
      'Cannot handle Card Reader Token without dispatcher! Please useCardReader',
    );
  }
  cloudDispatch({
    type: 'StripeGetConnectionToken',
  })
    .then(result => {
      CardReaderManager.provideConnectionToken(result.secret);
    })
    .catch(e => {
      console.log('==== ! JS dispatch error in StripeGetConnectionToken! ', e);
      console.error(e);
    });
});

async function startPayment(amount, description) {
  return await new Promise((resolve, reject) => {
    CardReaderManager.getPayment(amount, description, (error, result) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(result);
    });
  });
}

async function cancelPayment(paymentIntentId) {
  readerIsWaitingForInput.next(false);
  paymentRejectersByIntentId[paymentIntentId] &&
    paymentRejectersByIntentId[paymentIntentId]({
      code: 20,
      message: 'Payment Cancelled',
    });
  await new Promise((resolve, reject) => {
    CardReaderManager.cancelPayment(error => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
}

const paymentRejectersByIntentId = {};
const paymentResolversByIntentId = {};

async function getPayment(amount, description) {
  const { paymentIntentId } = await startPayment(amount, description);

  await new Promise((resolve, reject) => {
    function clearHandlers() {
      delete paymentRejectersByIntentId[paymentIntentId];
      delete paymentResolversByIntentId[paymentIntentId];
    }
    paymentRejectersByIntentId[paymentIntentId] = err => {
      clearHandlers();
      reject(err);
    };
    paymentResolversByIntentId[paymentIntentId] = () => {
      clearHandlers();
      resolve();
    };
  });

  return paymentIntentId;
}

AppEmitter.addListener('CardReaderPaymentReadyForCapture', request => {
  const paymentIntentId = request.paymentIntentId;
  readerIsWaitingForInput.next(false);
  readerPrompt.next(null);

  if (!cloudDispatch) {
    throw new Error(
      'Cannot handle Card Reader Token without dispatcher! Please useCardReader',
    );
  }
  cloudDispatch({
    type: 'StripeCapturePayment',
    paymentIntentId,
  })
    .then(result => {
      paymentResolversByIntentId[paymentIntentId] &&
        paymentResolversByIntentId[paymentIntentId]();
    })
    .catch(e => {
      console.error('==== ! JS dispatch error in StripeCapturePayment! ', e);
      readerErrors.next(e);
      paymentRejectersByIntentId[paymentIntentId] &&
        paymentRejectersByIntentId[paymentIntentId](e);
    });
});

// AppEmitter.addListener('CardReaderReady', response => {
// });

AppEmitter.addListener('CardReaderWaitingForInput', response => {
  readerAllowedPaymentOptions.next(response.options);
  readerIsWaitingForInput.next(true);
});

AppEmitter.addListener('CardReaderPrompt', promptEvent => {
  readerPrompt.next(promptEvent);
});

AppEmitter.addListener('CardReaderError', evt => {
  readerIsWaitingForInput.next(false);
  readerErrors.next(evt);

  console.error('==== ! JS CardReaderError ' + JSON.stringify(evt));
});

AppEmitter.addListener('CardReaderPaymentStatus', evt => {
  readerStatus.next(evt.status);
});

AppEmitter.addListener('CardReaderInsertState', evt => {
  readerHasCardInserted.next(evt.isInserted);
});

async function prepareReader() {
  await new Promise((resolve, reject) => {
    CardReaderManager.prepareReader(error => {
      if (error) {
        reject(error);
        return;
      }
      resolve();
    });
  });
}
export function useCardReader() {
  const { dispatch } = useCloud();
  useEffect(
    () => {
      cloudDispatch = dispatch;
      console.log('===== JS Requesting prepared reader!');
      prepareReader();
    },
    [dispatch],
  );
  return {
    readerIsReady: readerStatus.map(s => s === 'Ready'),
    readerIsWaitingForInput,
    readerHasCardInserted,
    readerAllowedPaymentOptions,
    readerPrompt,
    readerStatus,
    cancelPayment,
    getPayment,
  };
}
