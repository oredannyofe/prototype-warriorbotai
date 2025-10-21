import { getToken } from './auth';
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export async function predictRisk(payload: any) {
  const token = getToken();
  const headers: any = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  try {
    const r = await fetch(`${API_URL}/risk/predict`, { method: 'POST', headers, body: JSON.stringify(payload) });
    if (!r.ok) throw new Error('Failed');
    return await r.json();
  } catch {
    // Offline/local fallback scoring
    const score = localScore(payload);
    const level = score < 0.33 ? 'low' : score < 0.66 ? 'medium' : 'high';
    const message = level==='high' ? 'High risk—rest, hydrate, and consider contacting your clinician.' : level==='medium' ? 'Risk rising—hydrate, reduce exertion, monitor pain.' : 'Risk low—maintain routine hydration and rest.';
    const next_steps = level==='high' ? ['Rest now','Warmth and hydration','If pain escalates, call care team / ER'] : level==='medium' ? ['Increase fluids','Avoid temperature extremes','Prepare rescue meds per plan'] : ['Drink water','Light stretching','Log symptoms daily'];
    return { risk_score: Math.round(score*100)/100, risk_level: level, message, next_steps, explanations: [] };
  }
}

function localScore(f: any){
  const pain = (f.pain_level||0)/10;
  const hyd = Math.max(0, (1500 - (f.hydration_ml||0)))/1500;
  const act = (f.activity_level||0)/10;
  const hr = Math.max(0, ((f.heart_rate||0) - 80))/80;
  const spo2 = Math.max(0, (95 - (f.spo2||0)))/10;
  const temp = Math.max(0, (18 - (f.temperature_c||18)))/18;
  const rh = Math.max(0, ((f.relative_humidity||70) - 85))/15;
  const w = [1.2,0.8,0.4,0.3,0.7,0.2,0.2];
  const x = [pain,hyd,act,hr,spo2,temp,rh];
  const z = x.reduce((s,v,i)=>s+v*w[i],0);
  const prob = 1/(1+Math.exp(-z));
  return Math.min(1, Math.max(0, prob));
}

export async function fetchEducation(lang?: string) {
  const qs = lang ? `?lang=${encodeURIComponent(lang)}` : '';
  const r = await fetch(`${API_URL}/education${qs}`);
  if (!r.ok) throw new Error('Failed');
  return r.json();
}

export async function fetchHcpPatients() {
  const token = getToken();
  if (!token) throw new Error('not authed');
  const r = await fetch(`${API_URL}/hcp/patients?limit=100`, { headers: { 'Authorization': `Bearer ${token}` } });
  if (!r.ok) throw new Error('Failed');
  return r.json();
}

export async function fetchPatientLogs(user_id: number) {
  const token = getToken();
  if (!token) throw new Error('not authed');
  const r = await fetch(`${API_URL}/hcp/patient/${user_id}/logs`, { headers: { 'Authorization': `Bearer ${token}` } });
  if (!r.ok) throw new Error('Failed');
  return r.json();
}

export async function fetchTriageOpen(){
  const token = getToken();
  if (!token) throw new Error('not authed');
  const r = await fetch(`${API_URL}/hcp/triage/open`, { headers: { 'Authorization': `Bearer ${token}` } });
  if (!r.ok) throw new Error('Failed');
  return r.json();
}

export async function resolveTriageCase(case_id: number){
  const token = getToken();
  if (!token) throw new Error('not authed');
  const r = await fetch(`${API_URL}/hcp/triage/${case_id}/resolve`, { method:'POST', headers: { 'Authorization': `Bearer ${token}` } });
  if (!r.ok) throw new Error('Failed');
  return r.json();
}

export async function createLog(payload: any) {
  const token = getToken();
  if (!token) throw new Error('not authed');
  const r = await fetch(`${API_URL}/logs`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(payload) });
  if (!r.ok) throw new Error('Failed');
  return r.json();
}

export async function getSettings(){
  const token = getToken();
  if (!token) throw new Error('not authed');
  const r = await fetch(`${API_URL}/users/settings`, { headers: { 'Authorization': `Bearer ${token}` }});
  if (!r.ok) throw new Error('Failed');
  return r.json();
}

export async function updateSettings(payload: any){
  const token = getToken();
  if (!token) throw new Error('not authed');
  const r = await fetch(`${API_URL}/users/settings`, { method:'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(payload)});
  if (!r.ok) throw new Error('Failed');
  return r.json();
}
