import type { NativeToWebMessage } from '../../../core/contracts';

export function serializeNativeToWeb(message: NativeToWebMessage): string {
  return JSON.stringify(message);
}

export function createHostMessageScript(json: string): string {
  return `window.__onHostMessage(${json}); true;`;
}
