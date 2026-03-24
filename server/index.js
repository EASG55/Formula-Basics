const express = require('express')
const cors = require('cors')
const db = require('./db.js')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const app = express()
const PORT = process.env.PORT || 3000

// Middlewares
app.use(cors())
app.use(express.json())

// --- ENDPOINTS DE F1 ---

// 1. Obtener todos los pilotos (con datos de la escudería)
app.get('/api/drivers', async (req, res) => {
  try {
    // Usamos LEFT JOIN para traer el nombre del constructor
    // Cambiamos 'pool' por 'db' 👇
    const result = await db.query(`
      SELECT d.*, c.name AS team_name 
      FROM drivers d 
      LEFT JOIN constructors c ON d.constructor_id = c.id 
      ORDER BY d.fullname ASC
    `)
    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al obtener pilotos' })
  }
})

// 2. Obtener todos los constructores (equipos)
app.get('/api/constructors', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM constructors')
    res.json(result.rows)
  } catch (error) {
    console.error('Error al obtener los constructores:', error.message)
    res.status(500).json({
      error: 'Error interno del servidor al consultar la base de datos'
    })
  }
})

// 3. Obtener el calendario de carreras (ordenado por ronda)
app.get('/api/races', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM races ORDER BY round ASC')
    res.json(result.rows)
  } catch (error) {
    console.error('Error al obtener las carreras:', error.message)
    res.status(500).json({
      error: 'Error interno del servidor al consultar la base de datos'
    })
  }
})

// --- ENDPOINTS EDUCATIVOS ---

// 4. Obtener todos los módulos
app.get('/api/modules', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM modules ORDER BY order_index ASC'
    )
    res.status(200).json(result.rows)
  } catch (error) {
    console.error('Error al obtener los módulos:', error.message)
    res.status(500).json({
      error: 'Error interno del servidor al consultar la base de datos'
    })
  }
})

// 5. Obtener las lecciones de un módulo específico
app.get('/api/lessons/:moduleId', async (req, res) => {
  try {
    const { moduleId } = req.params
    const result = await db.query(
      'SELECT * FROM lessons WHERE module_id = $1 ORDER BY id ASC',
      [moduleId]
    )
    res.status(200).json(result.rows)
  } catch (error) {
    console.error('Error al obtener las lecciones:', error.message)
    res.status(500).json({
      error: 'Error interno del servidor al consultar la base de datos'
    })
  }
})

// 6. Guardar progreso del usuario
app.post('/api/progress', async (req, res) => {
  try {
    const { user_id, lesson_id } = req.body

    await db.query(
      'INSERT INTO user_progress (user_id, lesson_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [user_id, lesson_id]
    )

    res.status(201).json({ message: 'Progreso guardado exitosamente' })
  } catch (error) {
    console.error('Error al guardar el progreso:', error.message)
    res
      .status(500)
      .json({ error: 'Error interno del servidor al guardar el progreso' })
  }
})

// --- ENDPOINTS DE AUTENTICACIÓN ---

// 7. Registro de usuario
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body

    const existingUser = await db.query(
      'SELECT id FROM users WHERE email = $1 OR username = $2',
      [email, username]
    )

    if (existingUser.rows.length > 0) {
      return res
        .status(400)
        .json({ error: 'El email o nombre de usuario ya están en uso' })
    }

    const saltRounds = 10
    const password_hash = await bcrypt.hash(password, saltRounds)

    await db.query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3)',
      [username, email, password_hash]
    )

    res.status(201).json({ message: 'Usuario registrado exitosamente' })
  } catch (error) {
    console.error('Error en el registro:', error.message)
    res
      .status(500)
      .json({ error: 'Error interno del servidor al registrar el usuario' })
  }
})

// 8. Login de usuario
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body

    const result = await db.query('SELECT * FROM users WHERE email = $1', [
      email
    ])

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales incorrectas' })
    }

    const user = result.rows[0]

    const isMatch = await bcrypt.compare(password, user.password_hash)

    if (!isMatch) {
      return res.status(401).json({ error: 'Credenciales incorrectas' })
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET || 'secreto_de_desarrollo',
      { expiresIn: '24h' }
    )

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    })
  } catch (error) {
    console.error('Error en el login:', error.message)
    res
      .status(500)
      .json({ error: 'Error interno del servidor al iniciar sesión' })
  }
})

// --- INICIO DEL SERVIDOR (SIEMPRE AL FINAL) ---
app.listen(PORT, () => {
  console.log(`Servidor F1 rodando en el puerto ${PORT} 🏎️`)
})
