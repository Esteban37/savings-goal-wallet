/**
 * Composition-root factories. Adapters are registered in a later phase.
 */
export type AppDependencies = Record<string, never>;

export function createAppDependencies(): AppDependencies {
  return {};
}
