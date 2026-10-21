import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../features/auth/ProveedorAuth'
import { useTema } from '../features/tema/ProveedorTema'
import { AVATARES } from '../data/avatares'
import { Trophy, Award, Sun, Moon, LogOut, Check, Star, ShieldCheck } from 'lucide-react'
import styles from './Perfil.module.css'

export default function Perfil() {
  const { perfil, esDocente, actualizarPerfil, logout } = useAuth()
  const { modoOscuro, alternarTema } = useTema()
  const [editandoAvatar, setEditandoAvatar] = useState(false)
  const [mensajeGuardado, setMensajeGuardado] = useState('')

  const avatarActual = AVATARES.find(a => a.id === perfil?.avatar) || AVATARES[0]

  const puntosTotales = perfil?.puntosTotal || 0
  const puntosMat = perfil?.puntosPorArea?.matematicas || 0
  const puntosCie = perfil?.puntosPorArea?.ciencias || 0
  const puntosInf = perfil?.puntosPorArea?.informatica || 0

  // Insignias según Sección 11.4
  const catalogoInsignias = [
    { id: 'primer-codigo', nombre: 'Primer Código', desc: 'Resuelve tu primer reto de programación.', emoji: '🚀' },
    { id: 'matematico',    nombre: 'Matemático',    desc: 'Supera 5 retos del área de matemáticas.', emoji: '📐' },
    { id: 'cientifico',    nombre: 'Científico',    desc: 'Supera 5 retos del área de ciencias.',    emoji: '🔬' },
    { id: 'programador',   nombre: 'Programador',   desc: 'Supera 5 retos de informática.',          emoji: '💻' },
    { id: 'mente-steam',   nombre: 'Mente STEAM',   desc: 'Resuelve al menos un reto de cada área.', emoji: '🌟' },
    { id: 'cazador-qr',    nombre: 'Cazador de QR', desc: 'Escanea 10 flashcards físicas.',          emoji: '📸' },
  ]

  const insigniasUsuario = perfil?.insignias || ['primer-codigo']

  const handleCambiarAvatar = async (nuevoAvatarId) => {
    try {
      await actualizarPerfil({ avatar: nuevoAvatarId })
      setEditandoAvatar(false)
      setMensajeGuardado('¡Avatar actualizado!')
      setTimeout(() => setMensajeGuardado(''), 2500)
    } catch {
      // Ignorar error
    }
  }

  return (
    <div className={styles.contenedorPerfil}>
      {/* Cabecera del perfil */}
      <section className={styles.tarjetaUsuario}>
        <div className={styles.avatarGrandeWrap}>
          <div className={styles.avatarCirculo} style={{ borderColor: avatarActual.color }}>
            <span className={styles.avatarEmoji}>{avatarActual.emoji}</span>
          </div>
          <button
            type="button"
            onClick={() => setEditandoAvatar(!editandoAvatar)}
            className={styles.botonEditarAvatar}
          >
            {editandoAvatar ? 'Cerrar' : 'Cambiar avatar'}
          </button>
        </div>

        <div className={styles.datosUsuario}>
          <div className={styles.filaNombre}>
            <h1 className={styles.nombre}>{perfil?.nombreUsuario || 'Estudiante'}</h1>
            {esDocente ? (
              <span className={styles.badgeDocente}>
                <ShieldCheck size={14} />
                <span>Docente</span>
              </span>
            ) : (
              <span className={styles.badgeEstudiante}>Estudiante</span>
            )}
          </div>
          <p className={styles.curso}>Curso {perfil?.curso || '8A-2026'} · Grado Octavo</p>

          <div className={styles.puntosResumen}>
            <div className={styles.pillPuntos}>
              <Star size={16} />
              <span>{puntosTotales} puntos totales</span>
            </div>
            <div className={styles.pillNivel}>
              <span>Nivel {perfil?.nivel || 1} ({perfil?.nombreNivel || 'Explorador'})</span>
            </div>
          </div>
        </div>
      </section>

      {/* Notificación de guardado */}
      {mensajeGuardado && (
        <div className={styles.alertaGuardado}>
          <Check size={16} />
          <span>{mensajeGuardado}</span>
        </div>
      )}

      {/* Selector de nuevo avatar si está abierto */}
      {editandoAvatar && (
        <section className={styles.seccionSelectorAvatar}>
          <h3>Elige un nuevo avatar para tu perfil</h3>
          <div className={styles.gridAvatares}>
            {AVATARES.map((av) => (
              <button
                key={av.id}
                type="button"
                onClick={() => handleCambiarAvatar(av.id)}
                className={`${styles.itemOpcionAvatar} ${avatarActual.id === av.id ? styles.opcionActiva : ''}`}
                style={{ borderColor: avatarActual.id === av.id ? av.color : undefined }}
              >
                <span className={styles.emojiOpcion}>{av.emoji}</span>
                <span className={styles.nombreOpcion}>{av.nombre}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Puntos desglosados por Área */}
      <section className={styles.seccionDesglose}>
        <h2>Puntos por Área STEAM</h2>
        <div className={styles.cuadriculaAreasPuntos}>
          <div className={`${styles.cardAreaPunto} ${styles.puntoMat}`}>
            <span className={styles.nombreAreaPunto}>Matemáticas</span>
            <span className={styles.valorAreaPunto}>{puntosMat} pts</span>
            <div className={styles.barraAreaFondo}>
              <div className={styles.barraAreaRelleno} style={{ width: `${Math.min(100, (puntosMat / 150) * 100)}%` }} />
            </div>
          </div>

          <div className={`${styles.cardAreaPunto} ${styles.puntoCie}`}>
            <span className={styles.nombreAreaPunto}>Ciencias</span>
            <span className={styles.valorAreaPunto}>{puntosCie} pts</span>
            <div className={styles.barraAreaFondo}>
              <div className={styles.barraAreaRelleno} style={{ width: `${Math.min(100, (puntosCie / 150) * 100)}%` }} />
            </div>
          </div>

          <div className={`${styles.cardAreaPunto} ${styles.puntoInf}`}>
            <span className={styles.nombreAreaPunto}>Informática</span>
            <span className={styles.valorAreaPunto}>{puntosInf} pts</span>
            <div className={styles.barraAreaFondo}>
              <div className={styles.barraAreaRelleno} style={{ width: `${Math.min(100, (puntosInf / 150) * 100)}%` }} />
            </div>
          </div>
        </div>
      </section>

      {/* Insignias Obtenidas */}
      <section className={styles.seccionInsignias}>
        <div className={styles.cabeceraInsignias}>
          <h2>Tus Insignias</h2>
          <span>{insigniasUsuario.length} de {catalogoInsignias.length} desbloqueadas</span>
        </div>

        <div className={styles.gridInsignias}>
          {catalogoInsignias.map((ins) => {
            const desbloqueada = insigniasUsuario.includes(ins.id)
            return (
              <div
                key={ins.id}
                className={`${styles.cardInsignia} ${desbloqueada ? styles.insigniaActiva : styles.insigniaBloqueada}`}
              >
                <div className={styles.iconoInsignia}>
                  <span>{ins.emoji}</span>
                </div>
                <div className={styles.infoInsignia}>
                  <h4>{ins.nombre}</h4>
                  <p>{ins.desc}</p>
                </div>
                {desbloqueada && (
                  <div className={styles.checkInsignia}>
                    <Check size={14} />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* Configuración y Preferencias */}
      <section className={styles.seccionAjustes}>
        <h2>Preferencias</h2>
        <div className={styles.listaAjustes}>
          <div className={styles.filaAjuste}>
            <div>
              <span className={styles.tituloAjuste}>Aspecto visual</span>
              <p className={styles.descAjuste}>Cambia entre modo oscuro (recomendado para programar) y claro.</p>
            </div>
            <button
              type="button"
              onClick={alternarTema}
              className={styles.botonCambiarTema}
            >
              {modoOscuro ? <Sun size={18} /> : <Moon size={18} />}
              <span>{modoOscuro ? 'Activar Claro' : 'Activar Oscuro'}</span>
            </button>
          </div>

          {esDocente && (
            <div className={styles.filaAjuste}>
              <div>
                <span className={styles.tituloAjuste}>Panel de Administración Docente</span>
                <p className={styles.descAjuste}>Gestiona retos, genera flashcards con QR y exporta notas a CSV.</p>
              </div>
              <Link
                to="/docente"
                className={styles.botonCambiarTema}
                style={{ background: 'linear-gradient(135deg, #2563EB, #7C3AED)', color: '#FFFFFF', textDecoration: 'none' }}
              >
                <ShieldCheck size={18} />
                <span>Abrir Panel</span>
              </Link>
            </div>
          )}

          <div className={styles.filaAjuste}>
            <div>
              <span className={styles.tituloAjuste}>Cerrar sesión</span>
              <p className={styles.descAjuste}>Cierra tu sesión si estás usando un computador compartido.</p>
            </div>
            <button
              type="button"
              onClick={logout}
              className={styles.botonCerrarSesion}
            >
              <LogOut size={18} />
              <span>Cerrar sesión</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
