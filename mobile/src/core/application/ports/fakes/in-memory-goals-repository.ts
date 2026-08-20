import type { SavingsGoal } from '../../../domain/savings-goal';
import type { GoalsRepository } from '../goals-repository';

export class InMemoryGoalsRepository implements GoalsRepository {
  private readonly goals = new Map<string, SavingsGoal>();

  constructor(seed: readonly SavingsGoal[] = []) {
    for (const goal of seed) {
      this.goals.set(goal.id, goal);
    }
  }

  async list(): Promise<SavingsGoal[]> {
    return [...this.goals.values()];
  }

  async getById(id: string): Promise<SavingsGoal | null> {
    return this.goals.get(id) ?? null;
  }

  async save(goal: SavingsGoal): Promise<void> {
    this.goals.set(goal.id, goal);
  }
}
