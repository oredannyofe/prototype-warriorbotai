import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:4000';

export const api = axios.create({ baseURL: API_URL, timeout: 10000 });

// Attach bearer token from SecureStore for each request
api.interceptors.request.use(async (config) => {
  try {
    const token = await SecureStore.getItemAsync('authToken');
    if (token) config.headers = { ...(config.headers || {}), Authorization: `Bearer ${token}` } as any;
  } catch {}
  return config;
});

let _onUnauthorized: (() => void) | null = null;
export function setUnauthorizedHandler(fn: () => void) {
  _onUnauthorized = fn;
}
api.interceptors.response.use(
  (resp) => resp,
  async (error) => {
    if (error?.response?.status === 401) {
      try { _onUnauthorized && _onUnauthorized(); } catch {}
    }
    return Promise.reject(error);
  }
);

export async function register(email: string, password: string) {
  const { data } = await api.post('/auth/register', { email, password });
  return data as { access_token: string };
}

export async function login(email: string, password: string) {
  const { data } = await api.post('/auth/login', { email, password });
  return data as { access_token: string };
}

export async function me() {
  const { data } = await api.get('/auth/me');
  return data as { id: number; email: string };
}

export async function fetchEducation(lang?: string) {
  const { data } = await api.get('/content/education', { params: { lang } });
  return data as { id: number; slug: string; title: string; body: string }[];
}

export async function createDailyLog(payload: { userId: number; pain: number; mood?: string; sleep?: string; hydrationCups?: number; medsTaken?: boolean; triggers?: string[]; notes?: string; }) {
  const { data } = await api.post('/logs', payload);
  return data;
}

export async function triage(payload: { userId: number; pain: number; chestPain?: boolean; dyspnea?: boolean; confusion?: boolean; fever?: boolean; triggers?: string[]; meds?: string[]; }) {
  const { data } = await api.post('/crisis/triage', payload);
  return data as { level: 'green'|'yellow'|'red'; summary: string; id: number };
}

export async function reportSummary(userId: number, days = 30) {
  const { data } = await api.get(`/reports/${userId}/summary`, { params: { days } });
  return data as { days: number; crisisCount: number; avgPain: number; patterns: any };
}

export async function fetchLogsCursor(userId: number, limit = 30, cursorId?: number) {
  const { data } = await api.get(`/logs/${userId}/cursor`, { params: { limit, cursorId } });
  return data as { items: any[]; nextCursor: number | null };
}

// Profile (self)
export async function getMyProfile() {
  const { data } = await api.get('/users/me/profile');
  return data as any;
}

export async function updateMyProfile(payload: any) {
  const { data } = await api.put('/users/me/profile', payload);
  return data as any;
}

// Reminders
export async function listReminders() {
  const { data } = await api.get('/reminders');
  return data as { id: number; label: string; type: string; timeHM: string; enabled: boolean }[];
}
export async function createReminder(body: { type: 'hydration'|'medication'; label: string; timeHM: string; enabled?: boolean; }) {
  const { data } = await api.post('/reminders', body);
  return data;
}
export async function patchReminder(id: number, body: Partial<{ label: string; timeHM: string; enabled: boolean }>) {
  const { data } = await api.patch(`/reminders/${id}`, body);
  return data;
}
export async function deleteReminder(id: number) {
  const { data } = await api.delete(`/reminders/${id}`);
  return data;
}
