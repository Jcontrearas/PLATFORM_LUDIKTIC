import { Link } from 'react-router-dom'
import { useAuth } from '../features/auth/ProveedorAuth'
import { AVATARES } from '../data/avatares'
import PersonajeBit from '../components/PersonajeBit'
import { Flame, Star, Trophy, QrCode, ArrowRight, BookOpen, Atom, Terminal } from 'lucide-react'
import styles from './Inicio.module.css'

export default function Inicio() {
  const { perfil } = useAuth()

  const avatarInfo = AVATARES.find(a => a.id === perfil?.avatar) || AVATARES[0]
  const puntos = perfil?.puntosTotal || 0

  // Cálculo de progreso de nivel (Sección 11.3)
  // Niveles: 1: Explorador (0), 2: Aprendiz (100), 3: Inventor (300), 4: Científico (600), 5: Maestro (1000)
  const niveles = [
    { nivel: 1, nombre: 'Explorador', min: 0, max: 100 },
    { nivel: 2, nombre: 'Aprendiz', min: 100, max: 300 },
    { nivel: 3, nombre: 'Inventor', min: 300, max: 600 },
    { nivel: 4, nombre: 'Científico', min: 600, max: 1000 },
    { nivel: 5, nombre: 'Maestro STEAM', min: 1000, max: 1000 },
  ]

  const nivelActual = niveles.find(n => puntos >= n.min && (puntos < n.max || n.nivel === 5)) || niveles[0]
  const puntosEnNivel = puntos - nivelActual.min
  const rangoNivel = nivelActual.max - nivelActual.min || 1
  const porcentajeNivel = nivelActual.nivel === 5 ? 100 : Math.min(100, Math.round((puntosEnNivel / rangoNivel) * 100))

  return (
    <div className={styles.contenedorInicio}>
      {/* Saludo y Mascota Hero */}
      <section className={styles.heroBienvenida}>
        <div className={styles.textosBienvenida}>
          <div className={styles.etiquetaCurso}>Curso {perfil?.curso || '8A-2026'}</div>
          <h1 className={styles.saludo}>
            ¡Hola, <span className={styles.nombreResaltado}>{perfil?.nombreUsuario || 'Estudiante'}</span>!
          </h1>
          <p className={styles.fraseMotivacional}>
            Hoy es un gran día para resolver problemas del mundo real programando en Python.
          </p>

          <div className={styles.filaAccionesHero}>
            <Link to="/escanear" className={styles.botonEscanearHero}>
              <QrCode size={20} />
              <span>Escanear Flashcard</span>
            </Link>
            <Link to="/areas" className={styles.botonExplorarHero}>
              <span>Ver Retos</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>

        <div className={styles.bitHeroWrap}>
          <PersonajeBit
            area="general"
            estado="reposo"
            tamano="md"
            mensaje="¡Tengo 18 retos STEAM listos para que los pongas a prueba!"
          />
        </div>
      </section>

      {/* Tarjetas de Estadísticas Gamificadas */}
      <section className={styles.filaEstadisticas}>
        {/* Puntos y Nivel */}
        <div className={styles.cardEstadistica}>
          <div className={styles.iconoEstadistica} style={{ background: 'rgba(251, 191, 36, 0.15)', color: '#FBBF24' }}>
            <Star size={24} />
          </div>
          <div className={styles.infoEstadistica}>
            <span className={styles.tituloEstadistica}>Nivel {nivelActual.nivel} · {nivelActual.nombre}</span>
            <span className={styles.valorEstadistica}>{puntos} <small>pts</small></span>
            <div className={styles.barraProgresoFondo}>
              <div className={styles.barraProgresoRelleno} style={{ width: `${porcentajeNivel}%` }} />
            </div>
            <span className={styles.subProgreso}>
              {nivelActual.nivel === 5 ? '¡Nivel máximo alcanzado!' : `${puntosEnNivel} / ${rangoNivel} pts para el siguiente nivel`}
            </span>
          </div>
        </div>

        {/* Racha de Días */}
        <div className={styles.cardEstadistica}>
          <div className={styles.iconoEstadistica} style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#EF4444' }}>
            <Flame size={24} />
          </div>
          <div className={styles.infoEstadistica}>
            <span className={styles.tituloEstadistica}>Racha de Práctica</span>
            <span className={styles.valorEstadistica}>{perfil?.racha || 1} <small>días</small></span>
            <span className={styles.subProgreso}>¡Sigue practicando para no perder tu fuego! 🔥</span>
          </div>
        </div>

        {/* Retos desbloqueados */}
        <div className={styles.cardEstadistica}>
          <div className={styles.iconoEstadistica} style={{ background: 'rgba(124, 58, 237, 0.15)', color: '#A78BFA' }}>
            <Trophy size={24} />
          </div>
          <div className={styles.infoEstadistica}>
            <span className={styles.tituloEstadistica}>Retos Desbloqueados</span>
            <span className={styles.valorEstadistica}>{perfil?.retosDesbloqueados?.length || 3} <small>/ 18</small></span>
            <span className={styles.subProgreso}>Escanea flashcards con QR para desbloquear más.</span>
          </div>
        </div>
      </section>

      {/* Acceso Rápido a las 3 Áreas STEAM */}
      <section className={styles.seccionAreas}>
        <div className={styles.cabeceraSeccion}>
          <h2>Explora las 3 Áreas STEAM</h2>
          <Link to="/areas" className={styles.enlaceVerTodas}>Ver catálogo completo →</Link>
        </div>

        <div className={styles.cuadriculaAreas}>
          {/* Matemáticas */}
          <Link to="/areas?area=matematicas" className={`${styles.cardArea} ${styles.areaMat}`}>
            <div className={styles.areaCabecera}>
              <div className={styles.areaIcono}>
                <BookOpen size={24} />
              </div>
              <span className={styles.badgeRetos}>6 retos</span>
            </div>
            <h3 className={styles.areaTitulo}>Matemáticas</h3>
            <p className={styles.areaDesc}>
              Porcentajes en la tienda escolar, ahorro familiar y estadística con Python.
            </p>
            <div className={styles.areaFooter}>
              <span>Empezar retos</span>
              <ArrowRight size={16} />
            </div>
          </Link>

          {/* Ciencias */}
          <Link to="/areas?area=ciencias" className={`${styles.cardArea} ${styles.areaCie}`}>
            <div className={styles.areaCabecera}>
              <div className={styles.areaIcono}>
                <Atom size={24} />
              </div>
              <span className={styles.badgeRetos}>6 retos</span>
            </div>
            <h3 className={styles.areaTitulo}>Ciencias</h3>
            <p className={styles.areaDesc}>
              Velocidad de ciclistas, conversión de temperatura y consumo hídrico en casa.
            </p>
            <div className={styles.areaFooter}>
              <span>Empezar retos</span>
              <ArrowRight size={16} />
            </div>
          </Link>

          {/* Informática */}
          <Link to="/areas?area=informatica" className={`${styles.cardArea} ${styles.areaInf}`}>
            <div className={styles.areaCabecera}>
              <div className={styles.areaIcono}>
                <Terminal size={24} />
              </div>
              <span className={styles.badgeRetos}>6 retos</span>
            </div>
            <h3 className={styles.areaTitulo}>Informática</h3>
            <p className={styles.areaDesc}>
              Cifrado César secreto, contraseñas seguras, semáforos y arte digital.
            </p>
            <div className={styles.areaFooter}>
              <span>Empezar retos</span>
              <ArrowRight size={16} />
            </div>
          </Link>
        </div>
      </section>
    </div>
  )
}
