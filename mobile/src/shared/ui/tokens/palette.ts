export type ColorScheme = 'light' | 'dark';

export type ColorPalette = {
  background: string;
  surface: string;
  text: string;
  textMuted: string;
  accent: string;
  progressTrack: string;
  progressFill: string;
  border: string;
};

const accent = '#C4122F';

export const palette: Record<ColorScheme, ColorPalette> = {
  light: {
    background: '#F3F4F6',
    surface: '#FFFFFF',
    text: '#111827',
    textMuted: '#6B7280',
    accent,
    progressTrack: '#E5E7EB',
    progressFill: accent,
    border: '#E5E7EB',
  },
  dark: {
    background: '#121212',
    surface: '#1E1E1E',
    text: '#F2F2F2',
    textMuted: '#A3A3A3',
    accent,
    progressTrack: '#3A3A3A',
    progressFill: accent,
    border: '#2A2A2A',
  },
};
