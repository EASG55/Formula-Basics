/**
 * 🏠 COMPONENTE: HOME (El Paddock Central)
 * Pantalla de bienvenida general.
 * Utiliza un diseño moderno tipo "Bento Box" (cuadrículas asimétricas)
 * para jerarquizar la Academia y dar accesos directos al resto de la app.
 */

import { Link } from 'react-router-dom'

export default function Home() {
  // Extraemos el nombre del piloto activo para el saludo personalizado
  const userStr = localStorage.getItem('user')
  const user = userStr ? JSON.parse(userStr) : { username: 'Piloto' }

  return (
    <div className='page-container'>
      {/* 1. SECCIÓN HERO (Banner de Presentación) */}
      <div
        style={{
          textAlign: 'center',
          padding: '70px 20px',
          backgroundColor: '#1f1f27',
          borderRadius: '16px',
          borderTop: '5px solid #e10600',
          marginBottom: '40px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.03,
            backgroundImage: 'url("/assets/login-bg.jpg")',
            backgroundSize: 'cover',
            pointerEvents: 'none'
          }}
        ></div>
        <h1
          style={{
            fontSize: '3.5rem',
            margin: '0 0 15px 0',
            color: '#fff',
            fontWeight: '800',
            letterSpacing: '-1px'
          }}
        >
          ¡Bienvenido, {user.username}! 🏆
        </h1>
        <p
          style={{
            fontSize: '1.2rem',
            color: '#aaa',
            maxWidth: '650px',
            margin: '0 auto',
            lineHeight: '1.6'
          }}
        >
          Estás en <strong style={{ color: '#fff' }}>Formula Basics</strong>, tu
          mentor digital interactivo. Domina las reglas, analiza la parrilla
          oficial y sigue los resultados de la temporada 2026.
        </p>
      </div>

      {/* 2. HERO CARD: ACADEMIA (Nuestra joya de la corona, destacada) */}
      <Link
        to='/academy'
        style={{
          textDecoration: 'none',
          display: 'block',
          marginBottom: '25px'
        }}
      >
        <div
          className='modern-card'
          style={{
            backgroundColor: '#1a2035',
            borderLeft: '8px solid #005AFF',
            display: 'flex',
            alignItems: 'center',
            gap: '30px',
            flexWrap: 'wrap'
          }}
        >
          <span
            style={{
              fontSize: '80px',
              filter: 'drop-shadow(0px 10px 15px rgba(0, 90, 255, 0.3))'
            }}
          >
            📚
          </span>
          <div style={{ flex: 1, minWidth: '250px' }}>
            <h2
              style={{
                color: '#fff',
                margin: '0 0 10px 0',
                fontSize: '32px',
                fontWeight: '800'
              }}
            >
              Academia F1
            </h2>
            <p
              style={{
                color: '#aaa',
                fontSize: '16px',
                margin: 0,
                lineHeight: '1.6'
              }}
            >
              Comienza por aquí. Entra a la academia interactiva, lee las
              lecciones oficiales y descubre cómo funciona el Gran Circo.
            </p>
          </div>
          <div className='btn-primary' style={{ backgroundColor: '#005AFF' }}>
            Empezar a aprender →
          </div>
        </div>
      </Link>

      {/* 3. BENTO BOX: Accesos Directos (Datos Técnicos en cuadrícula 4x) */}
      <div className='bento-grid'>
        <Link to='/drivers' style={{ textDecoration: 'none', height: '100%' }}>
          <div
            className='modern-card'
            style={{
              backgroundColor: '#2a2a35',
              textAlign: 'center',
              borderBottom: '5px solid #00D2BE',
              height: '100%',
              boxSizing: 'border-box'
            }}
          >
            <span style={{ fontSize: '45px' }}>🏎️</span>
            <h3
              style={{
                color: '#fff',
                margin: '15px 0 5px 0',
                fontWeight: '800'
              }}
            >
              La Parrilla
            </h3>
            <p style={{ color: '#aaa', fontSize: '14px', margin: 0 }}>
              Estadísticas de pilotos
            </p>
          </div>
        </Link>
        <Link to='/teams' style={{ textDecoration: 'none', height: '100%' }}>
          <div
            className='modern-card'
            style={{
              backgroundColor: '#2a2a35',
              textAlign: 'center',
              borderBottom: '5px solid #FF8700',
              height: '100%',
              boxSizing: 'border-box'
            }}
          >
            <span style={{ fontSize: '45px' }}>🛡️</span>
            <h3
              style={{
                color: '#fff',
                margin: '15px 0 5px 0',
                fontWeight: '800'
              }}
            >
              Escuderías
            </h3>
            <p style={{ color: '#aaa', fontSize: '14px', margin: 0 }}>
              Palmarés de constructores
            </p>
          </div>
        </Link>
        <Link
          to='/standings'
          style={{ textDecoration: 'none', height: '100%' }}
        >
          <div
            className='modern-card'
            style={{
              backgroundColor: '#2a2a35',
              textAlign: 'center',
              borderBottom: '5px solid #FFD700',
              height: '100%',
              boxSizing: 'border-box'
            }}
          >
            <span style={{ fontSize: '45px' }}>🏆</span>
            <h3
              style={{
                color: '#fff',
                margin: '15px 0 5px 0',
                fontWeight: '800'
              }}
            >
              Clasificación
            </h3>
            <p style={{ color: '#aaa', fontSize: '14px', margin: 0 }}>
              El mundial en directo
            </p>
          </div>
        </Link>
        <Link to='/races' style={{ textDecoration: 'none', height: '100%' }}>
          <div
            className='modern-card'
            style={{
              backgroundColor: '#2a2a35',
              textAlign: 'center',
              borderBottom: '5px solid #e10600',
              height: '100%',
              boxSizing: 'border-box'
            }}
          >
            <span style={{ fontSize: '45px' }}>📅</span>
            <h3
              style={{
                color: '#fff',
                margin: '15px 0 5px 0',
                fontWeight: '800'
              }}
            >
              Calendario
            </h3>
            <p style={{ color: '#aaa', fontSize: '14px', margin: 0 }}>
              Resultados y citas
            </p>
          </div>
        </Link>
      </div>
    </div>
  )
}
