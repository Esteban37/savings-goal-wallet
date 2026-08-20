import { configureStore } from '@reduxjs/toolkit';
import type { Action, ThunkAction } from '@reduxjs/toolkit';
import { goalsReducer } from '../../features/goals/store';
import type { AppDependencies } from '../di/create-app-dependencies';

export function createAppStore(deps: AppDependencies) {
  return configureStore({
    reducer: {
      goals: goalsReducer,
    },
    middleware: getDefaultMiddleware =>
      getDefaultMiddleware({
        thunk: {
          extraArgument: deps,
        },
      }),
  });
}

export type AppStore = ReturnType<typeof createAppStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  AppDependencies,
  Action
>;
