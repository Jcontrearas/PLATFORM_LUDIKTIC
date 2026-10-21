import { NavLink } from 'react-router-dom'
import { Home, Layers, QrCode, Trophy, User, ShieldCheck, Sun, Moon, LogOut } from 'lucide-react'
import { useAuth } from '../features/auth/ProveedorAuth'
import { useTema } from '../features/tema/ProveedorTema'
import { AVATARES } from '../data/avatares'
import LogoLudiktic from './LogoLudiktic'
import styles from './BarraLateral.module.css'

export default function BarraLateral() {
  const { perfil, esDocente, logout } = useAuth()
  const { modoOscuro, alternarTema } = useTema()

  const avatarInfo = AVATARES.find(a => a.id === perfil?.avatar) || AVATARES[0]

  return (
    <aside className={styles.sidebar} aria-label="Navegación de escritorio">
      {/* Cabecera / Marca LUDIKTIC */}
      <div style={{ padding: '4px 0 12px 0' }}>
        <LogoLudiktic tamano="md" subtitulo="STEAM · GRADO 8°" />
      </div>

      {/* Tarjeta de usuario activa */}
      <div className={styles.tarjetaUsuario}>
        <div className={styles.avatarCirculo} style={{ borderColor: avatarInfo.color }}>
          <span className={styles.avatarEmoji}>{avatarInfo.emoji}</span>
        </div>
        <div className={styles.usuarioInfo}>
          <span className={styles.nombreUsuario}>{perfil?.nombreUsuario || 'Estudiante'}</span>
          <span className={styles.cursoBadge}>{perfil?.curso || '8A'} · {perfil?.nombreNivel || 'Explorador'}</span>
          <span className={styles.puntosBadge}>⭐ {perfil?.puntosTotal || 0} pts</span>
        </div>
      </div>

      {/* Menú de navegación */}
      <nav className={styles.navegacion}>
        <NavLink
          to="/"
          className={({ isActive }) => `${styles.itemNav} ${isActive ? styles.activo : ''}`}
          end
        >
          <Home size={20} />
          <span>Inicio</span>
        </NavLink>

        <NavLink
          to="/areas"
          className={({ isActive }) => `${styles.itemNav} ${isActive ? styles.activo : ''}`}
        >
          <Layers size={20} />
          <span>Áreas STEAM</span>
        </NavLink>

        <NavLink
          to="/escanear"
          className={({ isActive }) => `${styles.itemNav} ${isActive ? styles.activo : ''}`}
        >
          <QrCode size={20} />
          <span>Escanear QR</span>
        </NavLink>

        <NavLink
          to="/clasificacion"
          className={({ isActive }) => `${styles.itemNav} ${isActive ? styles.activo : ''}`}
        >
          <Trophy size={20} />
          <span>Clasificación</span>
        </NavLink>

        <NavLink
          to="/perfil"
          className={({ isActive }) => `${styles.itemNav} ${isActive ? styles.activo : ''}`}
        >
          <User size={20} />
          <span>Mi Perfil</span>
        </NavLink>

        {esDocente && (
          <NavLink
            to="/docente"
            className={({ isActive }) => `${styles.itemNav} ${styles.itemDocente} ${isActive ? styles.activo : ''}`}
          >
            <ShieldCheck size={20} />
            <span>Panel Docente</span>
          </NavLink>
        )}
      </nav>

      {/* Pie de barra lateral */}
      <div className={styles.pieSidebar}>
        <button
          type="button"
          onClick={alternarTema}
          className={styles.botonTema}
          aria-label="Cambiar tema visual"
        >
          {modoOscuro ? <Sun size={18} /> : <Moon size={18} />}
          <span>{modoOscuro ? 'Modo claro' : 'Modo oscuro'}</span>
        </button>

        <button
          type="button"
          onClick={logout}
          className={styles.botonLogout}
          aria-label="Cerrar sesión"
        >
          <LogOut size={18} />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  )
}
