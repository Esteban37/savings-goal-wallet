import { createAsyncThunk, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AppDependencies } from '../../../app/di/create-app-dependencies';
import { toGoalSnapshot, type GoalSnapshot } from './goal-snapshot';

export type GoalsStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

export type GoalsState = {
  status: GoalsStatus;
  items: GoalSnapshot[];
  error: string | null;
};

const initialState: GoalsState = {
  status: 'idle',
  items: [],
  error: null,
};

export const fetchGoals = createAsyncThunk<
  GoalSnapshot[],
  void,
  { extra: AppDependencies; rejectValue: string }
>('goals/fetchGoals', async (_arg, { extra, rejectWithValue }) => {
  try {
    const result = await extra.getGoals();
    if (!result.ok) {
      return rejectWithValue('failed');
    }
    return result.value.map(toGoalSnapshot);
  } catch {
    return rejectWithValue('failed');
  }
});

const goalsSlice = createSlice({
  name: 'goals',
  initialState,
  reducers: {
    depositApplied(state, action: PayloadAction<GoalSnapshot>) {
      const index = state.items.findIndex(item => item.id === action.payload.id);
      if (index >= 0) {
        state.items[index] = action.payload;
      }
    },
    goalCreated(state, action: PayloadAction<GoalSnapshot>) {
      const index = state.items.findIndex(item => item.id === action.payload.id);
      if (index >= 0) {
        state.items[index] = action.payload;
        return;
      }
      state.items.push(action.payload);
    },
    goalDeleted(state, action: PayloadAction<string>) {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchGoals.pending, state => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchGoals.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchGoals.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'failed';
      });
  },
});

export const { depositApplied, goalCreated, goalDeleted } = goalsSlice.actions;
export const goalsReducer = goalsSlice.reducer;
