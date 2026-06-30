import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Plantel from './pages/Plantel'
import Partidos from './pages/Partidos'
import Calendario from './pages/Calendario'
import escudo from './assets/escudo.png'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen relative" style={{
        background: 'radial-gradient(ellipse at top, #1c1c1c 0%, #000000 60%)',
      }}>
        {/* watermark del escudo de fondo */}
        <img
          src={escudo}
          alt=""
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] max-w-none opacity-[0.04] pointer-events-none select-none"
        />

        <nav className="bg-black border-b border-yellow-500/30 px-4 py-2 flex items-center gap-1 flex-wrap relative z-10">
          <div className="flex items-center gap-2 mr-4">
            <img src={escudo} alt="Comunicaciones" className="w-8 h-8" />
            <span className="font-semibold text-yellow-400 text-sm tracking-wide">Comunicaciones</span>
          </div>
          <NavLink to="/" end className={({isActive}) =>
            `px-3 py-1.5 rounded-lg text-sm flex items-center gap-1.5 transition-colors ${isActive ? 'bg-yellow-400 text-black font-medium' : 'text-gray-300 hover:bg-white/10'}`
          }>🏠 Inicio</NavLink>
          <NavLink to="/plantel" className={({isActive}) =>
            `px-3 py-1.5 rounded-lg text-sm flex items-center gap-1.5 transition-colors ${isActive ? 'bg-yellow-400 text-black font-medium' : 'text-gray-300 hover:bg-white/10'}`
          }>👥 Plantel</NavLink>
          <NavLink to="/partidos" className={({isActive}) =>
            `px-3 py-1.5 rounded-lg text-sm flex items-center gap-1.5 transition-colors ${isActive ? 'bg-yellow-400 text-black font-medium' : 'text-gray-300 hover:bg-white/10'}`
          }>⚽ Partidos</NavLink>
          <NavLink to="/calendario" className={({isActive}) =>
            `px-3 py-1.5 rounded-lg text-sm flex items-center gap-1.5 transition-colors ${isActive ? 'bg-yellow-400 text-black font-medium' : 'text-gray-300 hover:bg-white/10'}`
          }>📅 Calendario</NavLink>
        </nav>
        <main className="p-4 max-w-5xl mx-auto relative z-10">
          <div className="bg-gray-50 rounded-2xl p-4 min-h-[70vh]">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/plantel" element={<Plantel />} />
              <Route path="/partidos" element={<Partidos />} />
              <Route path="/calendario" element={<Calendario />} />
            </Routes>
          </div>
        </main>
      </div>
    </BrowserRouter>
  )
}
