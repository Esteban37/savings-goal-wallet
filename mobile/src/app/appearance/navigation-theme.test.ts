import { createNavigationTheme } from './navigation-theme';
import { palette } from '../../shared/ui/tokens';

describe('createNavigationTheme', () => {
  it('uses dark palette colors when the resolved scheme is dark', () => {
    const inputScheme = 'dark' as const;
    const expectedBackground = palette.dark.background;

    const actualTheme = createNavigationTheme(inputScheme);

    expect(actualTheme.dark).toBe(true);
    expect(actualTheme.colors.background).toBe(expectedBackground);
    expect(actualTheme.colors.text).toBe(palette.dark.text);
  });

  it('uses light palette colors when the resolved scheme is light', () => {
    const inputScheme = 'light' as const;
    const expectedBackground = palette.light.background;

    const actualTheme = createNavigationTheme(inputScheme);

    expect(actualTheme.dark).toBe(false);
    expect(actualTheme.colors.background).toBe(expectedBackground);
  });
});
