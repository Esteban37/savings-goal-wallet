import { DarkTheme, DefaultTheme, type Theme } from '@react-navigation/native';
import { palette, type ColorScheme } from '../../shared/ui/tokens';

export function createNavigationTheme(scheme: ColorScheme): Theme {
  const color = palette[scheme];
  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
  return {
    ...base,
    colors: {
      ...base.colors,
      primary: color.accent,
      background: color.background,
      card: color.surface,
      text: color.text,
      border: color.border,
      notification: color.accent,
    },
  };
}
