import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './screens/HomeScreen';
import LogScreen from './screens/LogScreen';
import EducationScreen from './screens/EducationScreen';
import HcpPatientsScreen from './screens/HcpPatientsScreen';
import HcpTriageScreen from './screens/HcpTriageScreen';
import SettingsScreen from './screens/SettingsScreen';

export type RootStackParamList = {
  Home: undefined;
  Log: undefined;
  Education: undefined;
  HcpPatients: undefined;
  HcpTriage: undefined;
  Settings: undefined;
  Consent: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { useEffect } from 'react';
import { savePushToken, initAuth } from './services/auth';
import { getConsent } from './utils/consent';
import ConsentScreen from './screens/ConsentScreen';

export default function App() {
  const [consented, setConsented] = React.useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      setConsented(await getConsent());
      await initAuth();
      if (!Device.isDevice) return;
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') return;
      // Android channel
      if (Device.osName === 'Android') {
        await Notifications.setNotificationChannelAsync('default', { name: 'default', importance: Notifications.AndroidImportance.DEFAULT });
      }
      const token = await Notifications.getExpoPushTokenAsync();
      // @ts-ignore
      const expoToken = token?.data || token;
      if (expoToken) await savePushToken(expoToken as string);
    })();
  }, []);

  if (consented === null) return null;
  return (
    <NavigationContainer>
      <Stack.Navigator>
        {consented ? (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Log" component={LogScreen} />
            <Stack.Screen name="Education" component={EducationScreen} />
            <Stack.Screen name="HcpPatients" component={HcpPatientsScreen} />
            <Stack.Screen name="HcpTriage" component={HcpTriageScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
          </>
        ) : (
          <Stack.Screen name="Consent" component={ConsentScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
