import React, { useState } from 'react';
import { View, Text, Button } from 'react-native';
import { useAuth } from '../store/useAuth';
import { reportSummary } from '../api/client';

export default function ReportScreen() {
  const userId = useAuth((s)=>s.userId) || 0;
  const [report, setReport] = useState<any>(null);
  const gen = async () => {
    try { setReport(await reportSummary(userId, 30)); } catch { setReport({ crisisCount: 0, avgPain: 0, patterns: {} }); }
  };
  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: '600' }}>Doctor Report</Text>
      <Button title="Generate" onPress={gen} />
      {report && (
        <View style={{ marginTop: 16 }}>
          <Text>Crises (30d): {report.crisisCount}</Text>
          <Text>Average pain: {report.avgPain}</Text>
          <Text>Patterns: {JSON.stringify(report.patterns)}</Text>
        </View>
      )}
    </View>
  );
}