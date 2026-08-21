import type { GoalsRepository } from '../../../core/application/ports/goals-repository';
import { err, ok, type Result } from '../../../core/domain/result';
import type { SavingsGoal } from '../../../core/domain/savings-goal';

export type DeleteGoalError = 'goal-not-found';
export type DeleteGoal = (
  id: string,
) => Promise<Result<SavingsGoal, DeleteGoalError>>;

export function createDeleteGoal(deps: {
  repository: GoalsRepository;
}): DeleteGoal {
  return async function deleteGoal(
    id: string,
  ): Promise<Result<SavingsGoal, DeleteGoalError>> {
    const goal = await deps.repository.getById(id);
    if (goal === null) {
      return err('goal-not-found');
    }

    await deps.repository.remove(id);
    return ok(goal);
  };
}
