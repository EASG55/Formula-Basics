const express = require('express')
const cors = require('cors')
const db = require('./db.js') // Conexión a tu base de datos PostgreSQL
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const app = express()
const PORT = process.env.PORT || 3000

// Middlewares
app.use(cors())
app.use(express.json())

// --- ENDPOINTS ---

// 1. Obtener todos los pilotos
app.get('/api/drivers', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM drivers')
    // pg devuelve los registros dentro del array "rows"
    res.json(result.rows)
  } catch (error) {
    console.error('❌ Error al obtener los pilotos:', error.message)
    res.status(500).json({
      error: 'Error interno del servidor al consultar la base de datos'
    })
  }
})

// 2. Obtener todos los constructores (equipos)
app.get('/api/constructors', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM constructors')
    res.json(result.rows)
  } catch (error) {
    console.error('❌ Error al obtener los constructores:', error.message)
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
    console.error('❌ Error al obtener las carreras:', error.message)
    res.status(500).json({
      error: 'Error interno del servidor al consultar la base de datos'
    })
  }
})

// --- INICIO DEL SERVIDOR ---
app.listen(PORT, () => {
  console.log(`Servidor F1 rodando en el puerto ${PORT} 🏎️`)
})

// --- ENDPOINTS DE AUTENTICACIÓN ---

// Registro de usuario
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body

    // 1. Comprobar si el usuario ya existe (por email o username)
    const existingUser = await db.query(
      'SELECT id FROM users WHERE email = $1 OR username = $2',
      [email, username]
    )

    if (existingUser.rows.length > 0) {
      return res
        .status(400)
        .json({ error: 'El email o nombre de usuario ya están en uso' })
    }

    // 2. Hashear la contraseña
    const saltRounds = 10
    const password_hash = await bcrypt.hash(password, saltRounds)

    // 3. Insertar el nuevo usuario en la base de datos
    await db.query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3)',
      [username, email, password_hash]
    )

    // 4. Devolver éxito
    res.status(201).json({ message: 'Usuario registrado exitosamente' })
  } catch (error) {
    console.error('❌ Error en el registro:', error.message)
    res
      .status(500)
      .json({ error: 'Error interno del servidor al registrar el usuario' })
  }
})

// Login de usuario
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body

    // 1. Buscar al usuario por email
    const result = await db.query('SELECT * FROM users WHERE email = $1', [
      email
    ])

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales incorrectas' }) // Error 401 si no existe
    }

    const user = result.rows[0]

    // 2. Comparar la contraseña enviada con el hash guardado
    const isMatch = await bcrypt.compare(password, user.password_hash)

    if (!isMatch) {
      return res.status(401).json({ error: 'Credenciales incorrectas' }) // Error 401 si no coincide
    }

    // 3. Firmar el token JWT
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    )

    // 4. Devolver el token y los datos básicos
    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    })
  } catch (error) {
    console.error('❌ Error en el login:', error.message)
    res
      .status(500)
      .json({ error: 'Error interno del servidor al iniciar sesión' })
  }
})
