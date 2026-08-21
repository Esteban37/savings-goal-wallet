import { createAsyncThunk } from '@reduxjs/toolkit';
import type { AppDependencies } from '../../../app/di/create-app-dependencies';
import { goalCreated, toGoalSnapshot } from '../../goals/public';

export type CreateSucceededPayload = {
  goal: {
    id: string;
    name: string;
    targetAmount: number;
    depositedAmount: number;
    progressPercent: number;
  };
};

export type CreateFailedPayload = {
  reason: string;
};

export const requestCreate = createAsyncThunk<
  CreateSucceededPayload,
  { name: string; targetAmount: number },
  { extra: AppDependencies; rejectValue: CreateFailedPayload }
>('goalDetail/requestCreate', async (input, { extra, dispatch, rejectWithValue }) => {
  const result = await extra.createGoal({
    name: input.name,
    targetAmount: input.targetAmount,
  });

  if (!result.ok) {
    return rejectWithValue({
      reason: result.error === 'invalid-name' ? 'invalid-name' : 'invalid-target',
    });
  }

  const snapshot = toGoalSnapshot(result.value);
  dispatch(goalCreated(snapshot));
  return {
    goal: {
      id: snapshot.id,
      name: snapshot.name,
      targetAmount: snapshot.targetAmount,
      depositedAmount: snapshot.depositedAmount,
      progressPercent: snapshot.progressPercent,
    },
  };
});
