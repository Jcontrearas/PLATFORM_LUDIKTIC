import { Outlet } from 'react-router-dom'
import BarraLateral from './BarraLateral'
import HeaderSuperior from './HeaderSuperior'
import NavbarInferior from './NavbarInferior'
import styles from './LayoutPrincipal.module.css'

/**
 * Layout principal responsive para las páginas autenticadas:
 * - Computador: Barra lateral izquierda fija + contenido principal
 * - Celular: Header superior fijo + contenido + Barra inferior fija
 */
export default function LayoutPrincipal() {
  return (
    <div className={styles.contenedorApp}>
      {/* Barra lateral en computadores */}
      <BarraLateral />

      {/* Cabecera en celulares */}
      <HeaderSuperior />

      {/* Área de contenido de la página actual */}
      <main className={styles.areaContenido}>
        <div className={styles.limiteAncho}>
          <Outlet />
        </div>
      </main>

      {/* Barra de navegación inferior en celulares */}
      <NavbarInferior />
    </div>
  )
}
