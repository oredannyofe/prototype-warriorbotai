import Link from 'next/link'
import { useEffect, useState } from 'react'
import { apiFetch } from '../../lib/api'

export default function Patients() {
  const [items, setItems] = useState<any[]>([])
  const [q, setQ] = useState('')

  const [assignQ, setAssignQ] = useState('')
  const [candidates, setCandidates] = useState<any[]>([])
  const [assignMsg, setAssignMsg] = useState<string | null>(null)

  async function load(query?: string) {
    const res = await apiFetch(`/hcp/patients?limit=100${query?`&q=${encodeURIComponent(query)}`:''}`)
    setItems(res.items)
  }

  async function findCandidates(){
    setAssignMsg(null)
    try { const res = await apiFetch(`/hcp/find-patient?q=${encodeURIComponent(assignQ)}`); setCandidates(res); }
    catch(e:any){ setAssignMsg('Search failed'); }
  }

  async function assignPatient(id: number){
    setAssignMsg(null)
    try { await apiFetch(`/hcp/assign?patient_id=${id}`, { method: 'POST' }); setAssignMsg('Assigned'); await load(); }
    catch(e:any){ setAssignMsg('Assign failed'); }
  }

  useEffect(()=>{ load() }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Patients</h1>
        <Link className="text-blue-600" href="/dashboard">Dashboard</Link>
      </header>
      <main className="p-6 space-y-6">
        <div>
          <div className="mb-2 font-bold">Your Assigned Patients</div>
          <div className="mb-4 flex gap-2">
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search within assigned" className="border p-2 rounded w-64" />
            <button onClick={()=>load(q)} className="bg-blue-600 text-white px-3 py-2 rounded">Search</button>
          </div>
          <table className="w-full text-sm bg-white rounded shadow">
            <thead><tr className="text-left text-gray-500"><th className="p-2">Name</th><th className="p-2">Email</th><th className="p-2">Last Log</th><th className="p-2">Risk</th></tr></thead>
            <tbody>
              {items.map(p => (
                <tr key={p.id} className="border-t">
                  <td className="p-2"><Link className="text-blue-600" href={`/patients/${p.id}`}>{p.full_name || '—'}</Link></td>
                  <td className="p-2">{p.email}</td>
                  <td className="p-2">{p.last_log_at ? new Date(p.last_log_at).toLocaleString() : '—'}</td>
                  <td className="p-2">{p.last_risk? p.last_risk.level : '—'}</td>
                </tr>
              ))}
              {items.length===0 && <tr><td className="p-4" colSpan={4}>No patients assigned.</td></tr>}
            </tbody>
          </table>
        </div>

        <div>
          <div className="mb-2 font-bold">Find & Assign Patients</div>
          <div className="mb-3 flex gap-2">
            <input value={assignQ} onChange={e=>setAssignQ(e.target.value)} placeholder="Search name or email" className="border p-2 rounded w-64" />
            <button onClick={findCandidates} className="bg-emerald-600 text-white px-3 py-2 rounded">Find</button>
          </div>
          {assignMsg && <div className="text-sm mb-2">{assignMsg}</div>}
          <table className="w-full text-sm bg-white rounded shadow">
            <thead><tr className="text-left text-gray-500"><th className="p-2">Name</th><th className="p-2">Email</th><th className="p-2"></th></tr></thead>
            <tbody>
              {candidates.map(c => (
                <tr key={c.id} className="border-t">
                  <td className="p-2">{c.full_name || '—'}</td>
                  <td className="p-2">{c.email}</td>
                  <td className="p-2"><button className="bg-blue-600 text-white px-3 py-1 rounded" onClick={()=>assignPatient(c.id)}>Assign</button></td>
                </tr>
              ))}
              {candidates.length===0 && <tr><td className="p-4" colSpan={3}>No results</td></tr>}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}
