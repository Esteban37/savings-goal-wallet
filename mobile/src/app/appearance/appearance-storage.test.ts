import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  APPEARANCE_STORAGE_KEY,
  loadAppearancePreference,
  saveAppearancePreference,
} from './appearance-storage';

describe('appearance storage', () => {
  it('loads system when storage is empty', async () => {
    const expectedPreference = 'system';

    const actualPreference = await loadAppearancePreference();

    expect(actualPreference).toBe(expectedPreference);
  });

  it('reads back a saved dark preference', async () => {
    const inputPreference = 'dark' as const;
    const expectedPreference = 'dark';

    await saveAppearancePreference(inputPreference);
    const actualPreference = await loadAppearancePreference();

    expect(actualPreference).toBe(expectedPreference);
  });

  it('loads system when stored JSON is invalid', async () => {
    const inputRaw = 'not-json';
    const expectedPreference = 'system';

    await AsyncStorage.setItem(APPEARANCE_STORAGE_KEY, inputRaw);
    const actualPreference = await loadAppearancePreference();

    expect(actualPreference).toBe(expectedPreference);
  });
});
