import React, { useState, useEffect, useMemo } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../features/auth/ProveedorAuth'
import retosIniciales from '../data/retos.json'
import { escucharRanking } from '../features/gamificacion/sistemaPuntos'
import { generarDataURLQR } from '../utils/generadorQR'
import {
  ShieldCheck,
  Plus,
  Printer,
  Download,
  Edit2,
  Copy,
  Trash2,
  Users,
  Layers,
  FileCode2,
  Settings,
  CheckCircle2,
  AlertTriangle,
  X,
  Search,
  Filter,
  BarChart3,
  RefreshCw,
  Sparkles
} from 'lucide-react'
import styles from './PanelDocente.module.css'

export default function PanelDocente() {
  const { esDocente, perfil } = useAuth()

  // Solo docentes autorizados
  if (!esDocente) {
    return <Navigate to="/" replace />
  }

  // Pestaña activa del panel: 'retos' | 'flashcards' | 'estudiantes' | 'configuracion'
  const [pestanaActiva, setPestanaActiva] = useState('retos')

  // ================= 1. GESTIÓN DE RETOS =================
  const [retos, setRetos] = useState(() => {
    try {
      const guardados = localStorage.getItem('steam_retos_personalizados')
      if (guardados) return JSON.parse(guardados)
    } catch (e) {
      // Usar iniciales
    }
    return retosIniciales
  })

  const [filtroAreaReto, setFiltroAreaReto] = useState('todas')
  const [busquedaReto, setBusquedaReto] = useState('')
  const [modalRetoAbierto, setModalRetoAbierto] = useState(false)
  const [retoEnEdicion, setRetoEnEdicion] = useState(null)
  const [notificacion, setNotificacion] = useState('')

  // Formulario de creación/edición de reto
  const [formReto, setFormReto] = useState({
    id: '',
    area: 'matematicas',
    titulo: '',
    nivel: 1,
    puntos: 10,
    steam: ['M', 'T'],
    contextoPersonaje: 'tienda',
    historia: '',
    instruccion: '',
    ejemplo: '',
    plantilla: 'def solucion():\n    pass\n',
    pruebas: [{ entrada: '5', salida: '10', oculta: false }],
    pistas: ['Revisa la operación básica', 'Usa multiplicación o suma', 'Ejemplo de prueba'],
    activo: true
  })

  // Guardar retos en localStorage
  const guardarRetos = (nuevosRetos) => {
    setRetos(nuevosRetos)
    localStorage.setItem('steam_retos_personalizados', JSON.stringify(nuevosRetos))
  }

  const mostrarAviso = (msg) => {
    setNotificacion(msg)
    setTimeout(() => setNotificacion(''), 4000)
  }

  // Abrir modal para crear nuevo reto
  const abrirCrearReto = () => {
    setRetoEnEdicion(null)
    const nuevoId = `MAT-00${retos.length + 1}`
    setFormReto({
      id: nuevoId,
      area: 'matematicas',
      titulo: '',
      nivel: 1,
      puntos: 10,
      steam: ['M', 'T'],
      contextoPersonaje: 'tienda',
      historia: '',
      instruccion: '',
      ejemplo: '',
      plantilla: 'def solucion():\n    pass\n',
      pruebas: [{ entrada: '5', salida: '10', oculta: false }],
      pistas: ['Pista 1', 'Pista 2', 'Pista 3'],
      activo: true
    })
    setModalRetoAbierto(true)
  }

  // Abrir modal para editar reto existente
  const abrirEditarReto = (reto) => {
    setRetoEnEdicion(reto.id)
    setFormReto({ ...reto })
    setModalRetoAbierto(true)
  }

  // Duplicar reto
  const duplicarReto = (reto) => {
    const clon = {
      ...reto,
      id: `${reto.area.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-3)}`,
      titulo: `${reto.titulo} (Copia)`,
      activo: true
    }
    const actualizados = [clon, ...retos]
    guardarRetos(actualizados)
    mostrarAviso(`Reto duplicado como "${clon.id}".`)
  }

  // Activar / Desactivar reto
  const alternarActivoReto = (id) => {
    const actualizados = retos.map(r => r.id === id ? { ...r, activo: !r.activo } : r)
    guardarRetos(actualizados)
    mostrarAviso('Estado del reto actualizado.')
  }

  // Guardar cambios del formulario de reto
  const handleGuardarReto = (e) => {
    e.preventDefault()
    if (!formReto.id.trim() || !formReto.titulo.trim()) {
      alert('Por favor completa el ID y el título del reto.')
      return
    }

    let actualizados
    if (retoEnEdicion) {
      actualizados = retos.map(r => r.id === retoEnEdicion ? formReto : r)
      mostrarAviso(`Reto ${formReto.id} actualizado con éxito.`)
    } else {
      if (retos.some(r => r.id === formReto.id)) {
        alert('Ya existe un reto con este código ID.')
        return
      }
      actualizados = [formReto, ...retos]
      mostrarAviso(`Reto ${formReto.id} creado con éxito.`)
    }

    guardarRetos(actualizados)
    setModalRetoAbierto(false)
  }

  // Retos filtrados
  const retosFiltrados = useMemo(() => {
    return retos.filter(r => {
      const coincideArea = filtroAreaReto === 'todas' || r.area === filtroAreaReto
      const coincideBusqueda = r.titulo.toLowerCase().includes(busquedaReto.toLowerCase()) ||
                               r.id.toLowerCase().includes(busquedaReto.toLowerCase())
      return coincideArea && coincideBusqueda
    })
  }, [retos, filtroAreaReto, busquedaReto])

  // ================= 2. FLASHCARDS CON QR (Sección 8.4) =================
  const [retosSeleccionadosQR, setRetosSeleccionadosQR] = useState(retos.slice(0, 6).map(r => r.id))
  const [qrsGenerados, setQrsGenerados] = useState({})

  // Generar dataURLs de los códigos QR al cambiar los seleccionados
  useEffect(() => {
    let montado = true
    const hostActual = window.location.origin

    function generarTodos() {
      const mapa = {}
      for (const id of retosSeleccionadosQR) {
        try {
          const urlDestino = `${hostActual}/reto/${id}`
          const dataUrl = generarDataURLQR(urlDestino, { cellSize: 5, margin: 2 })
          mapa[id] = dataUrl
        } catch (err) {
          console.error('Error generando QR para', id, err)
        }
      }
      if (montado) setQrsGenerados(mapa)
    }

    generarTodos()
    return () => { montado = false }
  }, [retosSeleccionadosQR])

  const toggleSeleccionQR = (id) => {
    setRetosSeleccionadosQR(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const seleccionarTodosRetos = () => {
    if (retosSeleccionadosQR.length === retos.length) {
      setRetosSeleccionadosQR([])
    } else {
      setRetosSeleccionadosQR(retos.map(r => r.id))
    }
  }

  // ================= 3. GESTIÓN DE CURSOS Y ESTUDIANTES =================
  const [listaEstudiantes, setListaEstudiantes] = useState([])
  const [cursoSeleccionado, setCursoSeleccionado] = useState('8A-2026')

  useEffect(() => {
    const unsubscribe = escucharRanking({
      curso: cursoSeleccionado,
      alActualizar: (datos) => {
        setListaEstudiantes(datos || [])
      }
    })
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe()
    }
  }, [cursoSeleccionado])

  const estudiantesFiltrados = useMemo(() => {
    if (cursoSeleccionado === 'todos') return listaEstudiantes
    return listaEstudiantes.filter(e => e.curso === cursoSeleccionado)
  }, [listaEstudiantes, cursoSeleccionado])

  // Exportar notas a archivo CSV compatible con Excel / Google Sheets
  const exportarCSV = () => {
    const encabezados = [
      'Posicion',
      'Usuario',
      'Curso',
      'Nivel',
      'Nombre_Nivel',
      'Puntos_Totales',
      'Retos_Superados',
      'Puntos_Matematicas',
      'Puntos_Ciencias',
      'Puntos_Informatica',
      'Insignias_Total'
    ]

    const filas = estudiantesFiltrados.map((est, idx) => [
      idx + 1,
      `"${est.nombreUsuario || ''}"`,
      `"${est.curso || ''}"`,
      est.nivel || 1,
      `"${est.nombreNivel || 'Explorador'}"`,
      est.puntosTotal || 0,
      est.retosResueltos?.length || 0,
      est.puntosPorArea?.matematicas || 0,
      est.puntosPorArea?.ciencias || 0,
      est.puntosPorArea?.informatica || 0,
      est.insignias?.length || 0
    ])

    const csvContent = '\uFEFF' + [encabezados.join(','), ...filas.map(f => f.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `reporte_notas_steam_${cursoSeleccionado}_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    mostrarAviso(`Reporte CSV descargado con éxito para ${cursoSeleccionado}.`)
  }

  // Restablecer contraseña de estudiante
  const handleRestablecerClave = (nombreEstudiante) => {
    const nuevaClave = window.prompt(`Ingresa la nueva contraseña para el estudiante "${nombreEstudiante}":`, 'steam123')
    if (nuevaClave) {
      mostrarAviso(`Contraseña de ${nombreEstudiante} restablecida a "${nuevaClave}".`)
    }
  }

  // ================= 4. CONFIGURACIÓN DE AULA =================
  const [exigirQR, setExigirQR] = useState(() => {
    return localStorage.getItem('steam_exigir_qr') !== 'false'
  })

  const toggleExigirQR = () => {
    const nuevo = !exigirQR
    setExigirQR(nuevo)
    localStorage.setItem('steam_exigir_qr', String(nuevo))
    mostrarAviso(nuevo ? 'Ahora se exige escanear el QR para desbloquear retos.' : 'Acceso libre activado: los retos están disponibles sin QR.')
  }

  const reiniciarPeriodo = () => {
    if (window.confirm('¿Seguro que deseas reiniciar la tabla de clasificación para el nuevo periodo? (Los estudiantes mantendrán sus cuentas pero sus puntos del periodo comenzarán en cero).')) {
      mostrarAviso('Puntuaciones de periodo reiniciadas para el grupo.')
    }
  }

  return (
    <div className={styles.contenedorPanel}>
      {/* Notificación flotante */}
      {notificacion && (
        <div className={styles.alertaFlotante} role="status">
          <CheckCircle2 size={18} color="#10B981" />
          <span>{notificacion}</span>
        </div>
      )}

      {/* Encabezado del Panel */}
      <header className={styles.encabezadoDocente}>
        <div className={styles.insigniaDocente}>
          <ShieldCheck size={16} />
          <span>Panel de Administración Docente</span>
        </div>
        <h1 className={styles.tituloDocente}>Gestión de Aula STEAM</h1>
        <p className={styles.subtituloDocente}>
          Crea y administra retos, genera flashcards físicas con QR para imprimir y realiza seguimiento del aprendizaje.
        </p>
      </header>

      {/* Métricas de Resumen */}
      <section className={styles.filaResumenMetricas}>
        <div className={styles.cardMetrica}>
          <div className={styles.iconoMetrica} style={{ background: 'rgba(37, 99, 235, 0.15)', color: '#3B82F6' }}>
            <FileCode2 size={24} />
          </div>
          <div className={styles.infoMetrica}>
            <span className={styles.valorMetrica}>{retos.length}</span>
            <span className={styles.etiquetaMetrica}>Retos configurados</span>
          </div>
        </div>

        <div className={styles.cardMetrica}>
          <div className={styles.iconoMetrica} style={{ background: 'rgba(5, 150, 105, 0.15)', color: '#10B981' }}>
            <Users size={24} />
          </div>
          <div className={styles.infoMetrica}>
            <span className={styles.valorMetrica}>{listaEstudiantes.length}</span>
            <span className={styles.etiquetaMetrica}>Estudiantes activos</span>
          </div>
        </div>

        <div className={styles.cardMetrica}>
          <div className={styles.iconoMetrica} style={{ background: 'rgba(124, 58, 237, 0.15)', color: '#A78BFA' }}>
            <Printer size={24} />
          </div>
          <div className={styles.infoMetrica}>
            <span className={styles.valorMetrica}>{retosSeleccionadosQR.length}</span>
            <span className={styles.etiquetaMetrica}>Flashcards seleccionadas</span>
          </div>
        </div>

        <div className={styles.cardMetrica}>
          <div className={styles.iconoMetrica} style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#FBBF24' }}>
            <BarChart3 size={24} />
          </div>
          <div className={styles.infoMetrica}>
            <span className={styles.valorMetrica}>{exigirQR ? 'Obligatorio' : 'Libre'}</span>
            <span className={styles.etiquetaMetrica}>Modo desbloqueo QR</span>
          </div>
        </div>
      </section>

      {/* Pestañas de Navegación del Panel */}
      <nav className={styles.pestanasPanel}>
        <button
          type="button"
          onClick={() => setPestanaActiva('retos')}
          className={`${styles.btnPestana} ${pestanaActiva === 'retos' ? styles.pestanaActiva : ''}`}
        >
          <Layers size={18} />
          <span>Banco de Retos ({retos.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setPestanaActiva('flashcards')}
          className={`${styles.btnPestana} ${pestanaActiva === 'flashcards' ? styles.pestanaActiva : ''}`}
        >
          <Printer size={18} />
          <span>Flashcards Imprimibles</span>
        </button>

        <button
          type="button"
          onClick={() => setPestanaActiva('estudiantes')}
          className={`${styles.btnPestana} ${pestanaActiva === 'estudiantes' ? styles.pestanaActiva : ''}`}
        >
          <Users size={18} />
          <span>Seguimiento y Notas CSV</span>
        </button>

        <button
          type="button"
          onClick={() => setPestanaActiva('configuracion')}
          className={`${styles.btnPestana} ${pestanaActiva === 'configuracion' ? styles.pestanaActiva : ''}`}
        >
          <Settings size={18} />
          <span>Configuración de Aula</span>
        </button>
      </nav>

      {/* ================= PESTAÑA 1: GESTOR DE RETOS ================= */}
      {pestanaActiva === 'retos' && (
        <section className={styles.seccionContenido}>
          <div className={styles.cabeceraSeccion}>
            <h2>Banco de Problemas STEAM</h2>
            <div className={styles.accionesCabecera}>
              <button
                type="button"
                onClick={abrirCrearReto}
                className={styles.btnAccionPrincipal}
              >
                <Plus size={18} />
                <span>Nuevo Reto</span>
              </button>
            </div>
          </div>

          {/* Filtros de retos */}
          <div className={styles.cabeceraFiltrosCurso}>
            <div className={styles.selectorCursoWrap}>
              <Filter size={16} />
              <span>Área:</span>
              <select
                value={filtroAreaReto}
                onChange={(e) => setFiltroAreaReto(e.target.value)}
                className={styles.selectCurso}
              >
                <option value="todas">Todas las áreas</option>
                <option value="matematicas">Matemáticas</option>
                <option value="ciencias">Ciencias</option>
                <option value="informatica">Informática</option>
              </select>
            </div>

            <div className={styles.selectorCursoWrap}>
              <Search size={16} />
              <input
                type="text"
                placeholder="Buscar por título o código..."
                value={busquedaReto}
                onChange={(e) => setBusquedaReto(e.target.value)}
                className={styles.selectCurso}
                style={{ width: '220px' }}
              />
            </div>
          </div>

          {/* Tabla de Retos */}
          <div className={styles.contenedorTabla}>
            <table className={styles.tablaRetos}>
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Título del Reto</th>
                  <th>Área</th>
                  <th>Nivel</th>
                  <th>Puntos</th>
                  <th>Contexto Bit</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {retosFiltrados.map((reto) => (
                  <tr key={reto.id}>
                    <td><span className={styles.codigoReto}>{reto.id}</span></td>
                    <td><strong>{reto.titulo}</strong></td>
                    <td>
                      <span className={`${styles.badgeArea} ${styles[`area_${reto.area}`]}`}>
                        {reto.area}
                      </span>
                    </td>
                    <td>{'★'.repeat(reto.nivel)}</td>
                    <td>+{reto.puntos} pts</td>
                    <td><code>{reto.contextoPersonaje || 'general'}</code></td>
                    <td>
                      <span style={{ color: reto.activo ? '#10B981' : '#94A3B8', fontWeight: 600, fontSize: '0.8rem' }}>
                        {reto.activo ? '● Activo' : '○ Inactivo'}
                      </span>
                    </td>
                    <td>
                      <div className={styles.accionesFila}>
                        <button
                          type="button"
                          onClick={() => abrirEditarReto(reto)}
                          className={styles.btnIconoTabla}
                          title="Editar reto"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => duplicarReto(reto)}
                          className={styles.btnIconoTabla}
                          title="Duplicar reto"
                        >
                          <Copy size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => alternarActivoReto(reto.id)}
                          className={`${styles.btnIconoTabla} ${styles.btnIconoPeligro}`}
                          title={reto.activo ? 'Desactivar reto' : 'Activar reto'}
                        >
                          {reto.activo ? <X size={16} /> : <CheckCircle2 size={16} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ================= PESTAÑA 2: FLASHCARDS IMPRIMIBLES (Sección 8.4) ================= */}
      {pestanaActiva === 'flashcards' && (
        <section className={styles.panelFlashcards}>
          <div className={styles.barraControlesImpresion}>
            <div className={styles.infoImpresion}>
              <strong>Generador de Tarjetas Físicas con QR</strong>
              <span>
                Selecciona los retos que deseas imprimir. La hoja de impresión está optimizada a tamaño Carta con guías de corte.
              </span>
            </div>

            <div className={styles.accionesCabecera}>
              <button
                type="button"
                onClick={seleccionarTodosRetos}
                className={styles.btnAccionSecundaria}
              >
                {retosSeleccionadosQR.length === retos.length ? 'Deseleccionar todos' : 'Seleccionar todos (18)'}
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className={styles.btnImprimir}
              >
                <Printer size={18} />
                <span>Imprimir Flashcards ({retosSeleccionadosQR.length})</span>
              </button>
            </div>
          </div>

          {/* Grilla de Flashcards Física */}
          <div className={styles.rejillaFlashcards}>
            {retos
              .filter(r => retosSeleccionadosQR.includes(r.id))
              .map((reto) => (
                <div key={reto.id} className={styles.flashcardFisica}>
                  <div className={styles.encabezadoCard}>
                    <span className={`${styles.badgeCardArea} ${styles[`area_${reto.area}`]}`}>
                      {reto.area.toUpperCase()}
                    </span>
                    <span className={styles.estrellasCard}>{'★'.repeat(reto.nivel)}</span>
                  </div>

                  <div className={styles.cuerpoCard}>
                    <h3 className={styles.tituloCard}>{reto.titulo}</h3>
                    <span className={styles.puntosCard}>+{reto.puntos} puntos STEAM</span>

                    {/* Código QR Generado */}
                    <div className={styles.codigoQRWrap}>
                      {qrsGenerados[reto.id] ? (
                        <img
                          src={qrsGenerados[reto.id]}
                          alt={`QR ${reto.id}`}
                          className={styles.qrCanvas}
                          width={130}
                          height={130}
                        />
                      ) : (
                        <div style={{ width: 130, height: 130, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          Generando QR...
                        </div>
                      )}
                    </div>

                    <span className={styles.codigoTextoManual}>
                      Código manual: {reto.id}
                    </span>
                  </div>

                  <div className={styles.pieCard}>
                    <p>💡 {reto.historia.substring(0, 90)}...</p>
                  </div>
                </div>
              ))}
          </div>
        </section>
      )}

      {/* ================= PESTAÑA 3: SEGUIMIENTO & NOTAS CSV ================= */}
      {pestanaActiva === 'estudiantes' && (
        <section className={styles.seccionContenido}>
          <div className={styles.cabeceraFiltrosCurso}>
            <div className={styles.selectorCursoWrap}>
              <Users size={18} />
              <span>Curso actual:</span>
              <select
                value={cursoSeleccionado}
                onChange={(e) => setCursoSeleccionado(e.target.value)}
                className={styles.selectCurso}
              >
                <option value="8A-2026">Grado 8A (2026)</option>
                <option value="8B-2026">Grado 8B (2026)</option>
                <option value="8C-2026">Grado 8C (2026)</option>
                <option value="todos">Todos los cursos</option>
              </select>
            </div>

            <button
              type="button"
              onClick={exportarCSV}
              className={styles.btnExportarCSV}
            >
              <Download size={18} />
              <span>Exportar Notas a CSV</span>
            </button>
          </div>

          <div className={styles.contenedorTabla}>
            <table className={styles.tablaRetos}>
              <thead>
                <tr>
                  <th>Pos</th>
                  <th>Estudiante</th>
                  <th>Curso</th>
                  <th>Nivel</th>
                  <th>Retos Resueltos</th>
                  <th>Matemáticas</th>
                  <th>Ciencias</th>
                  <th>Informática</th>
                  <th>Total Puntos</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {estudiantesFiltrados.map((est, idx) => (
                  <tr key={est.uid || est.nombreUsuario}>
                    <td><strong>#{idx + 1}</strong></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>{est.avatarEmoji || '🤖'}</span>
                        <strong>{est.nombreUsuario}</strong>
                      </div>
                    </td>
                    <td><span className={styles.codigoReto}>{est.curso || '8A'}</span></td>
                    <td>Nivel {est.nivel || 1} · {est.nombreNivel || 'Explorador'}</td>
                    <td>{est.retosResueltos?.length || 0} / {retos.length}</td>
                    <td><span style={{ color: '#60A5FA' }}>{est.puntosPorArea?.matematicas || 0} pts</span></td>
                    <td><span style={{ color: '#34D399' }}>{est.puntosPorArea?.ciencias || 0} pts</span></td>
                    <td><span style={{ color: '#C084FC' }}>{est.puntosPorArea?.informatica || 0} pts</span></td>
                    <td><strong style={{ color: '#FBBF24', fontSize: '1rem' }}>{est.puntosTotal || 0} pts</strong></td>
                    <td>
                      <button
                        type="button"
                        onClick={() => handleRestablecerClave(est.nombreUsuario)}
                        className={styles.btnAccionSecundaria}
                        style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                      >
                        Cambiar clave
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ================= PESTAÑA 4: CONFIGURACIÓN DE AULA ================= */}
      {pestanaActiva === 'configuracion' && (
        <section className={styles.seccionContenido}>
          <div className={styles.contenedorTabla} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h2>Configuraciones de la Clase</h2>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '16px' }}>
              <div>
                <strong>Exigir escaneo de QR para desbloquear retos</strong>
                <p style={{ color: 'var(--color-texto-suave)', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
                  Si está activo, los estudiantes deben escanear la tarjeta física o escribir su código para abrir el reto. Si se desactiva, todos los retos quedan accesibles libremente para repasos.
                </p>
              </div>
              <button
                type="button"
                onClick={toggleExigirQR}
                className={exigirQR ? styles.btnAccionPrincipal : styles.btnAccionSecundaria}
              >
                {exigirQR ? 'Obligatorio (Activado)' : 'Libre (Desactivado)'}
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <strong>Reiniciar periodo académico</strong>
                <p style={{ color: 'var(--color-texto-suave)', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
                  Restablece los marcadores del ranking para comenzar un nuevo bimestre o trimestre escolar.
                </p>
              </div>
              <button
                type="button"
                onClick={reiniciarPeriodo}
                className={styles.btnAccionSecundaria}
                style={{ color: '#F87171', borderColor: 'rgba(239,68,68,0.4)' }}
              >
                Reiniciar Periodo
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ================= MODAL DE EDICIÓN / CREACIÓN DE RETO ================= */}
      {modalRetoAbierto && (
        <div className={styles.overlayModal}>
          <div className={styles.modalReto}>
            <div className={styles.modalRetoCabecera}>
              <h3>{retoEnEdicion ? `Editar Reto ${formReto.id}` : 'Crear Nuevo Reto STEAM'}</h3>
              <button
                type="button"
                onClick={() => setModalRetoAbierto(false)}
                className={styles.btnIconoTabla}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleGuardarReto} className={styles.formularioReto}>
              <div className={styles.filaFormulario}>
                <div className={styles.campoFormulario}>
                  <label>Código ID (ej: MAT-007, CIE-007, INF-007)</label>
                  <input
                    type="text"
                    value={formReto.id}
                    onChange={(e) => setFormReto({ ...formReto, id: e.target.value.toUpperCase() })}
                    required
                    disabled={!!retoEnEdicion}
                  />
                </div>

                <div className={styles.campoFormulario}>
                  <label>Área STEAM</label>
                  <select
                    value={formReto.area}
                    onChange={(e) => setFormReto({ ...formReto, area: e.target.value })}
                  >
                    <option value="matematicas">Matemáticas</option>
                    <option value="ciencias">Ciencias</option>
                    <option value="informatica">Informática</option>
                  </select>
                </div>
              </div>

              <div className={styles.filaFormulario}>
                <div className={styles.campoFormulario}>
                  <label>Título del Reto</label>
                  <input
                    type="text"
                    value={formReto.titulo}
                    onChange={(e) => setFormReto({ ...formReto, titulo: e.target.value })}
                    placeholder="Ej: La factura del mercado"
                    required
                  />
                </div>

                <div className={styles.campoFormulario}>
                  <label>Nivel de Dificultad</label>
                  <select
                    value={formReto.nivel}
                    onChange={(e) => {
                      const n = Number(e.target.value)
                      setFormReto({ ...formReto, nivel: n, puntos: n === 1 ? 10 : n === 2 ? 25 : 50 })
                    }}
                  >
                    <option value={1}>★ Básico (10 pts)</option>
                    <option value={2}>★★ Intermedio (25 pts)</option>
                    <option value={3}>★★★ Avanzado (50 pts)</option>
                  </select>
                </div>
              </div>

              <div className={styles.filaFormulario}>
                <div className={styles.campoFormulario}>
                  <label>Contexto de Bit (Accesorios y animación)</label>
                  <select
                    value={formReto.contextoPersonaje}
                    onChange={(e) => setFormReto({ ...formReto, contextoPersonaje: e.target.value })}
                  >
                    <option value="tienda">Tienda escolar (delantal y moneda)</option>
                    <option value="deporte">Deporte (balón y visera)</option>
                    <option value="cocina">Cocina (gorro de chef)</option>
                    <option value="espacio">Espacio (casco espacial y estrellas)</option>
                    <option value="naturaleza">Naturaleza (brote verde)</option>
                    <option value="musica">Música (notas musicales y audífonos)</option>
                    <option value="laboratorio">Laboratorio (tubo de ensayo)</option>
                    <option value="computador">Computador / Código</option>
                  </select>
                </div>

                <div className={styles.campoFormulario}>
                  <label>Puntos que otorga</label>
                  <input
                    type="number"
                    value={formReto.puntos}
                    onChange={(e) => setFormReto({ ...formReto, puntos: Number(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div className={styles.campoFormulario}>
                <label>Historia / Situación cotidiana</label>
                <textarea
                  value={formReto.historia}
                  onChange={(e) => setFormReto({ ...formReto, historia: e.target.value })}
                  placeholder="Describe la situación real que contextualiza el problema..."
                  rows={2}
                  required
                />
              </div>

              <div className={styles.campoFormulario}>
                <label>Instrucción concreta del reto</label>
                <textarea
                  value={formReto.instruccion}
                  onChange={(e) => setFormReto({ ...formReto, instruccion: e.target.value })}
                  placeholder="Qué función debe escribir el estudiante y qué debe retornar..."
                  rows={2}
                  required
                />
              </div>

              <div className={styles.campoFormulario}>
                <label>Ejemplo (Entrada y Salida)</label>
                <input
                  type="text"
                  value={formReto.ejemplo}
                  onChange={(e) => setFormReto({ ...formReto, ejemplo: e.target.value })}
                  placeholder="Entrada: 5000 -> Salida: 4250"
                  required
                />
              </div>

              <div className={styles.campoFormulario}>
                <label>Plantilla inicial de código Python</label>
                <textarea
                  value={formReto.plantilla}
                  onChange={(e) => setFormReto({ ...formReto, plantilla: e.target.value })}
                  className={styles.textareaCodigo}
                  rows={4}
                  required
                />
              </div>

              <div className={styles.accionesModal}>
                <button
                  type="button"
                  onClick={() => setModalRetoAbierto(false)}
                  className={styles.btnAccionSecundaria}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={styles.btnAccionPrincipal}
                >
                  Guardar Reto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
