import styles from './CargandoPantalla.module.css'

/**
 * Pantalla de carga global que se muestra mientras se verifica la sesión
 * o se carga un módulo diferido (lazy).
 */
export default function CargandoPantalla({ mensaje = 'Cargando...' }) {
  return (
    <div className={styles.contenedor}>
      <div className={styles.animacion}>
        <svg viewBox="0 0 80 80" className={styles.logo} aria-hidden="true">
          {/* Logo Bit simplificado */}
          <circle cx="40" cy="40" r="30" fill="none" stroke="url(#gradienteLoader)" strokeWidth="4" strokeDasharray="150" strokeDashoffset="150">
            <animate attributeName="stroke-dashoffset" values="150;0;150" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx="40" cy="40" r="12" fill="url(#gradienteLoader)" opacity="0.8">
            <animate attributeName="r" values="12;14;12" dur="1.5s" repeatCount="indefinite" />
          </circle>
          <defs>
            <linearGradient id="gradienteLoader" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2563EB" />
              <stop offset="50%" stopColor="#7C3AED" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
          </defs>
        </svg>
        <p className={styles.mensaje}>{mensaje}</p>
      </div>
    </div>
  )
}
