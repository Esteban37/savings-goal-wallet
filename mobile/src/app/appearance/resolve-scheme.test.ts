import { resolveScheme } from './resolve-scheme';
import { cycleAppearancePreference } from './appearance-preference';

describe('resolveScheme', () => {
  it('follows the OS when preference is system', () => {
    const inputPreference = 'system' as const;
    const inputOsScheme = 'dark' as const;
    const expectedScheme = 'dark';

    const actualScheme = resolveScheme(inputPreference, inputOsScheme);

    expect(actualScheme).toBe(expectedScheme);
  });

  it('keeps an explicit light preference when the OS is dark', () => {
    const inputPreference = 'light' as const;
    const inputOsScheme = 'dark' as const;
    const expectedScheme = 'light';

    const actualScheme = resolveScheme(inputPreference, inputOsScheme);

    expect(actualScheme).toBe(expectedScheme);
  });

  it('keeps an explicit dark preference when the OS is light', () => {
    const inputPreference = 'dark' as const;
    const inputOsScheme = 'light' as const;
    const expectedScheme = 'dark';

    const actualScheme = resolveScheme(inputPreference, inputOsScheme);

    expect(actualScheme).toBe(expectedScheme);
  });

  it('falls back to light when preference is system and OS scheme is missing', () => {
    const inputPreference = 'system' as const;
    const expectedScheme = 'light';

    const actualNull = resolveScheme(inputPreference, null);
    const actualUndefined = resolveScheme(inputPreference, undefined);

    expect(actualNull).toBe(expectedScheme);
    expect(actualUndefined).toBe(expectedScheme);
  });
});

describe('cycleAppearancePreference', () => {
  it('cycles system to light to dark to system', () => {
    const expectedOrder = ['light', 'dark', 'system'] as const;

    const actualLight = cycleAppearancePreference('system');
    const actualDark = cycleAppearancePreference('light');
    const actualSystem = cycleAppearancePreference('dark');

    expect([actualLight, actualDark, actualSystem]).toEqual([...expectedOrder]);
  });
});
