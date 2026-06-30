import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const CONDICIONES = ['Local', 'Visitante']

export default function Partidos() {
  const [partidos, setPartidos] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({
    rival: '', fecha: new Date().toISOString().split('T')[0],
    condicion: 'Local', torneo: 'B Metropolitana', nro_fecha: '',
    goles_comu: null, goles_rival: null, observaciones: ''
  })
  const [guardando, setGuardando] = useState(false)
  const [conResultado, setConResultado] = useState(false)

  async function cargar() {
    const { data } = await supabase.from('partidos').select('*').order('fecha', { ascending: false })
    setPartidos(data || [])
    setLoading(false)
  }

  useEffect(() => { cargar() }, [])

  async function guardar() {
    if (!form.rival || !form.fecha) return alert('Rival y fecha son obligatorios')
    setGuardando(true)
    await supabase.from('partidos').insert({
      rival: form.rival,
      fecha: form.fecha,
      condicion: form.condicion,
      torneo: form.torneo || null,
      nro_fecha: form.nro_fecha ? parseInt(form.nro_fecha) : null,
      goles_comu: conResultado ? parseInt(form.goles_comu) : null,
      goles_rival: conResultado ? parseInt(form.goles_rival) : null,
      observaciones: form.observaciones || null,
    })
    setModal(false)
    setForm({ rival:'', fecha: new Date().toISOString().split('T')[0], condicion:'Local', torneo:'B Metropolitana', nro_fecha:'', goles_comu:0, goles_rival:0, observaciones:'' })
    setConResultado(false)
    setGuardando(false)
    cargar()
  }

  async function eliminar(id) {
    if (!confirm('¿Eliminar partido?')) return
    await supabase.from('partidos').delete().eq('id', id)
    cargar()
  }

  if (loading) return <div className="text-center py-12 text-gray-400">Cargando partidos...</div>

  return (
    <div className="py-4">
      <div className="flex justify-end mb-4">
        <button onClick={() => setModal(true)} className="px-4 py-2 bg-yellow-400 text-black rounded-lg text-sm font-medium hover:bg-yellow-500 transition-colors">
          + Cargar partido
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="text-left px-4 py-3 text-xs text-gray-400 font-medium">Rival</th>
              <th className="text-left px-4 py-3 text-xs text-gray-400 font-medium hidden sm:table-cell">Fecha</th>
              <th className="text-left px-4 py-3 text-xs text-gray-400 font-medium hidden sm:table-cell">Torneo</th>
              <th className="text-left px-4 py-3 text-xs text-gray-400 font-medium">Cond.</th>
              <th className="text-left px-4 py-3 text-xs text-gray-400 font-medium">Resultado</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {partidos.map(p => {
              const r = p.goles_comu === null ? null : p.goles_comu > p.goles_rival ? 'Ganado' : p.goles_comu === p.goles_rival ? 'Empatado' : 'Perdido'
              const rColor = r === 'Ganado' ? 'bg-green-50 text-green-700' : r === 'Empatado' ? 'bg-yellow-50 text-yellow-700' : r === 'Perdido' ? 'bg-red-50 text-red-700' : 'bg-gray-50 text-gray-400'
              return (
                <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{p.rival}</td>
                  <td className="px-4 py-3 text-gray-400 hidden sm:table-cell">
                    {new Date(p.fecha + 'T12:00:00').toLocaleDateString('es-AR')}
                  </td>
                  <td className="px-4 py-3 text-gray-400 hidden sm:table-cell">{p.torneo || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.condicion === 'Local' ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'}`}>
                      {p.condicion}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {r ? (
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">{p.goles_comu} - {p.goles_rival}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${rColor}`}>{r}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-300">Pendiente</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => eliminar(p.id)} className="text-gray-300 hover:text-red-400 transition-colors text-xs">✕</button>
                  </td>
                </tr>
              )
            })}
            {partidos.length === 0 && (
              <tr><td colSpan={6} className="text-center py-12 text-gray-400">Sin partidos cargados</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-5 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-gray-900">Cargar partido</h2>
              <button onClick={() => setModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Rival</label>
                <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  value={form.rival} onChange={e => setForm({...form, rival: e.target.value})} placeholder="Nombre del rival" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Fecha</label>
                  <input type="date" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
                    value={form.fecha} onChange={e => setForm({...form, fecha: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Condición</label>
                  <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
                    value={form.condicion} onChange={e => setForm({...form, condicion: e.target.value})}>
                    {CONDICIONES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Torneo</label>
                  <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
                    value={form.torneo} onChange={e => setForm({...form, torneo: e.target.value})} />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Fecha N°</label>
                  <input type="number" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
                    value={form.nro_fecha} onChange={e => setForm({...form, nro_fecha: e.target.value})} placeholder="1" />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input type="checkbox" id="conRes" checked={conResultado} onChange={e => setConResultado(e.target.checked)} className="rounded" />
                <label htmlFor="conRes" className="text-sm text-gray-600">Cargar resultado ahora</label>
              </div>

              {conResultado && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-center gap-6">
                    <div className="text-center">
                      <div className="text-xs text-gray-400 mb-2">Comunicaciones</div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => setForm({...form, goles_comu: Math.max(0, (form.goles_comu||0)-1)})}
                          className="w-8 h-8 rounded-full border border-gray-200 bg-white text-gray-600 hover:bg-gray-100 font-bold">−</button>
                        <span className="text-2xl font-bold w-8 text-center">{form.goles_comu || 0}</span>
                        <button onClick={() => setForm({...form, goles_comu: (form.goles_comu||0)+1})}
                          className="w-8 h-8 rounded-full border border-gray-200 bg-white text-gray-600 hover:bg-gray-100 font-bold">+</button>
                      </div>
                    </div>
                    <div className="text-2xl text-gray-300 font-bold">:</div>
                    <div className="text-center">
                      <div className="text-xs text-gray-400 mb-2">Rival</div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => setForm({...form, goles_rival: Math.max(0, (form.goles_rival||0)-1)})}
                          className="w-8 h-8 rounded-full border border-gray-200 bg-white text-gray-600 hover:bg-gray-100 font-bold">−</button>
                        <span className="text-2xl font-bold w-8 text-center">{form.goles_rival || 0}</span>
                        <button onClick={() => setForm({...form, goles_rival: (form.goles_rival||0)+1})}
                          className="w-8 h-8 rounded-full border border-gray-200 bg-white text-gray-600 hover:bg-gray-100 font-bold">+</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs text-gray-500 mb-1 block">Observaciones</label>
                <textarea className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none resize-none"
                  rows={2} value={form.observaciones} onChange={e => setForm({...form, observaciones: e.target.value})} />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setModal(false)} className="flex-1 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
              <button onClick={guardar} disabled={guardando} className="flex-1 py-2 bg-yellow-400 text-black rounded-lg text-sm font-medium hover:bg-yellow-500 disabled:opacity-50">
                {guardando ? 'Guardando...' : 'Guardar partido'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
