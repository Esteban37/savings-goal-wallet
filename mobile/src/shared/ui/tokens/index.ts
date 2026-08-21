export {
  palette,
  type ColorPalette,
  type ColorScheme,
} from './palette';
export {
  ThemeTokensProvider,
  useThemeTokens,
  type ThemeTokens,
} from './use-theme-tokens';

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
};

export const type = {
  title: {
    fontSize: 22,
    fontWeight: '700' as const,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600' as const,
  },
  body: {
    fontSize: 14,
    fontWeight: '400' as const,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
  },
};
