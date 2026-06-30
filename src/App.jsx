import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Plantel from './pages/Plantel'
import Partidos from './pages/Partidos'
import Calendario from './pages/Calendario'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white border-b border-gray-200 px-4 py-2 flex items-center gap-1 flex-wrap">
          <div className="flex items-center gap-2 mr-4">
            <span className="text-xl">🛡️</span>
            <span className="font-semibold text-gray-800 text-sm">Comunicaciones</span>
          </div>
          <NavLink to="/" end className={({isActive}) =>
            `px-3 py-1.5 rounded-lg text-sm flex items-center gap-1.5 transition-colors ${isActive ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`
          }>🏠 Inicio</NavLink>
          <NavLink to="/plantel" className={({isActive}) =>
            `px-3 py-1.5 rounded-lg text-sm flex items-center gap-1.5 transition-colors ${isActive ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`
          }>👥 Plantel</NavLink>
          <NavLink to="/partidos" className={({isActive}) =>
            `px-3 py-1.5 rounded-lg text-sm flex items-center gap-1.5 transition-colors ${isActive ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`
          }>⚽ Partidos</NavLink>
          <NavLink to="/calendario" className={({isActive}) =>
            `px-3 py-1.5 rounded-lg text-sm flex items-center gap-1.5 transition-colors ${isActive ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`
          }>📅 Calendario</NavLink>
        </nav>
        <main className="p-4 max-w-5xl mx-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/plantel" element={<Plantel />} />
            <Route path="/partidos" element={<Partidos />} />
            <Route path="/calendario" element={<Calendario />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
