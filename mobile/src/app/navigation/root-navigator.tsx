import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { enableScreens } from 'react-native-screens';
import { GoalDetailScreen } from './goal-detail-screen';
import { GoalListScreen } from './goal-list-screen';
import type { RootStackParamList } from './types';

enableScreens();

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="GoalList">
        <Stack.Screen
          name="GoalList"
          component={GoalListScreen}
          options={{ title: 'Metas de ahorro' }}
        />
        <Stack.Screen name="GoalDetail" component={GoalDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
