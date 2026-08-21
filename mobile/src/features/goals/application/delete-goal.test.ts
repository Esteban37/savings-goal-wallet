import { InMemoryGoalsRepository } from '../../../core/application/ports/fakes/in-memory-goals-repository';
import { NoopGoalNotifier } from '../../../core/application/ports/fakes/noop-goal-notifier';
import { AlwaysConfirmDialog } from '../../../core/application/ports/fakes/always-confirm-dialog';
import { Money } from '../../../core/domain/money';
import type { Result } from '../../../core/domain/result';
import { SavingsGoal } from '../../../core/domain/savings-goal';
import { createDeleteGoal } from './delete-goal';

function unwrap<T>(result: Result<T, string>): T {
  if (!result.ok) {
    throw new Error(`expected ok, got ${result.error}`);
  }
  return result.value;
}

function seedGoal(id: string): SavingsGoal {
  return unwrap(
    SavingsGoal.create({
      id,
      name: id,
      target: unwrap(Money.ofPositive(100000)),
      deposited: unwrap(Money.ofNonNegative(0)),
    }),
  );
}

describe('createDeleteGoal', () => {
  it('removes a known goal from the list', async () => {
    const mockRepository = new InMemoryGoalsRepository([
      seedGoal('g1'),
      seedGoal('g2'),
    ]);
    const deleteGoal = createDeleteGoal({ repository: mockRepository });
    const actualX = await deleteGoal('g1');

    expect(actualX.ok).toBe(true);
    expect((await mockRepository.list()).map(goal => goal.id)).toEqual(['g2']);
    expect(await mockRepository.getById('g1')).toBeNull();
  });

  it('fails when the goal is missing and does not remove others', async () => {
    const mockRepository = new InMemoryGoalsRepository([seedGoal('g1')]);
    const deleteGoal = createDeleteGoal({ repository: mockRepository });
    const actualX = await deleteGoal('missing');
    const expectedX = { ok: false, error: 'goal-not-found' } as const;

    expect(actualX).toEqual(expectedX);
    expect(await mockRepository.list()).toHaveLength(1);
  });

  it('does not call confirm or notifier', async () => {
    const mockDialog = new AlwaysConfirmDialog();
    const mockNotifier = new NoopGoalNotifier();
    const mockRepository = new InMemoryGoalsRepository([seedGoal('g1')]);
    const deleteGoal = createDeleteGoal({ repository: mockRepository });
    await deleteGoal('g1');

    expect(mockNotifier.calls).toEqual([]);
    expect(mockNotifier.createdCalls).toEqual([]);
    expect(await mockDialog.confirm({ title: 'x', message: 'y' })).toBe(true);
  });
});
