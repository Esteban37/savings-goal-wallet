import { GoalListContainer } from '../../features/goals/public';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from './types';

type GoalListScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'GoalList'
>;

export function GoalListScreen({ navigation }: GoalListScreenProps) {
  return (
    <GoalListContainer
      onGoalPress={goalId => navigation.navigate('GoalDetail', { goalId })}
      onCreatePress={() => navigation.navigate('GoalCreate')}
    />
  );
}
