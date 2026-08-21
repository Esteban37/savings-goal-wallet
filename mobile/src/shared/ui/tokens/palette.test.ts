import { palette, type ColorPalette } from './palette';

function assertPalette(inputPalette: ColorPalette): ColorPalette {
  return inputPalette;
}

describe('palette', () => {
  it('exposes light and dark palettes with the same ColorPalette shape and brand accent', () => {
    const expectedAccent = '#C4122F';
    const actualLight = assertPalette(palette.light);
    const actualDark = assertPalette(palette.dark);

    expect(actualLight.accent).toBe(expectedAccent);
    expect(actualDark.accent).toBe(expectedAccent);
    expect(Object.keys(actualLight).sort()).toEqual(Object.keys(actualDark).sort());
  });
});
