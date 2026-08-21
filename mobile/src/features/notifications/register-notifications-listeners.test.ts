import { createAppDependencies } from '../../app/di/create-app-dependencies';
import { createAppStore } from '../../app/store/store';
import type { GoalNotifier } from '../../core/application/ports/goal-notifier';
import {
  depositApplied,
  goalCreated,
  type GoalSnapshot,
} from '../goals/store';

describe('registerNotificationsListeners', () => {
  it('notifies when a completed snapshot is applied and skips incomplete ones', async () => {
    const mockNotifier: GoalNotifier = {
      notifyGoalCompleted: jest.fn(async () => undefined),
      notifyGoalCreated: jest.fn(async () => undefined),
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

  it('notifies on goalCreated and does not use completion notify', async () => {
    const mockNotifier: GoalNotifier = {
      notifyGoalCompleted: jest.fn(async () => undefined),
      notifyGoalCreated: jest.fn(async () => undefined),
    };
    const mockDeps = {
      ...createAppDependencies(),
      goalNotifier: mockNotifier,
    };
    const store = createAppStore(mockDeps);
    const inputCreated: GoalSnapshot = {
      id: 'goal-viaje',
      name: 'Viaje',
      targetAmount: 500000,
      depositedAmount: 0,
      progressPercent: 0,
      isCompleted: false,
    };

    store.dispatch(goalCreated(inputCreated));
    await Promise.resolve();

    expect(mockNotifier.notifyGoalCreated).toHaveBeenCalledWith('Viaje');
    expect(mockNotifier.notifyGoalCompleted).not.toHaveBeenCalled();
  });
});
