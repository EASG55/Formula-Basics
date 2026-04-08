/**
 * 📅 COMPONENTE: RACES (Calendario Oficial)
 * El itinerario global. Calcula de forma automática cuál es la
 * "Próxima Carrera" basada en la fecha del sistema, e ilumina
 * la tarjeta correspondiente en verde neón.
 */

import { useState, useEffect } from 'react'
import api from '../utils/axiosConfig'
import { getTeamColor } from '../utils/f1Colors'

export default function Races() {
  // --- ESTADOS ---
  const [races, setRaces] = useState([])
  const [error, setError] = useState('')
  const [nextRaceId, setNextRaceId] = useState(null) // Rastreador de evento inminente

  // Modales y Podios
  const [selectedRace, setSelectedRace] = useState(null)
  const [podium, setPodium] = useState(null)
  const [loadingPodium, setLoadingPodium] = useState(false)

  // --- EFECTOS ---
  useEffect(() => {
    const fetchRaces = async () => {
      try {
        const response = await api.get('/races')
        setRaces(response.data)

        // ⏱️ Lógica de Tiempo Real: Busca la primera fecha igual o mayor a "Hoy"
        const hoy = new Date()
        hoy.setHours(0, 0, 0, 0)
        const next = response.data.find((r) => new Date(r.date) >= hoy)
        if (next) setNextRaceId(next.id)
      } catch (err) {
        setError('Error al sincronizar el calendario.')
      }
    }
    fetchRaces()
  }, [])

  // --- MANEJADORES ---
  const handleRaceClick = async (race) => {
    setSelectedRace(race)
    setPodium(null)
    setLoadingPodium(true)
    try {
      // Pide a nuestra DB quiénes subieron al podio
      const response = await api.get(`/races/${race.id}/podium`)
      setPodium(response.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingPodium(false)
    }
  }

  // Utilidad para pintar medallas
  const getPositionColor = (pos) =>
    pos === 1
      ? '#FFD700'
      : pos === 2
        ? '#C0C0C0'
        : pos === 3
          ? '#CD7F32'
          : '#fff'

  // --- RENDERIZADO VISUAL ---
  return (
    <div className='page-container'>
      <h2 className='page-title'>Calendario Oficial</h2>
      {error && <p className='error-message'>{error}</p>}

      {/* 1. Muro del Calendario (Grid) */}
      <div className='grid-container'>
        {races.map((race) => {
          const isNextRace = race.id === nextRaceId
          return (
            <div
              key={race.id}
              className='modern-card'
              onClick={() => handleRaceClick(race)}
              style={{
                borderTop: `6px solid ${isNextRace ? '#00ff00' : '#e10600'}`,
                cursor: 'pointer',
                transform: isNextRace ? 'scale(1.03)' : 'none',
                boxShadow: isNextRace
                  ? '0 10px 25px rgba(0, 255, 0, 0.2)'
                  : 'none'
              }}
            >
              {/* Etiqueta Especial "Next" */}
              {isNextRace && (
                <div
                  style={{
                    position: 'absolute',
                    top: '-15px',
                    right: '-10px',
                    backgroundColor: '#00ff00',
                    color: '#000',
                    padding: '6px 14px',
                    borderRadius: '20px',
                    fontWeight: '800',
                    fontSize: '11px',
                    textTransform: 'uppercase'
                  }}
                >
                  Próxima
                </div>
              )}

              <div
                style={{
                  color: isNextRace ? '#00ff00' : '#e10600',
                  fontSize: '28px',
                  fontWeight: '800',
                  fontFamily: 'monospace'
                }}
              >
                Ronda {race.round}
              </div>
              <h3
                style={{ margin: '5px 0', fontSize: '22px', fontWeight: '800' }}
              >
                {race.name}
              </h3>
              <p
                style={{
                  color: '#aaa',
                  fontWeight: '600',
                  marginBottom: '15px',
                  fontSize: '14px'
                }}
              >
                {new Date(race.date).toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
              <p style={{ margin: '5px 0', color: '#888', fontSize: '13px' }}>
                📍 {race.circuit_name}
              </p>
              <p style={{ margin: 0, color: '#888', fontSize: '13px' }}>
                🌍 {race.city}, {race.country}
              </p>
            </div>
          )
        })}
      </div>

      {/* 2. MODAL DE RESULTADOS DE CARRERA (Podio) */}
      {selectedRace && (
        <div className='glass-overlay' onClick={() => setSelectedRace(null)}>
          <div
            className='glass-modal'
            style={{ maxWidth: '550px', borderTop: `6px solid #e10600` }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              style={{
                margin: '0 0 5px 0',
                fontSize: '28px',
                color: '#fff',
                fontWeight: '800'
              }}
            >
              {selectedRace.name}
            </h3>
            <p
              style={{
                color: '#888',
                marginTop: 0,
                textTransform: 'uppercase',
                fontSize: '12px',
                fontWeight: 'bold'
              }}
            >
              Resultados Oficiales
            </p>

            {loadingPodium ? (
              <p style={{ color: '#aaa', margin: '40px 0' }}>
                📡 Reclamando tiempos a los comisarios...
              </p>
            ) : podium && podium.length > 0 ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  margin: '30px 0'
                }}
              >
                {podium.map((p) => (
                  <div
                    key={p.position}
                    className='list-row'
                    style={{
                      borderLeft: `6px solid ${getTeamColor(p.team_name)}`,
                      marginBottom: 0
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '20px',
                        flexGrow: 1
                      }}
                    >
                      <span
                        style={{
                          fontSize: '26px',
                          fontWeight: '800',
                          color: getPositionColor(p.position),
                          width: '40px',
                          textAlign: 'center'
                        }}
                      >
                        P{p.position}
                      </span>
                      <div style={{ textAlign: 'left' }}>
                        <p
                          style={{
                            margin: 0,
                            color: '#fff',
                            fontWeight: '800',
                            fontSize: '18px'
                          }}
                        >
                          {p.driver_name}
                        </p>
                        <p
                          style={{
                            margin: '4px 0 0 0',
                            color: '#aaa',
                            fontSize: '12px',
                            textTransform: 'uppercase',
                            fontWeight: 'bold'
                          }}
                        >
                          {p.team_name}
                        </p>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p
                        style={{
                          margin: 0,
                          color: '#fff',
                          fontFamily: 'monospace',
                          fontSize: '16px',
                          fontWeight: 'bold'
                        }}
                      >
                        ⏱️ {p.time_gap}
                      </p>
                      <p
                        style={{
                          margin: '4px 0 0 0',
                          color: '#e10600',
                          fontWeight: '800',
                          fontSize: '14px'
                        }}
                      >
                        +{p.points} pts
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className='error-message' style={{ margin: '40px 0' }}>
                🛑 Esta carrera aún no se ha disputado
              </div>
            )}
            <button
              onClick={() => setSelectedRace(null)}
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
