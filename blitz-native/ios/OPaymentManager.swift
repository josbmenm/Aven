//
//  OPaymentManager.swift
//  kiosk
//
//  Created by Eric Vicenti on 8/31/18.
//

import Foundation
import SquareReaderSDK
import CoreLocation
import AVFoundation

@objc(OPaymentManager)
class OPaymentManager: NSObject {
  
  public weak var delegate: SQRDCheckoutControllerDelegate?

  private lazy var locationManager = CLLocationManager()
  
  private static var eventEmitter: ReactNativeEventEmitter!

  
  @objc(setup:callback:)
  func setup(authCode: String, callback: @escaping RCTResponseSenderBlock) -> Void {
    DispatchQueue.main.async {

      // get audio permission
      switch AVAudioSession.sharedInstance().recordPermission {
      case .denied:
        print("open settings for audio permission!")
      case .undetermined:
        AVAudioSession.sharedInstance().requestRecordPermission { _ in
          print("audio permission")
        }
      case .granted:
        print("permission for audio granted!")
      default:
        print("other permission case!")
      }
      
      // get location permission
      switch CLLocationManager.authorizationStatus() {
      case .denied, .restricted:
        print("open settings for location permission!")
      case .notDetermined:
        self.locationManager.requestWhenInUseAuthorization()
      case .authorizedAlways, .authorizedWhenInUse:
        print("permission for location granted!")
      }
      
      // get square authorization
      if (SQRDReaderSDK.shared.isAuthorized) {
        SQRDReaderSDK.shared.deauthorize(completionHandler: { (err) in
          if let deauthError = err as? SQRDDeauthorizationError {
            guard let debugCode = deauthError.userInfo[SQRDErrorDebugCodeKey] as? String,
              let debugMessage = deauthError.userInfo[SQRDErrorDebugMessageKey] as? String else { return }
            callback([[
              "errorSource": "deauthorization",
              "debugCode": debugCode,
              "debugMessage": debugMessage
            ]])
            return
          }
          self.authorize(authCode: authCode, callback: callback);
        })
      } else {
        self.authorize(authCode: authCode, callback: callback);
      }

    }
  }

  func authorize(authCode: String, callback: @escaping RCTResponseSenderBlock) {
    SQRDReaderSDK.shared.authorize(withCode: authCode) { location, error in
      if let authError = error as? SQRDAuthorizationError {
        guard let debugCode = authError.userInfo[SQRDErrorDebugCodeKey] as? String,
          let debugMessage = authError.userInfo[SQRDErrorDebugMessageKey] as? String else { return }
        callback([[
          "errorSource": "authorization",
          "debugCode": debugCode,
          "debugMessage": debugMessage
        ]])
      } else if let location = location {
        callback([
          NSNull(),
          [
            "locationBusinessName": location.businessName,
            "locationId": location.locationID,
            "locationCurrency": location.currencyCode.isoCurrencyCode,
            "locationName": location.name
          ]
        ])
      }
    }
  }
  
  @objc(openSettings:)
  func openSettings(callback: @escaping RCTResponseSenderBlock) -> Void {
    DispatchQueue.main.async {

      let readerSettingsController = SQRDReaderSettingsController(delegate: self)
      let rootView = UIApplication.shared.keyWindow?.rootViewController;
      
      if (rootView != nil) {
        readerSettingsController.present(from: rootView!)
      }
      
      callback([NSNull()])
    }
  }
  
  private var checkoutController: SQRDCheckoutController?
  

  @objc(getPayment:description:)
  func getPayment(amount: NSNumber, description: String) -> Void {
    DispatchQueue.main.async {
      let money = SQRDMoney(amount: amount.intValue)
      let checkoutParameters = SQRDCheckoutParameters(amountMoney: money)
      checkoutParameters.note = description
      checkoutParameters.alwaysRequireSignature = false
      checkoutParameters.skipReceipt = true
      

      let rootView = UIApplication.shared.keyWindow?.rootViewController;
      
      if (rootView != nil) {
        self.checkoutController = SQRDCheckoutController(parameters: checkoutParameters, delegate: self as SQRDCheckoutControllerDelegate)

        self.checkoutController?.present(from: rootView!)
      }
      
      print(description, amount)
    }
  }
  
  @objc(dismissPayment:)
  func dismissPayment(callback: @escaping RCTResponseSenderBlock) -> Void {
    DispatchQueue.main.async {
      let rootView = UIApplication.shared.keyWindow?.rootViewController;
      rootView?.dismiss(animated: true, completion: {
        print("woa")
      })
    }
  }
  
  @objc
  func constantsToExport() -> [String: Any]! {
    return ["nativeSupportVersion": 1]
  }
  
  @objc static
  func requiresMainQueueSetup() -> Bool {
    return true
  }
  
  
  func format(amount: Int) -> String {
    let formatter = NumberFormatter()
    formatter.numberStyle = .currency
    formatter.currencyCode = authorizedLocation.currencyCode.isoCurrencyCode
    return formatter.string(from: NSNumber(value: Float(amount) / Float(100)))!
  }
  
  private var authorizedLocation: SQRDLocation {
    guard let location = SQRDReaderSDK.shared.authorizedLocation else {
      fatalError("You must authorize Reader SDK before attempting to access `authorizedLocation`.")
    }
    return location
  }
  
}

extension OPaymentManager : SQRDReaderSettingsControllerDelegate {
  func readerSettingsControllerDidPresent(_ readerSettingsController: SQRDReaderSettingsController) {
    print("The Reader Settings controller did present.")
  }
  
  func readerSettingsController(_ readerSettingsController: SQRDReaderSettingsController, didFailToPresentWith error: Error) {
    /**************************************************************************************************
     * The Reader Settings controller failed due to an error.
     *
     * Errors from Square Reader SDK always have a `localizedDescription` that is appropriate for displaying to users.
     * Use the values of `userInfo[SQRDErrorDebugCodeKey]` and `userInfo[SQRDErrorDebugMessageKey]` (which are always
     * set for Reader SDK errors) for more information about the underlying issue and how to recover from it in your app.
     **************************************************************************************************/
    
    guard let readerSettingsError = error as? SQRDReaderSettingsControllerError,
      let debugCode = readerSettingsError.userInfo[SQRDErrorDebugCodeKey] as? String,
      let debugMessage = readerSettingsError.userInfo[SQRDErrorDebugMessageKey] as? String else {
        return
    }
    
    print(debugCode)
    print(debugMessage)
    fatalError(error.localizedDescription)
  }
}

extension OPaymentManager : SQRDCheckoutControllerDelegate {
  
  func checkoutController(_ checkoutController: SQRDCheckoutController, didFinishCheckoutWith result: SQRDCheckoutResult) {
    // Checkout finished, print the result.
    print(result)
    
    let amountString = format(amount: result.totalMoney.amount)
    EventEmitter.sharedInstance.dispatch(name: "OPaymentComplete", body: ["debugCode": 0, "result": result, "amount": amountString ])
  }
  
  func checkoutController(_ checkoutController: SQRDCheckoutController, didFailWith error: Error) {
    /**************************************************************************************************
     * The Checkout controller failed due to an error.
     *
     * Errors from Square Reader SDK always have a `localizedDescription` that is appropriate for displaying to users.
     * Use the values of `userInfo[SQRDErrorDebugCodeKey]` and `userInfo[SQRDErrorDebugMessageKey]` (which are always
     * set for Reader SDK errors) for more information about the underlying issue and how to recover from it in your app.
     **************************************************************************************************/
    
    guard let checkoutError = error as? SQRDCheckoutControllerError,
      let debugCode = checkoutError.userInfo[SQRDErrorDebugCodeKey] as? String,
      let debugMessage = checkoutError.userInfo[SQRDErrorDebugMessageKey] as? String else {
        return
    }
    
    EventEmitter.sharedInstance.dispatch(name: "OPaymentError", body: ["debugCode": debugCode, "debugMessage": debugMessage])

  }
  
  func checkoutControllerDidCancel(_ checkoutController: SQRDCheckoutController) {
    EventEmitter.sharedInstance.dispatch(name: "OPaymentCancelled", body: ["debugCode": 0])
  }
  
}
