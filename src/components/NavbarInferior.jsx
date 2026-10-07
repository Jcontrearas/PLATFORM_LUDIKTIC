import { NavLink } from 'react-router-dom'
import { Home, Layers, QrCode, Trophy, User } from 'lucide-react'
import styles from './NavbarInferior.module.css'

/**
 * Barra de navegación inferior fija para celular (Sección 7)
 * 5 botones táctiles con el botón central de escaneo QR destacado.
 */
export default function NavbarInferior() {
  return (
    <nav className={styles.barraInferior} aria-label="Navegación principal móvil">
      <NavLink
        to="/"
        className={({ isActive }) => `${styles.enlace} ${isActive ? styles.activo : ''}`}
        end
      >
        <Home size={22} />
        <span>Inicio</span>
      </NavLink>

      <NavLink
        to="/areas"
        className={({ isActive }) => `${styles.enlace} ${isActive ? styles.activo : ''}`}
      >
        <Layers size={22} />
        <span>Áreas</span>
      </NavLink>

      <NavLink
        to="/escanear"
        className={({ isActive }) => `${styles.botonCentral} ${isActive ? styles.centralActivo : ''}`}
        aria-label="Escanear código QR de flashcard"
      >
        <div className={styles.circuloCentral}>
          <QrCode size={28} />
        </div>
        <span className={styles.textoCentral}>Escanear</span>
      </NavLink>

      <NavLink
        to="/clasificacion"
        className={({ isActive }) => `${styles.enlace} ${isActive ? styles.activo : ''}`}
      >
        <Trophy size={22} />
        <span>Ranking</span>
      </NavLink>

      <NavLink
        to="/perfil"
        className={({ isActive }) => `${styles.enlace} ${isActive ? styles.activo : ''}`}
      >
        <User size={22} />
        <span>Perfil</span>
      </NavLink>
    </nav>
  )
}
