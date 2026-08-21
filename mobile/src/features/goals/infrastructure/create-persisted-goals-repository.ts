import { InMemoryGoalsRepository } from '../../../core/application/ports/fakes/in-memory-goals-repository';
import type { GoalsRepository } from '../../../core/application/ports/goals-repository';
import type { SavingsGoal } from '../../../core/domain/savings-goal';
import { createSeedGoals } from './create-seeded-goals-repository';
import { GOALS_STORAGE_KEY, type KeyValueStore } from './key-value-store';
import { toPersistedGoalRecord, toSavingsGoal } from './persisted-goal-mapper';
import {
  persistedGoalsEnvelopeSchema,
  type PersistedGoalsEnvelope,
} from './persisted-goal-record';

export function createPersistedGoalsRepository(deps: {
  store: KeyValueStore;
  seed?: readonly SavingsGoal[];
}): GoalsRepository {
  const seed = deps.seed ?? createSeedGoals();
  let cache: InMemoryGoalsRepository | null = null;
  let hydratePromise: Promise<void> | null = null;

  async function persistAll(goals: readonly SavingsGoal[]): Promise<void> {
    const envelope: PersistedGoalsEnvelope = {
      version: 1,
      goals: goals.map(toPersistedGoalRecord),
    };
    await deps.store.setItem(GOALS_STORAGE_KEY, JSON.stringify(envelope));
  }

  async function writeSeed(): Promise<InMemoryGoalsRepository> {
    const memory = new InMemoryGoalsRepository(seed);
    await persistAll(seed);
    return memory;
  }

  function parseStoredGoals(raw: string | null): SavingsGoal[] | null {
    if (raw == null || raw === '') {
      return null;
    }
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return null;
    }
    const envelope = persistedGoalsEnvelopeSchema.safeParse(parsed);
    if (!envelope.success) {
      return null;
    }
    const goals: SavingsGoal[] = [];
    for (const record of envelope.data.goals) {
      const goal = toSavingsGoal(record);
      if (!goal.ok) {
        return null;
      }
      goals.push(goal.value);
    }
    return goals;
  }

  async function hydrate(): Promise<void> {
    const raw = await deps.store.getItem(GOALS_STORAGE_KEY);
    const loaded = parseStoredGoals(raw);
    cache =
      loaded === null
        ? await writeSeed()
        : new InMemoryGoalsRepository(loaded);
  }

  async function ensureHydrated(): Promise<InMemoryGoalsRepository> {
    if (!hydratePromise) {
      hydratePromise = hydrate();
    }
    await hydratePromise;
    if (cache == null) {
      throw new Error('persisted repository hydrate did not initialize cache');
    }
    return cache;
  }

  return {
    async list(): Promise<SavingsGoal[]> {
      const memory = await ensureHydrated();
      return memory.list();
    },
    async getById(id: string): Promise<SavingsGoal | null> {
      const memory = await ensureHydrated();
      return memory.getById(id);
    },
    async save(goal: SavingsGoal): Promise<void> {
      const memory = await ensureHydrated();
      await memory.save(goal);
      await persistAll(await memory.list());
    },
    async remove(id: string): Promise<void> {
      const memory = await ensureHydrated();
      await memory.remove(id);
      await persistAll(await memory.list());
    },
  };
}
