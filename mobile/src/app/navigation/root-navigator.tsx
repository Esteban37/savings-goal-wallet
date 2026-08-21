import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'react-native';
import { enableScreens } from 'react-native-screens';
import { AppearanceHeaderButton } from '../appearance/appearance-header-button';
import { useAppearance } from '../appearance/appearance-provider';
import { createNavigationTheme } from '../appearance/navigation-theme';
import { GoalDetailScreen } from './goal-detail-screen';
import { GoalListScreen } from './goal-list-screen';
import type { RootStackParamList } from './types';

enableScreens();

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { resolvedScheme } = useAppearance();
  const navigationTheme = createNavigationTheme(resolvedScheme);

  return (
    <NavigationContainer theme={navigationTheme}>
      <StatusBar
        barStyle={resolvedScheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={navigationTheme.colors.card}
      />
      <Stack.Navigator
        initialRouteName="GoalList"
        screenOptions={{
          headerRight: () => <AppearanceHeaderButton />,
        }}>
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
