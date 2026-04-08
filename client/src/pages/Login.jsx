/**
 * 🔑 COMPONENTE: LOGIN
 * Pantalla de inicio de sesión de acceso restringido.
 * Envía credenciales al Backend y, si son correctas, guarda el
 * "Pase de Paddock" (Token JWT) en la memoria del navegador.
 */

import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../utils/axiosConfig'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await api.post('/auth/login', { email, password })

      // Guardamos la llave maestra (Token JWT) en local
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))

      // Hacemos un reload puro para que el componente "ProtectedRoute" detecte el token nuevo
      window.location.href = '/'
    } catch (err) {
      setError(
        err.response?.data?.error ||
          'Contraseña incorrecta o piloto no registrado.'
      )
    }
  }

  return (
    <div className='auth-bg'>
      <div className='auth-card'>
        <h1 style={{ margin: '0 0 10px 0', fontSize: '28px' }}>
          🏎️ Formula Basics
        </h1>
        <p style={{ color: '#aaa', marginBottom: '30px' }}>
          Inicia sesión en tu telemetría
        </p>

        {error && <p className='error-message'>{error}</p>}

        <form onSubmit={handleSubmit}>
          <input
            className='auth-input'
            type='email'
            placeholder='Email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            className='auth-input'
            type='password'
            placeholder='Contraseña'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type='submit'
            className='btn-primary'
            style={{ width: '100%', marginTop: '10px' }}
          >
            Arrancar el Motor
          </button>
        </form>

        <p style={{ marginTop: '20px', color: '#aaa', fontSize: '14px' }}>
          ¿No tienes superlicencia?{' '}
          <Link
            to='/register'
            style={{
              color: '#e10600',
              fontWeight: 'bold',
              textDecoration: 'none'
            }}
          >
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  )
}
