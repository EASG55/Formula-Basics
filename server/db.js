/**
 * 🗄️ MOTOR DE BASE DE DATOS (PostgreSQL Pool)
 * Gestiona la conexión entre nuestro servidor Express y la base de datos.
 * * * SEGURIDAD Y DESPLIEGUE:
 * - No expone contraseñas en el código fuente (Usa variables de entorno .env).
 * - Activa el cifrado SSL dinámicamente si detecta que está corriendo en
 * un servidor en la nube (como Render o Neon.tech).
 */

const { Pool } = require('pg')
require('dotenv').config() // Carga las variables ocultas del archivo .env

// 1. Configuración del Pool de Conexiones
const pool = new Pool({
  // La cadena de conexión real (Ej: postgres://user:pass@host:5432/db) vive en el .env
  connectionString: process.env.DATABASE_URL,
  
  // 2. Regla SSL Dinámica: 
  // Si hay URL y NO incluye 'localhost', asumimos que es la nube y forzamos SSL.
  ssl: process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('localhost') 
    ? { rejectUnauthorized: false } 
    : false
})

// Exportamos los métodos de consulta para que el resto del backend los use
module.exports = {
  query: (text, params) => pool.query(text, params),
  end: () => pool.end()
}