/**
 * 📝 COMPONENTE: MODULE LESSONS (Lecciones Prácticas)
 * El simulador educativo real. Aquí ocurre la magia:
 * 1. Lee textos largos de PostgreSQL.
 * 2. Transforma esos textos parseando saltos de línea (\n).
 * 3. Busca etiquetas [WIDGET_API] para inyectar gráficos vivos.
 * 4. Envía recompensas de XP al backend cuando se pulsa "Leída".
 */

import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../utils/axiosConfig'
import ApiWidget from '../components/ApiWidget'

export default function ModuleLessons() {
  const { id } = useParams()
  const userStr = localStorage.getItem('user')
  const user = userStr ? JSON.parse(userStr) : null

  // --- ESTADOS ---
  const [lessons, setLessons] = useState([])
  const [completedLessons, setCompletedLessons] = useState([]) // IDs que ya hemos leído antes
  const [error, setError] = useState('')

  // --- EFECTOS (Sincronización DB) ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const lessonsRes = await api.get(`/lessons/${id}`)
        setLessons(lessonsRes.data)

        // Preguntamos al servidor: "¿Qué ha leído ya este piloto?"
        if (user?.id) {
          const progressRes = await api.get(`/progress/${user.id}/${id}`)
          setCompletedLessons(progressRes.data)
        }
      } catch (err) {
        setError('Pérdida de paquetes en la telemetría del servidor.')
      }
    }
    fetchData()
  }, [id, user?.id])

  // --- MANEJADORES (Gamificación) ---
  const marcarCompletada = async (lessonId) => {
    if (!user?.id) return
    try {
      const response = await api.post('/progress', {
        user_id: user.id,
        lesson_id: lessonId
      })
      if (response.status === 201) {
        setCompletedLessons((prev) => [...prev, lessonId])
        // 🚀 Evento Global: Avisa al Navbar (arriba) para que sume los XP visualmente
        window.dispatchEvent(new Event('xpUpdated'))
      }
    } catch (error) {
      console.error(error)
    }
  }

  // --- 🧩 EL PARSEADOR MÁGICO ---
  /**
   * Corta el texto crudo en pedacitos. Si encuentra la etiqueta WIDGET_API,
   * no renderiza texto, sino que llama al componente <ApiWidget />.
   */
  const renderContentWithWidgets = (text) => {
    if (!text) return null
    return text.split(/(\[WIDGET_API:\s*[^\]]+\])/g).map((part, index) => {
      if (part.startsWith('[WIDGET_API:')) {
        return (
          <ApiWidget
            key={index}
            type={part.replace(/\[WIDGET_API:\s*|\]/g, '').trim()}
          />
        )
      }
      return (
        <span
          key={index}
          style={{ color: '#ccc', lineHeight: '1.8', fontSize: '17px' }}
        >
          {part.split('\\n').map((line, i) => (
            <span key={i}>
              {line}
              <br />
            </span>
          ))}
        </span>
      )
    })
  }

  // --- RENDERIZADO VISUAL ---
  return (
    <div className='page-container' style={{ maxWidth: '800px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: '30px'
        }}
      >
        <h2 className='page-title' style={{ marginBottom: 0 }}>
          Academia
        </h2>
        <Link
          to='/academy'
          style={{
            color: '#005AFF',
            textDecoration: 'none',
            fontWeight: 'bold'
          }}
        >
          ← Volver
        </Link>
      </div>

      {error && <p className='error-message'>{error}</p>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
        {lessons.map((lesson) => {
          const isCompleted = completedLessons.includes(lesson.id)
          return (
            <div
              key={lesson.id}
              className='modern-card'
              style={{ borderLeft: '6px solid #005AFF', padding: '40px' }}
            >
              <h3
                style={{
                  margin: '0 0 25px 0',
                  fontSize: '26px',
                  fontWeight: '800'
                }}
              >
                {lesson.title}
              </h3>

              {/* Aquí se inyecta el contenido dinámico y los widgets */}
              <div style={{ marginBottom: '30px' }}>
                {renderContentWithWidgets(lesson.content_text)}
              </div>

              <button
                className='btn-primary'
                onClick={() => marcarCompletada(lesson.id)}
                disabled={isCompleted}
                style={{
                  width: '100%',
                  backgroundColor: isCompleted ? '#28a745' : '#333'
                }}
              >
                {isCompleted ? '✅ Lección Completada' : 'Marcar como Leída'}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
