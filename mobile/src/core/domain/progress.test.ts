import { Money } from './money';
import { Progress } from './progress';

function mustMoney(
  result: { ok: true; value: Money } | { ok: false; error: string },
): Money {
  if (!result.ok) {
    throw new Error(`expected money, got ${result.error}`);
  }
  return result.value;
}

describe('Progress', () => {
  it('is 25 percent when a quarter is deposited', () => {
    const inputDeposited = mustMoney(Money.ofNonNegative(25000));
    const inputTarget = mustMoney(Money.ofPositive(100000));
    const actualX = Progress.from(inputDeposited, inputTarget);
    const expectedX = { percent: 25, isCompleted: false };

    expect(actualX.percent).toBe(expectedX.percent);
    expect(actualX.isCompleted).toBe(expectedX.isCompleted);
  });

  it('is 100 percent and completed at the target', () => {
    const inputDeposited = mustMoney(Money.ofNonNegative(100000));
    const inputTarget = mustMoney(Money.ofPositive(100000));
    const actualX = Progress.from(inputDeposited, inputTarget);
    const expectedX = { percent: 100, isCompleted: true };

    expect(actualX.percent).toBe(expectedX.percent);
    expect(actualX.isCompleted).toBe(expectedX.isCompleted);
  });

  it('caps overshoot at 100 percent and completed', () => {
    const inputDeposited = mustMoney(Money.ofNonNegative(150000));
    const inputTarget = mustMoney(Money.ofPositive(100000));
    const actualX = Progress.from(inputDeposited, inputTarget);
    const expectedX = { percent: 100, isCompleted: true };

    expect(actualX.percent).toBe(expectedX.percent);
    expect(actualX.isCompleted).toBe(expectedX.isCompleted);
  });

  it('is 0 percent when nothing is deposited', () => {
    const inputDeposited = Money.zero();
    const inputTarget = mustMoney(Money.ofPositive(100000));
    const actualX = Progress.from(inputDeposited, inputTarget);
    const expectedX = { percent: 0, isCompleted: false };

    expect(actualX.percent).toBe(expectedX.percent);
    expect(actualX.isCompleted).toBe(expectedX.isCompleted);
  });
});
