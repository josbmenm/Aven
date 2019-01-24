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
  
  private static var cancelable: Cancelable?

  
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
      
      if (CardReaderManager.terminal == nil) {
        let config = TerminalConfiguration()
        CardReaderManager.terminal = Terminal(configuration: config,
                                tokenProvider: self,
                                delegate: self)
      }

      let status = CardReaderManager.terminal?.paymentStatus ?? PaymentStatus.notReady

      
      EventEmitter.sharedInstance.dispatch(name: "CardReaderState", body: [
        "status": CardReaderManager.stringConnectionStatus(status: status),
        "statusMessage": Terminal.stringFromPaymentStatus(status),
      ])
      
      callback([NSNull()])

      if (status == PaymentStatus.notReady) {
    
        if (CardReaderManager.terminal?.connectedReader == nil) {
          guard let discoverConfig = DiscoveryConfiguration(deviceType: DeviceType.chipper2X, method: DiscoveryMethod.bluetoothProximity) else { return }
          
          self.shouldConnectFirstReader = true;
          
          CardReaderManager.terminal?.discoverReaders(discoverConfig, delegate: self) { error in
            if let error = error {
              EventEmitter.sharedInstance.dispatch(name: "CardReaderState", body: [
                "errorStep": "discoverReaders",
                "error": error
              ])
            }
          }
        }
      }

    }
  }
  
  @objc(provideConnectionToken:)
  func provideConnectionToken(token: String) -> Void {
    CardReaderManager.connectionTokenFetchCompletion?(token, nil)
  }
  
  
  @objc(getPayment:description:callback:)
  func getPayment(amount: NSNumber, description: String, callback: @escaping RCTResponseSenderBlock) -> Void {
    
    let payParams = PaymentIntentParameters(amount: UInt(truncating: amount), currency: "USD")
    CardReaderManager.terminal?.createPaymentIntent(payParams) { (intent, error) in
      if let error = error {
        callback([error])
      }
      else if let intent = intent {
        EventEmitter.sharedInstance.dispatch(name: "CardReaderState", body: [
          "paymentIntentId": intent.stripeId
        ])
        callback([
          NSNull(),
          [
            "paymentIntentId": intent.stripeId,
          ]
        ])

        CardReaderManager.cancelable = CardReaderManager.terminal?.collectPaymentMethod(intent, delegate: self) { intentWithSource, attachError in

          CardReaderManager.cancelable = nil
          if let error = attachError {
            if (error._code == 102) {
              EventEmitter.sharedInstance.dispatch(name: "CardReaderState", body: [
                "errorStep": "confirmPaymentIntent",
                "error": error,
                ])
              // error code for cancelled payment
              return
            }
            EventEmitter.sharedInstance.dispatch(name: "CardReaderState", body: [
              "errorStep": "collectPaymentMethod",
              "error": error,
            ])
          }
          else if let intent = intentWithSource {
            CardReaderManager.terminal?.confirmPaymentIntent(intent) { confirmedIntent, confirmError in
              if let error = confirmError {
                EventEmitter.sharedInstance.dispatch(name: "CardReaderState", body: [
                  "errorStep": "confirmPaymentIntent",
                  "error": error,
                ])
              }
              else if let intent = confirmedIntent {
                EventEmitter.sharedInstance.dispatch(name: "CardReaderPaymentReadyForCapture", body: [
                  "paymentIntentId": intent.stripeId,
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
    if (CardReaderManager.cancelable != nil) {
      CardReaderManager.cancelable?.cancel() { cancelError in
        if let error = cancelError {
          callback([error])
        }
        else {
          callback([NSNull()])
        }
      }
    }
    else {
      callback([NSNull()])
    }
  }
 
  
  // MARK: DiscoveryDelegate
  
  func terminal(_ terminal: Terminal, didUpdateDiscoveredReaders readers: [Reader]) {
    if (self.shouldConnectFirstReader) {
      CardReaderManager.terminal?.connectReader(readers[0]) { reader, readerError in
        if let reader = reader {
          EventEmitter.sharedInstance.dispatch(name: "CardReaderState", body: [
            "connectionError": false,
            "readerSerialNumber": reader.serialNumber
          ])
        }
        else if let error = readerError {
          EventEmitter.sharedInstance.dispatch(name: "CardReaderState", body: [
            "connectionError": error,
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
    EventEmitter.sharedInstance.dispatch(name: "CardReaderState", body: [
      "paymentIntentId": paymentIntentId
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
    switch (event) {
    case .cardInserted:
      EventEmitter.sharedInstance.dispatch(name: "CardReaderState", body: [
        "isCardInserted": true,
      ])
      break;
    case .cardRemoved:
      EventEmitter.sharedInstance.dispatch(name: "CardReaderState", body: [
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
