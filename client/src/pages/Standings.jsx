/**
 * 🏆 COMPONENTE: STANDINGS (Clasificación Mundial)
 * El muro de control de la temporada.
 * ¡Arquitectura Offline-First! Consulta el archivo JSON pre-descargado
 * por nuestro servidor backend para evitar retrasos de red o caídas de la API.
 */

import { useState, useEffect } from 'react'
import api from '../utils/axiosConfig'
import { getTeamColor } from '../utils/f1Colors'

export default function Standings() {
  // --- ESTADOS ---
  const [activeTab, setActiveTab] = useState('drivers') // Controla si vemos pilotos o equipos
  const [driverStandings, setDriverStandings] = useState([])
  const [constructorStandings, setConstructorStandings] = useState([])
  const [lastUpdate, setLastUpdate] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // --- EFECTOS (Descarga de Caché) ---
  useEffect(() => {
    const fetchStandings = async () => {
      setLoading(true)
      try {
        // Solicitamos los datos ultra-rápidos al backend propio
        const response = await api.get('/standings')
        setDriverStandings(response.data.drivers)
        setConstructorStandings(response.data.constructors)
        setLastUpdate(response.data.lastUpdate)
      } catch (err) {
        setError(
          err.response?.data?.error || 'Error de conexión con la base central.'
        )
      } finally {
        setLoading(false)
      }
    }
    fetchStandings()
  }, [])

  // --- RENDERIZADO VISUAL ---
  return (
    <div className='page-container' style={{ maxWidth: '900px' }}>
      {/* 1. Cabecera y Reloj de actualización */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          marginBottom: '30px'
        }}
      >
        <h2 className='page-title' style={{ marginBottom: 0 }}>
          🏆 Clasificación del Mundial
        </h2>
        {lastUpdate && (
          <span style={{ color: '#888', fontSize: '12px', fontWeight: 'bold' }}>
            Última act: {lastUpdate}
          </span>
        )}
      </div>

      {/* 2. Selector de Pestañas (Tabs) */}
      <div
        style={{
          display: 'flex',
          gap: '15px',
          marginBottom: '30px',
          justifyContent: 'center'
        }}
      >
        <button
          onClick={() => setActiveTab('drivers')}
          className='btn-primary'
          style={{
            backgroundColor: activeTab === 'drivers' ? '#e10600' : '#333'
          }}
        >
          🏎️ Mundial de Pilotos
        </button>
        <button
          onClick={() => setActiveTab('constructors')}
          className='btn-primary'
          style={{
            backgroundColor: activeTab === 'constructors' ? '#e10600' : '#333'
          }}
        >
          🛡️ Mundial de Constructores
        </button>
      </div>

      {error && <p className='error-message'>{error}</p>}
      {loading && (
        <p style={{ textAlign: 'center', color: '#aaa', margin: '50px 0' }}>
          📡 Procesando telemetría de la FIA...
        </p>
      )}

      {/* 3. Tablas de Clasificación (List-Rows) */}
      {!loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* TABLA A: PILOTOS */}
          {activeTab === 'drivers' &&
            driverStandings.map((driver) => (
              <div
                key={driver.Driver.driverId}
                className='list-row'
                style={{
                  borderLeft: `6px solid ${getTeamColor(driver.Constructors[0]?.name)}`
                }}
              >
                <div
                  className='pos-number'
                  style={{
                    color: driver.position === '1' ? '#FFD700' : '#fff'
                  }}
                >
                  {driver.position}
                </div>
                <div style={{ flexGrow: 1 }}>
                  <h3
                    style={{ margin: 0, fontSize: '20px', fontWeight: '800' }}
                  >
                    {driver.Driver.givenName} {driver.Driver.familyName}
                  </h3>
                  <p
                    style={{
                      margin: 0,
                      color: '#aaa',
                      fontSize: '12px',
                      textTransform: 'uppercase',
                      fontWeight: 'bold'
                    }}
                  >
                    {driver.Constructors[0]?.name || 'Sin Equipo'}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p
                    style={{
                      margin: 0,
                      fontSize: '24px',
                      fontWeight: '800',
                      color: '#fff'
                    }}
                  >
                    {driver.points}{' '}
                    <span style={{ fontSize: '14px', color: '#aaa' }}>pts</span>
                  </p>
                  {driver.wins > 0 && (
                    <p
                      style={{
                        margin: 0,
                        fontSize: '12px',
                        color: '#FFD700',
                        fontWeight: 'bold'
                      }}
                    >
                      🏆 {driver.wins} Victorias
                    </p>
                  )}
                </div>
              </div>
            ))}

          {/* TABLA B: CONSTRUCTORES */}
          {activeTab === 'constructors' &&
            constructorStandings.map((team) => (
              <div
                key={team.Constructor.constructorId}
                className='list-row'
                style={{
                  borderLeft: `6px solid ${getTeamColor(team.Constructor.name)}`
                }}
              >
                <div
                  className='pos-number'
                  style={{ color: team.position === '1' ? '#FFD700' : '#fff' }}
                >
                  {team.position}
                </div>
                <div style={{ flexGrow: 1 }}>
                  <h3
                    style={{ margin: 0, fontSize: '22px', fontWeight: '800' }}
                  >
                    {team.Constructor.name}
                  </h3>
                  <p
                    style={{
                      margin: 0,
                      color: '#aaa',
                      fontSize: '12px',
                      textTransform: 'uppercase',
                      fontWeight: 'bold'
                    }}
                  >
                    🌍 {team.Constructor.nationality}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p
                    style={{
                      margin: 0,
                      fontSize: '24px',
                      fontWeight: '800',
                      color: '#fff'
                    }}
                  >
                    {team.points}{' '}
                    <span style={{ fontSize: '14px', color: '#aaa' }}>pts</span>
                  </p>
                  {team.wins > 0 && (
                    <p
                      style={{
                        margin: 0,
                        fontSize: '12px',
                        color: '#FFD700',
                        fontWeight: 'bold'
                      }}
                    >
                      🏆 {team.wins} Victorias
                    </p>
                  )}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}
