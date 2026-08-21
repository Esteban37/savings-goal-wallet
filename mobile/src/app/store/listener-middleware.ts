import { createListenerMiddleware } from '@reduxjs/toolkit';
import type { AppDependencies } from '../di/create-app-dependencies';

export function createAppListenerMiddleware(deps: AppDependencies) {
  return createListenerMiddleware({ extra: deps });
}
