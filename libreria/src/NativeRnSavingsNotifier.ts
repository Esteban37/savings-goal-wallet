import { TurboModuleRegistry, type TurboModule } from 'react-native';

export interface Spec extends TurboModule {
  notifyGoalCompleted(goalName: string): Promise<void>;
  showConfirmDialog(title: string, message: string): Promise<boolean>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('RnSavingsNotifier');
