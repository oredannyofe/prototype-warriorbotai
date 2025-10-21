import AsyncStorage from '@react-native-async-storage/async-storage';

let AUTH_TOKEN: string | null = null;

export async function setToken(token: string | null) {
  AUTH_TOKEN = token;
  if (token) await AsyncStorage.setItem('auth_token', token);
  else await AsyncStorage.removeItem('auth_token');
}

export function getToken() {
  return AUTH_TOKEN;
}

export async function initAuth() {
  try { const t = await AsyncStorage.getItem('auth_token'); AUTH_TOKEN = t; } catch {}
}

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export async function register(email: string, password: string) {
  const r = await fetch(`${API_URL}/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
  if (!r.ok) throw new Error('register failed');
  const data = await r.json();
  await setToken(data.access_token);
  await fetchMe();
  return data;
}

export async function login(email: string, password: string) {
  const r = await fetch(`${API_URL}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
  if (!r.ok) throw new Error('login failed');
  const data = await r.json();
  await setToken(data.access_token);
  await fetchMe();
  return data;
}

export async function savePushToken(expo_push_token: string) {
  const token = getToken();
  if (!token) return;
  await fetch(`${API_URL}/users/push-token`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ expo_push_token }) });
}

export type UserProfile = { id: number; email: string; full_name?: string; role: string } | null;

export async function fetchMe(): Promise<UserProfile> {
  const token = getToken();
  if (!token) return null;
  const r = await fetch(`${API_URL}/users/me`, { headers: { 'Authorization': `Bearer ${token}` } });
  if (!r.ok) return null;
  const me = await r.json();
  try { await AsyncStorage.setItem('profile', JSON.stringify(me)); } catch {}
  return me;
}

export async function loadProfile(): Promise<UserProfile> {
  try { const s = await AsyncStorage.getItem('profile'); return s ? JSON.parse(s) : null; } catch { return null; }
}

export async function testNotify() {
  const token = getToken();
  if (!token) throw new Error('not authed');
  await fetch(`${API_URL}/users/notify/test`, { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } });
}
