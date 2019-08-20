import EventEmitter from 'eventemitter3';
import { AsyncStorage } from 'react-native';

export default class ConnectionService {
  static StorageKey = '@StripeTerminal.ConnectionService:persistedSerialNumber';

  static PolicyAuto = 'auto';
  static PolicyPersist = 'persist';
  static PolicyManual = 'manual';
  static PolicyPersistManual = 'persist-manual';
  static Policies = [
    ConnectionService.PolicyAuto,
    ConnectionService.PolicyPersist,
    ConnectionService.PolicyManual,
    ConnectionService.PolicyPersistManual,
  ];

  static DesiredReaderAny = 'any';

  constructor({ policy, deviceType, discoveryMode, terminal, simulated }) {
    this._terminal = terminal;
    this.policy = policy;
    this.simulated = simulated || false;
    this.deviceType = deviceType || this._terminal.DeviceTypeChipper2X;
    this.discoveryMode =
      discoveryMode || this._terminal.DiscoveryMethodBluetoothScan;

    if (ConnectionService.Policies.indexOf(policy) === -1) {
      throw new Error(
        `Invalid policy passed to ConnectionService: got "${policy}", expects "${ConnectionService.Policies.join(
          '|',
        )}"`,
      );
    }

    this.emitter = new EventEmitter();
    this.desiredReader = null;
    this.onReadersDiscovered.bind(this);

    this.isCardInserted = false;

    this._terminal.addDidReportReaderEventListener(this.onReaderEvent);
    this._terminal.addReadersDiscoveredListener(this.onReadersDiscovered);
    this._terminal.addDidReportUnexpectedReaderDisconnectListener(
      this.onUnexpectedDisconnect,
    );

    this._createListeners([
      'connectionError',
      'persistedReaderNotFound',
      'readersDiscovered',
      'readerPersisted',
      'log',
    ]);
  }

  _createListeners(keys) {
    keys.forEach(k => {
      this[`add${k[0].toUpperCase() + k.substring(1)}Listener`] = listener =>
        this.emitter.addListener(k, listener);
      this[`remove${k[0].toUpperCase() + k.substring(1)}Listener`] = listener =>
        this.emitter.removeListener(k, listener);
    });
  }

  onReaderEvent = event => {
    if (event === this._terminal.ReaderEventCardRemoved) {
      this.isCardInserted = false;
    }
    if (event === this._terminal.ReaderEventCardInserted) {
      this.isCardInserted = true;
    }
  };

  onReadersDiscovered = readers => {
    this.emitter.emit('readersDiscovered', readers);

    if (!readers.length) {
      return;
    }

    // If we are not currently in a connecting phase, just emit the found readers without
    // connecting to anything (that will wait until the connect() call).
    if (!this.desiredReader) {
      return;
    }

    let connectionPromise;

    // Auto-reconnect to "desired" reader, if one exists. This could happen
    // if the connection drops, for example. Or when restoring from memory.
    const foundReader = readers.find(
      r => r.serialNumber === this.desiredReader,
    );
    if (foundReader) {
      connectionPromise = this._terminal.connectReader(
        foundReader.serialNumber,
      );

      // Otherwise, connect to best strength reader.
    } else if (
      this.policy === ConnectionService.PolicyAuto ||
      (this.policy === ConnectionService.PolicyPersist &&
        !this.desiredReader) ||
      this.desiredReader === ConnectionService.DesiredReaderAny
    ) {
      connectionPromise = this._terminal.connectReader(readers[0].serialNumber);
    }

    // If a connection is in progress, save the connected reader.
    if (connectionPromise) {
      connectionPromise
        .then(r => {
          this.desiredReader = r.serialNumber;

          if (
            this.policy === ConnectionService.PolicyPersist ||
            this.policy === ConnectionService.PolicyPersistManual
          ) {
            this.setPersistedReaderSerialNumber(this.desiredReader);
          }
        })
        .catch(e => {
          // If unable to connect, emit error & restart if in automatic mode.
          this.emitter.emit('connectionError', e);
          if (this.policy !== ConnectionService.PolicyManual) {
            this.connect();
          }
        });

      // If the only reader found was not an "allowed" persisted reader, restart the search.
    } else {
      this.emitter.emit('persistedReaderNotFound', readers);
      this.connect();
    }
  };

  onUnexpectedDisconnect = () => {
    // Automatically attempt to reconnect.
    this.connect();
  };

  async connect(serialNumber) {
    this.emitter.emit(
      'log',
      `Connecting to reader: "${serialNumber || 'any'}"...`,
    );

    if (serialNumber) {
      this.desiredReader = serialNumber;
    }
    if (!this.desiredReader) {
      this.desiredReader = ConnectionService.DesiredReaderAny;
    }

    // Don't reconnect if we are already connected to the desired reader.
    // (This state can occur when hot-reloading, for example.)
    const currentReader = await this.getReader();
    if (currentReader) {
      return Promise.resolve();
    }

    await this._terminal.abortDiscoverReaders(); // end any pending search
    await this._terminal.disconnectReader(); // cancel any existing non-matching reader
    return this._terminal.discoverReaders(
      this.deviceType,
      this.discoveryMode,
      this.simulated,
    );
  }

  async discover() {
    await this._terminal.abortDiscoverReaders(); // end any pending search
    return this._terminal.discoverReaders(
      this.deviceType,
      this.discoveryMode,
      this.simulated,
    );
  }

  async disconnect() {
    if (
      this.policy === ConnectionService.PolicyPersist ||
      this.policy === ConnectionService.PolicyPersistManual
    ) {
      await this.setPersistedReaderSerialNumber(null);
      this.desiredReader = null;
    }
    return this._terminal.disconnectReader();
  }

  async getReader() {
    const reader = await this._terminal.getConnectedReader();
    return reader && reader.serialNumber === this.desiredReader ? reader : null;
  }

  async getPersistedReaderSerialNumber() {
    const serialNumber = await AsyncStorage.getItem(
      ConnectionService.StorageKey,
    );
    return serialNumber;
  }

  async setPersistedReaderSerialNumber(serialNumber) {
    if (!serialNumber) {
      await AsyncStorage.removeItem(ConnectionService.StorageKey);
    } else {
      await AsyncStorage.setItem(ConnectionService.StorageKey, serialNumber);
    }
    this.emitter.emit('readerPersisted', serialNumber);
  }

  async start() {
    if (this.policy === ConnectionService.PolicyAuto) {
      this.connect();
    } else if (
      this.policy === ConnectionService.PolicyPersist ||
      this.policy === ConnectionService.PolicyPersistManual
    ) {
      const serialNumber = await this.getPersistedReaderSerialNumber();
      if (this.policy === ConnectionService.PolicyPersist || serialNumber) {
        this.connect(serialNumber);
      }
    } else {
      /* fallthrough, on PolicyManual, or PolicyPersistManual with no found reader, wait for user action */
    }
  }

  async stop() {
    await this._terminal.disconnectReader();

    this._terminal.removeDidReportReaderEventListener(this.onReaderEvent);
    this._terminal.removeReadersDiscoveredListener(this.onReadersDiscovered);
    this._terminal.removeDidReportUnexpectedReaderDisconnectListener(
      this.onUnexpectedDisconnect,
    );
  }
}
