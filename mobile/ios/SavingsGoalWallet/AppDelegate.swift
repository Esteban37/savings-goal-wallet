import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
  var window: UIWindow?

  var reactNativeDelegate: ReactNativeDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    let delegate = ReactNativeDelegate()
    let factory = RCTReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = factory

    window = UIWindow(frame: UIScreen.main.bounds)

    factory.startReactNative(
      withModuleName: "SavingsGoalWallet",
      in: window,
      initialProperties: Self.webBundleProperties(),
      launchOptions: launchOptions
    )

    return true
  }

  /// Host-less `file://` URLs so WKWebView uses `loadFileURL:` (a `localhost`
  /// host makes react-native-webview call `loadRequest:` and fail with NSURLErrorDomain).
  private static func webBundleProperties() -> [String: String] {
    guard
      let path = Bundle.main.path(forResource: "index", ofType: "html", inDirectory: "web")
    else {
      return [:]
    }
    let htmlURL = URL(fileURLWithPath: path)
    return [
      "webIndexHtmlUri": htmlURL.absoluteString,
      "webDirectoryUri": htmlURL.deletingLastPathComponent().absoluteString,
    ]
  }
}

class ReactNativeDelegate: RCTDefaultReactNativeFactoryDelegate {
  override func sourceURL(for bridge: RCTBridge) -> URL? {
    self.bundleURL()
  }

  override func extraModules(for bridge: RCTBridge!) -> [any RCTBridgeModule] {
    [SGWWebAssets()]
  }

  override func bundleURL() -> URL? {
#if DEBUG
    RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
#else
    Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }
}
