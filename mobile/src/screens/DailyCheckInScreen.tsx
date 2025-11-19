import React, { useState } from 'react';
import { View, Text, TextInput, Button, Switch } from 'react-native';
import { createDailyLog } from '../api/client';
import { enqueueLog, tryFlushNow } from '../offline/logQueue';
import { useAuth } from '../store/useAuth';

export default function DailyCheckInScreen() {
  const userId = useAuth((s) => s.userId) || 0;
  const [pain, setPain] = useState('3');
  const [hydrationCups, setHydration] = useState('4');
  const [medsTaken, setMeds] = useState(true);
  const [saved, setSaved] = useState(false);

  const submit = async () => {
    try {
      await createDailyLog({ userId, pain: Number(pain), hydrationCups: Number(hydrationCups), medsTaken });
      setSaved(true);
    } catch {
      await enqueueLog({ userId, pain: Number(pain), hydrationCups: Number(hydrationCups), medsTaken });
      setSaved(true);
      tryFlushNow();
    }
  };

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: '600' }}>Daily Check-in</Text>
      <Text>Pain (0–10)</Text>
      <TextInput keyboardType="numeric" value={pain} onChangeText={setPain} style={{ borderWidth: 1, padding: 8, marginVertical: 8 }} />
      <Text>Hydration (cups)</Text>
      <TextInput keyboardType="numeric" value={hydrationCups} onChangeText={setHydration} style={{ borderWidth: 1, padding: 8, marginVertical: 8 }} />
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: 4 }}>
        <Text>Took meds</Text>
        <Switch value={medsTaken} onValueChange={setMeds} />
      </View>
      <Button title="Save" onPress={submit} />
      {saved && <Text style={{ marginTop: 8 }}>Saved (or queued offline)</Text>}
    </View>
  );
}