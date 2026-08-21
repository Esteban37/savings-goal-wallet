import { createAsyncThunk } from '@reduxjs/toolkit';
import type { AppDependencies } from '../../../app/di/create-app-dependencies';
import { goalDeleted } from './goals-slice';

export type RequestDeleteInput = {
  id: string;
  name: string;
};

export const requestDelete = createAsyncThunk<
  { id: string; confirmed: boolean },
  RequestDeleteInput,
  { extra: AppDependencies }
>('goals/requestDelete', async (input, { extra, dispatch }) => {
  const confirmed = await extra.confirmDialog.confirm({
    title: 'Eliminar meta',
    message: `¿Eliminar ${input.name}? Esta acción no se puede deshacer.`,
  });
  if (!confirmed) {
    return { id: input.id, confirmed: false };
  }

  const result = await extra.deleteGoal(input.id);
  if (!result.ok) {
    return { id: input.id, confirmed: true };
  }

  dispatch(goalDeleted(input.id));
  return { id: input.id, confirmed: true };
});
