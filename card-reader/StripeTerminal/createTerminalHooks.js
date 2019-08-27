import { useEffect, useState, useRef } from 'react';

export default function createTerminalHooks(StripeTerminal) {
  function stringOfConnectionStatus(status) {
    switch (status) {
      case StripeTerminal.ConnectionStatusNotConnected:
        return 'disconnected';
      case StripeTerminal.ConnectionStatusConnected:
        return 'connected';
      case StripeTerminal.ConnectionStatusConnecting:
        return 'connecting';
      default:
        return null;
    }
  }

  function useStripeTerminalState() {
    const [connectionStatus, setConnectionStatus] = useState(
      StripeTerminal.ConnectionStatusNotConnected,
    );
    const [paymentStatus, setPaymentStatus] = useState(
      StripeTerminal.PaymentStatusNotReady,
    );
    const stripeService = StripeTerminal.getService();
    const [cardInserted, setCardInserted] = useState(
      stripeService.isCardInserted,
    );
    const [connectedReader, setConnectedReader] = useState(null);
    const [readerInputOptions, setReaderInputOptions] = useState(null);
    const [readerInputPrompt, setReaderInputPrompt] = useState(null);

    useEffect(() => {
      // Populate initial values
      StripeTerminal.getConnectionStatus().then(s => setConnectionStatus(s));
      StripeTerminal.getPaymentStatus().then(s => setPaymentStatus(s));
      StripeTerminal.getConnectedReader().then(r => setConnectedReader(r));

      function handleLog(event) {}
      function handleDidReportReaderEvent(event) {
        if (event.event === StripeTerminal.ReaderEventCardInserted) {
          setCardInserted(true);
        } else if (event.event === StripeTerminal.ReaderEventCardRemoved) {
          setCardInserted(false);
        }
      }
      function handleReadersDiscovered(event) {}
      function handleReaderSoftwareUpdateProgress(event) {}
      function handleDidRequestReaderInput(event) {}
      function handleDidRequestReaderDisplayMessage(event) {}
      function handleDidReportLowBatteryWarning(event) {}
      function handleDidChangePaymentStatus(event) {
        setPaymentStatus(event.status);
      }
      function handleDidChangeConnectionStatus(event) {
        setConnectionStatus(event.status);
        StripeTerminal.getConnectedReader().then(r => {
          if (connectedReader !== r) setConnectedReader(r);
        });
      }
      function handleDidReportUnexpectedReaderDisconnect(event) {
        setConnectionStatus(StripeTerminal.ConnectionStatusNotConnected);
      }

      StripeTerminal.addLogListener(handleLog);
      StripeTerminal.addReadersDiscoveredListener(handleReadersDiscovered);
      StripeTerminal.addReaderSoftwareUpdateProgressListener(
        handleReaderSoftwareUpdateProgress,
      );
      StripeTerminal.addDidRequestReaderInputListener(
        handleDidRequestReaderInput,
      );
      StripeTerminal.addDidRequestReaderDisplayMessageListener(
        handleDidRequestReaderDisplayMessage,
      );
      StripeTerminal.addDidReportReaderEventListener(
        handleDidReportReaderEvent,
      );
      StripeTerminal.addDidReportLowBatteryWarningListener(
        handleDidReportLowBatteryWarning,
      );
      StripeTerminal.addDidChangePaymentStatusListener(
        handleDidChangePaymentStatus,
      );
      StripeTerminal.addDidChangeConnectionStatusListener(
        handleDidChangeConnectionStatus,
      );
      StripeTerminal.addDidReportUnexpectedReaderDisconnectListener(
        handleDidReportUnexpectedReaderDisconnect,
      );

      return () => {
        StripeTerminal.removeLogListener(handleLog);
        StripeTerminal.removeReadersDiscoveredListener(handleReadersDiscovered);
        StripeTerminal.removeReaderSoftwareUpdateProgressListener(
          handleReaderSoftwareUpdateProgress,
        );
        StripeTerminal.removeDidRequestReaderInputListener(
          handleDidRequestReaderInput,
        );
        StripeTerminal.removeDidRequestReaderDisplayMessageListener(
          handleDidRequestReaderDisplayMessage,
        );
        StripeTerminal.removeDidReportReaderEventListener(
          handleDidReportReaderEvent,
        );
        StripeTerminal.removeDidReportLowBatteryWarningListener(
          handleDidReportLowBatteryWarning,
        );
        StripeTerminal.removeDidChangePaymentStatusListener(
          handleDidChangePaymentStatus,
        );
        StripeTerminal.removeDidChangeConnectionStatusListener(
          handleDidChangeConnectionStatus,
        );
        StripeTerminal.removeDidReportUnexpectedReaderDisconnectListener(
          handleDidReportUnexpectedReaderDisconnect,
        );
      };
    }, []);

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
      if (!options.amount) return;
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
                .then(() => onSuccess(intent))
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
        if (hasCreatedPayment && !isCompleted) {
          StripeTerminal.abortCreatePayment();
        }
      };
    }, [hasCreatedPayment, isCompleted]);

    return {
      ...state,
      readerError,
    };
  }

  const ConnectionManagerStatusConnecting = 'connecting';
  const ConnectionManagerStatusScanning = 'scanning';
  const ConnectionManagerStatusEmpty = null;

  function useStripeTerminalConnectionManager({ service, onError }) {
    const state = useStripeTerminalState();
    const { connectionStatus } = state;
    const [managerConnectionStatus, setManagerConnectionStatus] = useState(
      ConnectionManagerStatusEmpty,
    );
    const [readersAvailable, setReadersAvailable] = useState([]);
    const [
      persistedReaderSerialNumber,
      setPersistedReaderSerialNumber,
    ] = useState(null);

    useEffect(() => {
      // Populate initial values
      service
        .getPersistedReaderSerialNumber()
        .then(s => setPersistedReaderSerialNumber(s));

      service.addReadersDiscoveredListener(setReadersAvailable);
      service.addReaderPersistedListener(setPersistedReaderSerialNumber);

      return () => {
        service.removeReadersDiscoveredListener(setReadersAvailable);
        service.removeReaderPersistedListener(setPersistedReaderSerialNumber);
      };
    }, []);

    return {
      ...state,
      connectionStatus: stringOfConnectionStatus(connectionStatus),
      managerConnectionStatus,
      readersAvailable,
      persistedReaderSerialNumber,
      connectReader: serialNumber => {
        setManagerConnectionStatus(ConnectionManagerStatusConnecting);
        service
          .connect(serialNumber)
          .then(() => {
            setManagerConnectionStatus(null);
          })
          .catch(err => {
            setManagerConnectionStatus(null);
            if (onError) {
              onError(err);
            } else {
              console.error(err);
            }
          });
      },
      discoverReaders: () => {
        setManagerConnectionStatus(ConnectionManagerStatusScanning);
        service.discover();
      },
      disconnectReader: () => {
        service
          .disconnect()
          .then(() => {})
          .catch(err => {
            if (onError) {
              onError(err);
            } else {
              console.error(err);
            }
          });
      },
    };
  }

  return {
    useStripeTerminalState,
    useStripeTerminalCreatePayment,
    useStripeTerminalConnectionManager,
  };
}
