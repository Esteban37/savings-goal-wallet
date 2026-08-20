import { z } from 'zod';

const nonEmptyString = z.string().min(1);

const webReadyMessageSchema = z.strictObject({
  type: z.literal('WEB_READY'),
  payload: z.strictObject({
    goalId: nonEmptyString,
  }),
});

const depositRequestedMessageSchema = z.strictObject({
  type: z.literal('DEPOSIT_REQUESTED'),
  payload: z.strictObject({
    goalId: nonEmptyString,
    amount: z.number(),
  }),
});

const bootstrapGoalSchema = z.strictObject({
  id: nonEmptyString,
  name: nonEmptyString,
  targetAmount: z.number(),
  depositedAmount: z.number(),
  progressPercent: z.number(),
});

const sessionBootstrapMessageSchema = z.strictObject({
  type: z.literal('SESSION_BOOTSTRAP'),
  payload: z.strictObject({
    sessionId: nonEmptyString,
    goalId: nonEmptyString,
    userInfo: z.record(z.string(), z.unknown()),
    goal: bootstrapGoalSchema,
  }),
});

const depositSucceededMessageSchema = z.strictObject({
  type: z.literal('DEPOSIT_SUCCEEDED'),
  payload: z.strictObject({
    goalId: nonEmptyString,
    depositedAmount: z.number(),
    progressPercent: z.number(),
    isCompleted: z.boolean(),
  }),
});

const depositFailedMessageSchema = z.strictObject({
  type: z.literal('DEPOSIT_FAILED'),
  payload: z.strictObject({
    goalId: nonEmptyString,
    reason: nonEmptyString,
  }),
});

export const webToNativeMessageSchema = z.discriminatedUnion('type', [
  webReadyMessageSchema,
  depositRequestedMessageSchema,
]);

export const nativeToWebMessageSchema = z.discriminatedUnion('type', [
  sessionBootstrapMessageSchema,
  depositSucceededMessageSchema,
  depositFailedMessageSchema,
]);

export const bridgeMessageSchema = z.discriminatedUnion('type', [
  webReadyMessageSchema,
  depositRequestedMessageSchema,
  sessionBootstrapMessageSchema,
  depositSucceededMessageSchema,
  depositFailedMessageSchema,
]);

export type WebToNativeMessage = z.infer<typeof webToNativeMessageSchema>;
export type NativeToWebMessage = z.infer<typeof nativeToWebMessageSchema>;
export type BridgeMessage = z.infer<typeof bridgeMessageSchema>;

type _PingIsNotCatalog = Extract<BridgeMessage, { type: 'PING' }> extends never
  ? true
  : never;
export const pingIsOutsideCatalog: _PingIsNotCatalog = true;
