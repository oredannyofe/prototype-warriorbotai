import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import OnboardingScreen from './src/screens/OnboardingScreen';
import CrisisFlowScreen from './src/screens/CrisisFlowScreen';
import DailyCheckInScreen from './src/screens/DailyCheckInScreen';
import EducationScreen from './src/screens/EducationScreen';
import ReportScreen from './src/screens/ReportScreen';
import HomeScreen from './src/screens/HomeScreen';
import { useEffect, useState } from 'react';
import { useAuth } from './src/store/useAuth';
import LoadingScreen from './src/screens/LoadingScreen';
import { setUnauthorizedHandler } from './src/api/client';
import EmergencyPlanScreen from './src/screens/EmergencyPlanScreen';
import RemindersScreen from './src/screens/RemindersScreen';

const Stack = createNativeStackNavigator();
import { queryClient as qc, initQueryPersistence } from './src/query';
import { startLogQueue } from './src/offline/logQueue';

export default function App() {
  const hydrate = useAuth((s) => s.hydrate);
  const token = useAuth((s) => s.token);
  const logout = useAuth((s) => s.logout);
  const [ready, setReady] = useState(false);
  useEffect(() => { (async () => { await initQueryPersistence(); await hydrate(); startLogQueue(); setReady(true); })(); }, []);
  useEffect(() => { setUnauthorizedHandler(() => { logout(); }); }, [logout]);
  if (!ready) return <LoadingScreen />;
  const initialRouteName = token ? 'Home' : 'Onboarding';
  return (
    <QueryClientProvider client={qc}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName={initialRouteName}>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="Crisis" component={CrisisFlowScreen} />
          <Stack.Screen name="CheckIn" component={DailyCheckInScreen} />
          <Stack.Screen name="Education" component={EducationScreen} />
          <Stack.Screen name="Report" component={ReportScreen} />
          <Stack.Screen name="EmergencyPlan" component={EmergencyPlanScreen} />
          <Stack.Screen name="Reminders" component={RemindersScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </QueryClientProvider>
  );
}
