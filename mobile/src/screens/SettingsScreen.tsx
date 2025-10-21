import React from 'react';
import { SafeAreaView, View, Text, Switch, ScrollView } from 'react-native';
import { getSettings, updateSettings } from '../services/api';

export default function SettingsScreen(){
  const [settings, setSettings] = React.useState<any>({ share_with_hcps: true, data_commons_opt_in: false });
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(()=>{ (async()=>{ try{ const s = await getSettings(); setSettings(s);} finally{ setLoaded(true);} })(); },[]);

  const toggle = async (k: string)=>{
    const next = { ...settings, [k]: !settings[k] };
    setSettings(next);
    try{ await updateSettings({ [k]: next[k] }); }catch{ /* ignore */ }
  };

  return (
    <SafeAreaView style={{flex:1}}>
      <ScrollView style={{padding:16}}>
        <Text style={{fontSize:20, fontWeight:'bold', marginBottom:8}}>Privacy & Data</Text>
        {!loaded && <Text>Loading...</Text>}
        <View style={{flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingVertical:12}}>
          <View style={{flex:1, paddingRight:12}}>
            <Text style={{fontWeight:'bold'}}>Share with HCPs</Text>
            <Text style={{color:'#555'}}>Allow assigned healthcare professionals to view your logs and risk summaries.</Text>
          </View>
          <Switch value={!!settings.share_with_hcps} onValueChange={()=>toggle('share_with_hcps')} />
        </View>
        <View style={{height:1, backgroundColor:'#eee'}} />
        <View style={{flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingVertical:12}}>
          <View style={{flex:1, paddingRight:12}}>
            <Text style={{fontWeight:'bold'}}>Data Commons Opt-in</Text>
            <Text style={{color:'#555'}}>Share anonymized data to accelerate SCD research (can opt-out anytime).</Text>
          </View>
          <Switch value={!!settings.data_commons_opt_in} onValueChange={()=>toggle('data_commons_opt_in')} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
