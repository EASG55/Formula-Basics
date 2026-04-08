/**
 * 🔋 PROVEEDOR: AUTH PROVIDER
 * Es el motor que alimenta el AuthContext.
 * Maneja activamente los estados de 'token' y 'user', y expone las
 * funciones de 'login' y 'logout' a cualquier componente que lo necesite.
 */

import { useState } from 'react'
import { AuthContext } from './AuthContext.jsx'

export const AuthProvider = ({ children }) => {
  // Inicializamos leyendo el almacenamiento local por si el usuario ya había entrado antes
  const [token, setToken] = useState(localStorage.getItem('token') || null)
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem('user')) || null
  )

  /**
   * Registra la sesión activa en el estado y en el navegador
   */
  const login = (newToken, userData) => {
    setToken(newToken)
    setUser(userData)
    localStorage.setItem('token', newToken)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  /**
   * Destruye la sesión activa y borra las credenciales
   */
  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  // Envolvemos a los "children" (toda la app) dándoles acceso a estas variables
  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
