import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function RiskCard({ risk }: { risk: any | null }) {
  if (!risk) return <Text style={{padding:16}}>No risk calculated yet.</Text>;
  const color = risk.risk_level === 'high' ? '#d9534f' : risk.risk_level === 'medium' ? '#f0ad4e' : '#5cb85c';
  return (
    <View style={[styles.card, { borderColor: color }]}> 
      <Text style={styles.title}>Risk: {risk.risk_level.toUpperCase()} ({Math.round(risk.risk_score*100)}%)</Text>
      <Text style={styles.msg}>{risk.message}</Text>
      {risk.next_steps?.map((s: string, i: number) => (
        <Text key={i}>• {s}</Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth:2, borderRadius:8, padding:16, marginVertical:12 },
  title: { fontSize:18, fontWeight:'bold', marginBottom:8 },
  msg: { marginBottom:8 }
});
