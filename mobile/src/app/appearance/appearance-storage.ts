import AsyncStorage from '@react-native-async-storage/async-storage';
import { z } from 'zod';
import type { AppearancePreference } from './appearance-preference';

export const APPEARANCE_STORAGE_KEY = 'sgw.appearance.v1';

const appearanceEnvelopeSchema = z
  .object({
    version: z.literal(1),
    preference: z.enum(['system', 'light', 'dark']),
  })
  .strip();

export async function loadAppearancePreference(): Promise<AppearancePreference> {
  try {
    const raw = await AsyncStorage.getItem(APPEARANCE_STORAGE_KEY);
    if (raw == null || raw === '') {
      return 'system';
    }
    const parsed = appearanceEnvelopeSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) {
      return 'system';
    }
    return parsed.data.preference;
  } catch {
    return 'system';
  }
}

export async function saveAppearancePreference(
  preference: AppearancePreference,
): Promise<void> {
  const envelope = { version: 1 as const, preference };
  await AsyncStorage.setItem(
    APPEARANCE_STORAGE_KEY,
    JSON.stringify(envelope),
  );
}
