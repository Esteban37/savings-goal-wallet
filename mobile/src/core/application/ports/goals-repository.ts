import type { SavingsGoal } from '../../domain/savings-goal';

export interface GoalsRepository {
  list(): Promise<SavingsGoal[]>;
  getById(id: string): Promise<SavingsGoal | null>;
  save(goal: SavingsGoal): Promise<void>;
  remove(id: string): Promise<void>;
}
