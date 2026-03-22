import axios from 'axios'

// Creamos la instancia con la URL base de tu servidor Express
const api = axios.create({
  baseURL: 'http://localhost:3000/api'
})

// Añadimos el interceptor a las peticiones
api.interceptors.request.use(
  (config) => {
    // Buscamos el token en el almacenamiento local
    const token = localStorage.getItem('token')

    // Si hay token, lo inyectamos en las cabeceras de autorización
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

export default api
