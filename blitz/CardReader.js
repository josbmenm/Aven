import { useEffect, useState } from 'react';
import { NativeModules, NativeEventEmitter } from 'react-native';
import useCloud from '../aven-cloud/useCloud';
import { BehaviorSubject, Subject } from 'rxjs';
import { debounceTime, map, distinctUntilChanged } from 'rxjs/operators';
import useObservable from '../aven-cloud/useObservable';

const CardReaderManager = NativeModules.CardReaderManager;

const AppEmitter = new NativeEventEmitter(
  NativeModules.ReactNativeEventEmitter,
);

let cloudDispatch = null;

export const readerErrors = new Subject();
export const readerState = new BehaviorSubject({
  status: 'Unknown',
});

function setReaderState(updates) {
  const values = {
    ...readerState.value,
    ...updates,
  };
  readerState.next({
    ...values,
  });
}

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

AppEmitter.addListener('CardReaderError', evt => {
  readerErrors.next(evt);

  console.error('==== ! JS CardReaderError ' + JSON.stringify(evt));
});

AppEmitter.addListener('CardReaderState', evt => {
  setReaderState(evt);
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

function stateMap(mapper) {
  return (
    readerState
      .pipe(map(mapper))
      .pipe(distinctUntilChanged())
      // .pipe(debounceTime(500))
      .multicast(() => new BehaviorSubject(mapper(readerState.value)))
      .refCount()
  );
}

const readerIsReady = stateMap(
  s => s.status === 'Ready' || s.status === 'CollectingPaymentMethod',
);

const readerHasCardInserted = stateMap(s => s.isCardInserted);

const readerPrompt = stateMap(s => {
  if (s.promptMessage) {
    return s.promptMessage;
  }
  return 'Wait for reader';
});

const readerStatus = stateMap(s => s.status);

const stateMessage = stateMap(s => {
  if (s.promptMessage) {
    return s.promptMessage;
  }
  return s.status || 'Who knows..';
});

export function useCardPaymentCapture(request) {
  const { dispatch } = useCloud();
  const currentReaderState = useObservable(readerState);
  const [hasRequestedPayment, setHasRequestedPayment] = useState(false);
  useEffect(
    () => {
      cloudDispatch = dispatch; // terrible hack to give card reader access to our *contextual* dispatch, with existing authority, domain and auth
      if (currentReaderState.status === undefined) return;
      if (hasRequestedPayment) {
        // nothing?
        return;
      }

      if (currentReaderState.status === 'Unknown') {
        console.log('==== READER STATE IS UNKNIWN. PREPARING..');
        prepareReader()
          .then(() => {
            console.log('===== JS reader prep requested..?!');
          })
          .catch(e => {
            console.error('===== JS reador prep failure', e);
          });
      } else if (currentReaderState.status === 'Ready') {
        console.log('==== READER STATE IS READY. GETTING PAYMENT..');
        getPayment(request.amount, request.description)
          .then(() => {
            console.log('===== GETPAYMENTDONE!!!!');
          })
          .catch(e => {
            console.error('===== JS reador payment failure', e);
          });
        setHasRequestedPayment(true);
      } else if (currentReaderState.status === 'CollectingPaymentMethod') {
        console.log(
          '==== READER STATE IS CollectingPaymentMethod. Cancelling..',
        );
        // cancelPayment()
        //   .then(() => {
        //     console.log('===== CANCELLED OLD PAYMENT!!!!');
        //   })
        //   .catch(e => {
        //     console.error('===== JS reador payment failure', e);
        //   });
      } else if (currentReaderState.status === 'NotReady') {
        // wait (should do timeout probably)
      } else {
        throw new Error(
          'wot unexpected reader status ' + currentReaderState.status,
        );
      }

      return () => {
        console.log('===== READER CLEANUP!!!', hasRequestedPayment);

        // this is so jank
        cancelPayment()
          .then(() => {
            console.log('===== CANCELLED current PAYMENT!!!!');
          })
          .catch(e => {
            console.error('===== JS CANCEL payment failure', e);
          });
      };
    },
    [
      dispatch,
      hasRequestedPayment,
      currentReaderState.status === undefined,
      currentReaderState.status === 'Ready',
    ],
  );

  return { stateMessage: JSON.stringify(currentReaderState) };
}

export function useCardReader() {
  const { dispatch } = useCloud();
  useEffect(
    () => {
      cloudDispatch = dispatch; // terrible hack to give card reader access to our *contextual* dispatch, with existing authority, domain and auth
    },
    [dispatch],
  );
  return {
    readerIsReady,
    readerHasCardInserted,
    readerStatus,
    readerState,
    readerPrompt,
    cancelPayment: cancelPayment,
    getPayment,
    prepareReader,
  };
}
