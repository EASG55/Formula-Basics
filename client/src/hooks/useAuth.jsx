/**
 * 🪝 CUSTOM HOOK: USE AUTH
 * Provee un acceso rápido y tipado al contexto de autenticación global.
 * Permite a cualquier componente obtener los datos del piloto logueado,
 * el token de sesión y las funciones de login/logout.
 *
 * @returns {Object} { token, user, login, logout }
 */

import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'

export const useAuth = () => {
  return useContext(AuthContext)
}
