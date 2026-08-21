import { Pressable, StyleSheet, Text } from 'react-native';
import { useThemeTokens } from '../../shared/ui/tokens';
import {
  appearanceAccessibilityLabel,
  cycleAppearancePreference,
} from './appearance-preference';
import { useAppearance } from './appearance-provider';

const PREFERENCE_GLYPH = {
  system: '◐',
  light: '☀',
  dark: '☾',
} as const;

export function AppearanceHeaderButton() {
  const { preference, setPreference } = useAppearance();
  const { color } = useThemeTokens();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={appearanceAccessibilityLabel(preference)}
      hitSlop={8}
      onPress={() => setPreference(cycleAppearancePreference(preference))}
      style={styles.hit}>
      <Text style={[styles.glyph, { color: color.text }]}>
        {PREFERENCE_GLYPH[preference]}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hit: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  glyph: {
    fontSize: 18,
  },
});
