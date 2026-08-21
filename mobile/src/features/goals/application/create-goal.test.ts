import { InMemoryGoalsRepository } from '../../../core/application/ports/fakes/in-memory-goals-repository';
import { NoopGoalNotifier } from '../../../core/application/ports/fakes/noop-goal-notifier';
import { createCreateGoal } from './create-goal';

describe('createCreateGoal', () => {
  it('persists a valid new goal with deposited 0', async () => {
    const mockRepository = new InMemoryGoalsRepository();
    const createGoal = createCreateGoal({ repository: mockRepository });
    const actualX = await createGoal({ name: 'Viaje', targetAmount: 500000 });
    const expectedTarget = 500000;

    expect(actualX.ok).toBe(true);
    if (actualX.ok) {
      expect(actualX.value.name).toBe('Viaje');
      expect(actualX.value.target.amount).toBe(expectedTarget);
      expect(actualX.value.deposited.amount).toBe(0);
      expect(actualX.value.progress().percent).toBe(0);
      expect(actualX.value.id.length).toBeGreaterThan(0);
    }
    const stored = await mockRepository.list();
    expect(stored).toHaveLength(1);
    expect(stored[0]?.deposited.amount).toBe(0);
  });

  it('rejects a whitespace-only name without saving', async () => {
    const mockRepository = new InMemoryGoalsRepository();
    const createGoal = createCreateGoal({ repository: mockRepository });
    const actualX = await createGoal({ name: '   ', targetAmount: 500000 });
    const expectedX = { ok: false, error: 'invalid-name' } as const;

    expect(actualX).toEqual(expectedX);
    expect(await mockRepository.list()).toEqual([]);
  });

  it('rejects target 0 without saving', async () => {
    const mockRepository = new InMemoryGoalsRepository();
    const createGoal = createCreateGoal({ repository: mockRepository });
    const actualX = await createGoal({ name: 'Viaje', targetAmount: 0 });
    const expectedX = { ok: false, error: 'invalid-amount' } as const;

    expect(actualX).toEqual(expectedX);
    expect(await mockRepository.list()).toEqual([]);
  });

  it('does not invoke the notifier on a successful create', async () => {
    const mockNotifier = new NoopGoalNotifier();
    const mockRepository = new InMemoryGoalsRepository();
    const createGoal = createCreateGoal({ repository: mockRepository });
    const actualX = await createGoal({ name: 'Viaje', targetAmount: 500000 });

    expect(actualX.ok).toBe(true);
    expect(mockNotifier.createdCalls).toEqual([]);
    expect(mockNotifier.calls).toEqual([]);
  });
});
