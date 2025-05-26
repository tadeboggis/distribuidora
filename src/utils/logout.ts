// src/utils/logout.ts
import { signOut } from 'firebase/auth'
import { auth } from '../firebase/config'

export const cerrarSesion = async () => {
  try {
    await signOut(auth)
    localStorage.removeItem('logueado')
    window.location.reload()
  } catch (error) {
    console.error('Error al cerrar sesión', error)
  }
}