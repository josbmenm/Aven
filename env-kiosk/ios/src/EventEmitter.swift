class EventEmitter {

  /// Shared Instance.
  public static var sharedInstance = EventEmitter()

  // ReactNativeEventEmitter is instantiated by React Native with the bridge.
  private static var eventEmitter: ReactNativeEventEmitter!

  private init() {}

  // When React Native instantiates the emitter it is registered here.
  func registerEventEmitter(eventEmitter: ReactNativeEventEmitter) {
    EventEmitter.eventEmitter = eventEmitter
  }

  func dispatch(name: String, body: Any?) {
    EventEmitter.eventEmitter.sendEvent(withName: name, body: body)
  }

  /// All Events which must be support by React Native.
  lazy var allEvents: [String] = {
    var allEventNames: [String] = []

    allEventNames.append("CardReaderTokenRequested");
    allEventNames.append("CardReaderError");
    allEventNames.append("CardReaderPaymentReadyForCapture");
    allEventNames.append("CardReaderState");
    allEventNames.append("CardInsertState");
    allEventNames.append("CardReaderLog");
  
    return allEventNames
  }()

}
