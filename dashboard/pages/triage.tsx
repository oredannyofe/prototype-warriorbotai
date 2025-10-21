import Link from 'next/link'
import { useEffect, useState } from 'react'
import { apiFetch } from '../lib/api'

export default function Triage() {
  const [items, setItems] = useState<any[]>([])
  const [err, setErr] = useState<string| null>(null)

  async function load(){
    try { setItems(await apiFetch('/hcp/triage/open')); } catch(e:any){ setErr('Auth required'); }
  }
  async function resolve(id: number){
    try { await apiFetch(`/hcp/triage/${id}/resolve`, { method: 'POST' }); load(); } catch {}
  }
  useEffect(()=>{ load() }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Open Triage</h1>
        <Link className="text-blue-600" href="/dashboard">Dashboard</Link>
      </header>
      <main className="p-6">
        {err && <div className="text-red-600 mb-3">{err}</div>}
        <table className="w-full text-sm bg-white rounded shadow">
          <thead><tr className="text-left text-gray-500"><th className="p-2">Case</th><th className="p-2">Patient</th><th className="p-2">Risk</th><th className="p-2">Message</th><th className="p-2">Created</th><th className="p-2"></th></tr></thead>
          <tbody>
            {items.map(c => (
              <tr key={c.id} className="border-t">
                <td className="p-2">#{c.id}</td>
                <td className="p-2"><Link className="text-blue-600" href={`/patients/${c.patient_id}`}>Patient {c.patient_id}</Link></td>
                <td className="p-2"><span className={`px-2 py-1 rounded text-white ${c.level==='high'?'bg-red-500':c.level==='medium'?'bg-amber-500':'bg-green-600'}`}>{c.level} ({Math.round(c.score*100)}%)</span></td>
                <td className="p-2">{c.message}</td>
                <td className="p-2">{new Date(c.created_at).toLocaleString()}</td>
                <td className="p-2"><button onClick={()=>resolve(c.id)} className="bg-green-600 text-white px-3 py-1 rounded">Resolve</button></td>
              </tr>
            ))}
            {items.length===0 && <tr><td className="p-4" colSpan={6}>No open cases</td></tr>}
          </tbody>
        </table>
      </main>
    </div>
  )
}
