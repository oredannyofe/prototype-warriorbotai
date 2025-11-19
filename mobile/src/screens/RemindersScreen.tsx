import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, Switch, FlatList, Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import { listReminders, createReminder, patchReminder, deleteReminder } from '../api/client';

Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldShowAlert: true, shouldPlaySound: false, shouldSetBadge: false }),
});

async function scheduleLocal(id: number, label: string, timeHM: string) {
  const [h, m] = timeHM.split(':').map((x)=>parseInt(x,10));
  await Notifications.scheduleNotificationAsync({
    content: { title: label, body: 'Time to hydrate/meds', data: { id } },
    trigger: { hour: h, minute: m, repeats: true },
  });
}

export default function RemindersScreen() {
  const [items, setItems] = useState<any[]>([]);
  const [label, setLabel] = useState('Hydration');
  const [timeHM, setTimeHM] = useState('09:00');

  useEffect(() => {
    (async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') return;
      try { setItems(await listReminders()); } catch {}
    })();
  }, []);

  const add = async () => {
    const okTime = /^([01]?\d|2[0-3]):([0-5]\d)$/.test(timeHM);
    if (!okTime) { Alert.alert('Invalid time', 'Use 24h HH:MM (e.g., 09:00 or 18:30)'); return; }
    if (!label.trim()) { Alert.alert('Label required', 'Please enter a label.'); return; }
    try {
      const r = await createReminder({ type: 'hydration', label: label.trim(), timeHM });
      setItems(await listReminders());
      await scheduleLocal(r.id, r.label, r.timeHM);
    } catch { Alert.alert('Error', 'Could not create reminder'); }
  };

  const toggle = async (r: any) => {
    try { await patchReminder(r.id, { enabled: !r.enabled }); setItems(await listReminders()); } catch {}
  };

  const remove = async (r: any) => {
    try { await deleteReminder(r.id); setItems(await listReminders()); } catch {}
  };

  return (
    <View style={{ padding: 16, flex: 1 }}>
      <Text style={{ fontSize: 20, fontWeight: '600' }}>Reminders</Text>
      <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', marginVertical: 8 }}>
        <TextInput value={label} onChangeText={setLabel} placeholder='Label' style={{ borderWidth: 1, padding: 8, flex: 1 }} />
        <TextInput value={timeHM} onChangeText={setTimeHM} placeholder='HH:MM' style={{ borderWidth: 1, padding: 8, width: 90, textAlign: 'center' }} />
        <Button title='Add' onPress={add} />
      </View>
      <FlatList
        data={items}
        keyExtractor={(it)=>String(it.id)}
        renderItem={({ item }) => (
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8 }}>
            <Text>{item.label} — {item.timeHM}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Switch value={item.enabled} onValueChange={()=>toggle(item)} />
              <Button title='Delete' onPress={()=>remove(item)} />
            </View>
          </View>
        )}
      />
    </View>
  );
}