import { useState } from 'react'
import axios from 'axios'
// Antes: import { AuthContext } from '../context/AuthContext';
import { useAuth } from '../hooks/useAuth'
import { useNavigate, Link } from 'react-router-dom'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  // Antes: const { login } = useContext(AuthContext);
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await axios.post('http://localhost:3000/api/auth/login', {
        email,
        password
      })
      login(res.data.token)
      navigate('/') // Redirige al Home (Paddock) si hay éxito
    } catch (err) {
      setError(err.response?.data?.error || 'Error al iniciar sesión')
    }
  }

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h2 style={{ textAlign: 'center' }}>Iniciar Sesión 🏎️</h2>
        {error && <p style={styles.error}>{error}</p>}

        <input
          style={styles.input}
          type='email'
          placeholder='Email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          style={styles.input}
          type='password'
          placeholder='Contraseña'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button style={styles.button} type='submit'>
          Entrar al Paddock
        </button>
        <p style={{ textAlign: 'center', marginTop: '15px' }}>
          ¿No tienes cuenta?{' '}
          <Link to='/register' style={{ color: '#e10600' }}>
            Regístrate
          </Link>
        </p>
      </form>
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#f4f4f9',
    fontFamily: 'system-ui'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    padding: '2rem',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
    width: '320px'
  },
  input: {
    margin: '10px 0',
    padding: '12px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    fontSize: '14px'
  },
  button: {
    padding: '12px',
    marginTop: '10px',
    backgroundColor: '#e10600',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '16px'
  },
  error: {
    color: '#d32f2f',
    fontSize: '14px',
    backgroundColor: '#ffebee',
    padding: '10px',
    borderRadius: '4px',
    textAlign: 'center'
  }
}
