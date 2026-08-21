import { createAppDependencies } from '../../app/di/create-app-dependencies';
import { createAppStore } from '../../app/store/store';
import type { GoalNotifier } from '../../core/application/ports/goal-notifier';
import { depositApplied, type GoalSnapshot } from '../goals/store';

describe('registerNotificationsListeners', () => {
  it('notifies when a completed snapshot is applied and skips incomplete ones', async () => {
    const mockNotifier: GoalNotifier = {
      notifyGoalCompleted: jest.fn(async () => undefined),
    };
    const mockDeps = {
      ...createAppDependencies(),
      goalNotifier: mockNotifier,
    };
    const store = createAppStore(mockDeps);

    const inputIncomplete: GoalSnapshot = {
      id: 'goal-vacaciones',
      name: 'Vacaciones',
      targetAmount: 100000,
      depositedAmount: 35000,
      progressPercent: 35,
      isCompleted: false,
    };
    const inputComplete: GoalSnapshot = {
      id: 'goal-vacaciones',
      name: 'Vacaciones',
      targetAmount: 100000,
      depositedAmount: 100000,
      progressPercent: 100,
      isCompleted: true,
    };

    store.dispatch(depositApplied(inputIncomplete));
    await Promise.resolve();
    expect(mockNotifier.notifyGoalCompleted).not.toHaveBeenCalled();

    store.dispatch(depositApplied(inputComplete));
    await Promise.resolve();
    expect(mockNotifier.notifyGoalCompleted).toHaveBeenCalledWith('Vacaciones');
  });
});
