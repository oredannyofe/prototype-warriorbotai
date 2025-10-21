import React from 'react';
import { View, Text, SafeAreaView, ScrollView, Button } from 'react-native';
import { fetchHcpPatients, fetchPatientLogs } from '../services/api';

export default function HcpPatientsScreen(){
  const [items, setItems] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(()=>{ (async()=>{ try{ const res = await fetchHcpPatients(); setItems(res.items||[]);} finally{ setLoading(false);} })(); },[]);

  return (
    <SafeAreaView style={{flex:1}}>
      <ScrollView style={{padding:16}}>
        <Text style={{fontSize:20, fontWeight:'bold', marginBottom:8}}>HCP Patients</Text>
        {loading && <Text>Loading...</Text>}
        {items.map((p:any)=> (
          <View key={p.id} style={{marginBottom:12, borderBottomWidth:1, borderColor:'#eee', paddingBottom:8}}>
            <Text style={{fontWeight:'bold'}}>{p.full_name || p.email}</Text>
            <Text style={{color:'#555'}}>{p.email}</Text>
            <Text>Last Risk: {p.last_risk ? `${p.last_risk.level} (${Math.round(p.last_risk.score*100)}%)` : '—'}</Text>
          </View>
        ))}
        {items.length===0 && !loading && <Text>No patients assigned.</Text>}
      </ScrollView>
    </SafeAreaView>
  );
}
