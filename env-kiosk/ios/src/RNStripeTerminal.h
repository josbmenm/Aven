#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

#import <StripeTerminal/StripeTerminal.h>

@interface RNStripeTerminal : RCTEventEmitter <RCTBridgeModule, SCPConnectionTokenProvider, SCPDiscoveryDelegate, SCPReaderInputDelegate, SCPTerminalDelegate> {
  
  NSArray<SCPReader *> *readers;
  SCPReader *reader;
  SCPCancelable *pendingCreatePaymentIntent;
  SCPCancelable *pendingDiscoverReaders;
  SCPConnectionTokenCompletionBlock pendingConnectionTokenCompletionBlock;
  SCPReaderEvent lastReaderEvent;
}

@end
