const axios = require('axios')
const db = require('../db.js') // Importamos el Pool con la ruta relativa corregida

// --- 1. INGESTA DE CONSTRUCTORES (EQUIPOS) ---
async function ingestConstructors() {
  try {
    console.log('🏗️  Obteniendo constructores de la API de Jolpica...')

    const response = await axios.get(
      'https://api.jolpi.ca/ergast/f1/2026/constructors.json'
    )
    const constructors = response.data.MRData.ConstructorTable.Constructors
    let insertedCount = 0

    const insertQuery = `
      INSERT INTO constructors (external_id, name, nationality)
      VALUES ($1, $2, $3)
      ON CONFLICT (external_id) DO NOTHING;
    `

    for (const team of constructors) {
      const values = [team.constructorId, team.name, team.nationality]

      const result = await db.query(insertQuery, values)
      if (result.rowCount > 0) {
        insertedCount++
      }
    }
    console.log(`✅ Se han guardado ${insertedCount} equipos nuevos.`)
  } catch (error) {
    console.error(
      '❌ Error durante la ingesta de constructores:',
      error.message
    )
    throw error // Lanzamos el error para detener el flujo si algo falla
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
      ON CONFLICT (external_id) DO NOTHING;
    `

    for (const driver of drivers) {
      // Concatenamos el nombre y apellido
      const fullname = `${driver.givenName} ${driver.familyName}`

      const values = [
        driver.driverId,
        driver.code || null, // Manejo de nulos por si no hay código asignado
        driver.permanentNumber || null,
        fullname,
        driver.nationality
      ]

      const result = await db.query(insertQuery, values)
      if (result.rowCount > 0) {
        insertedCount++
      }
    }
    console.log(`✅ Se han guardado ${insertedCount} pilotos nuevos.`)
  } catch (error) {
    console.error('❌ Error durante la ingesta de pilotos:', error.message)
    throw error
  }
}

// --- 3. INGESTA DE CARRERAS (CALENDARIO) ---
async function ingestRaces() {
  try {
    console.log('🏁 Obteniendo calendario de carreras de la API de Jolpica...')

    const response = await axios.get('https://api.jolpi.ca/ergast/f1/2026.json')
    const races = response.data.MRData.RaceTable.Races
    let insertedCount = 0

    const insertQuery = `
      INSERT INTO races (external_id, round, name, date, circuit_name, city, country)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (external_id) DO NOTHING;
    `

    for (const race of races) {
      const values = [
        race.round, // external_id único basado en la ronda de la temporada
        race.round,
        race.raceName,
        race.date,
        race.Circuit.circuitName,
        race.Circuit.Location.locality,
        race.Circuit.Location.country
      ]

      const result = await db.query(insertQuery, values)
      if (result.rowCount > 0) {
        insertedCount++
      }
    }
    console.log(`✅ Se han guardado ${insertedCount} carreras nuevas.`)
  } catch (error) {
    console.error('❌ Error durante la ingesta de carreras:', error.message)
    throw error
  }
}

// --- 4. EJECUCIÓN SECUENCIAL ---
async function runAll() {
  console.log('🚀 Iniciando proceso de ingesta masiva...')
  try {
    // Ejecutamos en orden, esperando a que termine cada una
    await ingestConstructors()
    await ingestDrivers()
    await ingestRaces()

    console.log('🏆 ¡Toda la ingesta ha finalizado correctamente!')
  } catch (error) {
    console.error(
      '🛑 El proceso de ingesta se detuvo por un error:',
      error.message
    )
  } finally {
    // Cerramos la conexión a la base de datos al finalizar todo
    console.log('🔌 Cerrando conexión a la base de datos...')
    await db.end()
  }
}

// Arrancamos el script
runAll()
