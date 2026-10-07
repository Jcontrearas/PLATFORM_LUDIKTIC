import { Link } from 'react-router-dom'
import { Lock, CheckCircle2, Star, ArrowRight, QrCode } from 'lucide-react'
import styles from './TarjetaReto.module.css'

/**
 * Componente TarjetaReto (Sección 9.1 del prompt maestro)
 * Muestra el reto con sus estrellas de nivel, puntos, componentes STEAM y estado.
 */
export default function TarjetaReto({ reto, estado = 'disponible', alIntentarBloqueado }) {
  const { id, area, titulo, nivel, puntos, steam } = reto

  // Mapeo de componentes STEAM con nombres y colores
  const nombresSteam = {
    C: { letra: 'C', nombre: 'Ciencia',     color: '#10B981' },
    T: { letra: 'T', nombre: 'Tecnología',  color: '#3B82F6' },
    I: { letra: 'I', nombre: 'Ingeniería',  color: '#8B5CF6' },
    A: { letra: 'A', nombre: 'Arte',        color: '#EC4899' },
    M: { letra: 'M', nombre: 'Matemáticas', color: '#06B6D4' }
  }

  const estrellas = '★'.repeat(nivel)
  const esBloqueado = estado === 'bloqueado'
  const esResuelto  = estado === 'resuelto'

  const handleClick = (e) => {
    if (esBloqueado) {
      e.preventDefault()
      if (alIntentarBloqueado) alIntentarBloqueado(reto)
    }
  }

  return (
    <Link
      to={`/reto/${id}`}
      onClick={handleClick}
      className={`${styles.tarjeta} ${styles[`area_${area}`]} ${esBloqueado ? styles.bloqueada : ''} ${esResuelto ? styles.resuelta : ''}`}
    >
      {/* Cabecera de la tarjeta: ID y Estado */}
      <div className={styles.cabecera}>
        <span className={styles.codigoId}>{id}</span>
        <div className={styles.estadoBadge}>
          {esResuelto ? (
            <span className={styles.badgeResuelto}>
              <CheckCircle2 size={14} />
              <span>Resuelto</span>
            </span>
          ) : esBloqueado ? (
            <span className={styles.badgeBloqueado}>
              <Lock size={13} />
              <span>Con QR</span>
            </span>
          ) : (
            <span className={styles.badgeDisponible}>Disponible</span>
          )}
        </div>
      </div>

      {/* Título del reto */}
      <h3 className={styles.titulo}>{titulo}</h3>

      {/* Badges de componentes STEAM */}
      <div className={styles.componentesSteam}>
        {steam?.map((letra) => {
          const comp = nombresSteam[letra] || { letra, nombre: letra, color: '#94A3B8' }
          return (
            <span
              key={letra}
              className={styles.chipSteam}
              style={{ backgroundColor: `${comp.color}20`, color: comp.color, borderColor: `${comp.color}50` }}
              title={`Trabaja componente: ${comp.nombre}`}
            >
              {comp.nombre}
            </span>
          )
        })}
      </div>

      {/* Pie de tarjeta: Dificultad, Puntos y Acción */}
      <div className={styles.pieTarjeta}>
        <div className={styles.infoNivel}>
          <span className={styles.estrellas} title={`Dificultad nivel ${nivel}`}>{estrellas}</span>
          <span className={styles.puntosValor}>+{puntos} pts</span>
        </div>

        <div className={styles.iconoAccion}>
          {esBloqueado ? (
            <QrCode size={18} className={styles.iconoQr} />
          ) : (
            <ArrowRight size={18} className={styles.flechaIr} />
          )}
        </div>
      </div>
    </Link>
  )
}
