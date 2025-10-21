import Link from 'next/link'
import { useEffect, useState } from 'react'
import { apiFetch } from '../../lib/api'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export default function PatientDetail() {
  const [data, setData] = useState<any | null>(null)

  useEffect(()=>{
    const id = window.location.pathname.split('/').pop()
    ;(async()=>{
      const res = await apiFetch(`/hcp/patient/${id}/logs`)
      setData(res)
    })()
  },[])

  const chartData = (data?.logs||[]).map((l:any)=> ({ time: new Date(l.created_at).toLocaleDateString(), pain: l.pain_level, hr: l.heart_rate||0, spo2: l.spo2||0 }))

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">{data?.patient?.full_name || data?.patient?.email || 'Patient'}</h1>
        <Link className="text-blue-600" href="/patients">Back</Link>
      </header>
      <main className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded shadow"><div className="text-sm text-gray-500">Logs</div><div className="text-2xl font-bold">{data?.logs?.length||0}</div></div>
          <div className="bg-white p-4 rounded shadow"><div className="text-sm text-gray-500">Last Pain</div><div className="text-2xl font-bold">{data?.logs?.[0]?.pain_level ?? '—'}</div></div>
          <div className="bg-white p-4 rounded shadow"><div className="text-sm text-gray-500">Last SpO2</div><div className="text-2xl font-bold">{data?.logs?.[0]?.spo2 ?? '—'}</div></div>
        </div>
        <div className="bg-white p-4 rounded shadow h-80">
          <div className="mb-2 font-bold">Pain over time</div>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis dataKey="time" /><YAxis /><Tooltip />
              <Line type="monotone" dataKey="pain" stroke="#d9534f" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </main>
    </div>
  )
}
