import Link from 'next/link'
import { useEffect, useState } from 'react'
import { apiFetch, setToken } from '../lib/api'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

const COLORS = ['#5cb85c', '#f0ad4e', '#d9534f']

export default function Dashboard() {
  const [stats, setStats] = useState<any | null>(null)
  const [patients, setPatients] = useState<any[]>([])

  useEffect(() => { (async ()=>{
    try {
      const s = await apiFetch('/hcp/stats')
      setStats(s)
      const p = await apiFetch('/hcp/patients?limit=10')
      setPatients(p.items)
    } catch {}
  })() }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">WarriorBot HCP</h1>
        <button className="text-sm text-red-600" onClick={()=>{ setToken(null); window.location.href='/' }}>Logout</button>
      </header>
      <main className="p-6 space-y-6">
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded shadow"><div className="text-sm text-gray-500">Total Patients</div><div className="text-2xl font-bold">{stats.total_patients}</div></div>
            <div className="bg-white p-4 rounded shadow"><div className="text-sm text-gray-500">Logs (7 days)</div><div className="text-2xl font-bold">{stats.recent_logs}</div></div>
            <div className="bg-white p-4 rounded shadow"><div className="text-sm text-gray-500">Open Triage</div><div className="text-2xl font-bold">{stats.open_cases ?? 0}</div></div>
            <div className="bg-white p-4 rounded shadow h-48">
              <div className="text-sm text-gray-500 mb-2">Risk Distribution</div>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie dataKey="value" data={[
                    { name:'Low', value: stats.risk.low },
                    { name:'Medium', value: stats.risk.medium },
                    { name:'High', value: stats.risk.high },
                  ]} cx="50%" cy="50%" outerRadius={60} label>
                    <Cell fill={COLORS[0]} />
                    <Cell fill={COLORS[1]} />
                    <Cell fill={COLORS[2]} />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        <div className="bg-white p-4 rounded shadow">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-bold">Recent Patients</h2>
            <div className="flex gap-3">
              <Link className="text-blue-600 text-sm" href="/triage">Triage</Link>
              <Link className="text-blue-600 text-sm" href="/patients">View all</Link>
            </div>
          </div>
          <table className="w-full text-sm">
            <thead><tr className="text-left text-gray-500"><th className="p-2">Name</th><th className="p-2">Email</th><th className="p-2">Last Log</th><th className="p-2">Risk</th></tr></thead>
            <tbody>
              {patients.map(p => (
                <tr key={p.id} className="border-t">
                  <td className="p-2"><Link className="text-blue-600" href={`/patients/${p.id}`}>{p.full_name || '—'}</Link></td>
                  <td className="p-2">{p.email}</td>
                  <td className="p-2">{p.last_log_at ? new Date(p.last_log_at).toLocaleString() : '—'}</td>
                  <td className="p-2">
                    {p.last_risk ? (
                      <span className={`px-2 py-1 rounded text-white ${p.last_risk.level==='high'?'bg-red-500':p.last_risk.level==='medium'?'bg-amber-500':'bg-green-600'}`}>{p.last_risk.level} ({Math.round(p.last_risk.score*100)}%)</span>
                    ) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
