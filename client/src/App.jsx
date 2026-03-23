import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthProvider'
import { useAuth } from './hooks/useAuth'
import Login from './pages/Login'
import Register from './pages/Register'
import Navbar from './components/Navbar'
import Drivers from './pages/Drivers'
import Races from './pages/Races'
import Academy from './pages/Academy'
import ModuleLessons from './pages/ModuleLessons'
import './App.css'

const ProtectedRoute = ({ children }) => {
  const { token } = useAuth()

  if (!token) {
    return <Navigate to='/login' replace />
  }

  return (
    <div className='app-wrapper'>
      <Navbar />
      <main className='main-content'>{children}</main>
    </div>
  )
}

const Home = () => {
  return (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <h1>¡Bienvenido al Paddock! 🏆</h1>
      <p style={{ fontSize: '18px', color: '#ccc' }}>
        Navega usando el menú superior para ver los datos de la temporada 2026.
      </p>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />

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
            path='/races'
            element={
              <ProtectedRoute>
                <Races />
              </ProtectedRoute>
            }
          />
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
