export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export function setToken(t: string | null) {
  if (t) localStorage.setItem('auth_token', t);
  else localStorage.removeItem('auth_token');
}
export function getToken(): string | null {
  return typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
}

export async function apiFetch(path: string, opts: RequestInit = {}) {
  const headers: any = { 'Content-Type': 'application/json', ...(opts.headers||{}) };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_URL}${path}`, { ...opts, headers });
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
}
