import { type ComponentClass, type Ref } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  WebView as RNWebView,
  type WebViewMessageEvent,
  type WebViewProps,
} from 'react-native-webview';

const WebView = RNWebView as unknown as ComponentClass<WebViewProps>;

export const LOCAL_WEB_ASSET_URI = 'file:///android_asset/web/index.html';

export type HostWebView = {
  injectJavaScript: (script: string) => void;
};

type ImmersiveWebViewTemplateProps = {
  sourceUri: string;
  onMessage: (event: WebViewMessageEvent) => void;
  onWebViewRef: Ref<HostWebView>;
};

export function ImmersiveWebViewTemplate({
  sourceUri,
  onMessage,
  onWebViewRef,
}: ImmersiveWebViewTemplateProps) {
  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <WebView
        ref={onWebViewRef as never}
        source={{ uri: sourceUri }}
        onMessage={onMessage}
        javaScriptEnabled
        originWhitelist={['*']}
        allowFileAccess
        allowingReadAccessToURL={sourceUri}
        mixedContentMode="always"
        style={styles.webView}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  webView: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});
