import { useAuth } from '../features/auth/ProveedorAuth'
import { Navigate } from 'react-router-dom'

export default function PanelDocente() {
  const { esDocente } = useAuth()

  // Solo el docente puede acceder a este panel
  if (!esDocente) {
    return <Navigate to="/" replace />
  }

  return <div style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-texto)' }}>Panel Docente — Fase 7</div>
}
