/**
 * 🏎️ COMPONENTE: APP (Motor de Enrutamiento)
 * Actúa como el chasis principal de la aplicación.
 * Configura el contexto de autenticación y protege las rutas privadas
 * para que solo los pilotos registrados puedan acceder a la telemetría.
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthProvider'
import { useAuth } from './hooks/useAuth'

// Páginas Públicas (Box de entrada)
import Login from './pages/Login'
import Register from './pages/Register'

// Páginas Privadas (El Paddock)
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Drivers from './pages/Drivers'
import Races from './pages/Races'
import Academy from './pages/Academy'
import ModuleLessons from './pages/ModuleLessons'
import Teams from './pages/Teams'
import Standings from './pages/Standings'
import './App.css'

/**
 * 🛡️ COMPONENTE ENVOLTORIO: ProtectedRoute
 * Es nuestro guardia de seguridad. Verifica si existe un token de sesión válido.
 * Si no hay token (intruso), lo expulsa directamente a la pantalla de Login.
 */
const ProtectedRoute = ({ children }) => {
  const { token } = useAuth()

  if (!token) return <Navigate to='/login' replace />

  // Si tiene pase VIP, renderizamos la estructura base: Navbar + Contenido
  return (
    <div className='app-wrapper'>
      <Navbar />
      <main className='main-content'>{children}</main>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* RUTAS PÚBLICAS */}
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />

          {/* RUTAS PROTEGIDAS (Requieren Superlicencia/Token) */}
          <Route
            path='/'
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path='/drivers'
            element={
              <ProtectedRoute>
                <Drivers />
              </ProtectedRoute>
            }
          />
          <Route
            path='/teams'
            element={
              <ProtectedRoute>
                <Teams />
              </ProtectedRoute>
            }
          />
          <Route
            path='/races'
            element={
              <ProtectedRoute>
                <Races />
              </ProtectedRoute>
            }
          />
          <Route
            path='/standings'
            element={
              <ProtectedRoute>
                <Standings />
              </ProtectedRoute>
            }
          />

          {/* SECCIÓN ACADEMIA */}
          <Route
            path='/academy'
            element={
              <ProtectedRoute>
                <Academy />
              </ProtectedRoute>
            }
          />
          <Route
            path='/academy/module/:id'
            element={
              <ProtectedRoute>
                <ModuleLessons />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
