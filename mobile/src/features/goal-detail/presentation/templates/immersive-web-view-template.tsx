import { type ComponentClass, type Ref, useEffect, useRef } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  WebView as RNWebView,
  type WebViewMessageEvent,
  type WebViewProps,
} from 'react-native-webview';
import type { ColorScheme } from '../../../../shared/ui/tokens';
import {
  LOCAL_WEB_ORIGIN_WHITELIST,
  getLocalWebReadAccessUri,
} from '../../infrastructure/local-web-asset-uri';
import { createThemeAttributeScript } from './create-theme-attribute-script';

const WebView = RNWebView as unknown as ComponentClass<WebViewProps>;

export type HostWebView = {
  injectJavaScript: (script: string) => void;
};

type ImmersiveWebViewTemplateProps = {
  sourceUri: string;
  colorScheme: ColorScheme;
  onMessage: (event: WebViewMessageEvent) => void;
  onWebViewRef: Ref<HostWebView>;
};

export function ImmersiveWebViewTemplate({
  sourceUri,
  colorScheme,
  onMessage,
  onWebViewRef,
}: ImmersiveWebViewTemplateProps) {
  const innerRef = useRef<HostWebView | null>(null);
  const themeScript = createThemeAttributeScript(colorScheme);

  const setRef = (instance: HostWebView | null) => {
    innerRef.current = instance;
    if (typeof onWebViewRef === 'function') {
      onWebViewRef(instance);
    } else if (onWebViewRef) {
      onWebViewRef.current = instance;
    }
  };

  useEffect(() => {
    innerRef.current?.injectJavaScript(themeScript);
  }, [themeScript]);

  if (!sourceUri) {
    return <SafeAreaView style={styles.safe} edges={['bottom']} />;
  }

  const readAccessUri = getLocalWebReadAccessUri(sourceUri);

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <WebView
        ref={setRef as never}
        source={{ uri: sourceUri }}
        onMessage={onMessage}
        javaScriptEnabled
        originWhitelist={[...LOCAL_WEB_ORIGIN_WHITELIST]}
        onShouldStartLoadWithRequest={() => true}
        allowFileAccess
        allowFileAccessFromFileURLs
        allowUniversalAccessFromFileURLs
        allowingReadAccessToURL={readAccessUri}
        mixedContentMode="always"
        injectedJavaScriptBeforeContentLoaded={themeScript}
        injectedJavaScript={themeScript}
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
