//
//  CardReaderManager.swift
//  blitz
//
//  Created by Eric Vicenti on 12/19/18.
//  Copyright © 2018 Facebook. All rights reserved.
//

import Foundation
import StripeTerminal


@objc(CardReaderManager)
class CardReaderManager: NSObject, TerminalDelegate, ConnectionTokenProvider, DiscoveryDelegate, ReaderInputDelegate {

  
  static var terminal: Terminal?
  
  private var shouldConnectFirstReader = false;
  
  private static var eventEmitter: ReactNativeEventEmitter!
  
  private static var connectionTokenFetchCompletion: ConnectionTokenCompletionBlock?
  
  private static var paymentCancelable: Cancelable?
  private static var connectCancelable: Cancelable?
  
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

      if (CardReaderManager.terminal == nil) {
        // required
        Terminal.setTokenProvider(self)
        // optional – set a listener to incorporate SDK logs into your own logs
//        Terminal.setLogListener({ ... })
        // optional – set a delegate to receive status updates from the SDK
        Terminal.shared.delegate = self
        
        print("~~ configuring terminal")
//        CardReaderManager.terminal = Terminal(configuration: config,
//                                tokenProvider: self,
//                                delegate: self)
      }

      let status = CardReaderManager.terminal?.paymentStatus ?? PaymentStatus.notReady

      print("~~ status=", Terminal.stringFromPaymentStatus(status))

      
      EventEmitter.sharedInstance.dispatch(name: "CardReaderState", body: [
        "status": CardReaderManager.stringConnectionStatus(status: status),
        "statusMessage": Terminal.stringFromPaymentStatus(status),
      ])
      
      callback([NSNull()])

      if (status == PaymentStatus.notReady) {
        
        if (CardReaderManager.terminal?.connectedReader != nil) {
          return
        }
        
        if let cancelable = CardReaderManager.connectCancelable {
          if (!cancelable.completed) {
            cancelable.cancel({ (error) in
              if let error = error {
                print("~~ failed to cancel", error)
              }
              self.discoverAndConnect()
            })
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
    guard let discoverConfig = DiscoveryConfiguration(deviceType: DeviceType.chipper2X, method: DiscoveryMethod.bluetoothProximity) else { return }
    
    
    CardReaderManager.connectCancelable = CardReaderManager.terminal?.discoverReaders(discoverConfig, delegate: self) { error in
      CardReaderManager.connectCancelable = nil
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
    CardReaderManager.terminal?.createPaymentIntent(payParams) { (intent, error) in
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

        CardReaderManager.paymentCancelable = CardReaderManager.terminal?.collectPaymentMethod(intent, delegate: self) { intentWithSource, attachError in

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
            CardReaderManager.terminal?.confirmPaymentIntent(intent) { confirmedIntent, confirmError in
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
                let status = CardReaderManager.terminal?.paymentStatus ?? PaymentStatus.notReady
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
        let status = CardReaderManager.terminal?.paymentStatus ?? PaymentStatus.notReady
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
      let status = CardReaderManager.terminal?.paymentStatus ?? PaymentStatus.notReady
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
      CardReaderManager.terminal?.connectReader(readers[0]) { reader, readerError in
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
  
  
  // MARK: ConnectionTokenProvider
  
  func fetchConnectionToken(_ completion: @escaping ConnectionTokenCompletionBlock) {
    EventEmitter.sharedInstance.dispatch(name: "CardReaderTokenRequested", body: [])
    CardReaderManager.connectionTokenFetchCompletion = completion;
  }
  
  func capturePaymentIntent(_ paymentIntentId: String, completion: @escaping ErrorCompletionBlock) {
    EventEmitter.sharedInstance.dispatch(name: "CardReaderPaymentReadyForCapture", body: [
      "paymentIntentId": paymentIntentId
    ])
    let status = CardReaderManager.terminal?.paymentStatus ?? PaymentStatus.notReady
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
