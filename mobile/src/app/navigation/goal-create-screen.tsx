import { useCallback } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppearance } from '../appearance/appearance-provider';
import { GoalDetailContainer } from '../../features/goal-detail/public';
import type { RootStackParamList } from './types';

type GoalCreateScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'GoalCreate'
>;

export function GoalCreateScreen({ navigation }: GoalCreateScreenProps) {
  const { resolvedScheme } = useAppearance();
  const onCreateSuccess = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  return (
    <GoalDetailContainer
      mode="create"
      colorScheme={resolvedScheme}
      onCreateSuccess={onCreateSuccess}
    />
  );
}
