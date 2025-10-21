import React from 'react';
import { View, Text, TextInput, Button, SafeAreaView } from 'react-native';
import { predictRisk, createLog } from '../services/api';

export default function LogScreen(){
  const [form, setForm] = React.useState({ pain_level:'5', hydration_ml:'1000', activity_level:'4', heart_rate:'100', spo2:'95' });
  const [result, setResult] = React.useState<any | null>(null);
  const onChange = (k: string, v: string)=> setForm(s=>({...s, [k]:v}));
  const submit = async()=>{
    const payload = {
      pain_level: Number(form.pain_level),
      hydration_ml: Number(form.hydration_ml),
      activity_level: Number(form.activity_level),
      heart_rate: Number(form.heart_rate),
      spo2: Number(form.spo2),
    };
    try{ const r = await predictRisk(payload); setResult(r);}catch(e){ alert('API error'); }
  };
  return (
    <SafeAreaView style={{flex:1, padding:16}}>
      <Text style={{fontSize:20, fontWeight:'bold', marginBottom:8}}>Log & Predict</Text>
      {['pain_level','hydration_ml','activity_level','heart_rate','spo2'].map((k)=> (
        <View key={k} style={{marginBottom:8}}>
          <Text>{k}</Text>
          <TextInput keyboardType='numeric' value={(form as any)[k]} onChangeText={(v)=>onChange(k,v)} style={{borderWidth:1, padding:8, borderRadius:6}} />
        </View>
      ))}
      <Button title="Predict" onPress={submit} />
      <View style={{height:8}}/>
      <Button title="Save Log (auth)" onPress={async ()=>{
        try{ await createLog({
          pain_level: Number(form.pain_level), hydration_ml: Number(form.hydration_ml), activity_level: Number(form.activity_level), heart_rate: Number(form.heart_rate), spo2: Number(form.spo2)
        }); alert('Saved'); }catch{ alert('Login then try'); }
      }} />
      {result && <View style={{marginTop:16}}>
        <Text>Risk: {result.risk_level} ({Math.round(result.risk_score*100)}%)</Text>
        <Text>{result.message}</Text>
      </View>}
    </SafeAreaView>
  );
}
