import React, { useState } from 'react';
import { View, Text, TextInput, Button, Switch } from 'react-native';
import { triage } from '../api/client';
import { useAuth } from '../store/useAuth';

export default function CrisisFlowScreen() {
  const userId = useAuth((s) => s.userId) || 0;
  const [pain, setPain] = useState('6');
  const [flags, setFlags] = useState({ chestPain: false, dyspnea: false, confusion: false, fever: false });
  const [result, setResult] = useState<{ level: string; summary: string } | null>(null);

  const submit = async () => {
    try {
      const res = await triage({ userId, pain: Number(pain), ...flags });
      setResult(res);
    } catch (e) {
      // offline fallback: simple rules
      const level = (flags.chestPain || flags.dyspnea || flags.confusion || flags.fever) ? 'red' : (Number(pain) >= 7 ? 'yellow' : (Number(pain) <= 3 ? 'green' : 'yellow'));
      const summary = level === 'red' ? 'Emergency symptoms — go to hospital now.' : level === 'yellow' ? 'Monitor closely, consider calling doctor.' : 'Manage at home.';
      setResult({ level, summary });
    }
  };

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: '600' }}>Crisis Companion</Text>
      <Text>Pain (0–10)</Text>
      <TextInput keyboardType="numeric" value={pain} onChangeText={setPain} style={{ borderWidth: 1, padding: 8, marginVertical: 8 }} />
      {(['chestPain','dyspnea','confusion','fever'] as const).map(k => (
        <View key={k} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: 4 }}>
          <Text>{k}</Text>
          <Switch value={(flags as any)[k]} onValueChange={(v)=>setFlags(prev=>({ ...prev, [k]: v }))} />
        </View>
      ))}
      <Button title="Get guidance" onPress={submit} />
      {result && (
        <View style={{ marginTop: 16 }}>
          <Text style={{ fontSize: 18 }}>Result: {result.level.toUpperCase()}</Text>
          <Text>{result.summary}</Text>
          <Text style={{ marginTop: 8, color: '#555' }}>This is NOT a diagnosis. If you feel unsafe, seek emergency care immediately.</Text>
        </View>
      )}
    </View>
  );
}