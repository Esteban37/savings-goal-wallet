import { parseBridgeMessage } from './parse-bridge-message';

describe('parseBridgeMessage', () => {
  it('accepts a WEB_READY object envelope', () => {
    const inputEnvelope = { type: 'WEB_READY', payload: { goalId: 'g1' } };
    const actualX = parseBridgeMessage(inputEnvelope);

    expect(actualX).toEqual({
      ok: true,
      value: { type: 'WEB_READY', payload: { goalId: 'g1' } },
    });
  });

  it('accepts a WEB_READY JSON string', () => {
    const inputJson =
      '{"type":"WEB_READY","payload":{"goalId":"goal-scaffold"}}';
    const actualX = parseBridgeMessage(inputJson);

    expect(actualX).toEqual({
      ok: true,
      value: { type: 'WEB_READY', payload: { goalId: 'goal-scaffold' } },
    });
  });

  it('accepts DEPOSIT_REQUESTED', () => {
    const inputEnvelope = {
      type: 'DEPOSIT_REQUESTED',
      payload: { goalId: 'g1', amount: 10000 },
    };
    const actualX = parseBridgeMessage(inputEnvelope);
    const expectedX = {
      type: 'DEPOSIT_REQUESTED',
      payload: { goalId: 'g1', amount: 10000 },
    };

    expect(actualX).toEqual({ ok: true, value: expectedX });
  });

  it('rejects DEPOSIT_REQUESTED without amount', () => {
    const inputEnvelope = {
      type: 'DEPOSIT_REQUESTED',
      payload: { goalId: 'g1' },
    };
    const actualX = parseBridgeMessage(inputEnvelope);
    const expectedX = { ok: false, error: 'invalid-message' } as const;

    expect(actualX).toEqual(expectedX);
  });

  it('rejects an unknown type', () => {
    const inputEnvelope = { type: 'PING', payload: {} };
    const actualX = parseBridgeMessage(inputEnvelope);
    const expectedX = { ok: false, error: 'invalid-message' } as const;

    expect(actualX).toEqual(expectedX);
  });

  it('rejects invalid JSON', () => {
    const inputJson = '{not json';
    const actualX = parseBridgeMessage(inputJson);
    const expectedX = { ok: false, error: 'invalid-message' } as const;

    expect(actualX).toEqual(expectedX);
  });

  it('rejects null and non-objects', () => {
    expect(parseBridgeMessage(null)).toEqual({
      ok: false,
      error: 'invalid-message',
    });
    expect(parseBridgeMessage(1)).toEqual({
      ok: false,
      error: 'invalid-message',
    });
  });

  it('rejects extra payload keys', () => {
    const inputEnvelope = {
      type: 'WEB_READY',
      payload: { goalId: 'g1', extra: true },
    };
    const actualX = parseBridgeMessage(inputEnvelope);
    const expectedX = { ok: false, error: 'invalid-message' } as const;

    expect(actualX).toEqual(expectedX);
  });

  it('accepts SESSION_BOOTSTRAP with a goal DTO', () => {
    const inputEnvelope = {
      type: 'SESSION_BOOTSTRAP',
      payload: {
        sessionId: 's1',
        goalId: 'g1',
        userInfo: {},
        mode: 'deposit',
        goal: {
          id: 'g1',
          name: 'Viaje',
          targetAmount: 100000,
          depositedAmount: 25000,
          progressPercent: 25,
        },
      },
    };
    const actualX = parseBridgeMessage(inputEnvelope);

    expect(actualX.ok).toBe(true);
    if (actualX.ok) {
      expect(actualX.value.type).toBe('SESSION_BOOTSTRAP');
      if (
        actualX.value.type === 'SESSION_BOOTSTRAP' &&
        actualX.value.payload.mode === 'deposit'
      ) {
        expect(actualX.value.payload.goal.name).toBe('Viaje');
        expect(actualX.value.payload.goal.progressPercent).toBe(25);
      }
    }
  });

  it('accepts SESSION_BOOTSTRAP in create mode without a goal', () => {
    const inputEnvelope = {
      type: 'SESSION_BOOTSTRAP',
      payload: {
        sessionId: 's1',
        goalId: 'pending',
        userInfo: {},
        mode: 'create',
      },
    };
    const actualX = parseBridgeMessage(inputEnvelope);

    expect(actualX).toEqual({ ok: true, value: inputEnvelope });
  });

  it('rejects SESSION_BOOTSTRAP missing mode', () => {
    const inputEnvelope = {
      type: 'SESSION_BOOTSTRAP',
      payload: {
        sessionId: 's1',
        goalId: 'g1',
        userInfo: {},
        goal: {
          id: 'g1',
          name: 'Viaje',
          targetAmount: 100000,
          depositedAmount: 25000,
          progressPercent: 25,
        },
      },
    };
    const actualX = parseBridgeMessage(inputEnvelope);
    const expectedX = { ok: false, error: 'invalid-message' } as const;

    expect(actualX).toEqual(expectedX);
  });

  it('accepts CREATE_REQUESTED', () => {
    const inputEnvelope = {
      type: 'CREATE_REQUESTED',
      payload: { name: 'Viaje', targetAmount: 500000 },
    };
    const actualX = parseBridgeMessage(inputEnvelope);

    expect(actualX).toEqual({ ok: true, value: inputEnvelope });
  });

  it('rejects CREATE_REQUESTED missing name', () => {
    const inputEnvelope = {
      type: 'CREATE_REQUESTED',
      payload: { targetAmount: 500000 },
    };
    const actualX = parseBridgeMessage(inputEnvelope);
    const expectedX = { ok: false, error: 'invalid-message' } as const;

    expect(actualX).toEqual(expectedX);
  });

  it('accepts CREATE_SUCCEEDED', () => {
    const inputEnvelope = {
      type: 'CREATE_SUCCEEDED',
      payload: {
        goal: {
          id: 'g-new',
          name: 'Viaje',
          targetAmount: 500000,
          depositedAmount: 0,
          progressPercent: 0,
        },
      },
    };
    const actualX = parseBridgeMessage(inputEnvelope);

    expect(actualX).toEqual({ ok: true, value: inputEnvelope });
  });

  it('accepts CREATE_FAILED', () => {
    const inputEnvelope = {
      type: 'CREATE_FAILED',
      payload: { reason: 'invalid-target' },
    };
    const actualX = parseBridgeMessage(inputEnvelope);

    expect(actualX).toEqual({ ok: true, value: inputEnvelope });
  });

  it('accepts DEPOSIT_SUCCEEDED', () => {
    const inputEnvelope = {
      type: 'DEPOSIT_SUCCEEDED',
      payload: {
        goalId: 'g1',
        depositedAmount: 30000,
        progressPercent: 30,
        isCompleted: false,
      },
    };
    const actualX = parseBridgeMessage(inputEnvelope);

    expect(actualX).toEqual({ ok: true, value: inputEnvelope });
  });

  it('accepts DEPOSIT_FAILED', () => {
    const inputEnvelope = {
      type: 'DEPOSIT_FAILED',
      payload: { goalId: 'g1', reason: 'invalid-amount' },
    };
    const actualX = parseBridgeMessage(inputEnvelope);

    expect(actualX).toEqual({ ok: true, value: inputEnvelope });
  });
});
