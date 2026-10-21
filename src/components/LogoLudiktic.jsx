import React from 'react'
import { Link } from 'react-router-dom'
import styles from './LogoLudiktic.module.css'

/**
 * Logotipo oficial de LUDIKTIC (Nombre y marca con icono QR)
 * @param {string} tamano 'sm' | 'md' | 'lg' | 'xl'
 * @param {boolean} link Si enlaza al inicio al hacer clic
 * @param {string} subtitulo Subtítulo debajo de LUDIKTIC
 */
export default function LogoLudiktic({
  tamano = 'md',
  link = true,
  subtitulo = 'STEAM · GRADO 8°',
  className = ''
}) {
  const contenido = (
    <div className={`${styles.contenedorLogo} ${styles[tamano]} ${className}`}>
      {/* Icono QR estilizado y holográfico */}
      <div className={styles.iconoBadge}>
        <svg
          viewBox="0 0 40 40"
          className={styles.svgQr}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Esquina superior izquierda */}
          <rect x="6" y="6" width="10" height="10" rx="2" stroke="#00D2FF" strokeWidth="2.5" />
          <rect x="9.5" y="9.5" width="3" height="3" fill="#00D2FF" />

          {/* Esquina superior derecha */}
          <rect x="24" y="6" width="10" height="10" rx="2" stroke="#38BDF8" strokeWidth="2.5" />
          <rect x="27.5" y="9.5" width="3" height="3" fill="#38BDF8" />

          {/* Esquina inferior izquierda */}
          <rect x="6" y="24" width="10" height="10" rx="2" stroke="#A855F7" strokeWidth="2.5" />
          <rect x="9.5" y="27.5" width="3" height="3" fill="#A855F7" />

          {/* Módulos de datos centrales y patrón dinámico */}
          <rect x="20" y="20" width="4" height="4" rx="1" fill="#EC4899" />
          <rect x="26" y="24" width="3" height="3" rx="0.5" fill="#38BDF8" />
          <rect x="31" y="27" width="3" height="3" rx="0.5" fill="#00D2FF" />
          <rect x="24" y="31" width="3" height="3" rx="0.5" fill="#A855F7" />
          <rect x="20" y="10" width="2" height="6" rx="0.5" fill="#00D2FF" />
          <rect x="10" y="20" width="6" height="2" rx="0.5" fill="#A855F7" />

          {/* Rayo de luz diagonal sutil */}
          <line x1="5" y1="5" x2="35" y2="35" stroke="rgba(255,255,255,0.25)" strokeWidth="1" strokeDasharray="2 4" />
        </svg>
      </div>

      {/* Nombre LUDIKTIC */}
      <div className={styles.textosLogo}>
        <span className={styles.nombreLudiktic}>LUDIKTIC</span>
        {subtitulo && <span className={styles.subtituloLogo}>{subtitulo}</span>}
      </div>
    </div>
  )

  if (link) {
    return (
      <Link to="/" style={{ textDecoration: 'none' }} aria-label="Ir a inicio de LUDIKTIC">
        {contenido}
      </Link>
    )
  }

  return contenido
}
