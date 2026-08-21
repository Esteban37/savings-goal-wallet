import { interpretWebToNativeMessage } from './interpret-web-to-native-message';

describe('interpretWebToNativeMessage', () => {
  it('ignores malformed envelopes so no deposit is applied', () => {
    const inputX = '{not json';
    const actualX = interpretWebToNativeMessage(inputX);
    const expectedX = { type: 'ignore' as const };

    expect(actualX).toEqual(expectedX);
  });

  it('maps WEB_READY to bootstrap and DEPOSIT_REQUESTED to deposit', () => {
    const actualReady = interpretWebToNativeMessage({
      type: 'WEB_READY',
      payload: { goalId: 'pending' },
    });
    const actualDeposit = interpretWebToNativeMessage({
      type: 'DEPOSIT_REQUESTED',
      payload: { goalId: 'goal-vacaciones', amount: 10000 },
    });

    expect(actualReady).toEqual({ type: 'bootstrap' });
    expect(actualDeposit).toEqual({ type: 'deposit', amount: 10000 });
  });
});
