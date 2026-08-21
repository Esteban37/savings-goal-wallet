import { NativeModules, Platform } from 'react-native';

export const ANDROID_WEB_ASSET_URI = 'file:///android_asset/web/index.html';

type WebAssetsModule = {
  indexHtmlUri?: (() => string | null | undefined) | string;
};

function readIosIndexHtmlUri(): string | undefined {
  const native = NativeModules.SGWWebAssets as WebAssetsModule | undefined;
  if (native == null) {
    return undefined;
  }
  const raw =
    typeof native.indexHtmlUri === 'function'
      ? native.indexHtmlUri()
      : native.indexHtmlUri;
  if (typeof raw !== 'string' || raw.length === 0) {
    return undefined;
  }
  return raw;
}

export function getLocalWebAssetUri(): string {
  if (Platform.OS !== 'ios') {
    return ANDROID_WEB_ASSET_URI;
  }
  const iosUri = readIosIndexHtmlUri();
  if (iosUri != null) {
    return iosUri;
  }
  return ANDROID_WEB_ASSET_URI;
}

export function getLocalWebReadAccessUri(sourceUri: string): string {
  if (sourceUri.includes('android_asset')) {
    return sourceUri;
  }
  return sourceUri.replace(/\/index\.html$/u, '/');
}
