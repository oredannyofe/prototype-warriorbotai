import React from 'react';
import { View, Text, Button, SafeAreaView, ScrollView, TextInput } from 'react-native';
import RiskCard from '../components/RiskCard';
import { predictRisk } from '../services/api';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../App';
import { register, login, testNotify, loadProfile } from '../services/auth';

export default function HomeScreen({ navigation }: NativeStackScreenProps<RootStackParamList, 'Home'>) {
  const [risk, setRisk] = React.useState<any | null>(null);
  const [email, setEmail] = React.useState('demo@example.com');
  const [password, setPassword] = React.useState('password123');
  const [profile, setProfile] = React.useState<any | null>(null);
  React.useEffect(()=>{ (async()=>{ setProfile(await loadProfile()); })(); },[]);

  const sample = { pain_level: 3, hydration_ml: 1200, activity_level: 4, heart_rate: 95, spo2: 96 };

  return (
    <SafeAreaView style={{flex:1}}>
      <ScrollView style={{padding:16}}>
        <Text style={{fontSize:24, fontWeight:'bold'}}>WarriorBot</Text>
        {profile && <Text style={{color:'#555'}}>Signed in as {profile.email} ({profile.role})</Text>}
        <View style={{marginVertical:12}}>
          <Text style={{fontWeight:'bold'}}>Auth (dev)</Text>
          <Text>Email</Text>
          <TextInput value={email} onChangeText={setEmail} autoCapitalize='none' style={{borderWidth:1, padding:8, borderRadius:6, marginBottom:8}} />
          <Text>Password</Text>
          <TextInput value={password} onChangeText={setPassword} secureTextEntry style={{borderWidth:1, padding:8, borderRadius:6, marginBottom:8}} />
          <View style={{flexDirection:'row', gap:8}}>
            <Button title="Register" onPress={async ()=>{ try{ await register(email,password); const prof = await loadProfile(); setProfile(prof); alert('Registered'); }catch{ alert('Register failed'); } }} />
            <View style={{width:8}} />
            <Button title="Login" onPress={async ()=>{ try{ await login(email,password); const prof = await loadProfile(); setProfile(prof); alert('Logged in'); }catch{ alert('Login failed'); } }} />
          </View>
          <View style={{height:8}} />
          <Button title="Test Push" onPress={async ()=>{ try{ await testNotify(); alert('Push requested'); }catch{ alert('Login then try'); } }} />
        </View>
        <RiskCard risk={risk} />
        <Button title="Calculate Risk (sample)" onPress={async ()=>{
          try { const r = await predictRisk(sample); setRisk(r);} catch(e){ alert('API error'); }
        }} />
        <View style={{height:12}}/>
        <Button title="Log Symptoms" onPress={()=>navigation.navigate('Log')} />
        <View style={{height:12}}/>
        <Button title="Education" onPress={()=>navigation.navigate('Education')} />
        <View style={{height:12}}/>
        <Button title="Settings" onPress={()=>navigation.navigate('Settings')} />
        {profile?.role === 'hcp' && (<>
          <View style={{height:12}}/>
          <Button title="HCP: Patients" onPress={()=>navigation.navigate('HcpPatients')} />
          <View style={{height:12}}/>
          <Button title="HCP: Triage" onPress={()=>navigation.navigate('HcpTriage')} />
        </>)}
      </ScrollView>
    </SafeAreaView>
  );
}
