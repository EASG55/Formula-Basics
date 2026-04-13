/**
 * 🧭 COMPONENTE: NAVBAR (Barra de Navegación)
 * El panel superior del monoplaza. Contiene el menú principal,
 * el botón de salida y el medidor de revoluciones (Barra de XP en vivo).
 */

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../utils/axiosConfig'

export default function Navbar() {
  // --- ESTADOS (Memoria del Piloto) ---
  const [xp, setXp] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false) // Estado para el menú hamburguesa

  // Recuperamos la sesión activa desde el almacenamiento local
  const userStr = localStorage.getItem('user')
  const user = userStr ? JSON.parse(userStr) : null

  // --- LÓGICA DE GAMIFICACIÓN (Sistema de la FIA) ---
  /**
   * Recibe la experiencia total y devuelve la categoría actual,
   * sus límites de puntos y el color corporativo que le corresponde.
   */
  const getLevelInfo = (currentXp) => {
    if (currentXp < 300)
      return { title: 'Karting', min: 0, max: 300, color: '#cd7f32', level: 1 }
    if (currentXp < 700)
      return {
        title: 'Fórmula 3',
        min: 300,
        max: 700,
        color: '#c0c0c0',
        level: 2
      }
    if (currentXp < 1200)
      return {
        title: 'Fórmula 2',
        min: 700,
        max: 1200,
        color: '#ffd700',
        level: 3
      }
    if (currentXp < 1600)
      return {
        title: 'Piloto Reserva',
        min: 1200,
        max: 1600,
        color: '#00d2be',
        level: 4
      }
    if (currentXp < 1800)
      return {
        title: 'Titular F1',
        min: 1600,
        max: 1800,
        color: '#e10600',
        level: 5
      }
    return {
      title: 'Campeón del Mundo',
      min: 1800,
      max: 1800,
      color: '#b800ff',
      level: 6
    }
  }

  const levelInfo = getLevelInfo(xp)

  // Calcula cuánto se llena la barra visualmente (0% a 100%)
  const progressPercentage =
    levelInfo.level === 6
      ? 100
      : ((xp - levelInfo.min) / (levelInfo.max - levelInfo.min)) * 100

  // --- EFECTOS DE TELEMETRÍA ---
  const fetchXP = async () => {
    if (user?.id) {
      try {
        const response = await api.get(`/progress/${user.id}/xp`)
        setXp(response.data.xp)
      } catch (error) {
        console.error('Error cargando telemetría de XP', error)
      }
    }
  }

  useEffect(() => {
    fetchXP()
    // Escuchador Mágico: Si la Academia grita "xpUpdated", el Navbar se actualiza solo
    window.addEventListener('xpUpdated', fetchXP)
    return () => window.removeEventListener('xpUpdated', fetchXP)
  }, [user?.id])

  // --- MANEJADORES ---
  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/login'
  }

  // --- RENDERIZADO VISUAL ---
  return (
    <nav
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '15px 30px',
        backgroundColor: '#1a1a1f',
        borderBottom: '1px solid #333',
        boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
        position: 'sticky',
        top: 0,
        zIndex: 1000
      }}
    >
      {/* 1. Logotipo */}
      <div className='navbar-brand'>
        <Link
          to='/'
          style={{
            color: '#fff',
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: '800',
            fontSize: '20px'
          }}
        >
          🏎️ Formula Basics
        </Link>
      </div>

      {/* 2. Barra de Revoluciones (Gamificación) */}
      {user && (
        <div
          className='xp-container'
          style={{
            flex: 1,
            maxWidth: '300px',
            margin: '0 30px',
            backgroundColor: '#2a2a35',
            padding: '8px 15px',
            borderRadius: '12px',
            border: `1px solid ${levelInfo.color}40`
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '5px',
              fontSize: '12px',
              fontWeight: 'bold'
            }}
          >
            <span
              style={{ color: levelInfo.color, textTransform: 'uppercase' }}
            >
              {levelInfo.title}
            </span>
            <span style={{ color: '#aaa' }}>
              {xp} XP {levelInfo.level < 6 && `/ ${levelInfo.max}`}
            </span>
          </div>
          <div
            style={{
              width: '100%',
              height: '6px',
              backgroundColor: '#15151e',
              borderRadius: '3px',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                width: `${progressPercentage}%`,
                height: '100%',
                backgroundColor: levelInfo.color,
                boxShadow: `0 0 10px ${levelInfo.color}`,
                transition: 'width 0.5s ease-out'
              }}
            ></div>
          </div>
        </div>
      )}

      {/* Botón Hamburguesa para Móviles */}
      <button className='hamburger' onClick={() => setMenuOpen(!menuOpen)}>
        {menuOpen ? '✖' : '☰'}
      </button>

      {/* 3. Menú de Navegación */}
      <div className={`nav-links ${menuOpen ? 'active' : ''}`}>
        <Link
          to='/academy'
          className='nav-link'
          style={{ color: '#005AFF' }}
          onClick={() => setMenuOpen(false)}
        >
          Academia
        </Link>
        <Link
          to='/drivers'
          className='nav-link'
          onClick={() => setMenuOpen(false)}
        >
          Pilotos
        </Link>
        <Link
          to='/teams'
          className='nav-link'
          onClick={() => setMenuOpen(false)}
        >
          Equipos
        </Link>
        <Link
          to='/standings'
          className='nav-link'
          onClick={() => setMenuOpen(false)}
        >
          Mundial
        </Link>
        <Link
          to='/races'
          className='nav-link'
          onClick={() => setMenuOpen(false)}
        >
          Calendario
        </Link>
        <button
          className='btn-primary'
          onClick={() => {
            setMenuOpen(false)
            handleLogout()
          }}
          style={{ padding: '8px 18px', marginLeft: '10px' }}
        >
          Salir
        </button>
      </div>
    </nav>
  )
}
