import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
// Antes: import { AuthProvider, AuthContext } from './context/AuthContext';
import { AuthProvider } from './context/AuthProvider'
import { useAuth } from './hooks/useAuth'
import Login from './pages/Login'
import Register from './pages/Register'

// Componente para proteger las rutas privadas
const ProtectedRoute = ({ children }) => {
  // Antes: const { token } = useContext(AuthContext);
  const { token } = useAuth()
  if (!token) {
    // Si no hay token guardado, lo expulsamos al login
    return <Navigate to='/login' replace />
  }

  return children
}

// Componente Home de prueba
const Home = () => {
  // Antes: const { logout } = useContext(AuthContext);
  const { logout } = useAuth()
  return (
    <div
      style={{
        textAlign: 'center',
        marginTop: '100px',
        fontFamily: 'system-ui'
      }}
    >
      <h1>¡Bienvenido al Paddock! 🏆</h1>
      <p>Has iniciado sesión correctamente.</p>
      <button
        onClick={logout}
        style={{
          padding: '10px 20px',
          backgroundColor: '#333',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          marginTop: '20px'
        }}
      >
        Cerrar Sesión
      </button>
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
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
