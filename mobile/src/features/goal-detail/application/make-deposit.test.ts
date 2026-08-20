import { InMemoryGoalsRepository } from '../../../core/application/ports/fakes/in-memory-goals-repository';
import { NoopGoalNotifier } from '../../../core/application/ports/fakes/noop-goal-notifier';
import { Money } from '../../../core/domain/money';
import type { Result } from '../../../core/domain/result';
import { SavingsGoal } from '../../../core/domain/savings-goal';
import { createMakeDeposit } from './make-deposit';

function unwrap<T>(result: Result<T, string>): T {
  if (!result.ok) {
    throw new Error(`expected ok, got ${result.error}`);
  }
  return result.value;
}

function seedGoal(id: string, deposited: number, target = 100000): SavingsGoal {
  return unwrap(
    SavingsGoal.create({
      id,
      name: 'Viaje',
      target: unwrap(Money.ofPositive(target)),
      deposited: unwrap(Money.ofNonNegative(deposited)),
    }),
  );
}

describe('createMakeDeposit', () => {
  it('persists a valid deposit and returns updated progress', async () => {
    const mockRepository = new InMemoryGoalsRepository([seedGoal('g1', 10000)]);
    const makeDeposit = createMakeDeposit({ repository: mockRepository });
    const actualX = await makeDeposit({ goalId: 'g1', amount: 20000 });
    const expectedDeposited = 30000;
    const expectedPercent = 30;

    expect(actualX.ok).toBe(true);
    if (actualX.ok) {
      expect(actualX.value.deposited.amount).toBe(expectedDeposited);
      expect(actualX.value.progress().percent).toBe(expectedPercent);
    }
    const stored = await mockRepository.getById('g1');
    expect(stored?.deposited.amount).toBe(expectedDeposited);
  });

  it('fails when the goal is missing and does not save', async () => {
    const mockRepository = new InMemoryGoalsRepository();
    const makeDeposit = createMakeDeposit({ repository: mockRepository });
    const actualX = await makeDeposit({ goalId: 'missing', amount: 20000 });
    const expectedX = { ok: false, error: 'goal-not-found' } as const;

    expect(actualX).toEqual(expectedX);
    expect(await mockRepository.list()).toEqual([]);
  });

  it('rejects amount 0 without changing the stored deposited amount', async () => {
    const mockRepository = new InMemoryGoalsRepository([seedGoal('g1', 10000)]);
    const makeDeposit = createMakeDeposit({ repository: mockRepository });
    const actualX = await makeDeposit({ goalId: 'g1', amount: 0 });
    const expectedX = { ok: false, error: 'invalid-amount' } as const;

    expect(actualX).toEqual(expectedX);
    expect((await mockRepository.getById('g1'))?.deposited.amount).toBe(10000);
  });

  it('does not invoke the notifier when a deposit completes the goal', async () => {
    const mockNotifier = new NoopGoalNotifier();
    const mockRepository = new InMemoryGoalsRepository([
      seedGoal('g1', 90000, 100000),
    ]);
    const makeDeposit = createMakeDeposit({ repository: mockRepository });
    const actualX = await makeDeposit({ goalId: 'g1', amount: 10000 });

    expect(actualX.ok).toBe(true);
    if (actualX.ok) {
      expect(actualX.value.progress().isCompleted).toBe(true);
    }
    expect(mockNotifier.calls).toEqual([]);
  });
});
