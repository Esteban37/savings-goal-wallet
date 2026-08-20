import { InMemoryGoalsRepository } from '../../../core/application/ports/fakes/in-memory-goals-repository';
import { Money } from '../../../core/domain/money';
import type { Result } from '../../../core/domain/result';
import { SavingsGoal } from '../../../core/domain/savings-goal';
import { createGetGoals } from './get-goals';

function unwrap<T>(result: Result<T, string>): T {
  if (!result.ok) {
    throw new Error(`expected ok, got ${result.error}`);
  }
  return result.value;
}

function seedGoal(id: string, name: string, deposited: number): SavingsGoal {
  return unwrap(
    SavingsGoal.create({
      id,
      name,
      target: unwrap(Money.ofPositive(100000)),
      deposited: unwrap(Money.ofNonNegative(deposited)),
    }),
  );
}

describe('createGetGoals', () => {
  it('returns an empty list when the repository is empty', async () => {
    const mockRepository = new InMemoryGoalsRepository();
    const getGoals = createGetGoals({ repository: mockRepository });
    const actualX = await getGoals();
    const expectedX: string[] = [];

    expect(actualX.ok).toBe(true);
    if (actualX.ok) {
      expect(actualX.value.map(goal => goal.id)).toEqual(expectedX);
    }
  });

  it('returns every seeded goal with derived progress', async () => {
    const mockRepository = new InMemoryGoalsRepository([
      seedGoal('g1', 'Viaje', 25000),
      seedGoal('g2', 'Emergencia', 0),
    ]);
    const getGoals = createGetGoals({ repository: mockRepository });
    const actualX = await getGoals();

    expect(actualX.ok).toBe(true);
    if (actualX.ok) {
      expect(actualX.value).toHaveLength(2);
      expect(actualX.value[0]?.id).toBe('g1');
      expect(actualX.value[0]?.name).toBe('Viaje');
      expect(actualX.value[0]?.target.amount).toBe(100000);
      expect(actualX.value[0]?.deposited.amount).toBe(25000);
      expect(actualX.value[0]?.progress().percent).toBe(25);
      expect(actualX.value[1]?.id).toBe('g2');
      expect(actualX.value[1]?.progress().percent).toBe(0);
    }
  });
});
