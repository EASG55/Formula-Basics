/**
 * 📝 COMPONENTE: REGISTER
 * Punto de captación de nuevos alumnos.
 * Recopila nombre, email y contraseña con validación estricta de formato,
 * y los envía al backend para ser almacenados de forma segura con encriptación Bcrypt.
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
    setError('') // Limpiamos errores previos en cada intento

    // 🛡️ 1. Validación de Formato de Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError(
        '⚠️ Formato inválido: Introduce un correo real (ej: piloto@escuderia.com).'
      )
      return // Frenamos la ejecución, no se envía al backend
    }

    // 🛡️ 2. Validación de Contraseña Segura (Nivel FIA)
    // Mínimo 8 caracteres, al menos 1 mayúscula, 1 minúscula y 1 número.
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
    if (!passwordRegex.test(password)) {
      setError(
        '⚠️ Seguridad insuficiente: La contraseña debe tener al menos 8 caracteres, incluir una mayúscula, una minúscula y un número.'
      )
      return // Frenamos la ejecución
    }

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
            placeholder='Contraseña segura'
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
