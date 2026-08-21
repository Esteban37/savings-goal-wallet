import type { ColorScheme } from '../../shared/ui/tokens';
import type { AppearancePreference } from './appearance-preference';

export function resolveScheme(
  preference: AppearancePreference,
  osScheme: ColorScheme | null | undefined,
): ColorScheme {
  if (preference === 'light' || preference === 'dark') {
    return preference;
  }
  return osScheme === 'dark' ? 'dark' : 'light';
}
