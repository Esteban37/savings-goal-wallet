import type { GoalsRepository } from '../../../core/application/ports/goals-repository';
import { Money } from '../../../core/domain/money';
import { err, type Result } from '../../../core/domain/result';
import type { SavingsGoal } from '../../../core/domain/savings-goal';

export type MakeDepositError = 'invalid-amount' | 'goal-not-found';
export type MakeDeposit = (input: {
  goalId: string;
  amount: number;
}) => Promise<Result<SavingsGoal, MakeDepositError>>;

export function createMakeDeposit(deps: {
  repository: GoalsRepository;
}): MakeDeposit {
  return async function makeDeposit(input: {
    goalId: string;
    amount: number;
  }): Promise<Result<SavingsGoal, MakeDepositError>> {
    const moneyResult = Money.ofPositive(input.amount);
    if (!moneyResult.ok) {
      return moneyResult;
    }

    const goal = await deps.repository.getById(input.goalId);
    if (goal === null) {
      return err('goal-not-found');
    }

    const applied = goal.applyDeposit(moneyResult.value);
    if (!applied.ok) {
      return applied;
    }

    await deps.repository.save(applied.value);
    return applied;
  };
}
