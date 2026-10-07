import React from 'react'
import styles from './PersonajeBit.module.css'

/**
 * Personaje animado "Bit" (Sección 12 del prompt maestro)
 * Robot amigable y expresivo que cambia según el área y el estado.
 */
export default function PersonajeBit({
  area = 'general',
  estado = 'reposo',
  tamano = 'md',
  mensaje = null,
  accesorio = null
}) {
  // Colores del área para los acentos de Bit
  const coloresArea = {
    general:      { primario: '#7C3AED', secundario: '#2563EB', luz: '#38BDF8' },
    matematicas:  { primario: '#2563EB', secundario: '#3B82F6', luz: '#06B6D4' },
    ciencias:     { primario: '#059669', secundario: '#10B981', luz: '#84CC16' },
    informatica:  { primario: '#7C3AED', secundario: '#A78BFA', luz: '#EC4899' },
  }

  const { primario, secundario, luz } = coloresArea[area] || coloresArea.general

  return (
    <div className={`${styles.contenedor} ${styles[tamano]} ${styles[`area_${area}`]}`}>
      {mensaje && (
        <div className={styles.globoDialogo}>
          <p>{mensaje}</p>
          <div className={styles.triangulo} />
        </div>
      )}

      <div className={`${styles.robotWrap} ${styles[estado]}`}>
        <svg viewBox="0 0 120 120" className={styles.svgRobot} aria-label="Mascota Bit">
          <defs>
            <linearGradient id={`gradCuerpo_${area}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={secundario} />
              <stop offset="100%" stopColor={primario} />
            </linearGradient>
            <linearGradient id={`gradPantalla_${area}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0F172A" />
              <stop offset="100%" stopColor="#1E293B" />
            </linearGradient>
          </defs>

          {/* Antena */}
          <line x1="60" y1="28" x2="60" y2="12" stroke={primario} strokeWidth="4" strokeLinecap="round" />
          <circle cx="60" cy="10" r="6" fill={luz}>
            <animate attributeName="opacity" values="1;0.4;1" dur="2s" repeatCount="indefinite" />
          </circle>

          {/* Orejas / Parlantes */}
          <rect x="22" y="44" width="8" height="20" rx="4" fill={primario} />
          <rect x="90" y="44" width="8" height="20" rx="4" fill={primario} />

          {/* Cabeza */}
          <rect x="28" y="26" width="64" height="54" rx="16" fill={`url(#gradCuerpo_${area})`} stroke="rgba(255,255,255,0.2)" strokeWidth="2" />

          {/* Pantalla de la cara */}
          <rect x="36" y="34" width="48" height="38" rx="10" fill={`url(#gradPantalla_${area})`} />

          {/* Ojos según el estado */}
          {estado === 'celebrando' ? (
            // Ojos felices (arco)
            <g stroke={luz} strokeWidth="3" fill="none" strokeLinecap="round">
              <path d="M 44 52 Q 49 44 54 52" />
              <path d="M 66 52 Q 71 44 76 52" />
            </g>
          ) : estado === 'pensando' ? (
            // Ojos mirando arriba a la derecha
            <g fill={luz}>
              <circle cx="52" cy="48" r="4" />
              <circle cx="74" cy="48" r="4" />
              <line x1="44" y1="42" x2="56" y2="44" stroke={luz} strokeWidth="2" strokeLinecap="round" />
            </g>
          ) : estado === 'animando' ? (
            // Ojos guiño
            <g fill={luz}>
              <circle cx="48" cy="52" r="4" />
              <path d="M 68 52 Q 73 56 78 52" stroke={luz} strokeWidth="3" fill="none" strokeLinecap="round" />
            </g>
          ) : (
            // Ojos normales parpadeando
            <g fill={luz} className={styles.ojos}>
              <circle cx="48" cy="52" r="5" />
              <circle cx="72" cy="52" r="5" />
            </g>
          )}

          {/* Boca sonriente */}
          {estado === 'celebrando' ? (
            <path d="M 52 64 Q 60 70 68 64" stroke={luz} strokeWidth="2.5" fill="none" strokeLinecap="round" />
          ) : (
            <line x1="55" y1="64" x2="65" y2="64" stroke={luz} strokeWidth="2" strokeLinecap="round" opacity="0.8" />
          )}

          {/* Cuello */}
          <rect x="52" y="80" width="16" height="8" rx="3" fill="#334155" />

          {/* Pecho / Cuerpo */}
          <rect x="36" y="88" width="48" height="28" rx="10" fill={`url(#gradCuerpo_${area})`} stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" />

          {/* Símbolo en el pecho según el área */}
          {area === 'matematicas' && (
            <text x="60" y="106" textAnchor="middle" fill="#FFFFFF" fontSize="13" fontWeight="bold" fontFamily="monospace">∑</text>
          )}
          {area === 'ciencias' && (
            <text x="60" y="106" textAnchor="middle" fill="#FFFFFF" fontSize="12" fontWeight="bold">⚛</text>
          )}
          {area === 'informatica' && (
            <text x="60" y="106" textAnchor="middle" fill="#FFFFFF" fontSize="11" fontWeight="bold" fontFamily="monospace">&lt;/&gt;</text>
          )}
          {area === 'general' && (
            <circle cx="60" cy="102" r="4" fill={luz} />
          )}

          {/* Accesorio opcional */}
          {accesorio === 'laboratorio' && (
            <circle cx="92" cy="74" r="6" fill="#84CC16" opacity="0.9" />
          )}
        </svg>
      </div>
    </div>
  )
}
