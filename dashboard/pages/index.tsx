import { useState } from 'react'
import { API_URL, apiFetch, setToken } from '../lib/api'

export default function Login() {
  const [email, setEmail] = useState('hcp@example.com')
  const [password, setPassword] = useState('password123')
  const [error, setError] = useState<string | null>(null)
  const [adminSecret, setAdminSecret] = useState('')

  async function submit(path: string) {
    setError(null)
    try {
      const headers: any = { 'Content-Type': 'application/json' }
      if (path.includes('register-hcp') && adminSecret) headers['x-admin-secret'] = adminSecret
      const res = await fetch(`${API_URL}${path}`, { method: 'POST', headers, body: JSON.stringify({ email, password })})
      if (!res.ok) throw new Error('auth failed')
      const data = await res.json()
      setToken(data.access_token)
      window.location.href = '/dashboard'
    } catch (e:any) {
      setError(e.message)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="bg-white p-8 rounded shadow w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4">WarriorBot HCP Login</h1>
        <label className="block text-sm mb-1">Email</label>
        <input className="border rounded w-full p-2 mb-3" value={email} onChange={e=>setEmail(e.target.value)} />
        <label className="block text-sm mb-1">Password</label>
        <input type="password" className="border rounded w-full p-2 mb-4" value={password} onChange={e=>setPassword(e.target.value)} />
        {error && <div className="text-red-600 text-sm mb-3">{error}</div>}
        <div className="mb-2">
          <label className="block text-xs text-gray-500">Admin Secret (for HCP registration)</label>
          <input className="border rounded w-full p-2" value={adminSecret} onChange={e=>setAdminSecret(e.target.value)} />
        </div>
        <div className="flex gap-2">
          <button onClick={()=>submit('/auth/login')} className="bg-blue-600 text-white px-4 py-2 rounded">Login</button>
          <button onClick={()=>submit('/auth/register-hcp')} className="bg-gray-200 px-4 py-2 rounded">Register HCP</button>
        </div>
      </div>
    </div>
  )
}
