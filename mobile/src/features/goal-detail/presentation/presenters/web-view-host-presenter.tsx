import type { Ref } from 'react';
import type { WebViewMessageEvent } from 'react-native-webview';
import {
  ImmersiveWebViewTemplate,
  type HostWebView,
} from '../templates/immersive-web-view-template';

type WebViewHostPresenterProps = {
  sourceUri: string;
  onMessage: (event: WebViewMessageEvent) => void;
  onWebViewRef: Ref<HostWebView>;
};

export function WebViewHostPresenter({
  sourceUri,
  onMessage,
  onWebViewRef,
}: WebViewHostPresenterProps) {
  return (
    <ImmersiveWebViewTemplate
      sourceUri={sourceUri}
      onMessage={onMessage}
      onWebViewRef={onWebViewRef}
    />
  );
}
