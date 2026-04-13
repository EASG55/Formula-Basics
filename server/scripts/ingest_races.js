/**
 * 🏁 SCRIPT DE INGESTA DE CARRERAS (Datos Transaccionales)
 * Archivo: server/scripts/ingest_races.js
 * Descarga el calendario y los resultados de las carreras.
 * Además, vincula automáticamente a los pilotos con sus escuderías
 * basándose en los resultados de la carrera.
 */

const axios = require('axios')
const db = require('../db.js')

// --- 1. INGESTA DEL CALENDARIO ---
async function ingestRaces() {
  try {
    console.log('📅 Obteniendo calendario actualizado de la API...')
    const response = await axios.get('https://api.jolpi.ca/ergast/f1/2026.json')
    const races = response.data.MRData.RaceTable.Races

    const insertQuery = `
      INSERT INTO races (external_id, round, name, date, circuit_name, city, country)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (external_id) DO UPDATE SET
        date = EXCLUDED.date,
        name = EXCLUDED.name;
    `
    for (const race of races) {
      await db.query(insertQuery, [
        race.round.toString(),
        race.round,
        race.raceName,
        race.date,
        race.Circuit.circuitName,
        race.Circuit.Location.locality,
        race.Circuit.Location.country
      ])
    }
    console.log(`✅ Calendario actualizado.`)
  } catch (error) {
    console.error('❌ Error en carreras:', error.message)
  }
}

// --- 2. INGESTA DE RESULTADOS Y VÍNCULOS PILOTO-EQUIPO ---
async function ingestRaceResults() {
  try {
    console.log(
      '🏆 Obteniendo resultados históricos y actualizando asientos de pilotos...'
    )
    const response = await axios.get(
      'https://api.jolpi.ca/ergast/f1/2026/results.json?limit=1000'
    )
    const resultsRaces = response.data.MRData.RaceTable.Races

    for (const race of resultsRaces) {
      // Buscar ID de la carrera en nuestra BD
      const dbRace = await db.query('SELECT id FROM races WHERE round = $1', [
        race.round
      ])
      if (dbRace.rows.length === 0) continue
      const raceId = dbRace.rows[0].id

      for (const result of race.Results) {
        // Buscar IDs de piloto y equipo
        const dbDriver = await db.query(
          'SELECT id FROM drivers WHERE external_id = $1',
          [result.Driver.driverId]
        )
        const dbConstructor = await db.query(
          'SELECT id FROM constructors WHERE external_id = $1',
          [result.Constructor.constructorId]
        )

        if (dbDriver.rows.length > 0 && dbConstructor.rows.length > 0) {
          const driverId = dbDriver.rows[0].id
          const constructorId = dbConstructor.rows[0].id

          // 🔗 LA MAGIA DEL JOIN: Actualizamos la tabla del piloto para decirle cuál es su equipo actual
          await db.query(
            'UPDATE drivers SET constructor_id = $1 WHERE id = $2',
            [constructorId, driverId]
          )

          const timeGap = result.Time ? result.Time.time : result.status // "+2.3s" o "Retired"

          // Insertar o actualizar el resultado de la carrera
          const query = `
            INSERT INTO race_results (race_id, driver_id, constructor_id, position, points, grid, time_gap)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            ON CONFLICT (race_id, driver_id) DO UPDATE SET
              position = EXCLUDED.position,
              time_gap = EXCLUDED.time_gap,
              points = EXCLUDED.points
          `
          await db.query(query, [
            raceId,
            driverId,
            constructorId,
            result.position,
            result.points,
            result.grid,
            timeGap
          ])
        }
      }
    }
    console.log(
      `✅ Resultados procesados y Pilotos vinculados a sus Escuderías correctamente.`
    )
  } catch (error) {
    console.error('❌ Error en resultados:', error.message)
  }
}

// --- ORQUESTADOR DE CARRERAS ---
async function runRaceIngest() {
  console.log(
    '🚀 Iniciando ingesta de Datos Transaccionales (Carreras y Resultados)...'
  )
  try {
    await ingestRaces()
    await ingestRaceResults()
    console.log('🏁 Ingesta de Carreras finalizada.')
  } catch (error) {
    console.error('🛑 Error crítico:', error.message)
  } finally {
    await db.end()
  }
}

runRaceIngest()
