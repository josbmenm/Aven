import { useState, useEffect } from 'react';
import StripeTerminal, {
  useStripeTerminalCreatePayment,
  useStripeTerminalState,
  useStripeTerminalConnectionManager,
} from './StripeTerminal/StripeTerminal';
import { BehaviorSubject } from 'rxjs';
import { get } from '../screens/useAsyncStorage';

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

export async function getIsLiveMode() {
  const isLiveMode = await get('PaymentsIsLiveMode');
  if (isLiveMode == null) {
    return true;
  }
  return isLiveMode;
}

StripeTerminal.initialize({
  fetchConnectionToken: () =>
    (async () => {
      const isLive = await getIsLiveMode();
      console.log('=== initializing payments', isLive);
      const result = await getDispatcher()({
        type: 'StripeGetConnectionToken',
        isLive,
      });
      return result.secret;
    })().catch(console.error),
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
  discoveryMode: StripeTerminal.DiscoveryMethodBluetoothScan,
  deviceType: USE_SIMULATOR
    ? StripeTerminal.DeviceTypeReaderSimulator
    : StripeTerminal.DeviceTypeChipper2X,
});

stripeTerminalService.addPersistedReaderNotFoundListener(readers => {
  addCardReaderLogEvent(
    `[StripeTerminalService] persistedReaderNotFound, found readers: ${readers
      .map(r => r.serialNumber)
      .join(', ')}`,
  );
});

stripeTerminalService.addConnectionErrorListener(e => {
  addCardReaderLogEvent(
    `[StripeTerminalService] connectionError, error: ${JSON.stringify(e)}`,
  );
});

stripeTerminalService.addLogListener(message => {
  addCardReaderLogEvent(`[StripeTerminalService] ${message}`);
});

export async function disconnectReader() {
  return stripeTerminalService.disconnect();
}

async function cancelPayment() {
  return StripeTerminal.abortCreatePayment();
}

async function capturePayment(paymentIntentId, context) {
  const isLive = await getIsLiveMode();
  return getDispatcher()({
    type: 'StripeCapturePayment',
    paymentIntentId,
    context,
    isLive,
  });
}

async function prepareReader(options) {
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
    capturePayment(intent.stripeId, options.context, !!options.isLive),
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
    context: request.context,
    currency: 'usd',
    autoRetry: true,
    onCapture: intent => {
      setCapturedPaymentIntent(intent);
      return capturePayment(intent.stripeId, request.context);
    },
    onSuccess: () => {
      setPaymentSuccessful(true);
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

export function useCardReader(options) {
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
    collectPayment: () => collectPayment(state, options),
    prepareReader: () => prepareReader(state, options),
  };
}

export function useCardReaderConnectionManager() {
  return useStripeTerminalConnectionManager({
    service: stripeTerminalService,
  });
}
