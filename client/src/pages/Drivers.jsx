import { useState, useEffect } from 'react'
import axios from 'axios'
import { getTeamColor } from '../utils/f1Colors'

export default function Drivers() {
  const [drivers, setDrivers] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/drivers')
        setDrivers(response.data)
      } catch (err) {
        setError('Error al cargar los pilotos')
      }
    }
    fetchDrivers()
  }, [])

  return (
    <div className='page-container'>
      <h2 className='page-title'>🏎️ Pilotos Confirmados - Temporada 2026</h2>

      {error && <p className='error-message'>{error}</p>}

      {drivers.length === 0 && !error && (
        <p className='empty-message'>
          No hay pilotos guardados en la base de datos.
        </p>
      )}

      <div className='driver-grid'>
        {drivers.map((driver) => (
          <div
            key={driver.external_id}
            className='driver-card'
            style={{ borderTop: `8px solid ${getTeamColor(driver.team_name)}` }}
          >
            <div className='driver-number'>#{driver.number || '?'}</div>
            <h3 className='driver-name'>{driver.fullname}</h3>

            {/* Aquí mostramos el equipo del piloto */}
            <p
              style={{
                color: '#ccc',
                fontWeight: 'bold',
                marginBottom: '15px'
              }}
            >
              {driver.team_name || 'Sin equipo'}
            </p>

            <p className='driver-country'>🌍 {driver.country}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
