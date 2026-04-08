/**
 * 🛡️ COMPONENTE: TEAMS (Escuderías / Constructores)
 * Muestra el panel con todos los equipos inscritos en la temporada 2026.
 * * ARQUITECTURA:
 * Al igual que los pilotos, la información base vive en nuestra DB PostgreSQL.
 * Para el historial pesado de victorias y mundiales, recurrimos a nuestra caché
 * local del servidor, evitando peticiones masivas a servidores de terceros.
 */

import { useState, useEffect } from 'react'
import api from '../utils/axiosConfig'
import { getTeamColor } from '../utils/f1Colors'

export default function Teams() {
  // --- 📦 ESTADOS DEL COMPONENTE ---
  const [teams, setTeams] = useState([]) // Almacena el listado de escuderías
  const [error, setError] = useState('') // Mensajes de fallo en la red

  // Estados para controlar el Modal (Ventana flotante) de Palmarés
  const [selectedTeam, setSelectedTeam] = useState(null)
  const [teamStats, setTeamStats] = useState(null)
  const [loadingStats, setLoadingStats] = useState(false)

  // --- ⚙️ CICLO DE VIDA (useEffect) ---
  useEffect(() => {
    /**
     * Descarga la lista de constructores desde nuestra base de datos.
     */
    const fetchTeams = async () => {
      try {
        const response = await api.get('/constructors')
        setTeams(response.data)
      } catch (err) {
        setError('Error fatal al cargar las escuderías desde la base de datos.')
      }
    }
    fetchTeams()
  }, [])

  // --- 🖱️ MANEJADORES DE EVENTOS ---
  /**
   * Abre el modal del equipo y consulta el historial a la centralita local.
   * Evita problemas de Rate Limiting (Error 429) de APIs externas.
   * * @param {Object} team - Objeto con los datos de la escudería seleccionada.
   */
  const handleTeamClick = async (team) => {
    setSelectedTeam(team)
    setTeamStats(null)
    setLoadingStats(true)

    try {
      const response = await api.get(`/stats/teams/${team.external_id}`)
      setTeamStats(response.data)
    } catch (err) {
      setTeamStats({
        error: 'Palmarés histórico no disponible (Caché en proceso)'
      })
    } finally {
      setLoadingStats(false)
    }
  }

  // --- 🎨 RENDERIZADO VISUAL ---
  return (
    <div className='page-container'>
      {/* Cabecera de la página */}
      <h2 className='page-title'>Escuderías</h2>
      {error && <p className='error-message'>{error}</p>}

      {/* 1. GRILLA PRINCIPAL DE EQUIPOS (3 Tarjetas por fila) */}
      <div className='grid-container'>
        {teams.map((team) => (
          <div
            key={team.external_id}
            className='modern-card'
            onClick={() => handleTeamClick(team)}
            style={{
              borderTop: `6px solid ${getTeamColor(team.name)}`,
              cursor: 'pointer'
            }}
          >
            {/* LOGOTIPO DE EQUIPO: Uso de clases CSS para evitar deformaciones en PNGs */}
            <div className='team-logo-container'>
              <img
                src={`/assets/teams/${team.external_id}.png`}
                alt={`Logo ${team.name}`}
                onError={(e) => {
                  e.target.onerror = null
                  e.target.src = '/assets/teams/default_team.png'
                }}
                className='team-logo-img'
              />
            </div>

            <h3 className='driver-name'>{team.name}</h3>
            <p
              style={{
                color: '#888',
                fontWeight: '600',
                marginBottom: '10px',
                fontSize: '12px',
                textTransform: 'uppercase'
              }}
            >
              Base: {team.base || 'Desconocida'}
            </p>
            <p style={{ margin: 0, color: '#aaa', fontSize: '14px' }}>
              🌍 {team.nationality}
            </p>
          </div>
        ))}
      </div>

      {/* 2. MODAL FLOTANTE DE PALMARÉS (Se superpone al contenido) */}
      {selectedTeam && (
        <div className='glass-overlay' onClick={() => setSelectedTeam(null)}>
          <div
            className='glass-modal'
            onClick={(e) => e.stopPropagation()}
            style={{
              borderTop: `6px solid ${getTeamColor(selectedTeam.name)}`
            }}
          >
            <h3
              style={{
                margin: '0 0 5px 0',
                fontSize: '28px',
                color: '#fff',
                fontWeight: '800'
              }}
            >
              {selectedTeam.name}
            </h3>
            <p
              style={{
                color: getTeamColor(selectedTeam.name),
                fontWeight: 'bold',
                marginTop: 0,
                textTransform: 'uppercase',
                fontSize: '12px'
              }}
            >
              Palmarés Histórico
            </p>

            {loadingStats ? (
              <p style={{ color: '#aaa', margin: '40px 0' }}>
                📡 Conectando con la centralita local...
              </p>
            ) : teamStats?.error ? (
              <p className='error-message' style={{ marginTop: '20px' }}>
                {teamStats.error}
              </p>
            ) : teamStats ? (
              /* RECUADROS DE ESTADÍSTICAS (Usa el grid de 3 columnas del CSS) */
              <div className='stats-grid'>
                <div className='stat-box'>
                  <p className='stat-title'>Victorias</p>
                  <p className='stat-value' style={{ color: '#FFD700' }}>
                    {teamStats.wins}
                  </p>
                </div>
                <div className='stat-box'>
                  <p className='stat-title'>Podios</p>
                  <p className='stat-value' style={{ color: '#C0C0C0' }}>
                    {teamStats.podiums}
                  </p>
                </div>
                <div className='stat-box'>
                  <p className='stat-title'>Mundiales</p>
                  <p className='stat-value' style={{ color: '#fff' }}>
                    {teamStats.championships}
                  </p>
                </div>
              </div>
            ) : null}

            <button
              onClick={() => setSelectedTeam(null)}
              className='btn-primary'
              style={{ width: '100%', backgroundColor: '#333' }}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
