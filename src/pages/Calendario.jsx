import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const DIAS = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']

function formatFecha(str) {
  const d = new Date(str + 'T12:00:00')
  return d.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })
}

export default function Calendario() {
  const [partidos, setPartidos] = useState([])
  const [sesiones, setSesiones] = useState([])
  const [loading, setLoading] = useState(true)
  const [year, setYear] = useState(new Date().getFullYear())
  const [month, setMonth] = useState(new Date().getMonth())
  const [diaSeleccionado, setDiaSeleccionado] = useState(null)

  useEffect(() => {
    async function cargar() {
      const [{ data: p }, { data: s }] = await Promise.all([
        supabase.from('partidos').select('*'),
        supabase.from('sesiones').select('*'),
      ])
      setPartidos(p || [])
      setSesiones(s || [])
      setLoading(false)
    }
    cargar()
  }, [])

  function navMes(dir) {
    let m = month + dir, y = year
    if (m > 11) { m = 0; y++ }
    if (m < 0) { m = 11; y-- }
    setMonth(m); setYear(y)
    setDiaSeleccionado(null)
  }

  const hoy = new Date().toISOString().split('T')[0]
  const primerDia = new Date(year, month, 1).getDay()
  const diasEnMes = new Date(year, month + 1, 0).getDate()

  // Agrupar eventos por día
  const eventosPorDia = {}
  partidos.forEach(p => {
    if (!eventosPorDia[p.fecha]) eventosPorDia[p.fecha] = []
    eventosPorDia[p.fecha].push({ tipo: 'partido', data: p })
  })
  sesiones.forEach(s => {
    if (!eventosPorDia[s.fecha]) eventosPorDia[s.fecha] = []
    eventosPorDia[s.fecha].push({ tipo: 'sesion', data: s })
  })

  function colorSesion(tipo) {
    if (tipo?.includes('Pre Partido')) return 'bg-blue-100 text-blue-700'
    if (tipo === 'ABP') return 'bg-purple-100 text-purple-700'
    if (tipo === 'Partido Entrenamiento') return 'bg-orange-100 text-orange-700'
    return 'bg-green-100 text-green-700'
  }

  const totalCeldas = Math.ceil((primerDia + diasEnMes) / 7) * 7

  if (loading) return <div className="text-center py-12 text-gray-400">Cargando calendario...</div>

  const eventosDelDia = diaSeleccionado ? (eventosPorDia[diaSeleccionado] || []) : []

  return (
    <div className="py-4">
      {/* Navegación */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <button onClick={() => navMes(-1)} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">‹</button>
        <span className="font-semibold text-gray-900 flex-1">{MESES[month]} {year}</span>
        <button onClick={() => navMes(1)} className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm hover:bg-gray-50">›</button>
        <div className="flex gap-2 text-xs flex-wrap">
          <span className="bg-red-50 text-red-700 px-2 py-0.5 rounded-full font-medium">Partido</span>
          <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-medium">Entrenamiento</span>
          <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">Pre partido</span>
          <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full font-medium">ABP</span>
        </div>
      </div>

      {/* Grilla */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="grid grid-cols-7 border-b border-gray-100">
          {DIAS.map(d => (
            <div key={d} className="text-center text-xs text-gray-400 font-medium py-2">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {Array.from({ length: totalCeldas }).map((_, i) => {
            const diaNum = i - primerDia + 1
            const esDelMes = diaNum >= 1 && diaNum <= diasEnMes
            const dateStr = esDelMes
              ? `${year}-${String(month + 1).padStart(2, '0')}-${String(diaNum).padStart(2, '0')}`
              : null
            const esHoy = dateStr === hoy
            const esSeleccionado = dateStr === diaSeleccionado
            const eventos = dateStr ? (eventosPorDia[dateStr] || []) : []

            return (
              <div
                key={i}
                onClick={() => esDelMes && setDiaSeleccionado(dateStr === diaSeleccionado ? null : dateStr)}
                className={`min-h-14 p-1 border-b border-r border-gray-50 transition-colors
                  ${esDelMes ? 'cursor-pointer hover:bg-gray-50' : 'opacity-20'}
                  ${esSeleccionado ? 'bg-blue-50' : ''}
                `}
              >
                <div className={`text-xs mb-1 w-5 h-5 flex items-center justify-center rounded-full font-medium
                  ${esHoy ? 'bg-blue-600 text-white' : 'text-gray-500'}
                `}>
                  {esDelMes ? diaNum : ''}
                </div>
                {eventos.slice(0, 2).map((ev, idx) => (
                  <div key={idx} className={`text-[10px] px-1 py-0.5 rounded mb-0.5 truncate font-medium leading-tight
                    ${ev.tipo === 'partido' ? 'bg-red-50 text-red-700' : colorSesion(ev.data.tipo)}
                  `}>
                    {ev.tipo === 'partido' ? `vs ${ev.data.rival}` : ev.data.tipo}
                  </div>
                ))}
                {eventos.length > 2 && (
                  <div className="text-[10px] text-gray-400">+{eventos.length - 2}</div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Detalle del día seleccionado */}
      {diaSeleccionado && (
        <div className="mt-4 bg-white rounded-xl border border-blue-200 p-4">
          <div className="text-sm font-semibold text-blue-700 mb-3 capitalize">
            📅 {formatFecha(diaSeleccionado)}
          </div>
          {eventosDelDia.length === 0 ? (
            <div className="text-sm text-gray-400 text-center py-4">Sin eventos este día</div>
          ) : (
            <div className="space-y-2">
              {eventosDelDia.map((ev, idx) => (
                <div key={idx} className="bg-gray-50 rounded-lg p-3 text-sm">
                  {ev.tipo === 'partido' ? (
                    <>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs bg-red-50 text-red-700 px-2 py-0.5 rounded-full font-medium">Partido</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ev.data.condicion === 'Local' ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'}`}>
                          {ev.data.condicion}
                        </span>
                      </div>
                      <div className="font-semibold text-gray-900">vs {ev.data.rival}</div>
                      <div className="text-gray-500 text-xs mt-1">{ev.data.torneo} {ev.data.nro_fecha ? `· Fecha ${ev.data.nro_fecha}` : ''}</div>
                      {ev.data.goles_comu !== null && (
                        <div className="mt-1 font-bold text-gray-900">{ev.data.goles_comu} - {ev.data.goles_rival}
                          <span className={`ml-2 text-xs font-medium px-2 py-0.5 rounded-full
                            ${ev.data.resultado === 'Ganado' ? 'bg-green-50 text-green-700' : ev.data.resultado === 'Empatado' ? 'bg-yellow-50 text-yellow-700' : 'bg-red-50 text-red-700'}`}>
                            {ev.data.resultado}
                          </span>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colorSesion(ev.data.tipo)}`}>{ev.data.tipo}</span>
                        <span className="text-xs text-gray-400">{ev.data.turno}</span>
                      </div>
                      {ev.data.descripcion && <div className="text-gray-600">{ev.data.descripcion}</div>}
                      {ev.data.cantidad_jugadores && <div className="text-xs text-gray-400 mt-1">{ev.data.cantidad_jugadores} jugadores</div>}
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
