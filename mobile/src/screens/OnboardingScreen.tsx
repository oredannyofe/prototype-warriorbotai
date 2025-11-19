import React, { useState } from 'react';
import { View, Text, TextInput, Button } from 'react-native';
import { register } from '../api/client';
import { useAuth } from '../store/useAuth';

export default function OnboardingScreen() {
  const [email, setEmail] = useState('warrior@example.com');
  const [password, setPassword] = useState('password123');
  const setAuth = useAuth((s) => s.setAuth);

  const onContinue = async () => {
    try {
      const res = await register(email, password);
      // store token, then fetch /auth/me to get user id
      await setAuth(res.access_token, 0);
      const who = await (await import('../api/client')).me();
      await setAuth(res.access_token, who.id);
    } catch (e) {
      console.warn('register failed', e);
    }
  };

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: '600' }}>Create your Warrior profile</Text>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" style={{ borderWidth: 1, padding: 8, marginVertical: 8 }} />
      <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry style={{ borderWidth: 1, padding: 8, marginVertical: 8 }} />
      <Button title="Continue" onPress={onContinue} />
      <Text style={{ marginTop: 12, color: '#555' }}>
        By continuing you agree this app is not a doctor. If you ever feel unsafe, seek emergency care immediately.
      </Text>
    </View>
  );
}