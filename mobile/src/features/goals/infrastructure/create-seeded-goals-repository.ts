import { InMemoryGoalsRepository } from '../../../core/application/ports/fakes/in-memory-goals-repository';
import type { GoalsRepository } from '../../../core/application/ports/goals-repository';
import { Money } from '../../../core/domain/money';
import type { Result } from '../../../core/domain/result';
import { SavingsGoal } from '../../../core/domain/savings-goal';

function unwrap<T>(result: Result<T, string>): T {
  if (!result.ok) {
    throw new Error(`expected ok, got ${result.error}`);
  }
  return result.value;
}

function createSeedGoal(input: {
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

export function createSeedGoals(): SavingsGoal[] {
  return [
    createSeedGoal({
      id: 'goal-vacaciones',
      name: 'Vacaciones',
      target: 100000,
      deposited: 25000,
    }),
    createSeedGoal({
      id: 'goal-emergencia',
      name: 'Fondo de emergencia',
      target: 1000000,
      deposited: 0,
    }),
    createSeedGoal({
      id: 'goal-bici',
      name: 'Bicicleta',
      target: 800000,
      deposited: 200000,
    }),
  ];
}

export function createSeededGoalsRepository(): GoalsRepository {
  return new InMemoryGoalsRepository(createSeedGoals());
}
