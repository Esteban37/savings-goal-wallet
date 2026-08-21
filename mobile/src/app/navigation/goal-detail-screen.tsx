import { useEffect } from 'react';
import { Text } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppearance } from '../appearance/appearance-provider';
import { useAppSelector } from '../store/hooks';
import { GoalDetailContainer } from '../../features/goal-detail/public';
import { selectGoalById } from '../../features/goals/public';
import type { RootStackParamList } from './types';

type GoalDetailScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'GoalDetail'
>;

export function GoalDetailScreen({
  route,
  navigation,
}: GoalDetailScreenProps) {
  const { goalId } = route.params;
  const { resolvedScheme } = useAppearance();
  const goal = useAppSelector(state => selectGoalById(state, goalId));

  useEffect(() => {
    navigation.setOptions({ title: goal?.name ?? 'Meta' });
  }, [goal?.name, navigation]);

  if (!goal) {
    return <Text>Meta no encontrada</Text>;
  }

  return <GoalDetailContainer mode="deposit" goalId={goalId} colorScheme={resolvedScheme} />;
}
