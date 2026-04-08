/**
 * 📝 COMPONENTE: REGISTER
 * Punto de captación de nuevos alumnos.
 * Recopila nombre, email y contraseña y los envía al backend
 * para ser almacenados de forma segura con encriptación Bcrypt.
 */

import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../utils/axiosConfig'

export default function Register() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await api.post('/auth/register', { username, email, password })
      // Una vez la licencia está creada en DB, lo mandamos al garaje a hacer Login normal
      navigate('/login')
    } catch (err) {
      setError(
        err.response?.data?.error ||
          'No pudimos procesar tu Superlicencia. Inténtalo de nuevo.'
      )
    }
  }

  return (
    <div className='auth-bg'>
      <div className='auth-card'>
        <h1 style={{ margin: '0 0 10px 0', fontSize: '28px' }}>
          🏁 Nueva Superlicencia
        </h1>
        <p style={{ color: '#aaa', marginBottom: '30px' }}>
          Regístrate para unirte a la academia
        </p>

        {error && <p className='error-message'>{error}</p>}

        <form onSubmit={handleSubmit}>
          <input
            className='auth-input'
            type='text'
            placeholder='Nombre de piloto'
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            className='auth-input'
            type='email'
            placeholder='Correo Electrónico'
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
            Firmar Contrato
          </button>
        </form>

        <p style={{ marginTop: '20px', color: '#aaa', fontSize: '14px' }}>
          ¿Ya tienes equipo?{' '}
          <Link
            to='/login'
            style={{
              color: '#e10600',
              fontWeight: 'bold',
              textDecoration: 'none'
            }}
          >
            Entra a tu box
          </Link>
        </p>
      </div>
    </div>
  )
}
