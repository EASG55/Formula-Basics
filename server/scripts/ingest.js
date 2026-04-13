/**
 * 🏭 SCRIPT DE INGESTA BASE (Datos Maestros)
 * Archivo: server/scripts/ingest.js
 * Descarga y actualiza los Equipos (Constructores) y los Pilotos.
 * Incluye un filtro de "Lista Negra" para evitar pilotos de reserva.
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

    const insertQuery = `
      INSERT INTO constructors (external_id, name, nationality)
      VALUES ($1, $2, $3)
      ON CONFLICT (external_id) DO UPDATE SET
        name = EXCLUDED.name,
        nationality = EXCLUDED.nationality;
    `
    for (const team of constructors) {
      await db.query(insertQuery, [
        team.constructorId,
        team.name,
        team.nationality
      ])
    }
    console.log(`✅ Equipos insertados/actualizados.`)

    // 🔧 ACTUALIZACIÓN MANUAL DE SEDES (La API no provee este dato)
    console.log('📍 Asignando sedes (Bases) a las escuderías...')
    const bases = [
      { id: 'ferrari', base: 'Maranello, Italia' },
      { id: 'mercedes', base: 'Brackley, Reino Unido' },
      { id: 'red_bull', base: 'Milton Keynes, Reino Unido' },
      { id: 'mclaren', base: 'Woking, Reino Unido' },
      { id: 'aston_martin', base: 'Silverstone, Reino Unido' },
      { id: 'alpine', base: 'Enstone, Reino Unido' },
      { id: 'williams', base: 'Grove, Reino Unido' },
      { id: 'rb', base: 'Faenza, Italia' },
      { id: 'audi', base: 'Hinwil, Suiza' },
      { id: 'haas', base: 'Kannapolis, EE. UU.' },
      { id: 'cadillac', base: 'Fishers, EE. UU.' }
    ]

    for (const b of bases) {
      await db.query(
        'UPDATE constructors SET base = $1 WHERE external_id = $2',
        [b.base, b.id]
      )
    }
    console.log(`✅ Sedes de los equipos actualizadas.`)
  } catch (error) {
    console.error('❌ Error en constructores:', error.message)
  }
}

// --- 2. INGESTA DE PILOTOS (CON LISTA NEGRA) ---
async function ingestDrivers() {
  try {
    console.log('🏎️  Obteniendo pilotos de la API de Jolpica...')
    const response = await axios.get(
      'https://api.jolpi.ca/ergast/f1/2026/drivers.json'
    )
    const drivers = response.data.MRData.DriverTable.Drivers

    // 🛑 LISTA NEGRA: Añade aquí los 'driverId' de los pilotos que NO quieres en tu app
    const blacklist = ['jak_crawford'] // Ejemplo: Bloqueamos a Crawford y Bearman si son reservas

    const insertQuery = `
      INSERT INTO drivers (external_id, code, number, fullname, country)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (external_id) DO UPDATE SET
        number = EXCLUDED.number,
        fullname = EXCLUDED.fullname;
    `
    let insertedCount = 0
    let ignoredCount = 0

    for (const driver of drivers) {
      // 🛡️ Filtro de seguridad: Si el ID está en la lista negra, lo saltamos
      if (blacklist.includes(driver.driverId)) {
        console.log(
          `⚠️ Ignorando piloto excluido: ${driver.givenName} ${driver.familyName}`
        )
        ignoredCount++
        continue
      }

      const fullname = `${driver.givenName} ${driver.familyName}`
      await db.query(insertQuery, [
        driver.driverId,
        driver.code || null,
        driver.permanentNumber || null,
        fullname,
        driver.nationality
      ])
      insertedCount++
    }
    console.log(
      `✅ Pilotos guardados: ${insertedCount}. Ignorados: ${ignoredCount}. (El vínculo con sus equipos se hará al descargar las carreras)`
    )
  } catch (error) {
    console.error('❌ Error en pilotos:', error.message)
  }
}

// --- ORQUESTADOR BASE ---
async function runBaseIngest() {
  console.log('🚀 Iniciando ingesta de Datos Maestros (Pilotos y Equipos)...')
  try {
    await ingestConstructors()
    await ingestDrivers()
    console.log('🏁 Ingesta Base finalizada.')
  } catch (error) {
    console.error('🛑 Error crítico:', error.message)
  } finally {
    await db.end()
  }
}

runBaseIngest()
