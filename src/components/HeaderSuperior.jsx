import { Link } from 'react-router-dom'
import { Sun, Moon, LogOut } from 'lucide-react'
import { useAuth } from '../features/auth/ProveedorAuth'
import { useTema } from '../features/tema/ProveedorTema'
import { AVATARES } from '../data/avatares'
import styles from './HeaderSuperior.module.css'

export default function HeaderSuperior() {
  const { perfil, logout } = useAuth()
  const { modoOscuro, alternarTema } = useTema()

  const avatarInfo = AVATARES.find(a => a.id === perfil?.avatar) || AVATARES[0]

  return (
    <header className={styles.headerMovil}>
      <Link to="/" className={styles.marca}>
        <div className={styles.logoBadge}>S</div>
        <span className={styles.nombreApp}>STEAM</span>
      </Link>

      <div className={styles.acciones}>
        <div className={styles.nivelPill}>
          <span>⭐ {perfil?.puntosTotal || 0}</span>
        </div>

        <button
          type="button"
          onClick={alternarTema}
          className={styles.botonIcono}
          aria-label="Cambiar tema visual"
        >
          {modoOscuro ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <Link to="/perfil" className={styles.avatarEnlace} aria-label="Ir a mi perfil">
          <span className={styles.avatarMini}>{avatarInfo.emoji}</span>
        </Link>

        <button
          type="button"
          onClick={logout}
          className={`${styles.botonIcono} ${styles.botonSalir}`}
          aria-label="Cerrar sesión"
        >
          <LogOut size={17} />
        </button>
      </div>
    </header>
  )
}
