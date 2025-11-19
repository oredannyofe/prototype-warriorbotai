import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { fetchEducation } from '../api/client';

export default function EducationScreen() {
  const { data } = useQuery({ queryKey: ['education'], queryFn: () => fetchEducation() });
  return (
    <ScrollView style={{ padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: '600' }}>Education</Text>
      {(data || []).map((it) => (
        <View key={it.slug} style={{ marginVertical: 8 }}>
          <Text style={{ fontSize: 16, fontWeight: '500' }}>{it.title}</Text>
          <Text>{it.body}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

import React from 'react';
import { View, Text, SafeAreaView, ScrollView } from 'react-native';
import { fetchEducation } from '../services/api';
import * as Localization from 'expo-localization';

export default function EducationScreen(){
  const [items, setItems] = React.useState<any[]>([]);
  React.useEffect(()=>{ (async()=>{ try{ const lang = Localization.getLocales?.()[0]?.languageCode || 'en'; setItems(await fetchEducation(lang)); }catch(e){ /* ignore */ } })(); },[]);
  return (
    <SafeAreaView style={{flex:1}}>
      <ScrollView style={{padding:16}}>
        <Text style={{fontSize:20, fontWeight:'bold', marginBottom:8}}>Education</Text>
        {items.map((it: any)=> (
          <View key={it.id} style={{marginBottom:12}}>
            <Text style={{fontWeight:'bold'}}>{it.title}</Text>
            <Text>{it.body}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
