import React, { useState } from 'react'
import styles from './PersonajeBit.module.css'

/**
 * Personaje animado "Bit" (Sección 12 del prompt maestro)
 * Robot amigable y expresivo que cambia según el área, el contexto del problema y el estado emocional.
 *
 * @param {string} area 'matematicas' | 'ciencias' | 'informatica' | 'general'
 * @param {string} estado 'reposo' | 'pensando' | 'celebrando' | 'animando' | 'pista'
 * @param {string} contexto 'tienda' | 'deporte' | 'cocina' | 'espacio' | 'naturaleza' | 'musica' | 'laboratorio' | 'computador' | 'ciudad' | 'cuerpoHumano' | 'paseo'
 * @param {string} tamano 'sm' | 'md' | 'lg' | 'xl'
 * @param {string} mensaje Globo de diálogo narrativo
 * @param {string} accesorio Alias opcional de contexto
 */
export default function PersonajeBit({
  area = 'general',
  estado = 'reposo',
  contexto = null,
  accesorio = null,
  tamano = 'md',
  mensaje = null,
  onClick = null
}) {
  const [globoVisible, setGloboVisible] = useState(true)

  // Contexto activo (prioriza prop contexto o accesorio)
  const temaContexto = contexto || accesorio

  // Paleta de colores STEAM del robot por área
  const paletas = {
    matematicas: {
      primario: '#2563EB',
      secundario: '#3B82F6',
      acento: '#06B6D4',
      luz: '#38BDF8',
      brilloPecho: '#60A5FA'
    },
    ciencias: {
      primario: '#059669',
      secundario: '#10B981',
      acento: '#84CC16',
      luz: '#34D399',
      brilloPecho: '#6EE7B7'
    },
    informatica: {
      primario: '#7C3AED',
      secundario: '#9333EA',
      acento: '#EC4899',
      luz: '#C084FC',
      brilloPecho: '#E879F9'
    },
    general: {
      primario: '#4F46E5',
      secundario: '#6366F1',
      acento: '#06B6D4',
      luz: '#818CF8',
      brilloPecho: '#A5B4FC'
    }
  }

  const { primario, secundario, acento, luz, brilloPecho } = paletas[area] || paletas.general

  return (
    <div
      className={`${styles.contenedor} ${styles[tamano]} ${styles[`area_${area}`]}`}
      onClick={onClick}
    >
      {/* Globo de diálogo narrativo */}
      {mensaje && globoVisible && (
        <div
          className={styles.globoDialogo}
          onClick={(e) => {
            e.stopPropagation()
            setGloboVisible(false)
          }}
          title="Toca para ocultar mensaje"
        >
          <p>{mensaje}</p>
          <div className={styles.triangulo} />
        </div>
      )}

      <div className={`${styles.robotWrap} ${styles[estado] || styles.reposo}`}>
        <svg viewBox="0 0 140 140" className={styles.svgRobot} aria-label="Mascota Bit STEAM">
          <defs>
            {/* Gradiente del cuerpo */}
            <linearGradient id={`gradCuerpo_${area}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={secundario} />
              <stop offset="100%" stopColor={primario} />
            </linearGradient>

            {/* Gradiente de la pantalla de la cara */}
            <linearGradient id={`gradPantalla_${area}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0B132B" />
              <stop offset="100%" stopColor="#1C2541" />
            </linearGradient>

            {/* Brillo de luz de antena */}
            <filter id={`resplandor_${area}`} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            {/* Gradiente de casco espacial si aplica */}
            <radialGradient id="gradCasco" cx="50%" cy="40%" r="60%">
              <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
              <stop offset="70%" stopColor="rgba(56,189,248,0.15)" />
              <stop offset="100%" stopColor="rgba(14,165,233,0.35)" />
            </radialGradient>
          </defs>

          {/* ================= 1. ACCESORIO TRASERO: ESPACIO / AURA ================= */}
          {temaContexto === 'espacio' && (
            <g opacity="0.8">
              <circle cx="24" cy="20" r="1.5" fill="#FDE047" />
              <circle cx="116" cy="24" r="2" fill="#FDE047" />
              <circle cx="125" cy="80" r="1.5" fill="#38BDF8" />
              <circle cx="15" cy="90" r="2" fill="#FFFFFF" />
            </g>
          )}

          {/* ================= 2. ANTENA SUPERIOR CON ESTADO PISTA ================= */}
          {estado === 'pista' ? (
            // Bombilla de idea encendida
            <g transform="translate(70, 16)">
              <circle cx="0" cy="0" r="14" fill="#FBBF24" opacity="0.3" filter={`url(#resplandor_${area})`}>
                <animate attributeName="r" values="12;16;12" dur="1.2s" repeatCount="indefinite" />
              </circle>
              {/* Bombilla */}
              <circle cx="0" cy="0" r="8" fill="#FDE047" />
              <path d="M -4 5 L 4 5 L 2 9 L -2 9 Z" fill="#94A3B8" />
              {/* Rayos de luz */}
              <line x1="-12" y1="-12" x2="-8" y2="-8" stroke="#FDE047" strokeWidth="2" strokeLinecap="round" />
              <line x1="12" y1="-12" x2="8" y2="-8" stroke="#FDE047" strokeWidth="2" strokeLinecap="round" />
              <line x1="0" y1="-14" x2="0" y2="-10" stroke="#FDE047" strokeWidth="2" strokeLinecap="round" />
            </g>
          ) : (
            // Antena estándar con LED pulsante
            <g>
              <line x1="70" y1="36" x2="70" y2="16" stroke={primario} strokeWidth="4.5" strokeLinecap="round" />
              <circle cx="70" cy="14" r="7" fill={luz} filter={`url(#resplandor_${area})`}>
                <animate attributeName="opacity" values="1;0.4;1" dur="2s" repeatCount="indefinite" />
              </circle>
            </g>
          )}

          {/* ================= 3. BRAZOS LATERALES ================= */}
          {estado === 'celebrando' ? (
            // Brazos alzados de victoria
            <g stroke={primario} strokeWidth="6" strokeLinecap="round" fill="none">
              <path d="M 36 94 Q 18 70 20 46" />
              <circle cx="20" cy="44" r="5" fill={acento} />
              <path d="M 104 94 Q 122 70 120 46" />
              <circle cx="120" cy="44" r="5" fill={acento} />
            </g>
          ) : estado === 'animando' ? (
            // Brazo derecho saludando
            <g stroke={primario} strokeWidth="6" strokeLinecap="round" fill="none">
              <path d="M 36 94 Q 22 104 22 112" />
              <circle cx="22" cy="114" r="4.5" fill={acento} />
              <path d="M 104 94 Q 120 78 122 62" />
              <circle cx="122" cy="60" r="5" fill={acento} />
            </g>
          ) : (
            // Brazos en reposo a los lados
            <g stroke={primario} strokeWidth="6" strokeLinecap="round" fill="none">
              <path d="M 38 94 Q 24 102 24 114" />
              <circle cx="24" cy="116" r="4.5" fill={acento} />
              <path d="M 102 94 Q 116 102 116 114" />
              <circle cx="116" cy="116" r="4.5" fill={acento} />
            </g>
          )}

          {/* ================= 4. ACCESORIOS DE CABEZA / OREJAS ================= */}
          {/* Informática o Música: Audífonos tipo gaming/coder con luces */}
          {(area === 'informatica' || temaContexto === 'musica') ? (
            <g>
              {/* Diadema de los audífonos */}
              <path d="M 28 58 Q 70 18 112 58" fill="none" stroke="#334155" strokeWidth="6" strokeLinecap="round" />
              {/* Almohadilla izquierda */}
              <rect x="22" y="50" width="10" height="24" rx="5" fill="#1E293B" stroke={acento} strokeWidth="2" />
              <circle cx="27" cy="62" r="3" fill={acento} />
              {/* Almohadilla derecha */}
              <rect x="108" y="50" width="10" height="24" rx="5" fill="#1E293B" stroke={acento} strokeWidth="2" />
              <circle cx="113" cy="62" r="3" fill={acento} />
            </g>
          ) : (
            // Orejas estándar de parlante
            <g>
              <rect x="26" y="52" width="9" height="20" rx="4.5" fill={primario} stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
              <rect x="105" y="52" width="9" height="20" rx="4.5" fill={primario} stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
            </g>
          )}

          {/* ================= 5. CABEZA DEL ROBOT ================= */}
          <rect
            x="34"
            y="32"
            width="72"
            height="58"
            rx="18"
            fill={`url(#gradCuerpo_${area})`}
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="2.5"
          />

          {/* Pantalla digital de la cara */}
          <rect
            x="42"
            y="40"
            width="56"
            height="42"
            rx="12"
            fill={`url(#gradPantalla_${area})`}
            stroke="rgba(255,255,255,0.12)"
            strokeWidth="1.5"
          />

          {/* ================= 6. OJOS Y EXPRESIÓN SEGÚN ESTADO ================= */}
          {estado === 'celebrando' ? (
            // Ojos felices en arco con destellos
            <g stroke={luz} strokeWidth="3.5" fill="none" strokeLinecap="round">
              <path d="M 50 60 Q 56 50 62 60" />
              <path d="M 78 60 Q 84 50 90 60" />
            </g>
          ) : estado === 'pensando' ? (
            // Ojos concentrados escaneando con engranaje giratorio
            <g>
              <g className={styles.engranajeGiro}>
                <circle cx="70" cy="61" r="5" fill="none" stroke={luz} strokeWidth="1.5" strokeDasharray="3 2" />
              </g>
              <circle cx="56" cy="59" r="4.5" fill={luz} />
              <circle cx="84" cy="59" r="4.5" fill={luz} />
              <line x1="50" y1="52" x2="62" y2="54" stroke={luz} strokeWidth="2" strokeLinecap="round" />
              <line x1="90" y1="52" x2="78" y2="54" stroke={luz} strokeWidth="2" strokeLinecap="round" />
            </g>
          ) : estado === 'animando' ? (
            // Ojo izquierdo guiñando, ojo derecho abierto
            <g fill={luz}>
              <circle cx="54" cy="60" r="5" />
              <path d="M 80 61 Q 86 66 92 61" stroke={luz} strokeWidth="3.5" fill="none" strokeLinecap="round" />
            </g>
          ) : estado === 'pista' ? (
            // Ojos grandes asombrados
            <g fill={luz}>
              <circle cx="54" cy="60" r="6" />
              <circle cx="86" cy="60" r="6" />
              <circle cx="52" cy="58" r="2" fill="#FFFFFF" />
              <circle cx="84" cy="58" r="2" fill="#FFFFFF" />
            </g>
          ) : (
            // Reposo: ojos con pupilas LED y animación de parpadeo
            <g fill={luz} className={styles.ojos}>
              <circle cx="54" cy="60" r="5" />
              <circle cx="86" cy="60" r="5" />
              <circle cx="52" cy="58" r="1.5" fill="#FFFFFF" />
              <circle cx="84" cy="58" r="1.5" fill="#FFFFFF" />
            </g>
          )}

          {/* Boca del robot */}
          {estado === 'celebrando' ? (
            <path d="M 60 72 Q 70 80 80 72" stroke={luz} strokeWidth="3" fill="none" strokeLinecap="round" />
          ) : estado === 'pensando' ? (
            <circle cx="70" cy="73" r="2.5" fill={luz} opacity="0.8" />
          ) : estado === 'animando' ? (
            <path d="M 63 72 Q 70 77 77 72" stroke={luz} strokeWidth="2.5" fill="none" strokeLinecap="round" />
          ) : (
            <line x1="64" y1="73" x2="76" y2="73" stroke={luz} strokeWidth="2.5" strokeLinecap="round" opacity="0.85" />
          )}

          {/* ================= 7. ACCESORIOS DE ÁREA EN CABEZA ================= */}
          {/* Ciencias: Gafas protectoras de laboratorio */}
          {area === 'ciencias' && (
            <g stroke="#6EE7B7" strokeWidth="2" fill="none" opacity="0.9">
              <circle cx="54" cy="60" r="10" />
              <circle cx="86" cy="60" r="10" />
              <line x1="64" y1="60" x2="76" y2="60" stroke="#6EE7B7" strokeWidth="2.5" />
            </g>
          )}

          {/* Matemáticas: Regla graduada miniatura sobre la oreja */}
          {area === 'matematicas' && (
            <g transform="translate(98, 38) rotate(20)">
              <rect x="0" y="0" width="6" height="24" rx="1.5" fill="#FCD34D" stroke="#B45309" strokeWidth="0.8" />
              <line x1="0" y1="5" x2="3" y2="5" stroke="#78350F" strokeWidth="0.8" />
              <line x1="0" y1="10" x2="4" y2="10" stroke="#78350F" strokeWidth="0.8" />
              <line x1="0" y1="15" x2="3" y2="15" stroke="#78350F" strokeWidth="0.8" />
              <line x1="0" y1="20" x2="4" y2="20" stroke="#78350F" strokeWidth="0.8" />
            </g>
          )}

          {/* ================= 8. ACCESORIOS DE CONTEXTO ESPECÍFICO ================= */}
          {/* Cocina: Gorro de chef */}
          {temaContexto === 'cocina' && (
            <g transform="translate(52, 12)">
              <path d="M 4 20 Q 2 6 12 6 Q 18 0 26 6 Q 34 2 36 20 Z" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
              <rect x="4" y="18" width="32" height="5" rx="1" fill="#F1F5F9" />
            </g>
          )}

          {/* Deporte: Visera / gorra deportiva */}
          {temaContexto === 'deporte' && (
            <g transform="translate(40, 26)">
              <path d="M 0 10 Q 30 2 60 10 L 68 12 Q 30 6 -4 14 Z" fill="#EF4444" />
            </g>
          )}

          {/* Espacio: Burbuja de casco espacial translúcida */}
          {temaContexto === 'espacio' && (
            <ellipse cx="70" cy="58" rx="44" ry="38" fill="url(#gradCasco)" stroke="rgba(255,255,255,0.6)" strokeWidth="2" />
          )}

          {/* Naturaleza: Brote de hojitas verdes en la cabeza */}
          {temaContexto === 'naturaleza' && (
            <g transform="translate(70, 22)">
              <path d="M 0 6 Q -10 -2 -4 -10 Q 2 -4 0 6" fill="#4ADE80" stroke="#166534" strokeWidth="1" />
              <path d="M 0 6 Q 10 -2 4 -10 Q -2 -4 0 6" fill="#86EFAC" stroke="#166534" strokeWidth="1" />
            </g>
          )}

          {/* ================= 9. CUELLO ================= */}
          <rect x="62" y="90" width="16" height="8" rx="3" fill="#334155" />

          {/* ================= 10. CUERPO Y PECHO ================= */}
          <rect
            x="44"
            y="98"
            width="52"
            height="34"
            rx="12"
            fill={`url(#gradCuerpo_${area})`}
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="2"
          />

          {/* Pantalla del pecho con símbolos temáticos */}
          <rect x="52" y="104" width="36" height="22" rx="7" fill="#0F172A" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />

          {/* Simbología en el pecho según área */}
          {area === 'matematicas' && (
            <text x="70" y="120" textAnchor="middle" fill={brilloPecho} fontSize="13" fontWeight="900" fontFamily="sans-serif">
              ∑ π
            </text>
          )}
          {area === 'ciencias' && (
            <text x="70" y="120" textAnchor="middle" fill={brilloPecho} fontSize="13" fontWeight="bold">
              ⚛
            </text>
          )}
          {area === 'informatica' && (
            <text x="70" y="120" textAnchor="middle" fill={brilloPecho} fontSize="11" fontWeight="bold" fontFamily="monospace">
              &lt;/&gt;
            </text>
          )}
          {area === 'general' && (
            <circle cx="70" cy="115" r="4.5" fill={luz} filter={`url(#resplandor_${area})`}>
              <animate attributeName="r" values="3.5;5;3.5" dur="1.8s" repeatCount="indefinite" />
            </circle>
          )}

          {/* Bata de laboratorio para ciencias en el cuerpo */}
          {area === 'ciencias' && (
            <g stroke="#F8FAFC" strokeWidth="2" fill="none" opacity="0.6">
              <path d="M 46 98 L 56 116" />
              <path d="M 94 98 L 84 116" />
            </g>
          )}

          {/* Delantal de tienda escolar */}
          {temaContexto === 'tienda' && (
            <g>
              <path d="M 52 108 L 88 108 L 84 130 L 56 130 Z" fill="#F59E0B" opacity="0.75" />
              <circle cx="70" cy="120" r="3" fill="#FEF08A" />
            </g>
          )}

          {/* ================= 11. ACCESORIOS DE MANO (DERECHA / IZQUIERDA) ================= */}
          {/* Tubo de ensayo para laboratorio o ciencias */}
          {(temaContexto === 'laboratorio' || area === 'ciencias') && (
            <g transform="translate(108, 98) rotate(15)">
              <rect x="0" y="0" width="7" height="22" rx="3.5" fill="rgba(255,255,255,0.7)" stroke="#94A3B8" strokeWidth="1" />
              <rect x="1" y="10" width="5" height="11" rx="2.5" fill="#10B981" />
              <circle cx="3.5" cy="13" r="1" fill="#FFFFFF" />
            </g>
          )}

          {/* Balón deportivo */}
          {temaContexto === 'deporte' && (
            <g transform="translate(16, 102)">
              <circle cx="8" cy="8" r="8" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1.5" />
              <polygon points="8,5 11,7 10,11 6,11 5,7" fill="#0F172A" />
            </g>
          )}

          {/* Nota musical flotante */}
          {temaContexto === 'musica' && (
            <g className={styles.notaMusicalFlotante} transform="translate(112, 42)">
              <text x="0" y="0" fill="#EC4899" fontSize="16" fontWeight="bold">♪</text>
            </g>
          )}
        </svg>
      </div>
    </div>
  )
}
