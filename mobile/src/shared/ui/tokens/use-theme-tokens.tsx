import { createContext, useContext, type ReactNode } from 'react';
import {
  palette,
  type ColorPalette,
  type ColorScheme,
} from './palette';

export type ThemeTokens = {
  scheme: ColorScheme;
  color: ColorPalette;
};

const ThemeTokensContext = createContext<ThemeTokens>({
  scheme: 'light',
  color: palette.light,
});

type ThemeTokensProviderProps = {
  scheme: ColorScheme;
  children: ReactNode;
};

export function ThemeTokensProvider({
  scheme,
  children,
}: ThemeTokensProviderProps) {
  return (
    <ThemeTokensContext.Provider value={{ scheme, color: palette[scheme] }}>
      {children}
    </ThemeTokensContext.Provider>
  );
}

export function useThemeTokens(): ThemeTokens {
  return useContext(ThemeTokensContext);
}
