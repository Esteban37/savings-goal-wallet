import { z } from 'zod';

export const persistedGoalRecordSchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1),
    targetAmount: z.number().int().positive(),
    depositedAmount: z.number().int().nonnegative(),
  })
  .strip();

export const persistedGoalsEnvelopeSchema = z
  .object({
    version: z.literal(1),
    goals: z.array(persistedGoalRecordSchema),
  })
  .strip();

export type PersistedGoalRecord = z.infer<typeof persistedGoalRecordSchema>;
export type PersistedGoalsEnvelope = z.infer<
  typeof persistedGoalsEnvelopeSchema
>;
