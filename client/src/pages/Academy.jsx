import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'

export default function Academy() {
  const [modules, setModules] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/modules')
        setModules(response.data)
      } catch (err) {
        setError('Error al cargar los módulos de la academia')
      }
    }
    fetchModules()
  }, [])

  return (
    <div className='page-container'>
      <h2 className='page-title'>📚 Academia F1</h2>
      {error && <p className='error-message'>{error}</p>}

      {modules.length === 0 && !error && (
        <p className='empty-message'>
          No hay módulos disponibles en este momento.
        </p>
      )}

      <div className='academy-grid'>
        {modules.map((mod) => (
          <div key={mod.id} className='academy-card'>
            <h3 className='academy-title'>{mod.title}</h3>
            <p className='academy-description'>{mod.description}</p>
            <Link to={`/academy/module/${mod.id}`} className='btn-enter-module'>
              Ver Lecciones
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}
