import { createThemeAttributeScript } from './create-theme-attribute-script';

describe('createThemeAttributeScript', () => {
  it('sets data-theme on the document element', () => {
    const inputScheme = 'dark' as const;
    const expectedSnippet = "data-theme','dark";

    const actualScript = createThemeAttributeScript(inputScheme);

    expect(actualScript).toContain(expectedSnippet);
    expect(actualScript.endsWith('true;')).toBe(true);
  });
});
