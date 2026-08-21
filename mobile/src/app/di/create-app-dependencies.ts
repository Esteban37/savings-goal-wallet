import { AlwaysConfirmDialog } from '../../core/application/ports/fakes/always-confirm-dialog';
import type { ConfirmDialog } from '../../core/application/ports/confirm-dialog';
import type { GoalNotifier } from '../../core/application/ports/goal-notifier';
import type { GoalsRepository } from '../../core/application/ports/goals-repository';
import {
  createMakeDeposit,
  type MakeDeposit,
} from '../../features/goal-detail/application';
import { createGetGoals, type GetGoals } from '../../features/goals/application';
import {
  AsyncStorageKeyValueStore,
  createPersistedGoalsRepository,
} from '../../features/goals/infrastructure';
import { RnSavingsNotifierAdapter } from '../../features/notifications/public';

export type AppDependencies = {
  repository: GoalsRepository;
  getGoals: GetGoals;
  makeDeposit: MakeDeposit;
  goalNotifier: GoalNotifier;
  confirmDialog: ConfirmDialog;
};

export function createAppDependencies(): AppDependencies {
  const repository = createPersistedGoalsRepository({
    store: new AsyncStorageKeyValueStore(),
  });
  return {
    repository,
    getGoals: createGetGoals({ repository }),
    makeDeposit: createMakeDeposit({ repository }),
    goalNotifier: new RnSavingsNotifierAdapter(),
    confirmDialog: new AlwaysConfirmDialog(),
  };
}
