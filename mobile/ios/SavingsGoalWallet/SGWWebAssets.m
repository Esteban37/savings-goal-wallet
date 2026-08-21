#import "SGWWebAssets.h"

@implementation SGWWebAssets

RCT_EXPORT_MODULE();

+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

RCT_EXPORT_BLOCKING_SYNCHRONOUS_METHOD(indexHtmlUri)
{
  NSURL *url = [[NSBundle mainBundle] URLForResource:@"index"
                                       withExtension:@"html"
                                        subdirectory:@"web"];
  return url.absoluteString;
}

@end
