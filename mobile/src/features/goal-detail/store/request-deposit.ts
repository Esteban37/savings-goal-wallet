import { createAsyncThunk } from '@reduxjs/toolkit';
import type { AppDependencies } from '../../../app/di/create-app-dependencies';
import { depositApplied, toGoalSnapshot } from '../../goals/public';

export type DepositSucceededPayload = {
  goalId: string;
  depositedAmount: number;
  progressPercent: number;
  isCompleted: boolean;
};

export type DepositFailedPayload = {
  goalId: string;
  reason: string;
};

export const requestDeposit = createAsyncThunk<
  DepositSucceededPayload,
  { goalId: string; amount: number },
  { extra: AppDependencies; rejectValue: DepositFailedPayload }
>('goalDetail/requestDeposit', async (input, { extra, dispatch, rejectWithValue }) => {
  const result = await extra.makeDeposit({
    goalId: input.goalId,
    amount: input.amount,
  });

  if (!result.ok) {
    return rejectWithValue({
      goalId: input.goalId,
      reason: result.error,
    });
  }

  const snapshot = toGoalSnapshot(result.value);
  dispatch(depositApplied(snapshot));
  return {
    goalId: snapshot.id,
    depositedAmount: snapshot.depositedAmount,
    progressPercent: snapshot.progressPercent,
    isCompleted: snapshot.isCompleted,
  };
});
