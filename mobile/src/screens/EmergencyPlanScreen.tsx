import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, ScrollView } from 'react-native';
import { getMyProfile, updateMyProfile } from '../api/client';

export default function EmergencyPlanScreen() {
  const [hospital, setHospital] = useState('');
  const [contacts, setContacts] = useState(''); // simple JSON text {name,phone}[]
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const p = await getMyProfile();
        if (p?.hospital) setHospital(p.hospital);
        if (p?.emergencyContacts) setContacts(JSON.stringify(p.emergencyContacts));
      } catch {}
    })();
  }, []);

  const save = async () => {
    try {
      const payload: any = { hospital };
      if (contacts && contacts.trim().length > 0) {
        try {
          const arr = JSON.parse(contacts);
          if (!Array.isArray(arr)) throw new Error('Contacts must be an array');
          // Optional shallow validation
          payload.emergencyContacts = arr.map((x: any) => ({ name: String(x.name || ''), phone: String(x.phone || '') }));
        } catch (e: any) {
          setSaved(false);
          return alert('Contacts must be valid JSON array of {name, phone}');
        }
      }
      await updateMyProfile(payload);
      setSaved(true);
    } catch { setSaved(false); }
  };

  return (
    <ScrollView style={{ padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: '600' }}>Emergency Plan</Text>
      <Text>Preferred hospital/clinic</Text>
      <TextInput value={hospital} onChangeText={setHospital} style={{ borderWidth: 1, padding: 8, marginVertical: 8 }} />
<Text>Emergency contacts (JSON array of {"{name, phone}"})</Text>
      <TextInput value={contacts} onChangeText={setContacts} placeholder='[{"name":"Mum","phone":"+234..."}]' multiline numberOfLines={4} style={{ borderWidth: 1, padding: 8, marginVertical: 8 }} />
      <Button title='Save Plan' onPress={save} />
      {saved && <Text style={{ marginTop: 8 }}>Saved</Text>}
    </ScrollView>
  );
}