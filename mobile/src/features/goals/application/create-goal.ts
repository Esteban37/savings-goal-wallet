import type { GoalsRepository } from '../../../core/application/ports/goals-repository';
import { Money } from '../../../core/domain/money';
import { err, ok, type Result } from '../../../core/domain/result';
import { SavingsGoal } from '../../../core/domain/savings-goal';

export type CreateGoalError = 'invalid-name' | 'invalid-amount';
export type CreateGoal = (input: {
  name: string;
  targetAmount: number;
}) => Promise<Result<SavingsGoal, CreateGoalError>>;

function createGoalId(): string {
  return `goal-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createCreateGoal(deps: {
  repository: GoalsRepository;
}): CreateGoal {
  return async function createGoal(input: {
    name: string;
    targetAmount: number;
  }): Promise<Result<SavingsGoal, CreateGoalError>> {
    const name = input.name.trim();
    if (name.length === 0) {
      return err('invalid-name');
    }

    const targetResult = Money.ofPositive(input.targetAmount);
    if (!targetResult.ok) {
      return err('invalid-amount');
    }

    const existing = await deps.repository.list();
    let id = createGoalId();
    if (existing.some(goal => goal.id === id)) {
      id = createGoalId();
    }

    const goalResult = SavingsGoal.create({
      id,
      name,
      target: targetResult.value,
    });
    if (!goalResult.ok) {
      return err('invalid-name');
    }

    await deps.repository.save(goalResult.value);
    return ok(goalResult.value);
  };
}
