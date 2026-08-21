import { depositApplied } from '../goals/store';
import type { AppDependencies } from '../../app/di/create-app-dependencies';

type NotificationsListenerMiddleware = {
  startListening: (options: {
    actionCreator: typeof depositApplied;
    effect: (
      action: ReturnType<typeof depositApplied>,
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
      if (!action.payload.isCompleted) {
        return;
      }
      await listenerApi.extra.goalNotifier.notifyGoalCompleted(
        action.payload.name,
      );
    },
  });
}
