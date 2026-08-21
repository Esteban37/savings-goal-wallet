import { Money } from '../../../core/domain/money';
import type { Result } from '../../../core/domain/result';
import { SavingsGoal } from '../../../core/domain/savings-goal';
import { createPersistedGoalsRepository } from './create-persisted-goals-repository';
import { createSeedGoals } from './create-seeded-goals-repository';
import { GOALS_STORAGE_KEY } from './key-value-store';
import { MapKeyValueStore } from './map-key-value-store';

function unwrap<T>(result: Result<T, string>): T {
  if (!result.ok) {
    throw new Error(`expected ok, got ${result.error}`);
  }
  return result.value;
}

describe('createPersistedGoalsRepository', () => {
  it('seeds empty storage with the three frozen ids', async () => {
    const mockStore = new MapKeyValueStore();
    const mockRepository = createPersistedGoalsRepository({
      store: mockStore,
    });

    const actualGoals = await mockRepository.list();
    const actualX = actualGoals.map(goal => goal.id);
    const expectedX = [
      'goal-vacaciones',
      'goal-emergencia',
      'goal-bici',
    ];

    expect(actualX).toEqual(expectedX);
    expect(await mockStore.getItem(GOALS_STORAGE_KEY)).not.toBeNull();
  });

  it('lists a saved deposit from a second repository instance', async () => {
    const mockStore = new MapKeyValueStore();
    const mockRepository = createPersistedGoalsRepository({
      store: mockStore,
    });
    const inputOriginal = await mockRepository.getById('goal-vacaciones');
    expect(inputOriginal).not.toBeNull();

    const inputUpdated = unwrap(
      SavingsGoal.create({
        id: inputOriginal!.id,
        name: inputOriginal!.name,
        target: inputOriginal!.target,
        deposited: unwrap(Money.ofNonNegative(35000)),
      }),
    );
    await mockRepository.save(inputUpdated);

    const actualRepository = createPersistedGoalsRepository({
      store: mockStore,
    });
    const actualGoal = await actualRepository.getById('goal-vacaciones');
    const actualListed = (await actualRepository.list()).find(
      goal => goal.id === 'goal-vacaciones',
    );
    const expectedX = { deposited: 35000, percent: 35 };

    expect(actualGoal?.deposited.amount).toBe(expectedX.deposited);
    expect(actualListed?.deposited.amount).toBe(expectedX.deposited);
    expect(actualListed?.progress().percent).toBe(expectedX.percent);
  });

  it('does not reset a pre-filled envelope to the original seed', async () => {
    const inputEnvelope = {
      version: 1,
      goals: [
        {
          id: 'goal-vacaciones',
          name: 'Vacaciones',
          targetAmount: 100000,
          depositedAmount: 35000,
        },
        {
          id: 'goal-emergencia',
          name: 'Fondo de emergencia',
          targetAmount: 1000000,
          depositedAmount: 0,
        },
        {
          id: 'goal-bici',
          name: 'Bicicleta',
          targetAmount: 800000,
          depositedAmount: 200000,
        },
      ],
    };
    const mockStore = new MapKeyValueStore({
      [GOALS_STORAGE_KEY]: JSON.stringify(inputEnvelope),
    });
    const mockRepository = createPersistedGoalsRepository({
      store: mockStore,
      seed: createSeedGoals(),
    });

    const actualGoal = await mockRepository.getById('goal-vacaciones');
    const expectedX = 35000;

    expect(actualGoal?.deposited.amount).toBe(expectedX);
  });

  it('reseeds when stored JSON is corrupt', async () => {
    const mockStore = new MapKeyValueStore({
      [GOALS_STORAGE_KEY]: '{not-json',
    });
    const mockRepository = createPersistedGoalsRepository({
      store: mockStore,
    });

    const actualGoals = await mockRepository.list();
    const actualX = actualGoals.map(goal => goal.id);
    const expectedX = createSeedGoals().map(goal => goal.id);

    expect(actualX).toEqual(expectedX);
  });

  it('reseeds when a stored record is missing id', async () => {
    const inputX = {
      version: 1,
      goals: [
        {
          name: 'Vacaciones',
          targetAmount: 100000,
          depositedAmount: 25000,
        },
      ],
    };
    const mockStore = new MapKeyValueStore({
      [GOALS_STORAGE_KEY]: JSON.stringify(inputX),
    });
    const mockRepository = createPersistedGoalsRepository({
      store: mockStore,
    });

    const actualGoals = await mockRepository.list();
    const actualX = actualGoals.map(goal => ({
      id: goal.id,
      deposited: goal.deposited.amount,
    }));
    const expectedX = createSeedGoals().map(goal => ({
      id: goal.id,
      deposited: goal.deposited.amount,
    }));

    expect(actualX).toEqual(expectedX);
  });

  it('lists zero goals from a valid empty envelope and does not write the seed', async () => {
    const inputEnvelope = { version: 1, goals: [] };
    const mockStore = new MapKeyValueStore({
      [GOALS_STORAGE_KEY]: JSON.stringify(inputEnvelope),
    });
    const mockRepository = createPersistedGoalsRepository({
      store: mockStore,
    });

    const actualGoals = await mockRepository.list();
    const storedAfter = await mockStore.getItem(GOALS_STORAGE_KEY);

    expect(actualGoals).toEqual([]);
    expect(storedAfter).toBe(JSON.stringify(inputEnvelope));
  });

  it('persists a remove so a second instance no longer lists that id', async () => {
    const mockStore = new MapKeyValueStore();
    const mockRepository = createPersistedGoalsRepository({
      store: mockStore,
    });
    await mockRepository.list();
    await mockRepository.remove('goal-vacaciones');

    const actualRepository = createPersistedGoalsRepository({
      store: mockStore,
    });
    const actualIds = (await actualRepository.list()).map(goal => goal.id);
    const expectedX = ['goal-emergencia', 'goal-bici'];

    expect(actualIds).toEqual(expectedX);
    expect(await actualRepository.getById('goal-vacaciones')).toBeNull();
  });
});
