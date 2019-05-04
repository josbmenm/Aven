import { useState, useEffect } from 'react';
import StripeTerminal, {
  useStripeTerminalState,
  useStripeTerminalCreatePayment,
  useStripeTerminalConnectionManager,
} from './terminal';
import { BehaviorSubject, Subject } from 'rxjs';

const USE_SIMULATOR = false;

let dispatch = null;

export function registerDispatcher(dispatcher) {
  if (dispatch) {
    throw new Error('Dispatcher is already registered');
  }
  dispatch = dispatcher;
}

function getDispatcher() {
  if (!dispatch) {
    throw new Error('Dispatcher has not been registered with CardReader');
  }
  return dispatch;
}

StripeTerminal.initialize({
  fetchConnectionToken: () => {
    return getDispatcher()({ type: 'StripeGetConnectionToken' }).then(
      result => {
        return result.secret;
      },
    );
  },
});

export const CardReaderLog = new BehaviorSubject([]);

export function clearReaderLog() {
  CardReaderLog.next([]);
}

function addCardReaderLogEvent(e) {
  const lastRecentLogs = CardReaderLog.getValue();
  CardReaderLog.next([
    { event: e, time: Date.now() },
    ...lastRecentLogs.slice(0, 50),
  ]);
}

StripeTerminal.addLogListener(addCardReaderLogEvent);

const stripeTerminalService = StripeTerminal.startService({
  policy: 'persist-manual',
  deviceType: USE_SIMULATOR
    ? StripeTerminal.DeviceTypeReaderSimulator
    : StripeTerminal.DeviceTypeChipper2X,
});

stripeTerminalService.addListener('persistedReaderNotFound', readers => {
  addCardReaderLogEvent(
    `[StripeTerminalService] persistedReaderNotFound, found readers: ${readers
      .map(r => r.serialNumber)
      .join(', ')}`,
  );
});

stripeTerminalService.addListener('connectionError', e => {
  addCardReaderLogEvent(
    `[StripeTerminalService] connectionError, error: ${JSON.stringify(e)}`,
  );
});

stripeTerminalService.addListener('log', message => {
  addCardReaderLogEvent(`[StripeTerminalService] ${message}`);
});

export async function disconnectReader() {
  return stripeTerminalService.disconnect();
}

async function cancelPayment() {
  return StripeTerminal.abortCreatePayment();
}

async function capturePayment(paymentIntentId) {
  return getDispatcher()({
    type: 'StripeCapturePayment',
    paymentIntentId,
  });
}

async function prepareReader() {
  return stripeTerminalService.connect();
}

async function collectPayment(state, options) {
  if (state.paymentStatus !== StripeTerminal.PaymentStatusReady) {
    throw new Error(
      `Could not 'collectPayment' since Terminal is not ready (status: ${
        state.paymentStatus
      }).`,
    );
  }

  return StripeTerminal.createPayment(options).then(intent =>
    capturePayment(intent.stripeId),
  );
}

export function useCardPaymentCapture({
  onCompletion,
  onFailure,
  ...request
} = {}) {
  const [capturedPaymentIntent, setCapturedPaymentIntent] = useState(null);
  const [paymentSuccessful, setPaymentSuccessful] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [paymentErrorMessage, setPaymentErrorMessage] = useState(null);

  const handleError = function(e) {
    onFailure(e);
    setPaymentErrorMessage(e.error || e.message || e);
    setPaymentCompleted(true);
  };

  const handleCompletion = function(intent) {
    setPaymentCompleted(true);
    onCompletion(intent);
  };

  const {
    connectionStatus,
    connectedReader,
    paymentStatus,
    cardInserted,
    readerInputOptions,
    readerInputPrompt,
    readerError,
  } = (state = useStripeTerminalCreatePayment({
    amount: request.amount,
    description: request.description,
    currency: 'usd',
    autoRetry: true,
    onCapture: intent => capturePayment(intent.stripeId),
    onSuccess: intent => {
      setPaymentSuccessful(true);
      setCapturedPaymentIntent(intent);
    },
    onFailure: handleError,
  }));

  // Wait for capture + card removed before firing payment success.
  useEffect(() => {
    if (capturedPaymentIntent && !paymentCompleted && !cardInserted) {
      handleCompletion(capturedPaymentIntent);
    }
  });

  return {
    paymentSuccessful,
    paymentCompleted,
    paymentErrorMessage: paymentErrorMessage || readerError,
    displayMessage: readerInputPrompt || readerInputOptions,
    state: {
      ...state,
      capturedPaymentIntent,
    },
  };
}

export function useCardReader() {
  const {
    connectionStatus,
    connectedReader,
    paymentStatus,
    cardInserted,
  } = (state = useStripeTerminalState());

  return {
    readerIsReady:
      connectionStatus !== StripeTerminal.ConnectionStatusNotConnected,
    readerHasCardInserted: cardInserted,
    readerState: state,
    cancelPayment: cancelPayment,
    collectPayment: collectPayment.bind(null, state),
    prepareReader: prepareReader.bind(null, state),
  };
}

export function useCardReaderConnectionManager() {
  return useStripeTerminalConnectionManager({
    service: stripeTerminalService,
  });
}
