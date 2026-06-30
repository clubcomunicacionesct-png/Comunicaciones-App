import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const POSICIONES = ['Arquero','Defensor','Lateral','Mediocampista','Extremo','Delantero']
const POS_COLOR = {
  Arquero: 'bg-yellow-50 text-yellow-700',
  Defensor: 'bg-blue-50 text-blue-700',
  Lateral: 'bg-green-50 text-green-700',
  Mediocampista: 'bg-purple-50 text-purple-700',
  Extremo: 'bg-orange-50 text-orange-700',
  Delantero: 'bg-red-50 text-red-700',
}

function calcEdad(fn) {
  if (!fn) return '—'
  const b = new Date(fn), now = new Date()
  let age = now.getFullYear() - b.getFullYear()
  if (now < new Date(now.getFullYear(), b.getMonth(), b.getDate())) age--
  return age
}

function iniciales(nombre, apellido) {
  return ((apellido?.[0] || '') + (nombre?.[0] || '')).toUpperCase()
}

export default function Plantel() {
  const [jugadores, setJugadores] = useState([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [filtroPosicion, setFiltroPosicion] = useState('')
  const [modal, setModal] = useState(null) // 'nuevo' | jugador
  const [form, setForm] = useState({ nombre:'', apellido:'', posicion:'Arquero', fecha_nacimiento:'', altura:'', peso:'' })
  const [guardando, setGuardando] = useState(false)

  async function cargar() {
    const { data } = await supabase.from('jugadores').select('*').order('apellido')
    setJugadores(data || [])
    setLoading(false)
  }

  useEffect(() => { cargar() }, [])

  const filtrados = jugadores.filter(j => {
    const nombre = `${j.apellido} ${j.nombre}`.toLowerCase()
    return nombre.includes(busqueda.toLowerCase()) && (!filtroPosicion || j.posicion === filtroPosicion)
  })

  async function guardar() {
    if (!form.nombre || !form.apellido) return alert('Nombre y apellido son obligatorios')
    setGuardando(true)
    await supabase.from('jugadores').insert({
      nombre: form.nombre,
      apellido: form.apellido,
      posicion: form.posicion,
      fecha_nacimiento: form.fecha_nacimiento || null,
      altura: form.altura ? parseFloat(form.altura) : null,
      peso: form.peso ? parseFloat(form.peso) : null,
    })
    setModal(null)
    setForm({ nombre:'', apellido:'', posicion:'Arquero', fecha_nacimiento:'', altura:'', peso:'' })
    setGuardando(false)
    cargar()
  }

  async function eliminar(id) {
    if (!confirm('¿Eliminar jugador?')) return
    await supabase.from('jugadores').delete().eq('id', id)
    setModal(null)
    cargar()
  }

  if (loading) return <div className="text-center py-12 text-gray-400">Cargando plantel...</div>

  return (
    <div className="py-4">
      {/* Toolbar */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <input
          type="text"
          placeholder="Buscar jugador..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          className="flex-1 min-w-40 px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
        />
        <select
          value={filtroPosicion}
          onChange={e => setFiltroPosicion(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none"
        >
          <option value="">Todas las posiciones</option>
          {POSICIONES.map(p => <option key={p}>{p}</option>)}
        </select>
        <button
          onClick={() => setModal('nuevo')}
          className="px-4 py-2 bg-yellow-400 text-black rounded-lg text-sm font-medium hover:bg-yellow-500 transition-colors"
        >
          + Nuevo jugador
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {filtrados.map(j => (
          <div
            key={j.id}
            onClick={() => setModal(j)}
            className="bg-white border border-gray-100 rounded-xl p-4 text-center cursor-pointer hover:border-yellow-400 hover:bg-yellow-50 transition-all"
          >
            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 font-semibold text-lg flex items-center justify-center mx-auto mb-2">
              {iniciales(j.nombre, j.apellido)}
            </div>
            <div className="font-medium text-sm text-gray-900 leading-tight">{j.apellido}, {j.nombre}</div>
            <div className={`text-xs mt-1.5 px-2 py-0.5 rounded-full inline-block font-medium ${POS_COLOR[j.posicion] || 'bg-gray-100 text-gray-600'}`}>
              {j.posicion}
            </div>
          </div>
        ))}
        {filtrados.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-400">Sin jugadores que coincidan</div>
        )}
      </div>

      {/* Modal nuevo jugador */}
      {modal === 'nuevo' && (
        <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-5">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-semibold text-gray-900">Nuevo jugador</h2>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Nombre</label>
                <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} placeholder="Juan" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Apellido</label>
                <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  value={form.apellido} onChange={e => setForm({...form, apellido: e.target.value})} placeholder="Pérez" />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-gray-500 mb-1 block">Posición</label>
                <select className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
                  value={form.posicion} onChange={e => setForm({...form, posicion: e.target.value})}>
                  {POSICIONES.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-xs text-gray-500 mb-1 block">Fecha de nacimiento</label>
                <input type="date" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
                  value={form.fecha_nacimiento} onChange={e => setForm({...form, fecha_nacimiento: e.target.value})} />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Altura (cm)</label>
                <input type="number" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
                  value={form.altura} onChange={e => setForm({...form, altura: e.target.value})} placeholder="178" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Peso (kg)</label>
                <input type="number" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
                  value={form.peso} onChange={e => setForm({...form, peso: e.target.value})} placeholder="73" />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setModal(null)} className="flex-1 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancelar</button>
              <button onClick={guardar} disabled={guardando} className="flex-2 flex-1 py-2 bg-yellow-400 text-black rounded-lg text-sm font-medium hover:bg-yellow-500 disabled:opacity-50">
                {guardando ? 'Guardando...' : 'Guardar jugador'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal ficha jugador */}
      {modal && modal !== 'nuevo' && (
        <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-5">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-semibold flex items-center justify-center">
                  {iniciales(modal.nombre, modal.apellido)}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{modal.apellido}, {modal.nombre}</div>
                  <div className={`text-xs px-2 py-0.5 rounded-full inline-block font-medium ${POS_COLOR[modal.posicion] || ''}`}>{modal.posicion}</div>
                </div>
              </div>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <div className="space-y-2 text-sm">
              {[
                ['Edad', modal.fecha_nacimiento ? `${calcEdad(modal.fecha_nacimiento)} años` : '—'],
                ['Altura', modal.altura ? `${modal.altura} cm` : '—'],
                ['Peso', modal.peso ? `${modal.peso} kg` : '—'],
                ['Posición', modal.posicion],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between py-2 border-b border-gray-50">
                  <span className="text-gray-500">{k}</span>
                  <span className="font-medium text-gray-900">{v}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => eliminar(modal.id)} className="py-2 px-4 border border-red-200 text-red-600 rounded-lg text-sm hover:bg-red-50">Eliminar</button>
              <button onClick={() => setModal(null)} className="flex-1 py-2 bg-yellow-400 text-black rounded-lg text-sm font-medium hover:bg-yellow-500">Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
