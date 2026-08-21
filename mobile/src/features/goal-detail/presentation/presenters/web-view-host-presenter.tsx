import type { Ref } from 'react';
import type { WebViewMessageEvent } from 'react-native-webview';
import type { ColorScheme } from '../../../../shared/ui/tokens';
import {
  ImmersiveWebViewTemplate,
  type HostWebView,
} from '../templates/immersive-web-view-template';

type WebViewHostPresenterProps = {
  sourceUri: string;
  colorScheme: ColorScheme;
  onMessage: (event: WebViewMessageEvent) => void;
  onWebViewRef: Ref<HostWebView>;
};

export function WebViewHostPresenter({
  sourceUri,
  colorScheme,
  onMessage,
  onWebViewRef,
}: WebViewHostPresenterProps) {
  return (
    <ImmersiveWebViewTemplate
      sourceUri={sourceUri}
      colorScheme={colorScheme}
      onMessage={onMessage}
      onWebViewRef={onWebViewRef}
    />
  );
}
