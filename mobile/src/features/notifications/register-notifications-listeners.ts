import { depositApplied, goalCreated } from '../goals/store';
import type { AppDependencies } from '../../app/di/create-app-dependencies';

type NotificationsListenerMiddleware = {
  startListening: (options: {
    actionCreator: typeof depositApplied | typeof goalCreated;
    effect: (
      action:
        | ReturnType<typeof depositApplied>
        | ReturnType<typeof goalCreated>,
      listenerApi: { extra: AppDependencies },
    ) => void | Promise<void>;
  }) => unknown;
};

export function registerNotificationsListeners(
  middleware: NotificationsListenerMiddleware,
): void {
  middleware.startListening({
    actionCreator: depositApplied,
    effect: async (action, listenerApi) => {
      if (action.type !== depositApplied.type) {
        return;
      }
      if (!action.payload.isCompleted) {
        return;
      }
      await listenerApi.extra.goalNotifier.notifyGoalCompleted(
        action.payload.name,
      );
    },
  });
  middleware.startListening({
    actionCreator: goalCreated,
    effect: async (action, listenerApi) => {
      if (action.type !== goalCreated.type) {
        return;
      }
      await listenerApi.extra.goalNotifier.notifyGoalCreated(
        action.payload.name,
      );
    },
  });
}
