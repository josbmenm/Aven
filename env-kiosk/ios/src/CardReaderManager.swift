//
//  CardReaderManager.swift
//  blitz
//
//  Created by Eric Vicenti on 12/19/18.
//  Copyright © 2018 Facebook. All rights reserved.
//

import Foundation
import StripeTerminal

class APIProvider: NSObject, ConnectionTokenProvider {
  
  static let shared: APIProvider = APIProvider()
  
  // MARK: ConnectionTokenProvider
  
  func fetchConnectionToken(_ completion: @escaping ConnectionTokenCompletionBlock) {
    EventEmitter.sharedInstance.dispatch(name: "CardReaderTokenRequested", body: [])
    CardReaderManager.connectionTokenFetchCompletion = completion;
  }
}

@objc(CardReaderManager)
class CardReaderManager: NSObject, TerminalDelegate, DiscoveryDelegate, ReaderInputDelegate {

  static var hasInitializedTerminal: Bool = false;

  override init() {
    super.init()
    if (!CardReaderManager.hasInitializedTerminal) {
      Terminal.setTokenProvider(APIProvider.shared)
      CardReaderManager.hasInitializedTerminal = true;
    }
    Terminal.setLogListener({ logString in
      EventEmitter.sharedInstance.dispatch(name: "CardReaderLog", body: logString);
    })
    Terminal.shared.delegate = self
  }
  
  deinit {
    Terminal.shared.disconnectReader { error in
      if let error = error {
        print("~~ BAD NEWS!", error)
      }
      print("CardReaderManager disconnect successs");
    }
  }
  
  
  private var shouldConnectFirstReader = false;
  
  private static var eventEmitter: ReactNativeEventEmitter!
  
  static var connectionTokenFetchCompletion: ConnectionTokenCompletionBlock?
  
  private static var paymentCancelable: Cancelable?
  private static var discoverCancelable: Cancelable?
  
  static func stringConnectionStatus(status: PaymentStatus) -> String {
    var statusString = "Unknown"
    switch status {
    case .collectingPaymentMethod:
      statusString = "CollectingPaymentMethod"
    case .confirmingPaymentIntent:
      statusString = "CollectingPaymentIntent"
    case .notReady:
      statusString = "NotReady"
    case .ready:
      statusString = "Ready"
    }
    return statusString
  }
  
  @objc static
    func requiresMainQueueSetup() -> Bool {
    return true
  }
  
  @objc(prepareReader:)
  func prepareReader(callback: @escaping RCTResponseSenderBlock) -> Void {
    DispatchQueue.main.async {
      print("~~ preparing reader")
      let terminal = Terminal.shared
      let status = terminal.paymentStatus

      print("~~ status=", Terminal.stringFromPaymentStatus(status))

      
      EventEmitter.sharedInstance.dispatch(name: "CardReaderState", body: [
        "status": CardReaderManager.stringConnectionStatus(status: status),
        "statusMessage": Terminal.stringFromPaymentStatus(status),
      ])
      
      callback([NSNull()])

      if (status == PaymentStatus.notReady) {
        
        if (terminal.connectedReader != nil) {
          return
        }
        
        if let cancelable = CardReaderManager.discoverCancelable {
           if (!cancelable.completed) {
            cancelable.cancel { error in
              CardReaderManager.discoverCancelable = nil
              if let error = error {
                print("~~ failed to cancel", error)
              }
              self.discoverAndConnect()
            }
            return;
          }
        }
        self.discoverAndConnect()
      }

    }
  }
  
  private func discoverAndConnect() -> Void {
    print("~~ discoverAndConnect")
    self.shouldConnectFirstReader = true;
    guard let discoverConfig = DiscoveryConfiguration(deviceType: .chipper2X, method: .bluetoothProximity) else {
      print("~~ wtf yo")

      return
      
    }
    
    let terminal = Terminal.shared
    
    CardReaderManager.discoverCancelable = terminal.discoverReaders(discoverConfig, delegate: self) { error in
      CardReaderManager.discoverCancelable = nil
      print("~~ callback of discoverReaders")
      if let error = error {
        print("~~ discovery start failed", error)
        EventEmitter.sharedInstance.dispatch(name: "CardReaderState", body: [
          "errorStep": "discoverReaders",
          "error": error
          ])
      } else {
        print("~~ discovery started")
      }
    }
    
  }
 
  
  @objc(provideConnectionToken:)
  func provideConnectionToken(token: String) -> Void {
    CardReaderManager.connectionTokenFetchCompletion?(token, nil)
  }
  
  @objc(disconnectReader:)
  func disconnectReader(callback: @escaping RCTResponseSenderBlock) -> Void {
    Terminal.shared.disconnectReader { error in
      if let error = error {
        callback([ "Disconnect failed: \(error)" ])
      }
      else {
        callback([])
      }
    }
  }
  
  
  @objc(getPayment:description:callback:)
  func getPayment(amount: NSNumber, description: String, callback: @escaping RCTResponseSenderBlock) -> Void {
    
    if (CardReaderManager.paymentCancelable != nil) {
      callback([
        [
          "message": "Must cancel previous getPayment via cancelPayment",
          "code": 501,
        ]
      ])
      return;
    }
    
    let payParams = PaymentIntentParameters(amount: UInt(truncating: amount), currency: "USD")
    Terminal.shared.createPaymentIntent(payParams) { (intent, error) in
      if let error = error {
        print("========= s eror creating paynent intent", error)
        callback([error])
      }
      else if let intent = intent {
        print("========= s intent intent intent", intent.stripeId)
        EventEmitter.sharedInstance.dispatch(name: "CardReaderState", body: [
          "paymentIntentId": intent.stripeId
        ])
        callback([
          NSNull(),
          [
            "paymentIntentId": intent.stripeId,
          ]
        ])

        CardReaderManager.paymentCancelable = Terminal.shared.collectPaymentMethod(intent, delegate: self) { intentWithSource, attachError in

          CardReaderManager.paymentCancelable = nil
          if let error = attachError {
            if (error._code == 102) {
              EventEmitter.sharedInstance.dispatch(name: "CardReaderState", body: [
                "isCollecting": false,
                ])
              // error code for cancelled payment
              return
            }
            EventEmitter.sharedInstance.dispatch(name: "CardReaderState", body: [
              "errorStep": "collectPaymentMethod",
              "isCollecting": false,
              "error": error,
            ])
          }
          else if let intent = intentWithSource {
            Terminal.shared.confirmPaymentIntent(intent) { confirmedIntent, confirmError in
              if let error = confirmError {
                EventEmitter.sharedInstance.dispatch(name: "CardReaderState", body: [
                  "errorStep": "confirmPaymentIntent",
                  "isCollecting": false,
                  "errorCode": error.code,
                  "errorDeclineCode": error.declineCode!,
                  "errorPaymentIntentId": intent.stripeId
                ])
              }
              else if let intent = confirmedIntent {
                EventEmitter.sharedInstance.dispatch(name: "CardReaderPaymentReadyForCapture", body: [
                  "paymentIntentId": intent.stripeId,
                ])
                let status = Terminal.shared.paymentStatus
                EventEmitter.sharedInstance.dispatch(name: "CardReaderState", body: [
                  "isCollecting": false,
                  "status": CardReaderManager.stringConnectionStatus(status: status),
                  "statusMessage": Terminal.stringFromPaymentStatus(status),
                ])
              }
            }
          }
        }
      }
    }
  }
  
  @objc(cancelPayment:)
  func cancelPayment(callback: @escaping RCTResponseSenderBlock) -> Void {
    if (CardReaderManager.paymentCancelable != nil) {
      CardReaderManager.paymentCancelable?.cancel() { cancelError in
        let status = Terminal.shared.paymentStatus
        if let error = cancelError {
          EventEmitter.sharedInstance.dispatch(name: "CardReaderState", body: [
            "status": CardReaderManager.stringConnectionStatus(status: status),
            "statusMessage": Terminal.stringFromPaymentStatus(status),
          ])
          callback([error])
        }
        else {
          EventEmitter.sharedInstance.dispatch(name: "CardReaderState", body: [
            "status": CardReaderManager.stringConnectionStatus(status: status),
            "statusMessage": Terminal.stringFromPaymentStatus(status),
          ])
          callback([NSNull()])
        }
      }
    }
    else {
      let status = Terminal.shared.paymentStatus
      EventEmitter.sharedInstance.dispatch(name: "CardReaderState", body: [
        "status": CardReaderManager.stringConnectionStatus(status: status),
        "statusMessage": Terminal.stringFromPaymentStatus(status),
      ])
      callback([NSNull()])
    }
  }
 
  
  // MARK: DiscoveryDelegate
  
  func terminal(_ terminal: Terminal, didUpdateDiscoveredReaders readers: [Reader]) {
    print("~~ readers discovered", readers.count)
    if (self.shouldConnectFirstReader) {
      print("~~ connecting reader", readers[0])
      Terminal.shared.connectReader(readers[0]) { reader, readerError in
        if let reader = reader {
          print("~~ rrr reader", reader.serialNumber)
          EventEmitter.sharedInstance.dispatch(name: "CardReaderState", body: [
            "connectionError": false,
            "readerSerialNumber": reader.serialNumber
          ])
        }
        else if let error = readerError {
          print("~~ connection reader error", error)
          EventEmitter.sharedInstance.dispatch(name: "CardReaderState", body: [
            "connectionError": error,
            "isCollecting":false,
            "errorStep": "connectReader",
          ])
        }
      }
    }
  }
  
  
  func capturePaymentIntent(_ paymentIntentId: String, completion: @escaping ErrorCompletionBlock) {
    EventEmitter.sharedInstance.dispatch(name: "CardReaderPaymentReadyForCapture", body: [
      "paymentIntentId": paymentIntentId
    ])
    let status = Terminal.shared.paymentStatus
    EventEmitter.sharedInstance.dispatch(name: "CardReaderState", body: [
      "paymentIntentId": paymentIntentId,
      "isCollecting": true,
      "status": CardReaderManager.stringConnectionStatus(status: status),
      "statusMessage": Terminal.stringFromPaymentStatus(status),
    ])
  }

  // MARK: ReaderInputDelegate
  
  func terminal(_ terminal: Terminal, didBeginWaitingForReaderInput inputOptions: ReaderInputOptions = []) {
    var namedOptions: [String] = []
    if inputOptions.contains(ReaderInputOptions.swipeCard) {
      namedOptions.append("SwipeCard")
    }
    if inputOptions.contains(ReaderInputOptions.insertCard) {
      namedOptions.append("InsertCard")
    }
    if inputOptions.contains(ReaderInputOptions.tapCard) {
      namedOptions.append("TapCard")
    }
    EventEmitter.sharedInstance.dispatch(name: "CardReaderState", body: [
      "inputOptionsMessage": Terminal.stringFromReaderInputOptions(inputOptions),
      "inputOptions": namedOptions,
      "isCollecting": true,
    ])
  }
  
  func terminal(_ terminal: Terminal, didRequestReaderInputPrompt inputPrompt: ReaderInputPrompt) {
    var promptType = "Unknown"
    if inputPrompt == ReaderInputPrompt.insertCard {
      promptType = "InsertCard";
    }
    else if inputPrompt == ReaderInputPrompt.removeCard {
      promptType = "RemoveCard";
    }
    else if inputPrompt == ReaderInputPrompt.insertOrSwipeCard {
      promptType = "InsertOrSwipe";
    }
    else if inputPrompt == ReaderInputPrompt.tryAnotherCard {
      promptType = "TryAnotherCard";
    }
    else if inputPrompt == ReaderInputPrompt.tryAnotherReadMethod {
      promptType = "TryAnotherReadMethod";
    }
    else if inputPrompt == ReaderInputPrompt.retryCard {
      promptType = "RetryCard";
    }
    else if inputPrompt == ReaderInputPrompt.swipeCard {
      promptType = "SwipeCard";
    }
    else if inputPrompt == ReaderInputPrompt.multipleContactlessCardsDetected {
      promptType = "MultipleContactlessCardsDetected";
    }
    EventEmitter.sharedInstance.dispatch(name: "CardReaderState", body: [
      "promptType": promptType,
      "promptMessage": Terminal.stringFromReaderInputPrompt(inputPrompt),
    ])
  }
  
  func terminal(_ terminal: Terminal, didReportReaderEvent event: ReaderEvent, info: [AnyHashable : Any]?) {
    print("--------- s reader event")
    print("---------", event)
    switch (event) {
    case .cardInserted:
      print("----- s hello true")
      EventEmitter.sharedInstance.dispatch(name: "CardInsertState", body: [
        "isCardInserted": true,
      ])
      break;
    case .cardRemoved:
      print("----- s hello false")
      EventEmitter.sharedInstance.dispatch(name: "CardInsertState", body: [
        "isCardInserted": false,
      ])
      break;
    }
  }
  
  func terminal(_ terminal: Terminal, didChangePaymentStatus status: PaymentStatus) {
    EventEmitter.sharedInstance.dispatch(name: "CardReaderState", body: [
      "status": CardReaderManager.stringConnectionStatus(status: status),
      "statusMessage": Terminal.stringFromPaymentStatus(status),
    ])
  }

}
