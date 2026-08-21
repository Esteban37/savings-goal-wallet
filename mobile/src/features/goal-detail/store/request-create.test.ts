import { createAppDependencies } from '../../../app/di/create-app-dependencies';
import { createAppStore } from '../../../app/store/store';
import { fetchGoals } from '../../goals/public';
import { interpretWebToNativeMessage } from '../infrastructure';
import { requestCreate } from './request-create';

describe('requestCreate', () => {
  it('appends a valid goal with deposited 0 to the goals store', async () => {
    const mockDeps = createAppDependencies();
    const store = createAppStore(mockDeps);
    await store.dispatch(fetchGoals());
    const expectedCount = store.getState().goals.items.length + 1;

    const result = await store.dispatch(
      requestCreate({ name: 'Viaje', targetAmount: 500000 }),
    );
    const actualX = store
      .getState()
      .goals.items.find(item => item.name === 'Viaje');

    expect(requestCreate.fulfilled.match(result)).toBe(true);
    expect(store.getState().goals.items).toHaveLength(expectedCount);
    expect(actualX?.targetAmount).toBe(500000);
    expect(actualX?.depositedAmount).toBe(0);
    expect(actualX?.progressPercent).toBe(0);
  });

  it('rejects target 0 without changing the item count', async () => {
    const mockDeps = createAppDependencies();
    const store = createAppStore(mockDeps);
    await store.dispatch(fetchGoals());
    const expectedCount = store.getState().goals.items.length;

    const result = await store.dispatch(
      requestCreate({ name: 'Viaje', targetAmount: 0 }),
    );

    expect(requestCreate.rejected.match(result)).toBe(true);
    expect(store.getState().goals.items).toHaveLength(expectedCount);
    if (requestCreate.rejected.match(result)) {
      expect(result.payload).toEqual({ reason: 'invalid-target' });
    }
  });

  it('does not call createGoal for a malformed envelope', async () => {
    const mockCreateGoal = jest.fn();
    const mockDeps = {
      ...createAppDependencies(),
      createGoal: mockCreateGoal,
    };
    const store = createAppStore(mockDeps);

    const decision = interpretWebToNativeMessage('{not json');
    expect(decision).toEqual({ type: 'ignore' });
    expect(mockCreateGoal).not.toHaveBeenCalled();
    expect(store.getState().goals.items).toEqual([]);
  });
});
