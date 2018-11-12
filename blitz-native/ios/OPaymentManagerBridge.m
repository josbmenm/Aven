#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(OPaymentManager, NSObject)

RCT_EXTERN_METHOD(setup: (nonnull NSString *)authCode callback:(RCTResponseSenderBlock)callback)
RCT_EXTERN_METHOD(getPayment:(nonnull NSNumber *)amount description:(NSString *)description)
RCT_EXTERN_METHOD(openSettings: (RCTResponseSenderBlock)callback)
RCT_EXTERN_METHOD(dismissPayment: (RCTResponseSenderBlock)callback)

@end
