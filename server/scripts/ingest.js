/**
 * 🏭 SCRIPT DE INGESTA DE DATOS (Data Pipeline)
 * Archivo ejecutable independiente (`node ingest.js`).
 * Se encarga de descargar masivamente toda la información base de la temporada 2026
 * desde la API de Jolpica (Equipos, Pilotos, Calendario, Resultados) y poblar nuestra
 * base de datos PostgreSQL. Utiliza sentencias UPSERT (ON CONFLICT DO UPDATE)
 * para evitar duplicados.
 */

const axios = require('axios')
const db = require('../db.js') // Conexión a PostgreSQL

// --- 1. INGESTA DE CONSTRUCTORES (EQUIPOS) ---
async function ingestConstructors() {
  try {
    console.log('🏗️  Obteniendo constructores de la API de Jolpica...')
    const response = await axios.get(
      'https://api.jolpi.ca/ergast/f1/2026/constructors.json'
    )
    const constructors = response.data.MRData.ConstructorTable.Constructors
    let insertedCount = 0

    // UPSERT: Si el external_id ya existe, solo actualizamos los datos
    const insertQuery = `
      INSERT INTO constructors (external_id, name, nationality)
      VALUES ($1, $2, $3)
      ON CONFLICT (external_id) DO UPDATE SET
        name = EXCLUDED.name,
        nationality = EXCLUDED.nationality;
    `
    for (const team of constructors) {
      const result = await db.query(insertQuery, [
        team.constructorId,
        team.name,
        team.nationality
      ])
      if (result.rowCount > 0) insertedCount++
    }
    console.log(`✅ Equipos procesados con éxito.`)
  } catch (error) {
    console.error('❌ Error en constructores:', error.message)
  }
}

// --- 2. INGESTA DE PILOTOS ---
async function ingestDrivers() {
  try {
    console.log('🏎️  Obteniendo pilotos de la API de Jolpica...')
    const response = await axios.get(
      'https://api.jolpi.ca/ergast/f1/2026/drivers.json'
    )
    const drivers = response.data.MRData.DriverTable.Drivers
    let insertedCount = 0

    const insertQuery = `
      INSERT INTO drivers (external_id, code, number, fullname, country)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (external_id) DO UPDATE SET
        number = EXCLUDED.number,
        fullname = EXCLUDED.fullname;
    `
    for (const driver of drivers) {
      const fullname = `${driver.givenName} ${driver.familyName}`
      const result = await db.query(insertQuery, [
        driver.driverId,
        driver.code || null,
        driver.permanentNumber || null,
        fullname,
        driver.nationality
      ])
      if (result.rowCount > 0) insertedCount++
    }
    console.log(`✅ Pilotos procesados con éxito.`)
  } catch (error) {
    console.error('❌ Error en pilotos:', error.message)
  }
}

// --- 3. INGESTA DE CARRERAS (CALENDARIO) ---
async function ingestRaces() {
  try {
    console.log('🏁 Obteniendo calendario de carreras de la API...')
    const response = await axios.get('https://api.jolpi.ca/ergast/f1/2026.json')
    const races = response.data.MRData.RaceTable.Races
    let insertedCount = 0

    const insertQuery = `
      INSERT INTO races (external_id, round, name, date, circuit_name, city, country)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (external_id) DO UPDATE SET
        date = EXCLUDED.date,
        name = EXCLUDED.name;
    `
    for (const race of races) {
      const result = await db.query(insertQuery, [
        race.round.toString(), // Forzamos formato string
        race.round,
        race.raceName,
        race.date,
        race.Circuit.circuitName,
        race.Circuit.Location.locality,
        race.Circuit.Location.country
      ])
      if (result.rowCount > 0) insertedCount++
    }
    console.log(`✅ Calendario limpio y actualizado guardado.`)
  } catch (error) {
    console.error('❌ Error en carreras:', error.message)
  }
}

// --- 4. INGESTA DE RESULTADOS DE CARRERA ---
async function ingestRaceResults() {
  try {
    console.log('🏆 Obteniendo resultados históricos de la temporada...')
    const response = await axios.get(
      'https://api.jolpi.ca/ergast/f1/2026/results.json?limit=1000'
    )
    const resultsRaces = response.data.MRData.RaceTable.Races
    let insertedCount = 0

    for (const race of resultsRaces) {
      // 4.1 Buscar ID interno de la carrera en nuestra DB
      const dbRace = await db.query('SELECT id FROM races WHERE round = $1', [
        race.round
      ])
      if (dbRace.rows.length === 0) continue
      const raceId = dbRace.rows[0].id

      for (const result of race.Results) {
        // 4.2 Buscar IDs relacionales (Foreign Keys) de piloto y equipo
        const dbDriver = await db.query(
          'SELECT id FROM drivers WHERE external_id = $1',
          [result.Driver.driverId]
        )
        const dbConstructor = await db.query(
          'SELECT id FROM constructors WHERE external_id = $1',
          [result.Constructor.constructorId]
        )

        if (dbDriver.rows.length > 0 && dbConstructor.rows.length > 0) {
          const timeGap = result.Time ? result.Time.time : result.status // Recupera "+2.3s" o "Retired"

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
            dbDriver.rows[0].id,
            dbConstructor.rows[0].id,
            result.position,
            result.points,
            result.grid,
            timeGap
          ])
          insertedCount++
        }
      }
    }
    console.log(
      `✅ Se han descargado todos los resultados de las carreras celebradas.`
    )
  } catch (error) {
    console.error('❌ Error en resultados:', error.message)
  }
}

// --- 5. ORQUESTADOR PRINCIPAL ---
/**
 * Ejecuta todas las funciones de ingesta en orden secuencial
 * para respetar las dependencias (Foreign Keys) de PostgreSQL.
 */
async function runAll() {
  console.log('🚀 Iniciando proceso de ingesta masiva...')
  try {
    await ingestConstructors()
    await ingestDrivers()
    await ingestRaces()
    await ingestRaceResults()
    console.log('🏆 ¡Toda la ingesta ha finalizado correctamente!')
  } catch (error) {
    console.error('🛑 El proceso se detuvo por un error:', error.message)
  } finally {
    console.log('🔌 Cerrando conexión a la base de datos...')
    await db.end() // Libera el pool de conexiones de Postgres
  }
}

runAll()
