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

const createRequestedMessageSchema = z.strictObject({
  type: z.literal('CREATE_REQUESTED'),
  payload: z.strictObject({
    name: nonEmptyString,
    targetAmount: z.number(),
  }),
});

const bootstrapGoalSchema = z.strictObject({
  id: nonEmptyString,
  name: nonEmptyString,
  targetAmount: z.number(),
  depositedAmount: z.number(),
  progressPercent: z.number(),
});

const sessionBootstrapPayloadSchema = z.discriminatedUnion('mode', [
  z.strictObject({
    sessionId: nonEmptyString,
    goalId: nonEmptyString,
    userInfo: z.record(z.string(), z.unknown()),
    mode: z.literal('deposit'),
    goal: bootstrapGoalSchema,
  }),
  z.strictObject({
    sessionId: nonEmptyString,
    goalId: nonEmptyString,
    userInfo: z.record(z.string(), z.unknown()),
    mode: z.literal('create'),
  }),
]);

const sessionBootstrapMessageSchema = z.strictObject({
  type: z.literal('SESSION_BOOTSTRAP'),
  payload: sessionBootstrapPayloadSchema,
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

const createSucceededMessageSchema = z.strictObject({
  type: z.literal('CREATE_SUCCEEDED'),
  payload: z.strictObject({
    goal: bootstrapGoalSchema,
  }),
});

const createFailedMessageSchema = z.strictObject({
  type: z.literal('CREATE_FAILED'),
  payload: z.strictObject({
    reason: nonEmptyString,
  }),
});

export const webToNativeMessageSchema = z.discriminatedUnion('type', [
  webReadyMessageSchema,
  depositRequestedMessageSchema,
  createRequestedMessageSchema,
]);

export const nativeToWebMessageSchema = z.discriminatedUnion('type', [
  sessionBootstrapMessageSchema,
  depositSucceededMessageSchema,
  depositFailedMessageSchema,
  createSucceededMessageSchema,
  createFailedMessageSchema,
]);

export const bridgeMessageSchema = z.discriminatedUnion('type', [
  webReadyMessageSchema,
  depositRequestedMessageSchema,
  createRequestedMessageSchema,
  sessionBootstrapMessageSchema,
  depositSucceededMessageSchema,
  depositFailedMessageSchema,
  createSucceededMessageSchema,
  createFailedMessageSchema,
]);

export type WebToNativeMessage = z.infer<typeof webToNativeMessageSchema>;
export type NativeToWebMessage = z.infer<typeof nativeToWebMessageSchema>;
export type BridgeMessage = z.infer<typeof bridgeMessageSchema>;

type _PingIsNotCatalog = Extract<BridgeMessage, { type: 'PING' }> extends never
  ? true
  : never;
export const pingIsOutsideCatalog: _PingIsNotCatalog = true;
