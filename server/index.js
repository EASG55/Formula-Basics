const express = require('express')
const cors = require('cors')
const db = require('./db.js') // Conexión a tu base de datos PostgreSQL

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
    res
      .status(500)
      .json({
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
    res
      .status(500)
      .json({
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
    res
      .status(500)
      .json({
        error: 'Error interno del servidor al consultar la base de datos'
      })
  }
})

// --- INICIO DEL SERVIDOR ---
app.listen(PORT, () => {
  console.log(`Servidor F1 rodando en el puerto ${PORT} 🏎️`)
})
