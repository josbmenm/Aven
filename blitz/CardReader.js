import { useEffect, useState, useRef } from 'react';
import { NativeModules, NativeEventEmitter } from 'react-native';
import useCloud from '../cloud-core/useCloud';
import { BehaviorSubject, Subject } from 'rxjs';
import {
  debounceTime,
  map,
  distinctUntilChanged,
  publishBehavior,
  refCount,
} from 'rxjs/operators';
import useObservable from '../cloud-core/useObservable';

const CardReaderManager = NativeModules.CardReaderManager;

const AppEmitter = new NativeEventEmitter(
  NativeModules.ReactNativeEventEmitter,
);

let cloudDispatch = null;

export const readerErrors = new Subject();
export const readerState = new BehaviorSubject({
  status: 'Unknown',
});

const paymentRejectersByIntentId = {};
const paymentResolversByIntentId = {};

function setReaderState(updates) {
  const values = {
    ...readerState.value,
    ...updates,
  };
  if (
    values.errorStep === 'confirmPaymentIntent' &&
    paymentRejectersByIntentId[values.errorPaymentIntentId]
  ) {
    paymentRejectersByIntentId[values.errorPaymentIntentId]({
      code: values.errorCode,
      declineCode: values.errorDeclineCode,
      paymentIntentId: values.errorPaymentIntentId,
    });
  }
  console.log(values);
  const isRemovingCard =
    readerState.value.promptType !== 'RemoveCard' &&
    values.promptType === 'RemoveCard';
  readerState.next({
    promptType:
      values.status === 'CollectingPaymentMethod' ? null : values.promptType,
    promptMessage:
      values.status === 'CollectingPaymentMethod' ? null : values.promptMessage,
    ...values,
    isCollecting:
      values.status === 'CollectingPaymentMethod' ||
      (values.status === 'Ready' && readerState.value.isCollecting),
    isCardInserted: values.isCardInserted,
    message:
      values.inputOptionsMessage ||
      values.promptMessage ||
      values.statusMessage,
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

async function cancelPayment() {
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
    paymentResolversByIntentId[paymentIntentId] = result => {
      clearHandlers();
      resolve(result, paymentIntentId);
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
        paymentResolversByIntentId[paymentIntentId](result);
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

let lastInsertStateUpdate = null;

AppEmitter.addListener('CardInsertState', updates => {
  clearTimeout(lastInsertStateUpdate);
  lastInsertStateUpdate = setTimeout(() => {
    setReaderState({ isCardInserted: updates.isCardInserted });
  }, 300);
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

export function useCardPaymentCapture(
  request,
  { onPaymentComplete, onPaymentCompleteAndCardRemoved },
) {
  const amount = request && request.amount;
  const description = request && request.description;
  const { dispatch } = useCloud();
  const currentReaderState = useObservable(readerState);
  const checkoutState = useRef({});
  const [hasRequestedPayment, setHasRequestedPayment] = useState(false);
  const [hasCompletedPayment, setHasCompletedPayment] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);
  const [declinedWithMessage, setHasDeclinedWithMessage] = useState(null);
  useEffect(
    () => {
      cloudDispatch = dispatch; // terrible hack to give card reader access to our *contextual* dispatch, with existing authority, domain and auth
      const { status, errorStep, errorCode } = currentReaderState;
      console.log('========= reader effect', currentReaderState);
      if (currentReaderState.status === undefined) return;
      if (!amount || !description) return;
      if (hasCompleted) {
        // everything is complete
        return;
      }
      if (hasCompletedPayment) {
        console.log('======= zooom', currentReaderState.isCardInserted);
        // not hasCompleted yet
        if (!currentReaderState.isCardInserted) {
          onPaymentCompleteAndCardRemoved && onPaymentCompleteAndCardRemoved();
          setHasCompleted(true);
        }
        return;
      }
      function doRequestPayment() {
        if (checkoutState.current.currentPaymentPromise) {
          return;
        }
        if (!hasRequestedPayment) {
          setHasRequestedPayment(true);
        }
        if (declinedWithMessage) {
          setHasDeclinedWithMessage(null);
        }
        console.log('===== iz requesting payment');
        checkoutState.current.currentPaymentPromise = getPayment(
          amount,
          description,
        );
        checkoutState.current.currentPaymentPromise
          .then(result => {
            console.log('===== getPaymentresuslltl', result);
            onPaymentComplete && onPaymentComplete();
            setHasCompletedPayment(true);
          })
          .catch(e => {
            if (e.code === 103) {
              setHasDeclinedWithMessage(
                `Declined with code "${e.declineCode}"`,
              );
            } else {
              console.error('===== JS reador payment failure', e);
            }
          })
          .finally(() => {
            checkoutState.current.currentPaymentPromise = null;
          });
      }
      if (hasRequestedPayment) {
        if (errorStep === 'confirmPaymentIntent' && errorCode === 103) {
          console.log('====== retry condition!!');
          doRequestPayment();
          return;
        }

        // not hasCompleted or hasCompletedPayment yet
        return () => {
          cancelPayment()
            .then(() => {
              console.log('===== CANCELLED current PAYMENT!!!!');
            })
            .catch(e => {
              console.error('===== JS CANCEL payment failure', e);
            });
        };
      }

      if (currentReaderState.status === 'Unknown') {
        prepareReader()
          .then(() => {})
          .catch(e => {
            console.error('===== JS reador prep failure', e);
          });
      } else if (currentReaderState.status === 'Ready') {
        doRequestPayment();
      } else if (currentReaderState.status === 'CollectingPaymentMethod') {
        cancelPayment()
          .then(() => {})
          .catch(e => {
            console.error('===== JS reador cancel failure', e);
          });
      } else if (currentReaderState.status === 'NotReady') {
        // wait (should do timeout probably)
      } else {
        throw new Error(
          'Unexpected reader status ' + currentReaderState.status,
        );
      }

      return;
    },
    [
      dispatch,
      amount,
      description,
      !hasRequestedPayment &&
        (currentReaderState.status === undefined ||
          currentReaderState.status === 'Ready'),
    ],
  );

  return {
    hasRequestedPayment,
    hasCompleted,
    hasCompletedPayment,
    declinedWithMessage,
    message: JSON.stringify(currentReaderState),
    state: currentReaderState,
  };
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