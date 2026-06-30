import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Dashboard() {
  const [partidos, setPartidos] = useState([])
  const [jugadores, setJugadores] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function cargar() {
      const [{ data: p }, { data: j }] = await Promise.all([
        supabase.from('partidos').select('*').order('fecha'),
        supabase.from('jugadores').select('id'),
      ])
      setPartidos(p || [])
      setJugadores(j || [])
      setLoading(false)
    }
    cargar()
  }, [])

  if (loading) return <div className="text-center py-12 text-gray-400">Cargando...</div>

  const jugados = partidos.filter(p => p.goles_comu !== null)
  const wins = jugados.filter(p => p.goles_comu > p.goles_rival).length
  const draws = jugados.filter(p => p.goles_comu === p.goles_rival).length
  const losses = jugados.filter(p => p.goles_comu < p.goles_rival).length
  const proximo = partidos.find(p => p.goles_comu === null && new Date(p.fecha) >= new Date())

  return (
    <div className="space-y-6 py-4">
      {/* Próximo partido */}
      {proximo && (
        <div className="bg-white rounded-xl border border-blue-200 p-4">
          <div className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">Próximo partido</div>
          <div className="flex items-center gap-3">
            <div className="text-3xl">⚽</div>
            <div>
              <div className="font-semibold text-gray-900">vs {proximo.rival}</div>
              <div className="text-sm text-gray-500">
                {new Date(proximo.fecha + 'T12:00:00').toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}
                {' · '}
                <span className={`font-medium ${proximo.condicion === 'Local' ? 'text-green-600' : 'text-blue-600'}`}>
                  {proximo.condicion}
                </span>
                {proximo.torneo && ` · ${proximo.torneo}`}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Métricas */}
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
        {[
          { label: 'Partidos', val: jugados.length, color: 'text-gray-900' },
          { label: 'Victorias', val: wins, color: 'text-green-600' },
          { label: 'Empates', val: draws, color: 'text-yellow-600' },
          { label: 'Derrotas', val: losses, color: 'text-red-600' },
          { label: 'Jugadores', val: jugadores.length, color: 'text-blue-600' },
          { label: 'GF / GC', val: `${jugados.reduce((s,p)=>s+p.goles_comu,0)} / ${jugados.reduce((s,p)=>s+p.goles_rival,0)}`, color: 'text-gray-900' },
        ].map(m => (
          <div key={m.label} className="bg-white rounded-lg p-3 border border-gray-100">
            <div className="text-xs text-gray-400 mb-1">{m.label}</div>
            <div className={`text-xl font-semibold ${m.color}`}>{m.val}</div>
          </div>
        ))}
      </div>

      {/* Últimos resultados */}
      {jugados.length > 0 && (
        <div>
          <div className="text-sm font-medium text-gray-500 mb-2">Últimos resultados</div>
          <div className="space-y-2">
            {jugados.slice(-5).reverse().map(p => {
              const r = p.goles_comu > p.goles_rival ? 'Ganado' : p.goles_comu === p.goles_rival ? 'Empatado' : 'Perdido'
              const color = r === 'Ganado' ? 'bg-green-50 text-green-700' : r === 'Empatado' ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-700'
              return (
                <div key={p.id} className="bg-white rounded-lg border border-gray-100 px-4 py-3 flex items-center gap-3">
                  <div className="flex-1 text-sm font-medium text-gray-800">vs {p.rival}</div>
                  <div className="text-sm text-gray-400">{new Date(p.fecha + 'T12:00:00').toLocaleDateString('es-AR')}</div>
                  <div className="font-semibold text-gray-900">{p.goles_comu} - {p.goles_rival}</div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${color}`}>{r}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {jugados.length === 0 && partidos.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <div className="text-4xl mb-3">⚽</div>
          <div>Todavía no hay partidos cargados</div>
        </div>
      )}
    </div>
  )
}
