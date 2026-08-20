#import "RnSavingsNotifier.h"

@implementation RnSavingsNotifier

- (void)notifyGoalCompleted:(NSString *)goalName
                    resolve:(RCTPromiseResolveBlock)resolve
                     reject:(RCTPromiseRejectBlock)reject
{
    resolve(nil);
}

- (void)showConfirmDialog:(NSString *)title
                  message:(NSString *)message
                  resolve:(RCTPromiseResolveBlock)resolve
                   reject:(RCTPromiseRejectBlock)reject
{
    resolve(@YES);
}

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
    (const facebook::react::ObjCTurboModule::InitParams &)params
{
    return std::make_shared<facebook::react::NativeRnSavingsNotifierSpecJSI>(params);
}

+ (NSString *)moduleName
{
    return @"RnSavingsNotifier";
}

@end
