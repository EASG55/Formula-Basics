/**
 * 🧠 CONTEXTO: AUTH CONTEXT
 * Crea el "espacio de memoria compartida" donde vivirá el estado
 * del usuario logueado. Permite que toda la aplicación sepa si
 * el conductor está en el coche o no sin pasar variables manualmente.
 */

import { createContext } from 'react'

export const AuthContext = createContext()
