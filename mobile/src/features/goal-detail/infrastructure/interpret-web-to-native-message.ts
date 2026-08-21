import { parseBridgeMessage } from '../../../core/contracts';

export type HostMessageDecision =
  | { type: 'ignore' }
  | { type: 'bootstrap' }
  | { type: 'deposit'; amount: number }
  | { type: 'create'; name: string; targetAmount: number };

export function interpretWebToNativeMessage(
  input: unknown,
): HostMessageDecision {
  const parsed = parseBridgeMessage(input);
  if (!parsed.ok) {
    return { type: 'ignore' };
  }

  switch (parsed.value.type) {
    case 'WEB_READY':
      return { type: 'bootstrap' };
    case 'DEPOSIT_REQUESTED':
      return { type: 'deposit', amount: parsed.value.payload.amount };
    case 'CREATE_REQUESTED':
      return {
        type: 'create',
        name: parsed.value.payload.name,
        targetAmount: parsed.value.payload.targetAmount,
      };
    default:
      return { type: 'ignore' };
  }
}
