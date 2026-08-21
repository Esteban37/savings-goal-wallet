import { NativeModules, Platform } from 'react-native';
import {
  ANDROID_WEB_ASSET_URI,
  getLocalWebAssetUri,
  getLocalWebReadAccessUri,
} from './local-web-asset-uri';

describe('local web asset URI', () => {
  const originalOs = Platform.OS;
  const originalWebAssets = NativeModules.SGWWebAssets;

  afterEach(() => {
    Platform.OS = originalOs;
    NativeModules.SGWWebAssets = originalWebAssets;
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
      indexHtmlUri: () => inputIosUri,
    };

    const actualUri = getLocalWebAssetUri();

    expect(actualUri).not.toContain('android_asset');
    expect(actualUri.startsWith('file://')).toBe(true);
    expect(actualUri.endsWith('web/index.html')).toBe(true);
    expect(actualUri).toBe(inputIosUri);
  });

  it('uses the web directory as iOS read access', () => {
    const inputSourceUri =
      'file:///var/containers/Bundle/Application/web/index.html';
    const expectedReadAccess =
      'file:///var/containers/Bundle/Application/web/';

    const actualReadAccess = getLocalWebReadAccessUri(inputSourceUri);

    expect(actualReadAccess).toBe(expectedReadAccess);
  });
});
