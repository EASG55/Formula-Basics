/**
 * 🏎️ FORMULA BASICS - BACKEND SERVER
 * Archivo principal del servidor Node.js/Express.
 * Gestiona la API, la base de datos, la autenticación de usuarios
 * y los procesos en segundo plano (CRON) para la caché de datos de F1.
 */

// ==========================================
// 1. IMPORTACIONES Y CONFIGURACIÓN INICIAL
// ==========================================
const express = require('express')
const cors = require('cors')
const db = require('./db.js') // Conexión a PostgreSQL
const bcrypt = require('bcrypt') // Para encriptar contraseñas
const jwt = require('jsonwebtoken') // Para tokens de sesión
const fs = require('fs') // File System: para leer/escribir caché
const path = require('path') // Utilidad para rutas seguras de archivos
const cron = require('node-cron') // Programador de tareas en segundo plano
const axios = require('axios') // Para peticiones HTTP a la API de Jolpica

const app = express()
const PORT = process.env.PORT || 3000

// Middlewares globales
app.use(cors())
app.use(express.json())

// Rutas absolutas para los archivos de caché local
const STANDINGS_FILE = path.join(__dirname, 'standings_backup.json')
const STATS_FILE = path.join(__dirname, 'stats_backup.json')

// Función de utilidad: Pausa la ejecución (ms) para no saturar APIs externas
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// ==========================================
// 2. SISTEMA DE CACHÉ AUTOMATIZADO (CRON JOBS)
// ==========================================

/**
 * 🤖 MECÁNICO 1: Clasificación del Mundial en Vivo
 * Descarga la tabla de puntos actual y la guarda en disco.
 */
const fetchAndSaveStandings = async () => {
  console.log('🤖 Mecánico 1: Descargando Mundial en vivo...')
  try {
    const [driversRes, constructorsRes] = await Promise.all([
      axios.get('https://api.jolpi.ca/ergast/f1/current/driverStandings.json'),
      axios.get(
        'https://api.jolpi.ca/ergast/f1/current/constructorStandings.json'
      )
    ])

    const dataToSave = {
      drivers:
        driversRes.data.MRData.StandingsTable.StandingsLists[0]
          ?.DriverStandings || [],
      constructors:
        constructorsRes.data.MRData.StandingsTable.StandingsLists[0]
          ?.ConstructorStandings || [],
      lastUpdate: new Date().toLocaleString()
    }

    fs.writeFileSync(STANDINGS_FILE, JSON.stringify(dataToSave))
    console.log(`✅ Mundial guardado en disco correctamente.`)
  } catch (error) {
    console.error('❌ Error Mecánico 1 (Mundial):', error.message)
  }
}

/**
 * 📊 MECÁNICO 2: Archivista Histórico (Pilotos y Equipos)
 * Recopila victorias y podios históricos. Incluye sistema
 * anti-saturación (Rate Limiting) con auto-reintento.
 */
const fetchAndSaveHistoricalStats = async () => {
  console.log(
    '📊 Mecánico 2: Recopilando estadísticas (Modo Anti-Saturación. Tardará ~2 min)...'
  )
  try {
    const driversRes = await db.query('SELECT external_id FROM drivers')
    const teamsRes = await db.query('SELECT external_id FROM constructors')

    const statsData = {
      drivers: {},
      teams: {},
      lastUpdate: new Date().toLocaleString()
    }

    // Obtenemos los puntos actuales para no pedir 22 peticiones extra luego
    let currentStandings = []
    try {
      const std = await axios.get(
        'https://api.jolpi.ca/ergast/f1/current/driverStandings.json'
      )
      currentStandings =
        std.data.MRData.StandingsTable.StandingsLists[0]?.DriverStandings || []
    } catch (e) {
      console.log('⚠️ No se pudo descargar el mundial actual para los puntos.')
    }

    // Función blindada con Auto-Reintento (Retries)
    const fetchTotal = async (url, retries = 3) => {
      for (let i = 0; i < retries; i++) {
        try {
          const res = await axios.get(url)
          return parseInt(res.data.MRData.total) || 0
        } catch (e) {
          if (e.response && e.response.status === 429) {
            console.log(
              `   ⏳ API Saturada. Pausando 3s... (Intento ${i + 1}/${retries})`
            )
            await delay(3000)
          } else if (e.response && e.response.status === 404) {
            return 0 // Equipo/Piloto nuevo sin historial (Ej: Audi)
          } else {
            return 0
          }
        }
      }
      return 0 // Si fallan todos los reintentos
    }

    // A. Procesar Pilotos (Con pausas de 1 segundo)
    console.log('🏎️ Procesando telemetría de pilotos...')
    for (const driver of driversRes.rows) {
      const extId = driver.external_id
      const p1 = await fetchTotal(
        `https://api.jolpi.ca/ergast/f1/drivers/${extId}/results/1.json?limit=1`
      )
      await delay(1000)
      const p2 = await fetchTotal(
        `https://api.jolpi.ca/ergast/f1/drivers/${extId}/results/2.json?limit=1`
      )
      await delay(1000)
      const p3 = await fetchTotal(
        `https://api.jolpi.ca/ergast/f1/drivers/${extId}/results/3.json?limit=1`
      )
      await delay(1000)

      const driverStanding = currentStandings.find(
        (d) => d.Driver.driverId === extId
      )
      statsData.drivers[extId] = {
        wins: p1,
        podiums: p1 + p2 + p3,
        currentPoints: driverStanding ? driverStanding.points : '0'
      }
      console.log(`   ✔️ Piloto ${extId} ok`)
    }

    // B. Procesar Equipos
    console.log('🛡️ Procesando palmarés de escuderías...')
    const historicalChampionships = {
      ferrari: 16,
      williams: 9,
      mclaren: 8,
      mercedes: 8,
      red_bull: 6,
      aston_martin: 0,
      alpine: 2,
      sauber: 0,
      haas: 0,
      rb: 0
    }

    for (const team of teamsRes.rows) {
      const extId = team.external_id
      const p1 = await fetchTotal(
        `https://api.jolpi.ca/ergast/f1/constructors/${extId}/results/1.json?limit=1`
      )
      await delay(1000)
      const p2 = await fetchTotal(
        `https://api.jolpi.ca/ergast/f1/constructors/${extId}/results/2.json?limit=1`
      )
      await delay(1000)
      const p3 = await fetchTotal(
        `https://api.jolpi.ca/ergast/f1/constructors/${extId}/results/3.json?limit=1`
      )
      await delay(1000)

      statsData.teams[extId] = {
        wins: p1,
        podiums: p1 + p2 + p3,
        championships: historicalChampionships[extId] || 0
      }
      console.log(`   ✔️ Equipo ${extId} ok`)
    }

    fs.writeFileSync(STATS_FILE, JSON.stringify(statsData))
    console.log(`✅ Estadísticas históricas guardadas al 100%.`)
  } catch (error) {
    console.error('❌ Error Mecánico 2:', error.message)
  }
}

// Programamos la ejecución automática cada hora (minuto 0)
cron.schedule('0 * * * *', () => {
  fetchAndSaveStandings()
  fetchAndSaveHistoricalStats()
})

// Ejecución forzada al iniciar el servidor
console.log('🚀 Arrancando motores y verificando telemetría inicial...')
fetchAndSaveStandings()
fetchAndSaveHistoricalStats()

// ==========================================
// 3. ENDPOINTS: CACHÉ LOCAL (Mundial y Stats)
// ==========================================

// Obtener clasificación actual (Offline support)
app.get('/api/standings', (req, res) => {
  try {
    if (fs.existsSync(STANDINGS_FILE)) {
      res.json(JSON.parse(fs.readFileSync(STANDINGS_FILE, 'utf8')))
    } else {
      res.status(404).json({ error: 'Mundial no disponible aún.' })
    }
  } catch (error) {
    res.status(500).json({ error: 'Error leyendo caché del disco.' })
  }
})

// Obtener estadísticas históricas (Offline support)
app.get('/api/stats/:type/:id', (req, res) => {
  try {
    if (fs.existsSync(STATS_FILE)) {
      const data = JSON.parse(fs.readFileSync(STATS_FILE, 'utf8'))
      const { type, id } = req.params
      if (data[type] && data[type][id]) {
        res.json(data[type][id])
      } else {
        res.status(404).json({ error: 'Estadísticas no encontradas.' })
      }
    } else {
      res.status(404).json({ error: 'Archivos no disponibles aún.' })
    }
  } catch (error) {
    res.status(500).json({ error: 'Error leyendo caché del disco.' })
  }
})

// ==========================================
// 4. ENDPOINTS: BASE DE DATOS F1 PRINCIPAL
// ==========================================

app.get('/api/drivers', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT d.*, c.name AS team_name FROM drivers d LEFT JOIN constructors c ON d.constructor_id = c.id ORDER BY d.fullname ASC`
    )
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener pilotos' })
  }
})

app.get('/api/constructors', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM constructors')
    res.json(result.rows)
  } catch (error) {
    res.status(500).json({ error: 'Error interno' })
  }
})

app.get('/api/races', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM races ORDER BY round ASC')
    res.json(result.rows)
  } catch (error) {
    res.status(500).json({ error: 'Error interno' })
  }
})

app.get('/api/races/:id/podium', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT rr.position, rr.time_gap, rr.points, d.fullname AS driver_name, d.external_id AS driver_id, c.name AS team_name FROM race_results rr JOIN drivers d ON rr.driver_id = d.id JOIN constructors c ON rr.constructor_id = c.id WHERE rr.race_id = $1 AND rr.position <= 3 ORDER BY rr.position ASC`,
      [req.params.id]
    )
    res.json(result.rows)
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener podio' })
  }
})

// ==========================================
// 5. ENDPOINTS: ACADEMIA Y GAMIFICACIÓN
// ==========================================

app.get('/api/modules', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM modules ORDER BY order_index ASC'
    )
    res.status(200).json(result.rows)
  } catch (error) {
    res.status(500).json({ error: 'Error interno' })
  }
})

app.get('/api/lessons/:moduleId', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM lessons WHERE module_id = $1 ORDER BY id ASC',
      [parseInt(req.params.moduleId)]
    )
    res.status(200).json(result.rows)
  } catch (error) {
    res.status(500).json({ error: 'Error interno' })
  }
})

// Guardar progreso de lectura
app.post('/api/progress', async (req, res) => {
  try {
    const userIdNum = parseInt(req.body.user_id)
    const lessonIdNum = parseInt(req.body.lesson_id)
    if (isNaN(userIdNum) || isNaN(lessonIdNum))
      return res.status(400).json({ error: 'Datos inválidos' })

    await db.query(
      'INSERT INTO user_progress (user_id, lesson_id) VALUES ($1, $2) ON CONFLICT (user_id, lesson_id) DO NOTHING',
      [userIdNum, lessonIdNum]
    )
    res.status(201).json({ message: 'Progreso guardado' })
  } catch (error) {
    res.status(500).json({ error: 'Error interno' })
  }
})

// Calcular XP total del usuario
app.get('/api/progress/:userId/xp', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId)
    if (isNaN(userId)) return res.json({ xp: 0 })

    const result = await db.query(
      `SELECT COALESCE(SUM(l.xp_reward), 0) AS total_xp FROM user_progress up JOIN lessons l ON up.lesson_id = l.id WHERE up.user_id = $1`,
      [userId]
    )
    res.json({ xp: parseInt(result.rows[0].total_xp) })
  } catch (error) {
    res.status(500).json({ error: 'Error interno' })
  }
})

// Comprobar qué lecciones completó un usuario
app.get('/api/progress/:userId/:moduleId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId)
    const moduleId = parseInt(req.params.moduleId)
    if (isNaN(userId) || isNaN(moduleId)) return res.json([])

    const result = await db.query(
      `SELECT up.lesson_id FROM user_progress up JOIN lessons l ON up.lesson_id = l.id WHERE up.user_id = $1 AND l.module_id = $2`,
      [userId, moduleId]
    )
    res.json(result.rows.map((row) => parseInt(row.lesson_id)))
  } catch (error) {
    res.status(500).json({ error: 'Error al recuperar progreso' })
  }
})

// ==========================================
// 6. ENDPOINTS: AUTENTICACIÓN (JWT)
// ==========================================

app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body
    const existingUser = await db.query(
      'SELECT id FROM users WHERE email = $1 OR username = $2',
      [email, username]
    )

    if (existingUser.rows.length > 0)
      return res.status(400).json({ error: 'Email/usuario en uso' })

    const password_hash = await bcrypt.hash(password, 10)
    await db.query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3)',
      [username, email, password_hash]
    )
    res.status(201).json({ message: 'Usuario registrado exitosamente' })
  } catch (error) {
    res.status(500).json({ error: 'Error interno' })
  }
})

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body
    const result = await db.query('SELECT * FROM users WHERE email = $1', [
      email
    ])

    if (result.rows.length === 0)
      return res.status(401).json({ error: 'Credenciales incorrectas' })

    const user = result.rows[0]
    const isMatch = await bcrypt.compare(password, user.password_hash)
    if (!isMatch)
      return res.status(401).json({ error: 'Credenciales incorrectas' })

    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET || 'secreto_de_desarrollo',
      { expiresIn: '24h' }
    )
    res.json({
      token,
      user: { id: user.id, username: user.username, email: user.email }
    })
  } catch (error) {
    res.status(500).json({ error: 'Error interno' })
  }
})

// ==========================================
// 7. INICIO DEL SERVIDOR
// ==========================================
app.listen(PORT, () => {
  console.log(`Servidor F1 rodando en el puerto ${PORT} 🏎️`)
})
