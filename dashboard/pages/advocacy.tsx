import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { apiFetch } from '../lib/api'
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend } from 'recharts'

const Map = dynamic(() => import('../components/GeoMap'), { ssr: false })

export default function Advocacy() {
  const [agg, setAgg] = useState<any>({ series: [] })
  const [geo, setGeo] = useState<any[]>([])
  const [days, setDays] = useState(30)

  useEffect(() => { (async()=>{
    const a = await apiFetch(`/advocacy/aggregate?days=${days}`)
    setAgg(a)
    const g = await apiFetch(`/advocacy/geo?days=${days}`)
    setGeo(g)
  })() }, [days])

  async function exportPdf(){
    const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
      import('html2canvas'),
      import('jspdf') as any,
    ]);
    const el = document.getElementById('advocacy-content');
    if (!el) return;
    const canvas = await html2canvas(el as HTMLElement, { useCORS: true, scale: 2, backgroundColor: '#ffffff' });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    pdf.save(`warriorbot-advocacy-${days}d.pdf`);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b p-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Advocacy & Research</h1>
        <button onClick={exportPdf} className="bg-rose-600 text-white px-3 py-2 rounded text-sm">Export PDF</button>
      </header>
      <main className="p-6 space-y-6" id="advocacy-content">
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">Window (days):</span>
          <select className="border p-1 rounded" value={days} onChange={e=>setDays(parseInt(e.target.value))}>
            {[7,14,30,60,90].map(d=> <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div className="bg-white p-4 rounded shadow h-80">
          <div className="mb-2 font-bold">Daily Metrics</div>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={agg.series}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" /><YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" name="Logs" stroke="#0ea5e9" />
              <Line type="monotone" dataKey="avg_pain" name="Avg Pain" stroke="#ef4444" />
              <Line type="monotone" dataKey="avg_hydration" name="Avg Hydration (ml)" stroke="#10b981" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-4 rounded shadow h-[500px]">
          <div className="mb-2 font-bold">Crisis Heatmap (opt-in users)</div>
          <Map points={geo} />
        </div>
      </main>
    </div>
  )
}
