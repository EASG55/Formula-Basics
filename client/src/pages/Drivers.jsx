/**
 * 🏎️ COMPONENTE: DRIVERS (La Parrilla de Pilotos)
 * Visualizador de la parrilla oficial de la temporada.
 * * ARQUITECTURA:
 * 1. Carga la información básica (nombre, foto, escudería) directamente
 * desde nuestra base de datos PostgreSQL local para máxima velocidad.
 * 2. Al hacer clic en un piloto, no colapsamos la API externa. Le pedimos
 * los datos históricos a la caché local generada por el servidor (Mecánico 2).
 */

import { useState, useEffect } from 'react'
import api from '../utils/axiosConfig'
import { getTeamColor } from '../utils/f1Colors'

export default function Drivers() {
  // --- 📦 ESTADOS DEL COMPONENTE ---
  const [drivers, setDrivers] = useState([]) // Almacena el array de pilotos desde la DB
  const [error, setError] = useState('') // Mensajes de fallo en la red

  // Estados para controlar el Modal (Ventana flotante) de Telemetría
  const [selectedDriver, setSelectedDriver] = useState(null)
  const [driverStats, setDriverStats] = useState(null)
  const [loadingStats, setLoadingStats] = useState(false)

  // --- ⚙️ CICLO DE VIDA (useEffect) ---
  useEffect(() => {
    /**
     * Descarga la lista de pilotos desde nuestra propia base de datos (PostgreSQL)
     * Nada más montar el componente.
     */
    const fetchDrivers = async () => {
      try {
        const response = await api.get('/drivers')
        setDrivers(response.data)
      } catch (err) {
        setError('Error fatal al cargar los pilotos de la base de datos.')
      }
    }
    fetchDrivers()
  }, [])

  // --- 🖱️ MANEJADORES DE EVENTOS ---
  /**
   * Se dispara al seleccionar una tarjeta de piloto.
   * Consulta el archivo de caché local (stats_backup.json en el servidor)
   * para obtener su palmarés sin depender de la latencia de internet.
   * * @param {Object} driver - Objeto con los datos base del piloto seleccionado.
   */
  const handleDriverClick = async (driver) => {
    setSelectedDriver(driver)
    setDriverStats(null)
    setLoadingStats(true)

    try {
      const response = await api.get(`/stats/drivers/${driver.external_id}`)
      setDriverStats(response.data)
    } catch (err) {
      setDriverStats({
        error: 'Telemetría histórica no disponible (Caché en proceso)'
      })
    } finally {
      setLoadingStats(false)
    }
  }

  // --- 🎨 RENDERIZADO VISUAL ---
  return (
    <div className='page-container'>
      {/* Cabecera de la página */}
      <h2 className='page-title'>La Parrilla</h2>

      {/* Manejo de errores o estados vacíos */}
      {error && <p className='error-message'>{error}</p>}
      {drivers.length === 0 && !error && (
        <p className='empty-message'>Parrilla vacía en la base de datos.</p>
      )}

      {/* 1. GRILLA PRINCIPAL DE PILOTOS (3 Tarjetas por fila) */}
      <div className='grid-container'>
        {drivers.map((driver) => {
          // Extraemos el color corporativo para decorar la tarjeta y la foto
          const teamColor = getTeamColor(driver.team_name)

          return (
            <div
              key={driver.external_id}
              className='modern-card'
              onClick={() => handleDriverClick(driver)}
              style={{ borderTop: `6px solid ${teamColor}`, cursor: 'pointer' }}
            >
              {/* DORSAL F1: Posicionado arriba a la derecha con la clase .driver-badge */}
              <div className='driver-badge' style={{ color: teamColor }}>
                {driver.number || '?'}
              </div>

              {/* AVATAR: Con sombra de resplandor (Glow) del color del equipo */}
              <img
                src={`/assets/drivers/${driver.external_id}.png`}
                alt={`Foto de ${driver.fullname}`}
                onError={(e) => {
                  e.target.onerror = null
                  e.target.src = '/assets/drivers/default.png'
                }}
                style={{
                  width: '130px',
                  height: '130px',
                  objectFit: 'cover',
                  borderRadius: '50%',
                  margin: '10px auto 20px auto',
                  display: 'block',
                  backgroundColor: '#2a2a35',
                  border: `4px solid ${teamColor}`,
                  boxShadow: `0 8px 25px ${teamColor}40` // Resplandor corporativo
                }}
              />

              <h3 className='driver-name'>{driver.fullname}</h3>
              <p
                style={{
                  color: '#aaa',
                  fontWeight: '600',
                  marginBottom: '15px',
                  textTransform: 'uppercase',
                  fontSize: '12px'
                }}
              >
                {driver.team_name || 'Sin equipo'}
              </p>
              <p style={{ margin: 0, color: '#888', fontSize: '14px' }}>
                🌍 {driver.country}
              </p>
            </div>
          )
        })}
      </div>

      {/* 2. MODAL FLOTANTE DE TELEMETRÍA (Se superpone al contenido) */}
      {selectedDriver && (
        <div className='glass-overlay' onClick={() => setSelectedDriver(null)}>
          {/* stopPropagation evita que al hacer clic dentro de la caja negra se cierre el modal */}
          <div
            className='glass-modal'
            onClick={(e) => e.stopPropagation()}
            style={{
              borderTop: `6px solid ${getTeamColor(selectedDriver.team_name)}`
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
              {selectedDriver.fullname}
            </h3>
            <p
              style={{
                color: getTeamColor(selectedDriver.team_name),
                fontWeight: 'bold',
                marginTop: 0,
                textTransform: 'uppercase',
                fontSize: '12px'
              }}
            >
              Telemetría Histórica
            </p>

            {loadingStats ? (
              <p style={{ color: '#aaa', margin: '40px 0' }}>
                📡 Conectando con la centralita local...
              </p>
            ) : driverStats?.error ? (
              <p className='error-message' style={{ marginTop: '20px' }}>
                {driverStats.error}
              </p>
            ) : driverStats ? (
              /* RECUADROS DE ESTADÍSTICAS (Usa el grid de 3 columnas del CSS) */
              <div className='stats-grid'>
                <div className='stat-box'>
                  <p className='stat-title'>Victorias</p>
                  <p className='stat-value' style={{ color: '#FFD700' }}>
                    {driverStats.wins}
                  </p>
                </div>
                <div className='stat-box'>
                  <p className='stat-title'>Podios</p>
                  <p className='stat-value' style={{ color: '#C0C0C0' }}>
                    {driverStats.podiums}
                  </p>
                </div>
                <div className='stat-box'>
                  <p className='stat-title'>Pts 2026</p>
                  <p className='stat-value' style={{ color: '#fff' }}>
                    {driverStats.currentPoints}
                  </p>
                </div>
              </div>
            ) : null}

            <button
              onClick={() => setSelectedDriver(null)}
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
