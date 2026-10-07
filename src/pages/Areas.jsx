import { useState, useMemo } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useAuth } from '../features/auth/ProveedorAuth'
import retosData from '../data/retos.json'
import TarjetaReto from '../components/TarjetaReto'
import PersonajeBit from '../components/PersonajeBit'
import { BookOpen, Atom, Terminal, QrCode, Filter, X } from 'lucide-react'
import styles from './Areas.module.css'

export default function Areas() {
  const [searchParams, setSearchParams] = useSearchParams()
  const areaSeleccionada = searchParams.get('area') || 'matematicas'
  const [filtroNivel, setFiltroNivel] = useState('todos')
  const [retoBloqueadoModal, setRetoBloqueadoModal] = useState(null)

  const { perfil } = useAuth()
  const retosDesbloqueados = perfil?.retosDesbloqueados || ['MAT-001', 'CIE-001', 'INF-001']
  const retosResueltos = perfil?.retosResueltos || []

  // Información visual de las 3 áreas
  const infoAreas = {
    matematicas: {
      id: 'matematicas',
      nombre: 'Matemáticas',
      icono: BookOpen,
      color: '#2563EB',
      colorClaro: '#60A5FA',
      desc: 'Porcentajes, proporciones, ecuaciones lineales, geometría y estadística.'
    },
    ciencias: {
      id: 'ciencias',
      nombre: 'Ciencias',
      icono: Atom,
      color: '#059669',
      colorClaro: '#34D399',
      desc: 'Movimiento y velocidad, energía, ecosistemas, química básica y clima.'
    },
    informatica: {
      id: 'informatica',
      nombre: 'Informática',
      icono: Terminal,
      color: '#7C3AED',
      colorClaro: '#C084FC',
      desc: 'Algoritmos, condicionales, ciclos, listas, cifrado de mensajes y lógica.'
    }
  }

  const areaActual = infoAreas[areaSeleccionada] || infoAreas.matematicas

  // Filtrar retos por área y nivel
  const retosFiltrados = useMemo(() => {
    return retosData.filter((r) => {
      if (r.area !== areaSeleccionada) return false
      if (filtroNivel === 'todos') return true
      return r.nivel === Number(filtroNivel)
    })
  }, [areaSeleccionada, filtroNivel])

  // Retos resueltos en esta área
  const totalEnArea = retosData.filter(r => r.area === areaSeleccionada).length
  const resueltosEnArea = retosData.filter(r => r.area === areaSeleccionada && retosResueltos.includes(r.id)).length
  const porcentajeArea = totalEnArea > 0 ? Math.round((resueltosEnArea / totalEnArea) * 100) : 0

  return (
    <div className={styles.contenedorBiblioteca}>
      {/* Selector de Carpetas / Menú de Áreas */}
      <div className={styles.selectorCarpetas}>
        {Object.values(infoAreas).map((area) => {
          const Icono = area.icono
          const esActiva = areaSeleccionada === area.id
          return (
            <button
              key={area.id}
              type="button"
              onClick={() => setSearchParams({ area: area.id })}
              className={`${styles.botonCarpeta} ${esActiva ? styles.carpetaActiva : ''}`}
              style={{
                borderColor: esActiva ? area.color : undefined,
                background: esActiva ? `${area.color}20` : undefined
              }}
            >
              <div className={styles.iconoCarpeta} style={{ color: area.colorClaro }}>
                <Icono size={22} />
              </div>
              <div className={styles.textosCarpeta}>
                <span className={styles.tituloCarpeta}>{area.nombre}</span>
                <span className={styles.subCarpeta}>6 retos</span>
              </div>
            </button>
          )
        })}
      </div>

      {/* Banner de progreso del área actual */}
      <section className={`${styles.bannerArea} ${styles[`banner_${areaSeleccionada}`]}`}>
        <div className={styles.infoBanner}>
          <div className={styles.badgeAreaActual}>Área de {areaActual.nombre}</div>
          <h1 className={styles.tituloAreaActual}>{areaActual.nombre} STEAM</h1>
          <p className={styles.descAreaActual}>{areaActual.desc}</p>

          <div className={styles.barraProgresoWrap}>
            <div className={styles.barraTexto}>
              <span>Progreso del área</span>
              <strong>{resueltosEnArea} de {totalEnArea} retos superados ({porcentajeArea}%)</strong>
            </div>
            <div className={styles.pistaProgreso}>
              <div className={styles.rellenoProgreso} style={{ width: `${porcentajeArea}%`, backgroundColor: areaActual.colorClaro }} />
            </div>
          </div>
        </div>

        <div className={styles.bitAreaWrap}>
          <PersonajeBit
            area={areaSeleccionada}
            estado="reposo"
            tamano="md"
            mensaje={`¡Explora los problemas de ${areaActual.nombre} y pon a prueba tu código!`}
          />
        </div>
      </section>

      {/* Filtros por Nivel de Dificultad */}
      <div className={styles.barraFiltros}>
        <div className={styles.etiquetaFiltro}>
          <Filter size={16} />
          <span>Dificultad:</span>
        </div>

        <div className={styles.botonesFiltro}>
          {[
            { id: 'todos', label: 'Todos' },
            { id: '1', label: '★ Básico' },
            { id: '2', label: '★★ Intermedio' },
            { id: '3', label: '★★★ Avanzado' }
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFiltroNivel(f.id)}
              className={`${styles.btnFiltro} ${filtroNivel === f.id ? styles.filtroActivo : ''}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Cuadrícula de Retos */}
      <div className={styles.gridRetos}>
        {retosFiltrados.map((reto) => {
          // Determinar estado: resuelto, disponible o con QR
          const yaResuelto = retosResueltos.includes(reto.id)
          const desbloqueado = retosDesbloqueados.includes(reto.id) || reto.nivel === 1 // Nivel 1 siempre disponible

          let estado = 'bloqueado'
          if (yaResuelto) estado = 'resuelto'
          else if (desbloqueado) estado = 'disponible'

          return (
            <TarjetaReto
              key={reto.id}
              reto={reto}
              estado={estado}
              alIntentarBloqueado={(r) => setRetoBloqueadoModal(r)}
            />
          )
        })}
      </div>

      {/* Modal explicativo de Reto Bloqueado */}
      {retoBloqueadoModal && (
        <div className={styles.overlayModal} onClick={() => setRetoBloqueadoModal(null)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className={styles.botonCerrarModal}
              onClick={() => setRetoBloqueadoModal(null)}
              aria-label="Cerrar ventana"
            >
              <X size={18} />
            </button>

            <div className={styles.iconoModal}>
              <QrCode size={40} color="#FBBF24" />
            </div>

            <h3>Reto protegido por QR</h3>
            <p className={styles.textoModal}>
              El reto <strong>{retoBloqueadoModal.titulo}</strong> ({retoBloqueadoModal.id}) está bloqueado.
              Tu docente tiene la flashcard física con el código QR impreso.
            </p>

            <div className={styles.accionesModal}>
              <Link to="/escanear" className={styles.btnEscanearModal}>
                <QrCode size={18} />
                <span>Abrir Escáner QR</span>
              </Link>
              <Link to={`/reto/${retoBloqueadoModal.id}`} className={styles.btnAccederIgual}>
                Abrir de todas formas (Modo prueba)
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
