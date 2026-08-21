import { Money } from '../../../core/domain/money';
import type { Result } from '../../../core/domain/result';
import { SavingsGoal } from '../../../core/domain/savings-goal';
import { toPersistedGoalRecord, toSavingsGoal } from './persisted-goal-mapper';
import { persistedGoalsEnvelopeSchema } from './persisted-goal-record';

function unwrap<T>(result: Result<T, string>): T {
  if (!result.ok) {
    throw new Error(`expected ok, got ${result.error}`);
  }
  return result.value;
}

function createGoal(input: {
  id: string;
  name: string;
  target: number;
  deposited: number;
}): SavingsGoal {
  return unwrap(
    SavingsGoal.create({
      id: input.id,
      name: input.name,
      target: unwrap(Money.ofPositive(input.target)),
      deposited: unwrap(Money.ofNonNegative(input.deposited)),
    }),
  );
}

describe('persisted goal mapper', () => {
  it('round-trips amounts and derives 25 percent progress', () => {
    const inputGoal = createGoal({
      id: 'goal-vacaciones',
      name: 'Vacaciones',
      target: 100000,
      deposited: 25000,
    });

    const actualRecord = toPersistedGoalRecord(inputGoal);
    const expectedRecord = {
      id: 'goal-vacaciones',
      name: 'Vacaciones',
      targetAmount: 100000,
      depositedAmount: 25000,
    };
    expect(actualRecord).toEqual(expectedRecord);

    const actualGoal = unwrap(toSavingsGoal(actualRecord));
    const actualX = actualGoal.progress();
    const expectedX = { percent: 25, isCompleted: false };

    expect(actualGoal.id).toBe(inputGoal.id);
    expect(actualGoal.name).toBe(inputGoal.name);
    expect(actualGoal.target.amount).toBe(100000);
    expect(actualGoal.deposited.amount).toBe(25000);
    expect(actualX).toEqual(expectedX);
  });

  it('ignores a stray progressPercent when reconstructing', () => {
    const inputX = {
      version: 1,
      goals: [
        {
          id: 'goal-vacaciones',
          name: 'Vacaciones',
          targetAmount: 100000,
          depositedAmount: 25000,
          progressPercent: 99,
        },
      ],
    };
    const actualEnvelope = persistedGoalsEnvelopeSchema.parse(inputX);
    const actualGoal = unwrap(toSavingsGoal(actualEnvelope.goals[0]!));
    const actualProgress = actualGoal.progress();
    const expectedX = { percent: 25, isCompleted: false };

    expect(actualEnvelope.goals[0]).not.toHaveProperty('progressPercent');
    expect(actualProgress).toEqual(expectedX);
  });
});
