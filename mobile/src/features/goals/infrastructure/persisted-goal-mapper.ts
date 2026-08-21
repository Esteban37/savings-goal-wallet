import { Money } from '../../../core/domain/money';
import { err, type Result } from '../../../core/domain/result';
import { SavingsGoal } from '../../../core/domain/savings-goal';
import type { PersistedGoalRecord } from './persisted-goal-record';

export function toPersistedGoalRecord(goal: SavingsGoal): PersistedGoalRecord {
  return {
    id: goal.id,
    name: goal.name,
    targetAmount: goal.target.amount,
    depositedAmount: goal.deposited.amount,
  };
}

export function toSavingsGoal(
  record: PersistedGoalRecord,
): Result<SavingsGoal, 'invalid-amount' | 'invalid-goal'> {
  const target = Money.ofPositive(record.targetAmount);
  if (!target.ok) {
    return err(target.error);
  }
  const deposited = Money.ofNonNegative(record.depositedAmount);
  if (!deposited.ok) {
    return err(deposited.error);
  }
  return SavingsGoal.create({
    id: record.id,
    name: record.name,
    target: target.value,
    deposited: deposited.value,
  });
}
