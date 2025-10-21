import React from 'react';
import { SafeAreaView, ScrollView, Text, Button, View } from 'react-native';
import { setConsent } from '../utils/consent';

export default function ConsentScreen({ navigation }: any){
  const accept = async ()=>{ await setConsent(true); navigation.reset({ index:0, routes:[{ name:'Home' }] }); };
  return (
    <SafeAreaView style={{flex:1}}>
      <ScrollView style={{padding:16}}>
        <Text style={{fontSize:24, fontWeight:'bold', marginBottom:12}}>Welcome to WarriorBot</Text>
        <Text style={{marginBottom:8}}>
          This is a prototype wellness companion for people with Sickle Cell Disease. It does not
          provide medical diagnosis or treatment. Always follow your clinician's advice and seek
          emergency care when needed.
        </Text>
        <Text style={{marginBottom:8}}>
          By continuing, you consent to processing your data as described in the app for the purposes of
          risk guidance, education, and optional anonymized research (if you opt in under Settings).
        </Text>
        <View style={{height:12}} />
        <Button title="I Agree" onPress={accept} />
      </ScrollView>
    </SafeAreaView>
  );
}
