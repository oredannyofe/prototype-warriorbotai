import React, { useEffect, useState } from 'react';
import { View, Text, Button, ScrollView } from 'react-native';
import { getMyProfile, fetchEducation, listReminders } from '../api/client';
import { useAuth } from '../store/useAuth';
import { useQueryClient } from '@tanstack/react-query';

export default function HomeScreen({ navigation }: any) {
  const logout = useAuth((s)=>s.logout);
  const [hasPlan, setHasPlan] = useState<boolean | null>(null);
  const qc = useQueryClient();

  useEffect(() => {
    (async () => {
      try {
        // prefetch common data to speed nav
        qc.prefetchQuery({ queryKey: ['education'], queryFn: () => fetchEducation(), staleTime: 1000 * 60 * 60 * 24 });
        qc.prefetchQuery({ queryKey: ['reminders'], queryFn: () => listReminders() });
        const p = await getMyProfile();
        setHasPlan(!!p?.hospital);
      } catch {
        setHasPlan(null);
      }
    })();
  }, [qc]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Button title={hasPlan ? 'Plan' : 'Plan*'} onPress={() => navigation.navigate('EmergencyPlan')} />
      ),
    });
  }, [navigation, hasPlan]);

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 24, fontWeight: '700' }}>WarriorBot</Text>
      {!hasPlan && (
        <Text style={{ color: '#b45309' }}>Tip: Set up your Emergency Plan so it’s ready during a crisis.</Text>
      )}
      <Button title="Crisis Companion" onPress={() => navigation.navigate('Crisis')} />
      <Button title="Daily Check-in" onPress={() => navigation.navigate('CheckIn')} />
      <Button title="Education" onPress={() => navigation.navigate('Education')} />
      <Button title="Doctor Report" onPress={() => navigation.navigate('Report')} />
      <Button title="Emergency Plan" onPress={() => navigation.navigate('EmergencyPlan')} />
      <Button title="Reminders" onPress={() => navigation.navigate('Reminders')} />
      <Button title="Logout" color="#b91c1c" onPress={() => logout()} />
      <Text style={{ marginTop: 16, color: '#666' }}>
        This app does not provide diagnosis. If you feel unsafe, go to the hospital immediately.
      </Text>
    </ScrollView>
  );
