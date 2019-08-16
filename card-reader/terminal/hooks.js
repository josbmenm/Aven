import { useEffect, useState, useRef } from 'react';

export default function createHooks(StripeTerminal) {
  function useStripeTerminalState() {
    const [connectionStatus, setConnectionStaus] = useState(
      StripeTerminal.ConnectionStatusNotConnected,
    );
    const [paymentStatus, setPaymentStatus] = useState(
      StripeTerminal.PaymentStatusNotReady,
    );
    const [lastReaderEvent, setLastReaderEvent] = useState(
      StripeTerminal.ReaderEventCardRemoved,
    );
    const [connectedReader, setConnectedReader] = useState(null);
    const [readerInputOptions, setReaderInputOptions] = useState(null);
    const [readerInputPrompt, setReaderInputPrompt] = useState(null);

    useEffect(() => {
      // Populate initial values
      StripeTerminal.getConnectionStatus().then(s => setConnectionStaus(s));
      StripeTerminal.getPaymentStatus().then(s => setPaymentStatus(s));
      StripeTerminal.getLastReaderEvent().then(e => setLastReaderEvent(e));
      StripeTerminal.getConnectedReader().then(r => setConnectedReader(r));

      function handleLog(event) {}
      function handleReadersDiscovered(event) {}
      function handleReaderSoftwareUpdateProgress(event) {}
      function handleDidRequestReaderInput(event) {}
      function handleDidRequestReaderDisplayMessage(event) {}
      function handleDidReportReaderEvent(event) {
        setLastReaderEvent(event);
      }
      function handleDidReportLowBatteryWarning(event) {}
      function handleDidChangePaymentStatus(event) {
        setPaymentStatus(event.status);
      }
      function handleDidChangeConnectionStatus(event) {
        setConnectionStaus(event.status);
        StripeTerminal.getConnectedReader().then(r => {
          if (connectedReader !== r) setConnectedReader(r);
        });
      }
      function handleDidReportUnexpectedReaderDisconnect(event) {}

      StripeTerminal.addLogListener('LogListener', handleLog);
      StripeTerminal.addReadersDiscoveredListener(
        'ReadersDiscoveredListener',
        handleReadersDiscovered,
      );
      StripeTerminal.addReaderSoftwareUpdateProgressListener(
        'ReaderSoftwareUpdateProgressListener',
        handleReaderSoftwareUpdateProgress,
      );
      StripeTerminal.addDidRequestReaderInputListener(
        'DidRequestReaderInputListener',
        handleDidRequestReaderInput,
      );
      StripeTerminal.addDidRequestReaderDisplayMessageListener(
        'DidRequestReaderDisplayMessageListener',
        handleDidRequestReaderDisplayMessage,
      );
      StripeTerminal.addDidReportReaderEventListener(
        'DidReportReaderEventListener',
        handleDidReportReaderEvent,
      );
      StripeTerminal.addDidReportLowBatteryWarningListener(
        'DidReportLowBatteryWarningListener',
        handleDidReportLowBatteryWarning,
      );
      StripeTerminal.addDidChangePaymentStatusListener(
        'DidChangePaymentStatusListener',
        handleDidChangePaymentStatus,
      );
      StripeTerminal.addDidChangeConnectionStatusListener(
        'DidChangeConnectionStatusListener',
        handleDidChangeConnectionStatus,
      );
      StripeTerminal.addDidReportUnexpectedReaderDisconnectListener(
        'DidReportUnexpectedReaderDisconnectListener',
        handleDidReportUnexpectedReaderDisconnect,
      );

      return () => {
        StripeTerminal.removeLogListener('LogListener', handleLog);
        StripeTerminal.removeReadersDiscoveredListener(
          'ReadersDiscoveredListener',
          handleReadersDiscovered,
        );
        StripeTerminal.removeReaderSoftwareUpdateProgressListener(
          'ReaderSoftwareUpdateProgressListener',
          handleReaderSoftwareUpdateProgress,
        );
        StripeTerminal.removeDidRequestReaderInputListener(
          'DidRequestReaderInputListener',
          handleDidRequestReaderInput,
        );
        StripeTerminal.removeDidRequestReaderDisplayMessageListener(
          'DidRequestReaderDisplayMessageListener',
          handleDidRequestReaderDisplayMessage,
        );
        StripeTerminal.removeDidReportReaderEventListener(
          'DidReportReaderEventListener',
          handleDidReportReaderEvent,
        );
        StripeTerminal.removeDidReportLowBatteryWarningListener(
          'DidReportLowBatteryWarningListener',
          handleDidReportLowBatteryWarning,
        );
        StripeTerminal.removeDidChangePaymentStatusListener(
          'DidChangePaymentStatusListener',
          handleDidChangePaymentStatus,
        );
        StripeTerminal.removeDidChangeConnectionStatusListener(
          'DidChangeConnectionStatusListener',
          handleDidChangeConnectionStatus,
        );
        StripeTerminal.removeDidReportUnexpectedReaderDisconnectListener(
          'DidReportUnexpectedReaderDisconnectListener',
          handleDidReportUnexpectedReaderDisconnect,
        );
      };
    }, []);

    const cardInserted =
      lastReaderEvent === StripeTerminal.ReaderEventCardInserted;

    return {
      connectionStatus,
      connectedReader,
      paymentStatus,
      readerInputOptions,
      readerInputPrompt,
      cardInserted,
      clearReaderInputState: () => {
        setReaderInputOptions(null);
        setReaderInputPrompt(null);
      },
    };
  }

  function useStripeTerminalCreatePayment({
    onSuccess,
    onFailure,
    onCapture,
    autoRetry,
    ...options
  }) {
    const {
      connectionStatus,
      connectedReader,
      paymentStatus,
      cardInserted,
      readerInputOptions,
      readerInputPrompt,
      clearReaderInputState,
    } = (state = useStripeTerminalState());

    const [hasCreatedPayment, setHasCreatedPayment] = useState(false);
    const [isCaptured, setIsCaptured] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    const [readerError, setReaderError] = useState(null);
    const [hasRetried, setHasRetried] = useState(false);

    useEffect(() => {
      if (
        paymentStatus !== StripeTerminal.PaymentStatusNotReady &&
        (!hasCreatedPayment || (readerError && !hasRetried && !cardInserted))
      ) {
        setHasCreatedPayment(true);
        if (readerError) {
          setHasRetried(true);
        }

        StripeTerminal.createPayment(options)
          .then(intent => {
            if (onCapture) {
              return onCapture(intent)
                .then(onSuccess)
                .catch(onFailure);
            }

            onSuccess(intent);
          })
          .catch(({ error }) => {
            if (autoRetry) {
              StripeTerminal.abortCreatePayment()
                .then(() => {
                  clearReaderInputState();
                  setHasRetried(false);
                  setReaderError(error);
                })
                .catch(e => onFailure(e));
              return;
            }

            onFailure(error);
          })
          .finally(() => setIsCompleted(true));
      }
    }, [
      paymentStatus,
      hasCreatedPayment,
      readerError,
      hasRetried,
      cardInserted,
    ]);

    // Cleanup: abort if unmounted midway through payment intent creation process.
    useEffect(() => {
      return () => {
        if (!isCompleted) {
          StripeTerminal.abortCreatePayment();
        }
      };
    }, []);

    return {
      ...state,
      readerError,
    };
  }

  const ConnectionManagerStatusConnected = 'connected';
  const ConnectionManagerStatusConnecting = 'connecting';
  const ConnectionManagerStatusDisconnected = 'disconnected';
  const ConnectionManagerStatusScanning = 'scanning';

  function useStripeTerminalConnectionManager({ service }) {
    const {
      connectionStatus,
      connectedReader,
      paymentStatus,
    } = (state = useStripeTerminalState());

    const [managerConnectionStatus, setManagerConnectionStatus] = useState(
      ConnectionManagerStatusDisconnected,
    );
    const [readersAvailable, setReadersAvailable] = useState([]);
    const [
      persistedReaderSerialNumber,
      setPersistedReaderSerialNumber,
    ] = useState(null);

    useEffect(() => {
      setManagerConnectionStatus(
        !!connectedReader
          ? ConnectionManagerStatusConnected
          : ConnectionManagerStatusDisconnected,
      );
    }, [connectedReader]);

    useEffect(() => {
      // Populate initial values
      service
        .getPersistedReaderSerialNumber()
        .then(s => setPersistedReaderSerialNumber(s));

      // Setup listeners
      const listeners = [
        service.addListener('readersDiscovered', readers =>
          setReadersAvailable(readers),
        ),
        service.addListener('readerPersisted', serialNumber =>
          setPersistedReaderSerialNumber(serialNumber),
        ),
      ];

      // Cleanup: remove listeners
      return () => {
        listeners.forEach(l => l.remove());
      };
    }, []);

    return {
      ...state,
      managerConnectionStatus,
      readersAvailable,
      persistedReaderSerialNumber,
      connectReader: serialNumber => {
        setManagerConnectionStatus(ConnectionManagerStatusConnecting);
        service.connect(serialNumber);
      },
      discoverReaders: () => {
        setManagerConnectionStatus(ConnectionManagerStatusScanning);
        service.discover();
      },
      disconnectReader: () => {
        service.disconnect();
      },
    };
  }

  return {
    useStripeTerminalState,
    useStripeTerminalCreatePayment,
    useStripeTerminalConnectionManager,
  };
}
