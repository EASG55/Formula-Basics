/**
 * 🧩 COMPONENTE MÁGICO: API WIDGET (El Ojo a la FIA)
 * Esto es pura ingeniería. Recibe un string (ej: "QUALY_RESULTS_3"),
 * lo trocea y averigua qué tiene que pedirle a la API de Jolpica.
 * Después, formatea esos datos técnicos en una tabla visual limpia
 * que puede inyectarse en cualquier parte de un bloque de texto de la Academia.
 */

import { useState, useEffect } from 'react'
import axios from 'axios'

export default function ApiWidget({ type }) {
  // --- ESTADOS ---
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  // --- EFECTOS (Decodificación y Llamada) ---
  useEffect(() => {
    const fetchJolpicaData = async () => {
      setLoading(true)
      try {
        // Rompemos el string para saber qué pedir (Ej: RACE_RESULTS_1 -> Round = 1)
        const parts = type.split('_')
        const round = parts.pop()
        const widgetType = parts.join('_')
        const year = '2026'

        let formattedData = null

        // 🟢 MODO 1: TABLA DE CARRERA (Top 10)
        if (widgetType === 'RACE_RESULTS') {
          const res = await axios.get(
            `https://api.jolpi.ca/ergast/f1/${year}/${round}/results.json`
          )
          const race = res.data.MRData.RaceTable.Races[0]
          if (race?.Results.length > 0) {
            const top10 = race.Results.slice(0, 10).map((r) => ({
              position: r.position,
              driver: `${r.Driver.givenName} ${r.Driver.familyName}`,
              team: r.Constructor.name,
              points: r.points
            }))
            formattedData = {
              title: `Top 10 - Carrera - GP de ${race.Circuit.Location.country}`,
              widgetType: 'race',
              top10
            }
          }
        }

        // 🔵 MODO 2: TIEMPOS DE CLASIFICACIÓN (Q3)
        else if (widgetType === 'QUALY_RESULTS') {
          const res = await axios.get(
            `https://api.jolpi.ca/ergast/f1/${year}/${round}/qualifying.json`
          )
          const race = res.data.MRData.RaceTable.Races[0]
          if (race?.QualifyingResults.length > 0) {
            const p1 = race.QualifyingResults[0]
            const p2 = race.QualifyingResults[1]
            const p1Time = p1.Q3 || p1.Q2 || p1.Q1
            const p2Time = p2 ? p2.Q3 || p2.Q2 || p2.Q1 : null
            // Cálculo rudimentario de distancias en pista (segundos)
            let gap = p2Time
              ? `+${(parseFloat(p2Time.replace(':', '.')) - parseFloat(p1Time.replace(':', '.'))).toFixed(3)}s`
              : ''
            formattedData = {
              title: `Clasificación - GP de ${race.Circuit.Location.country}`,
              widgetType: 'qualy',
              pole: `${p1.Driver.givenName} ${p1.Driver.familyName}`,
              poleTime: p1Time,
              p2: p2 ? `${p2.Driver.givenName} ${p2.Driver.familyName}` : '',
              p2Time,
              gap
            }
          }
        }

        // 🔴 MODO 3: ESTADO DEL MUNDIAL DE CONSTRUCTORES
        else if (widgetType === 'STANDINGS') {
          const res = await axios.get(
            `https://api.jolpi.ca/ergast/f1/${year}/${round}/constructorStandings.json`
          )
          const standings = res.data.MRData.StandingsTable.StandingsLists[0]
          if (standings?.ConstructorStandings.length > 0) {
            const leader = standings.ConstructorStandings[0]
            const second = standings.ConstructorStandings[1]
            formattedData = {
              title: `Constructores - Post Ronda ${round}`,
              widgetType: 'standings',
              leader: leader.Constructor.name,
              total: `${leader.points} pts`,
              gap: `+${second ? leader.points - second.points : 0} pts`
            }
          }
        }

        if (formattedData) setData(formattedData)
        else setError('Datos no disponibles en la API aún.')
      } catch (err) {
        setError('Error de conexión con la central de la FIA.')
      } finally {
        setLoading(false)
      }
    }
    if (type) fetchJolpicaData()
  }, [type])

  // --- RENDERIZADO VISUAL ---
  if (loading)
    return (
      <div className='widget-container'>
        📡 Solicitando datos en vivo a la FIA... [{type}]
      </div>
    )
  if (error) return <div className='widget-container'>⚠️ {error}</div>
  if (!data) return null

  return (
    <div className='widget-container'>
      <h4 className='widget-title'>{data.title}</h4>

      {/* Dibuja la tabla de carrera */}
      {data.widgetType === 'race' && (
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '14px',
            textAlign: 'left'
          }}
        >
          <thead>
            <tr style={{ borderBottom: '2px solid #334155', color: '#94a3b8' }}>
              <th>Pos</th>
              <th>Piloto</th>
              <th>Equipo</th>
              <th>Pts</th>
            </tr>
          </thead>
          <tbody>
            {data.top10.map((r) => (
              <tr
                key={r.position}
                style={{ borderBottom: '1px solid #1e293b' }}
              >
                <td style={{ padding: '8px', color: '#fbbf24' }}>
                  {r.position}
                </td>
                <td style={{ padding: '8px', color: '#e2e8f0' }}>{r.driver}</td>
                <td style={{ padding: '8px', color: '#94a3b8' }}>{r.team}</td>
                <td style={{ padding: '8px', color: '#4ade80' }}>
                  +{r.points}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Dibuja los duelos de clasificación */}
      {data.widgetType === 'qualy' && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-around',
            margin: '15px 0'
          }}
        >
          <div>
            <p style={{ color: '#94a3b8', fontSize: '12px', margin: 0 }}>
              Pole Position
            </p>
            <p
              style={{
                color: '#38bdf8',
                fontSize: '18px',
                margin: 0,
                fontWeight: 'bold'
              }}
            >
              {data.pole}
            </p>
            <p style={{ color: '#4ade80', margin: 0 }}>{data.poleTime}</p>
          </div>
          {data.p2 && (
            <div>
              <p style={{ color: '#94a3b8', fontSize: '12px', margin: 0 }}>
                P2
              </p>
              <p
                style={{
                  color: '#e2e8f0',
                  fontSize: '18px',
                  margin: 0,
                  fontWeight: 'bold'
                }}
              >
                {data.p2}
              </p>
              <p style={{ color: '#4ade80', margin: 0 }}>{data.p2Time}</p>
            </div>
          )}
        </div>
      )}

      {/* Dibuja los puntos del mundial */}
      {data.widgetType === 'standings' && (
        <div>
          <p style={{ color: '#94a3b8' }}>
            Líder:{' '}
            <strong style={{ color: '#38bdf8', fontSize: '18px' }}>
              {data.leader}
            </strong>
          </p>
          <p style={{ color: '#94a3b8' }}>
            Puntos:{' '}
            <strong style={{ color: '#4ade80', fontSize: '18px' }}>
              {data.total}
            </strong>
          </p>
          <p style={{ marginTop: '10px', color: '#fbbf24' }}>
            Diferencia: <strong>{data.gap}</strong>
          </p>
        </div>
      )}
    </div>
  )
}
