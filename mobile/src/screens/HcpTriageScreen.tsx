import React from 'react';
import { View, Text, SafeAreaView, ScrollView, Button } from 'react-native';
import { fetchTriageOpen, resolveTriageCase } from '../services/api';

export default function HcpTriageScreen(){
  const [items, setItems] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  const load = async()=>{
    try{ const res = await fetchTriageOpen(); setItems(res);}finally{ setLoading(false); }
  };

  React.useEffect(()=>{ load(); },[]);

  return (
    <SafeAreaView style={{flex:1}}>
      <ScrollView style={{padding:16}}>
        <Text style={{fontSize:20, fontWeight:'bold', marginBottom:8}}>Open Triage</Text>
        {loading && <Text>Loading...</Text>}
        {items.map((c:any)=> (
          <View key={c.id} style={{marginBottom:12, borderBottomWidth:1, borderColor:'#eee', paddingBottom:8}}>
            <Text style={{fontWeight:'bold'}}>Case #{c.id} • Patient {c.patient_id}</Text>
            <Text>Risk: {c.level} ({Math.round(c.score*100)}%)</Text>
            <Text>{c.message}</Text>
            <Button title="Resolve" onPress={async()=>{ try{ await resolveTriageCase(c.id); load(); }catch(e){ /* ignore */ } }} />
          </View>
        ))}
        {items.length===0 && !loading && <Text>No open cases.</Text>}
      </ScrollView>
    </SafeAreaView>
  );
}
