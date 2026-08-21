import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useColorScheme } from 'react-native';
import {
  ThemeTokensProvider,
  type ColorScheme,
} from '../../shared/ui/tokens';
import type { AppearancePreference } from './appearance-preference';
import {
  loadAppearancePreference,
  saveAppearancePreference,
} from './appearance-storage';
import { resolveScheme } from './resolve-scheme';

type AppearanceContextValue = {
  preference: AppearancePreference;
  resolvedScheme: ColorScheme;
  setPreference: (preference: AppearancePreference) => void;
};

const AppearanceContext = createContext<AppearanceContextValue | null>(null);

type AppearanceProviderProps = {
  children: ReactNode;
};

export function AppearanceProvider({ children }: AppearanceProviderProps) {
  const osScheme = useColorScheme();
  const [preference, setPreferenceState] =
    useState<AppearancePreference>('system');

  useEffect(() => {
    void loadAppearancePreference().then(setPreferenceState);
  }, []);

  const setPreference = useCallback((next: AppearancePreference) => {
    setPreferenceState(next);
    void saveAppearancePreference(next);
  }, []);

  const resolvedScheme = resolveScheme(preference, osScheme);
  const value = useMemo(
    () => ({ preference, resolvedScheme, setPreference }),
    [preference, resolvedScheme, setPreference],
  );

  return (
    <AppearanceContext.Provider value={value}>
      <ThemeTokensProvider scheme={resolvedScheme}>
        {children}
      </ThemeTokensProvider>
    </AppearanceContext.Provider>
  );
}

export function useAppearance(): AppearanceContextValue {
  const value = useContext(AppearanceContext);
  if (value == null) {
    throw new Error('useAppearance must be used within AppearanceProvider');
  }
  return value;
}
