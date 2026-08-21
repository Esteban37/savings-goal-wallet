import { configureStore } from '@reduxjs/toolkit';
import type { Action, ThunkAction } from '@reduxjs/toolkit';
import { registerNotificationsListeners } from '../../features/notifications/public';
import { goalsReducer } from '../../features/goals/store';
import type { AppDependencies } from '../di/create-app-dependencies';
import { createAppListenerMiddleware } from './listener-middleware';

export function createAppStore(deps: AppDependencies) {
  const listenerMiddleware = createAppListenerMiddleware(deps);
  registerNotificationsListeners(listenerMiddleware);

  return configureStore({
    reducer: {
      goals: goalsReducer,
    },
    middleware: getDefaultMiddleware =>
      getDefaultMiddleware({
        thunk: {
          extraArgument: deps,
        },
      }).prepend(listenerMiddleware.middleware),
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
