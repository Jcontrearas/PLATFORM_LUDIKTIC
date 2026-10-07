import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../features/auth/ProveedorAuth'
import CargandoPantalla from './CargandoPantalla'

/**
 * Componente que protege rutas privadas.
 * Si el usuario no tiene sesión, lo redirige al login
 * conservando la URL destino para redirigirlo después del login.
 */
export default function RutaProtegida() {
  const { usuario, cargando } = useAuth()
  const ubicacion = useLocation()

  // Mientras se verifica la sesión, mostrar pantalla de carga
  if (cargando) {
    return <CargandoPantalla />
  }

  // Sin sesión → redirigir al login, guardando la ruta actual
  if (!usuario) {
    return <Navigate to="/login" state={{ desde: ubicacion }} replace />
  }

  // Con sesión → renderizar la ruta solicitada
  return <Outlet />
}
