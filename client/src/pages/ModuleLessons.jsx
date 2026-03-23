import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../hooks/useAuth'

export default function ModuleLessons() {
  const { id } = useParams()
  const { user } = useAuth()

  const [lessons, setLessons] = useState([])
  const [error, setError] = useState('')
  const [completedLessons, setCompletedLessons] = useState([])

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

  const marcarCompletada = async (lessonId) => {
    try {
      const response = await axios.post('http://localhost:3000/api/progress', {
        user_id: user.id,
        lesson_id: lessonId
      })

      if (response.status === 201) {
        setCompletedLessons((prev) => [...prev, lessonId])
      }
    } catch (error) {
      console.error('Error al guardar progreso', error)
      // Opcional: Podrías mostrar un mensaje de error en la UI si falla
    }
  }

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

            <button
              className={`btn-complete ${completedLessons.includes(lesson.id) ? 'completed' : ''}`}
              onClick={() => marcarCompletada(lesson.id)}
              disabled={completedLessons.includes(lesson.id)}
            >
              {completedLessons.includes(lesson.id)
                ? '✅ Completada'
                : 'Marcar como Completada'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
