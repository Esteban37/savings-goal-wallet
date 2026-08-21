#import "RnSavingsNotifier.h"

#import <React/RCTUtils.h>
#import <UIKit/UIKit.h>

static void SGWShowOverlay(NSString *message)
{
  dispatch_async(dispatch_get_main_queue(), ^{
    UIWindow *window = RCTKeyWindow();
    if (window == nil) {
      return;
    }

    UILabel *label = [[UILabel alloc] init];
    label.text = message;
    label.textColor = UIColor.whiteColor;
    label.backgroundColor = [[UIColor blackColor] colorWithAlphaComponent:0.82];
    label.font = [UIFont systemFontOfSize:14];
    label.textAlignment = NSTextAlignmentCenter;
    label.numberOfLines = 0;
    label.layer.cornerRadius = 8;
    label.clipsToBounds = YES;

    CGFloat maxWidth = window.bounds.size.width - 40;
    CGSize fitted = [label sizeThatFits:CGSizeMake(maxWidth, CGFLOAT_MAX)];
    CGFloat width = MIN(maxWidth, MAX(fitted.width + 24, 120));
    CGFloat height = fitted.height + 16;
    label.frame = CGRectMake((window.bounds.size.width - width) / 2.0,
                             window.bounds.size.height - height - 48,
                             width,
                             height);
    [window addSubview:label];

    dispatch_after(dispatch_time(DISPATCH_TIME_NOW, (int64_t)(2.0 * NSEC_PER_SEC)),
                   dispatch_get_main_queue(), ^{
                     [UIView animateWithDuration:0.2
                                      animations:^{
                                        label.alpha = 0;
                                      }
                                      completion:^(BOOL finished) {
                                        [label removeFromSuperview];
                                      }];
                   });
  });
}

@implementation RnSavingsNotifier

- (void)notifyGoalCompleted:(NSString *)goalName
                    resolve:(RCTPromiseResolveBlock)resolve
                     reject:(RCTPromiseRejectBlock)reject
{
  if (goalName.length == 0) {
    resolve(nil);
    return;
  }
  SGWShowOverlay([NSString stringWithFormat:@"Meta completada: %@", goalName]);
  resolve(nil);
}

- (void)notifyGoalCreated:(NSString *)goalName
                  resolve:(RCTPromiseResolveBlock)resolve
                   reject:(RCTPromiseRejectBlock)reject
{
  if (goalName.length == 0) {
    resolve(nil);
    return;
  }
  SGWShowOverlay([NSString stringWithFormat:@"Meta registrada: %@", goalName]);
  resolve(nil);
}

- (void)showConfirmDialog:(NSString *)title
                  message:(NSString *)message
                  resolve:(RCTPromiseResolveBlock)resolve
                   reject:(RCTPromiseRejectBlock)reject
{
  dispatch_async(dispatch_get_main_queue(), ^{
    UIViewController *presenter = RCTPresentedViewController();
    if (presenter == nil) {
      resolve(@NO);
      return;
    }

    __block BOOL settled = NO;
    void (^settle)(BOOL) = ^(BOOL value) {
      if (settled) {
        return;
      }
      settled = YES;
      resolve(@(value));
    };

    UIAlertController *alert =
        [UIAlertController alertControllerWithTitle:title
                                            message:message
                                     preferredStyle:UIAlertControllerStyleAlert];
    [alert addAction:[UIAlertAction actionWithTitle:@"Cancelar"
                                              style:UIAlertActionStyleCancel
                                            handler:^(UIAlertAction *action) {
                                              settle(NO);
                                            }]];
    [alert addAction:[UIAlertAction actionWithTitle:@"Eliminar"
                                              style:UIAlertActionStyleDestructive
                                            handler:^(UIAlertAction *action) {
                                              settle(YES);
                                            }]];
    [presenter presentViewController:alert animated:YES completion:nil];
  });
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
