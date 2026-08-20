import { Money } from './money';
import { SavingsGoal } from './savings-goal';
import type { Result } from './result';

function unwrap<T>(result: Result<T, string>): T {
  if (!result.ok) {
    throw new Error(`expected ok, got ${result.error}`);
  }
  return result.value;
}

function createGoal(deposited: number): SavingsGoal {
  return unwrap(
    SavingsGoal.create({
      id: 'g1',
      name: 'Viaje',
      target: unwrap(Money.ofPositive(100000)),
      deposited: unwrap(Money.ofNonNegative(deposited)),
    }),
  );
}

describe('SavingsGoal', () => {
  it('applies a deposit immutably', () => {
    const inputGoal = createGoal(10000);
    const inputDeposit = unwrap(Money.ofPositive(5000));
    const actualX = inputGoal.applyDeposit(inputDeposit);
    const expectedOriginal = 10000;
    const expectedUpdated = 15000;

    expect(actualX.ok).toBe(true);
    if (actualX.ok) {
      expect(actualX.value.deposited.amount).toBe(expectedUpdated);
      expect(actualX.value).not.toBe(inputGoal);
    }
    expect(inputGoal.deposited.amount).toBe(expectedOriginal);
  });

  it('rejects a zero-amount deposit without changing the original', () => {
    const inputGoal = createGoal(10000);
    const inputDeposit = Money.zero();
    const actualX = inputGoal.applyDeposit(inputDeposit);
    const expectedX = { ok: false, error: 'invalid-amount' } as const;

    expect(actualX).toEqual(expectedX);
    expect(inputGoal.deposited.amount).toBe(10000);
  });

  it('derives progress from deposited and target', () => {
    const inputGoal = createGoal(25000);
    const actualX = inputGoal.progress();
    const expectedX = { percent: 25, isCompleted: false };

    expect(actualX.percent).toBe(expectedX.percent);
    expect(actualX.isCompleted).toBe(expectedX.isCompleted);
  });
});
