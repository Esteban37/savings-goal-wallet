import type { ConfirmDialog } from '../../core/application/ports/confirm-dialog';
import type { GoalNotifier } from '../../core/application/ports/goal-notifier';
import type { GoalsRepository } from '../../core/application/ports/goals-repository';
import {
  createMakeDeposit,
  type MakeDeposit,
} from '../../features/goal-detail/application';
import {
  createCreateGoal,
  createDeleteGoal,
  createGetGoals,
  type CreateGoal,
  type DeleteGoal,
  type GetGoals,
} from '../../features/goals/application';
import {
  AsyncStorageKeyValueStore,
  createPersistedGoalsRepository,
} from '../../features/goals/infrastructure';
import {
  RnConfirmDialogAdapter,
  RnSavingsNotifierAdapter,
} from '../../features/notifications/public';

export type AppDependencies = {
  repository: GoalsRepository;
  getGoals: GetGoals;
  makeDeposit: MakeDeposit;
  createGoal: CreateGoal;
  deleteGoal: DeleteGoal;
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
    createGoal: createCreateGoal({ repository }),
    deleteGoal: createDeleteGoal({ repository }),
    goalNotifier: new RnSavingsNotifierAdapter(),
    confirmDialog: new RnConfirmDialogAdapter(),
  };
}
