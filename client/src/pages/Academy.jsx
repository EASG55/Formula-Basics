/**
 * 📚 COMPONENTE: ACADEMY (Centro de Alto Rendimiento)
 * El punto de entrada principal para la educación de los usuarios.
 * Recopila los módulos temáticos de la base de datos y arma las tarjetas
 * que sirven de portal hacia el interior de las lecciones.
 */

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../utils/axiosConfig'

export default function Academy() {
  // --- ESTADOS ---
  const [modules, setModules] = useState([])
  const [error, setError] = useState('')

  // --- EFECTOS ---
  useEffect(() => {
    const fetchModules = async () => {
      try {
        const response = await api.get('/modules')
        setModules(response.data)
      } catch (err) {
        setError('Error de comunicación al solicitar el temario.')
      }
    }
    fetchModules()
  }, [])

  // --- RENDERIZADO VISUAL ---
  return (
    <div className='page-container'>
      <h2 className='page-title'>Academia F1</h2>
      {error && <p className='error-message'>{error}</p>}

      {/* Lista de Cursos Disponibles */}
      <div className='grid-container'>
        {modules.map((mod) => (
          <div
            key={mod.id}
            className='modern-card'
            style={{
              borderTop: '6px solid #005AFF',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <h3
              style={{
                margin: '0 0 15px 0',
                color: '#fff',
                fontSize: '22px',
                fontWeight: '800'
              }}
            >
              {mod.title}
            </h3>
            <p
              style={{
                color: '#aaa',
                marginBottom: '30px',
                flexGrow: 1,
                lineHeight: '1.6'
              }}
            >
              {mod.description}
            </p>
            <Link
              to={`/academy/module/${mod.id}`}
              className='btn-primary'
              style={{ backgroundColor: '#005AFF' }}
            >
              Entrar al Módulo
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
