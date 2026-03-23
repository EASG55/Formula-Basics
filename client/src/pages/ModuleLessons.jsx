import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'

export default function ModuleLessons() {
  const { id } = useParams()
  const [lessons, setLessons] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/api/lessons/${id}`
        )
        setLessons(response.data)
      } catch (err) {
        setError('Error al cargar las lecciones del módulo')
      }
    }
    fetchLessons()
  }, [id])

  return (
    <div className='page-container'>
      <div className='lessons-header'>
        <h2 className='page-title'>📖 Lecciones del Módulo</h2>
        <Link to='/academy' className='btn-back'>
          Volver a la Academia
        </Link>
      </div>

      {error && <p className='error-message'>{error}</p>}

      {lessons.length === 0 && !error && (
        <p className='empty-message'>
          Este módulo aún no tiene lecciones publicadas.
        </p>
      )}

      <div className='lessons-list'>
        {lessons.map((lesson) => (
          <div key={lesson.id} className='lesson-card'>
            <h3 className='lesson-title'>{lesson.title}</h3>
            <div className='lesson-content'>{lesson.content_text}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
