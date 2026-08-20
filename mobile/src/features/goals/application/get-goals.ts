import type { GoalsRepository } from '../../../core/application/ports/goals-repository';
import { ok, type Result } from '../../../core/domain/result';
import type { SavingsGoal } from '../../../core/domain/savings-goal';

export type GetGoals = () => Promise<Result<SavingsGoal[], never>>;

export function createGetGoals(deps: {
  repository: GoalsRepository;
}): GetGoals {
  return async function getGoals(): Promise<Result<SavingsGoal[], never>> {
    const goals = await deps.repository.list();
    return ok(goals);
  };
}
