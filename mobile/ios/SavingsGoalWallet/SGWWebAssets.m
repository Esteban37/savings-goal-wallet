#import "SGWWebAssets.h"

@implementation SGWWebAssets

RCT_EXPORT_MODULE();

+ (BOOL)requiresMainQueueSetup
{
  return NO;
}

+ (NSURL *)indexHtmlFileURL
{
  NSBundle *bundle = [NSBundle mainBundle];
  NSString *path = [bundle pathForResource:@"index" ofType:@"html" inDirectory:@"web"];
  if (path.length == 0) {
    return nil;
  }
  // Host-less file URLs make react-native-webview call loadFileURL: instead of
  // loadRequest:, which fails with NSURLErrorDomain for file://localhost/...
  return [NSURL fileURLWithPath:path];
}

- (NSDictionary *)constantsToExport
{
  return [self getConstants];
}

- (NSDictionary *)getConstants
{
  NSURL *url = [SGWWebAssets indexHtmlFileURL];
  NSURL *directory = [url URLByDeletingLastPathComponent];
  return @{
    @"indexHtmlUri": url.absoluteString ?: @"",
    @"webDirectoryUri": directory.absoluteString ?: @"",
  };
}

RCT_EXPORT_BLOCKING_SYNCHRONOUS_METHOD(indexHtmlUri)
{
  return [SGWWebAssets indexHtmlFileURL].absoluteString;
}

RCT_EXPORT_BLOCKING_SYNCHRONOUS_METHOD(webDirectoryUri)
{
  NSURL *url = [SGWWebAssets indexHtmlFileURL];
  return url.URLByDeletingLastPathComponent.absoluteString;
}

@end
