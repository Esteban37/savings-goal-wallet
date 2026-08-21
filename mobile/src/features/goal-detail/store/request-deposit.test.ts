import { createAppDependencies } from '../../../app/di/create-app-dependencies';
import { createAppStore } from '../../../app/store/store';
import { fetchGoals } from '../../goals/public';
import { requestDeposit } from './request-deposit';

describe('requestDeposit', () => {
  it('applies a valid deposit to the goals store snapshot', async () => {
    const mockDeps = createAppDependencies();
    const store = createAppStore(mockDeps);
    await store.dispatch(fetchGoals());

    const result = await store.dispatch(
      requestDeposit({ goalId: 'goal-vacaciones', amount: 10000 }),
    );
    const actualX = store
      .getState()
      .goals.items.find(item => item.id === 'goal-vacaciones');
    const expectedX = {
      id: 'goal-vacaciones',
      name: 'Vacaciones',
      targetAmount: 100000,
      depositedAmount: 35000,
      progressPercent: 35,
      isCompleted: false,
    };

    expect(requestDeposit.fulfilled.match(result)).toBe(true);
    expect(actualX).toEqual(expectedX);
    if (requestDeposit.fulfilled.match(result)) {
      expect(result.payload).toEqual({
        goalId: 'goal-vacaciones',
        depositedAmount: 35000,
        progressPercent: 35,
        isCompleted: false,
      });
    }
  });

  it('rejects a non-positive amount without changing the snapshot', async () => {
    const mockDeps = createAppDependencies();
    const store = createAppStore(mockDeps);
    await store.dispatch(fetchGoals());

    const result = await store.dispatch(
      requestDeposit({ goalId: 'goal-vacaciones', amount: 0 }),
    );
    const actualX = store
      .getState()
      .goals.items.find(item => item.id === 'goal-vacaciones');
    const expectedX = {
      depositedAmount: 25000,
      progressPercent: 25,
    };

    expect(requestDeposit.rejected.match(result)).toBe(true);
    expect(actualX?.depositedAmount).toBe(expectedX.depositedAmount);
    expect(actualX?.progressPercent).toBe(expectedX.progressPercent);
    if (requestDeposit.rejected.match(result)) {
      expect(result.payload).toEqual({
        goalId: 'goal-vacaciones',
        reason: 'invalid-amount',
      });
    }
  });
});
