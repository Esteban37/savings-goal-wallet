import { NativeModules, Platform } from 'react-native';
import {
  ANDROID_WEB_ASSET_URI,
  LOCAL_WEB_ORIGIN_WHITELIST,
  getLocalWebAssetUri,
  getLocalWebReadAccessUri,
  setIosWebBundleUris,
  toHostlessFileUri,
} from './local-web-asset-uri';

describe('local web asset URI', () => {
  const originalOs = Platform.OS;
  const originalWebAssets = NativeModules.SGWWebAssets;

  afterEach(() => {
    Platform.OS = originalOs;
    NativeModules.SGWWebAssets = originalWebAssets;
    setIosWebBundleUris({});
  });

  it('returns the Android asset URI on Android', () => {
    Platform.OS = 'android';

    const actualUri = getLocalWebAssetUri();

    expect(actualUri).toBe(ANDROID_WEB_ASSET_URI);
  });

  it('returns a file URI ending in web/index.html on iOS', () => {
    const inputIosUri = 'file:///var/containers/Bundle/Application/web/index.html';
    Platform.OS = 'ios';
    NativeModules.SGWWebAssets = {
      indexHtmlUri: inputIosUri,
    };

    const actualUri = getLocalWebAssetUri();

    expect(actualUri).not.toContain('android_asset');
    expect(actualUri.startsWith('file://')).toBe(true);
    expect(actualUri.endsWith('web/index.html')).toBe(true);
    expect(actualUri).toBe(inputIosUri);
  });

  it('does not fall back to android_asset when the iOS getter is missing', () => {
    Platform.OS = 'ios';
    NativeModules.SGWWebAssets = undefined;

    const actualUri = getLocalWebAssetUri();

    expect(actualUri).not.toContain('android_asset');
    expect(actualUri).toBe('');
  });

  it('uses iOS app initial properties when NativeModules is empty', () => {
    const inputIosUri =
      'file://localhost/var/containers/Bundle/Application/web/index.html';
    const expectedUri =
      'file:///var/containers/Bundle/Application/web/index.html';
    Platform.OS = 'ios';
    NativeModules.SGWWebAssets = undefined;
    setIosWebBundleUris({ indexHtmlUri: inputIosUri });

    const actualUri = getLocalWebAssetUri();

    expect(actualUri).toBe(expectedUri);
    expect(actualUri).not.toContain('localhost');
  });

  it('strips the localhost host from iOS file URIs', () => {
    const inputIosUri =
      'file://localhost/var/containers/Bundle/Application/web/index.html';
    const expectedUri =
      'file:///var/containers/Bundle/Application/web/index.html';

    expect(toHostlessFileUri(inputIosUri)).toBe(expectedUri);
  });

  it('uses the web directory as iOS read access', () => {
    const inputSourceUri =
      'file:///var/containers/Bundle/Application/web/index.html';
    const expectedReadAccess =
      'file:///var/containers/Bundle/Application/web/';
    Platform.OS = 'ios';
    NativeModules.SGWWebAssets = undefined;

    const actualReadAccess = getLocalWebReadAccessUri(inputSourceUri);

    expect(actualReadAccess).toBe(expectedReadAccess);
  });

  it('accepts file localhost in the WebView origin whitelist', () => {
    expect(LOCAL_WEB_ORIGIN_WHITELIST).toContain('*');
    expect(LOCAL_WEB_ORIGIN_WHITELIST).toContain('file://localhost*');
    expect(LOCAL_WEB_ORIGIN_WHITELIST).toContain('file://*');
  });
});
