import { Money } from './money';

describe('Money', () => {
  it('accepts a positive integer deposit amount', () => {
    const inputAmount = 10000;
    const actualX = Money.ofPositive(inputAmount);
    const expectedX = 10000;

    expect(actualX).toEqual({ ok: true, value: expect.any(Money) });
    if (actualX.ok) {
      expect(actualX.value.amount).toBe(expectedX);
    }
  });

  it('rejects a zero deposit amount', () => {
    const inputAmount = 0;
    const actualX = Money.ofPositive(inputAmount);
    const expectedX = { ok: false, error: 'invalid-amount' } as const;

    expect(actualX).toEqual(expectedX);
  });

  it('rejects a negative deposit amount', () => {
    const inputAmount = -1;
    const actualX = Money.ofPositive(inputAmount);
    const expectedX = { ok: false, error: 'invalid-amount' } as const;

    expect(actualX).toEqual(expectedX);
  });

  it('rejects a non-integer amount', () => {
    const inputAmount = 10.5;
    const actualX = Money.ofPositive(inputAmount);
    const expectedX = { ok: false, error: 'invalid-amount' } as const;

    expect(actualX).toEqual(expectedX);
  });

  it('rejects NaN and Infinity', () => {
    expect(Money.ofPositive(Number.NaN)).toEqual({
      ok: false,
      error: 'invalid-amount',
    });
    expect(Money.ofPositive(Number.POSITIVE_INFINITY)).toEqual({
      ok: false,
      error: 'invalid-amount',
    });
  });

  it('allows zero for deposited amounts', () => {
    const actualZero = Money.zero();
    const actualNonNegative = Money.ofNonNegative(0);
    const expectedX = 0;

    expect(actualZero.amount).toBe(expectedX);
    expect(actualNonNegative).toEqual({ ok: true, value: expect.any(Money) });
    if (actualNonNegative.ok) {
      expect(actualNonNegative.value.amount).toBe(expectedX);
    }
  });
});
