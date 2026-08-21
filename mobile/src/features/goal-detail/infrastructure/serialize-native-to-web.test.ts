import { parseBridgeMessage } from '../../../core/contracts';
import type { NativeToWebMessage } from '../../../core/contracts';
import { serializeNativeToWeb } from './serialize-native-to-web';

describe('serializeNativeToWeb', () => {
  it('round-trips SESSION_BOOTSTRAP, DEPOSIT_SUCCEEDED, and DEPOSIT_FAILED', () => {
    const inputBootstrap: NativeToWebMessage = {
      type: 'SESSION_BOOTSTRAP',
      payload: {
        sessionId: 'session-1',
        goalId: 'goal-vacaciones',
        userInfo: {},
        mode: 'deposit',
        goal: {
          id: 'goal-vacaciones',
          name: 'Vacaciones',
          targetAmount: 100000,
          depositedAmount: 25000,
          progressPercent: 25,
        },
      },
    };
    const inputSucceeded: NativeToWebMessage = {
      type: 'DEPOSIT_SUCCEEDED',
      payload: {
        goalId: 'goal-vacaciones',
        depositedAmount: 35000,
        progressPercent: 35,
        isCompleted: false,
      },
    };
    const inputFailed: NativeToWebMessage = {
      type: 'DEPOSIT_FAILED',
      payload: {
        goalId: 'goal-vacaciones',
        reason: 'invalid-amount',
      },
    };

    const actualBootstrap = parseBridgeMessage(
      serializeNativeToWeb(inputBootstrap),
    );
    const actualSucceeded = parseBridgeMessage(
      serializeNativeToWeb(inputSucceeded),
    );
    const actualFailed = parseBridgeMessage(serializeNativeToWeb(inputFailed));

    expect(actualBootstrap).toEqual({ ok: true, value: inputBootstrap });
    expect(actualSucceeded).toEqual({ ok: true, value: inputSucceeded });
    expect(actualFailed).toEqual({ ok: true, value: inputFailed });
  });
});
