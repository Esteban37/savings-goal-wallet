import { NativeModules, Platform } from 'react-native';

export const ANDROID_WEB_ASSET_URI = 'file:///android_asset/web/index.html';

/**
 * react-native-webview defaults to http(s) only. iOS file URLs often carry a
 * `localhost` host (`file://localhost/...`); `*` accepts that host and the
 * host-less `file:///...` form used by `loadFileURL:`.
 */
export const LOCAL_WEB_ORIGIN_WHITELIST = [
  '*',
  'file://*',
  'file://localhost*',
  'http://*',
  'https://*',
] as const;

type WebAssetsModule = {
  getConstants?: () => {
    indexHtmlUri?: string;
    webDirectoryUri?: string;
  };
  indexHtmlUri?: (() => string | null | undefined) | string;
  webDirectoryUri?: (() => string | null | undefined) | string;
};

type IosWebBundleUris = {
  indexHtmlUri?: string;
  webDirectoryUri?: string;
};

let iosWebBundleFromAppProps: IosWebBundleUris = {};

export function setIosWebBundleUris(uris: IosWebBundleUris): void {
  iosWebBundleFromAppProps = {
    indexHtmlUri: uris.indexHtmlUri,
    webDirectoryUri: uris.webDirectoryUri,
  };
}

export function toHostlessFileUri(uri: string): string {
  if (!uri.startsWith('file://localhost/')) {
    return uri;
  }
  return `file://${uri.slice('file://localhost'.length)}`;
}

function readNativeField(
  native: WebAssetsModule | undefined,
  key: 'indexHtmlUri' | 'webDirectoryUri',
): string | undefined {
  if (native == null) {
    return undefined;
  }
  const constants = native.getConstants?.();
  const fromConstants = constants?.[key];
  if (typeof fromConstants === 'string' && fromConstants.length > 0) {
    return fromConstants;
  }
  const raw = native[key];
  const value = typeof raw === 'function' ? raw() : raw;
  if (typeof value !== 'string' || value.length === 0) {
    return undefined;
  }
  return value;
}

export function getLocalWebAssetUri(): string {
  if (Platform.OS !== 'ios') {
    return ANDROID_WEB_ASSET_URI;
  }
  const iosUri =
    readNativeField(
      NativeModules.SGWWebAssets as WebAssetsModule | undefined,
      'indexHtmlUri',
    ) ?? iosWebBundleFromAppProps.indexHtmlUri;
  if (iosUri == null || iosUri.length === 0) {
    return '';
  }
  return toHostlessFileUri(iosUri);
}

export function getLocalWebReadAccessUri(sourceUri: string): string {
  if (sourceUri.includes('android_asset')) {
    return sourceUri;
  }
  const nativeDirectory =
    readNativeField(
      NativeModules.SGWWebAssets as WebAssetsModule | undefined,
      'webDirectoryUri',
    ) ?? iosWebBundleFromAppProps.webDirectoryUri;
  if (nativeDirectory != null && nativeDirectory.length > 0) {
    return toHostlessFileUri(nativeDirectory);
  }
  return toHostlessFileUri(sourceUri.replace(/\/index\.html$/u, '/'));
}
