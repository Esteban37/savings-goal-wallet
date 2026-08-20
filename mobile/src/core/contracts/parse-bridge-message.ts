import { err, ok, type Result } from '../domain/result';
import { bridgeMessageSchema, type BridgeMessage } from './schemas';

export function parseBridgeMessage(
  input: unknown,
): Result<BridgeMessage, 'invalid-message'> {
  let candidate: unknown = input;
  if (typeof input === 'string') {
    try {
      candidate = JSON.parse(input);
    } catch {
      return err('invalid-message');
    }
  }

  const parsed = bridgeMessageSchema.safeParse(candidate);
  if (!parsed.success) {
    return err('invalid-message');
  }
  return ok(parsed.data);
}
