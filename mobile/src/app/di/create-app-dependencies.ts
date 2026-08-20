import { AlwaysConfirmDialog } from '../../core/application/ports/fakes/always-confirm-dialog';
import { NoopGoalNotifier } from '../../core/application/ports/fakes/noop-goal-notifier';
import type { ConfirmDialog } from '../../core/application/ports/confirm-dialog';
import type { GoalNotifier } from '../../core/application/ports/goal-notifier';
import type { GoalsRepository } from '../../core/application/ports/goals-repository';
import {
  createMakeDeposit,
  type MakeDeposit,
} from '../../features/goal-detail/application';
import { createGetGoals, type GetGoals } from '../../features/goals/application';
import { createSeededGoalsRepository } from '../../features/goals/infrastructure';

export type AppDependencies = {
  repository: GoalsRepository;
  getGoals: GetGoals;
  makeDeposit: MakeDeposit;
  goalNotifier: GoalNotifier;
  confirmDialog: ConfirmDialog;
};

export function createAppDependencies(): AppDependencies {
  const repository = createSeededGoalsRepository();
  return {
    repository,
    getGoals: createGetGoals({ repository }),
    makeDeposit: createMakeDeposit({ repository }),
    goalNotifier: new NoopGoalNotifier(),
    confirmDialog: new AlwaysConfirmDialog(),
  };
}
