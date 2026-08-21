export type AppearancePreference = 'system' | 'light' | 'dark';

export const APPEARANCE_PREFERENCE_ORDER: readonly AppearancePreference[] = [
  'system',
  'light',
  'dark',
];

const PREFERENCE_LABEL: Record<AppearancePreference, string> = {
  system: 'sistema',
  light: 'claro',
  dark: 'oscuro',
};

export function cycleAppearancePreference(
  current: AppearancePreference,
): AppearancePreference {
  const index = APPEARANCE_PREFERENCE_ORDER.indexOf(current);
  const nextIndex = (index + 1) % APPEARANCE_PREFERENCE_ORDER.length;
  return APPEARANCE_PREFERENCE_ORDER[nextIndex];
}

export function appearanceAccessibilityLabel(
  preference: AppearancePreference,
): string {
  return `Apariencia: ${PREFERENCE_LABEL[preference]}`;
}
