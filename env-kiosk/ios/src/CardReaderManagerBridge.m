#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(CardReaderManager, NSObject)

RCT_EXTERN_METHOD(prepareReader: (RCTResponseSenderBlock)callback)
RCT_EXTERN_METHOD(provideConnectionToken: (NSString)token)
RCT_EXTERN_METHOD(getPayment:(nonnull NSNumber *)amount description:(NSString *)description callback:(RCTResponseSenderBlock)callback)
RCT_EXTERN_METHOD(cancelPayment:(RCTResponseSenderBlock)callback)
RCT_EXTERN_METHOD(disconnectReader:(RCTResponseSenderBlock)callback)

@end
