import type { ColorScheme } from '../../../../shared/ui/tokens';

export function createThemeAttributeScript(scheme: ColorScheme): string {
  return `document.documentElement.setAttribute('data-theme','${scheme}'); true;`;
}
