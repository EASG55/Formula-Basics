import { useState } from 'react'
import { AuthContext } from './AuthContext.jsx'

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token') || null)
  // Añadimos el estado del usuario, parseando el JSON si existe
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem('user')) || null
  )

  // Modificamos login para recibir el token y los datos del usuario
  const login = (newToken, userData) => {
    setToken(newToken)
    setUser(userData)
    localStorage.setItem('token', newToken)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  // Ahora exponemos "user" para que ModuleLessons pueda leerlo
  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
