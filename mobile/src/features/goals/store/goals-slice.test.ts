import { ok } from '../../../core/domain/result';
import type { AppDependencies } from '../../../app/di/create-app-dependencies';
import { createAppDependencies } from '../../../app/di/create-app-dependencies';
import { createSeedGoals } from '../infrastructure';
import { createAppStore } from '../../../app/store/store';
import { toGoalSnapshot } from './goal-snapshot';
import {
  depositApplied,
  fetchGoals,
  goalCreated,
  goalDeleted,
} from './goals-slice';

describe('goals slice', () => {
  it('writes three serializable snapshots when fetchGoals fulfills', async () => {
    const inputGoals = createSeedGoals();
    const mockDeps: AppDependencies = {
      ...createAppDependencies(),
      getGoals: async () => ok(inputGoals),
    };
    const store = createAppStore(mockDeps);

    await store.dispatch(fetchGoals());
    const actualX = store.getState().goals;
    const expectedX = inputGoals.map(toGoalSnapshot);

    expect(actualX.status).toBe('succeeded');
    expect(actualX.items).toEqual(expectedX);
    expect(JSON.parse(JSON.stringify(actualX))).toEqual(actualX);
  });

  it('updates deposited amount and percent on depositApplied', async () => {
    const mockDeps = createAppDependencies();
    const store = createAppStore(mockDeps);
    await store.dispatch(fetchGoals());

    const inputSnapshot = {
      id: 'goal-vacaciones',
      name: 'Vacaciones',
      targetAmount: 100000,
      depositedAmount: 50000,
      progressPercent: 50,
      isCompleted: false,
    };
    store.dispatch(depositApplied(inputSnapshot));
    const actualX = store
      .getState()
      .goals.items.find(item => item.id === 'goal-vacaciones');
    const expectedX = inputSnapshot;

    expect(actualX).toEqual(expectedX);
  });

  it('appends a created snapshot', async () => {
    const mockDeps = createAppDependencies();
    const store = createAppStore(mockDeps);
    await store.dispatch(fetchGoals());
    const inputSnapshot = {
      id: 'goal-viaje',
      name: 'Viaje',
      targetAmount: 500000,
      depositedAmount: 0,
      progressPercent: 0,
      isCompleted: false,
    };

    store.dispatch(goalCreated(inputSnapshot));
    const actualX = store
      .getState()
      .goals.items.find(item => item.id === 'goal-viaje');

    expect(actualX).toEqual(inputSnapshot);
  });

  it('removes only the deleted snapshot and keeps an empty list empty', async () => {
    const mockDeps = createAppDependencies();
    const store = createAppStore(mockDeps);
    await store.dispatch(fetchGoals());

    store.dispatch(goalDeleted('goal-vacaciones'));
    const actualIds = store.getState().goals.items.map(item => item.id);
    expect(actualIds).not.toContain('goal-vacaciones');
    expect(actualIds).toContain('goal-emergencia');

    store.getState().goals.items.forEach(item => {
      store.dispatch(goalDeleted(item.id));
    });
    expect(store.getState().goals.items).toEqual([]);

    store.dispatch(goalDeleted('goal-vacaciones'));
    expect(store.getState().goals.items).toEqual([]);
  });
});
