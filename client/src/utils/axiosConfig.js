/**
 * 📡 CONFIGURACIÓN CENTRAL DE AXIOS (Enrutador de Telemetría)
 * Actúa como la centralita de comunicaciones de nuestro monoplaza.
 * * * ARQUITECTURA CLOUD-READY:
 * - Detecta automáticamente si estamos en desarrollo (localhost) o en producción (Vercel).
 * - Inyecta el "Pase de Paddock" (Token JWT) de forma invisible en cada
 * petición saliente para garantizar que solo los pilotos autorizados acceden al backend.
 */

import axios from 'axios'

// 1. Detección Inteligente de Entorno (Vite Environment Variables)
// Si existe VITE_API_URL en Vercel, la usa. Si no, asume que estamos en el garaje (localhost).
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
// 2. Instancia base apuntando a nuestro servidor Node.js
const api = axios.create({
  baseURL: API_URL
})

// 3. Interceptor de Peticiones (Request Interceptor)
api.interceptors.request.use(
  (config) => {
    // Buscamos si el piloto tiene su credencial guardada en la guantera (localStorage)
    const token = localStorage.getItem('token')

    // Si tiene token, lo adjuntamos como autorización "Bearer" en las cabeceras HTTP
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    // Si la petición falla antes de salir del coche, rechazamos la promesa
    return Promise.reject(error)
  }
)

export default api
