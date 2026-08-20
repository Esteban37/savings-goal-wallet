import { ok } from '../../../core/domain/result';
import type { AppDependencies } from '../../../app/di/create-app-dependencies';
import { createAppDependencies } from '../../../app/di/create-app-dependencies';
import { createSeedGoals } from '../infrastructure';
import { createAppStore } from '../../../app/store/store';
import { toGoalSnapshot } from './goal-snapshot';
import { depositApplied, fetchGoals } from './goals-slice';

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
});
