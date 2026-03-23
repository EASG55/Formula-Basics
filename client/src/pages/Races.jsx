import { useState, useEffect } from 'react'
import axios from 'axios'

export default function Races() {
  const [races, setRaces] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchRaces = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/races')
        setRaces(response.data)
      } catch (err) {
        setError('Error al cargar el calendario de la base de datos')
      }
    }
    fetchRaces()
  }, [])

  // Obtenemos la fecha de hoy
  const currentDate = new Date()

  // Buscamos la primera carrera del calendario que aún no haya ocurrido
  const nextRace = races.find((race) => new Date(race.date) >= currentDate)

  // Guardamos su ID para saber a qué fila aplicarle los colores especiales
  const nextRaceId = nextRace ? nextRace.external_id : null

  return (
    <div className='page-container'>
      <h2 className='page-title'>🏁 Calendario Completo - Temporada 2026</h2>
      {error && <p className='error-message'>{error}</p>}

      {races.length === 0 && !error && (
        <p className='empty-message'>
          No hay carreras guardadas en la base de datos.
        </p>
      )}

      <div className='table-card'>
        <table className='f1-table'>
          <thead>
            <tr>
              <th style={{ width: '15%' }}>Ronda</th>
              <th style={{ width: '35%' }}>Gran Premio</th>
              <th style={{ width: '30%' }}>Circuito</th>
              <th style={{ width: '20%' }}>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {races.map((race) => (
              <tr
                key={race.external_id}
                className={
                  race.external_id === nextRaceId ? 'tr-next-race' : ''
                }
              >
                <td className='td-round'>
                  {race.round}
                  {/* Si es la próxima carrera, pintamos un pequeño badge rojo */}
                  {race.external_id === nextRaceId && (
                    <span className='badge-next'>PRÓXIMA</span>
                  )}
                </td>
                <td className='td-name'>{race.name}</td>
                <td className='td-circuit'>{race.circuit_name}</td>
                <td className='td-date'>
                  {new Date(race.date).toLocaleDateString('es-ES', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
