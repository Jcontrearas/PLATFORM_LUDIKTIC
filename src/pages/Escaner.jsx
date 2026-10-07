import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Html5Qrcode } from 'html5-qrcode'
import { useAuth } from '../features/auth/ProveedorAuth'
import retosData from '../data/retos.json'
import PersonajeBit from '../components/PersonajeBit'
import { reproducirBeepExito, vibrarExito } from '../utils/sonidos'
import {
  Camera,
  CameraOff,
  Keyboard,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Zap
} from 'lucide-react'
import styles from './Escaner.module.css'

/**
 * Función que extrae el ID del reto desde una URL, código QR o texto manual.
 * Soporta formatos:
 * - URL: https://plataforma-steam.web.app/reto/MAT-001
 * - ID directo: MAT-001, CIE-002, INF-003
 * - Sin guion: MAT001
 * - Códigos cortos: M01, C02, I03
 */
function extraerIdReto(texto) {
  if (!texto) return null
  const limpio = texto.trim()

  // 1. Si es URL completa
  const coincidenciaUrl = limpio.match(/\/reto\/([A-Za-z0-9-]+)/i)
  if (coincidenciaUrl) {
    return coincidenciaUrl[1].toUpperCase()
  }

  // 2. Si es ID estándar (MAT-001 o MAT001)
  const coincidenciaId = limpio.match(/^(MAT|CIE|INF)-?0*([1-9][0-9]*)$/i)
  if (coincidenciaId) {
    const prefijo = coincidenciaId[1].toUpperCase()
    const num = coincidenciaId[2].padStart(3, '0')
    return `${prefijo}-${num}`
  }

  // 3. Códigos cortos (M01, C02, I03)
  const coincidenciaCorta = limpio.match(/^([MCI])0*([1-9][0-9]*)$/i)
  if (coincidenciaCorta) {
    const mapa = { M: 'MAT', C: 'CIE', I: 'INF' }
    const prefijo = mapa[coincidenciaCorta[1].toUpperCase()]
    const num = coincidenciaCorta[2].padStart(3, '0')
    return `${prefijo}-${num}`
  }

  return limpio.toUpperCase()
}

export default function Escaner() {
  const navigate = useNavigate()
  const { perfil, actualizarPerfil } = useAuth()

  // Estados del escáner
  const [camaraActiva, setCamaraActiva]       = useState(false)
  const [errorCamara, setErrorCamara]         = useState('')
  const [codigoManual, setCodigoManual]       = useState('')
  const [errorManual, setErrorManual]         = useState('')
  const [retoDesbloqueado, setRetoDesbloqueado] = useState(null)
  const [linternaEncendida, setLinternaEncendida] = useState(false)

  const scannerRef = useRef(null)
  const contenedorId = 'lector-qr-elemento'

  // Procesar código detectado (por cámara o por ingreso manual)
  const procesarCodigo = (textoLeido) => {
    const idExtraido = extraerIdReto(textoLeido)
    const retoEncontrado = retosData.find(r => r.id === idExtraido)

    if (!retoEncontrado) {
      setErrorManual(`No encontramos ningún reto con el código "${textoLeido}". Revisa la tarjeta e intenta de nuevo.`)
      return
    }

    // ¡ÉXITO!
    reproducirBeepExito()
    vibrarExito()
    setErrorManual('')
    setErrorCamara('')

    // Desbloquear en el perfil del estudiante si aún no lo estaba
    const desbloqueados = perfil?.retosDesbloqueados || []
    if (!desbloqueados.includes(retoEncontrado.id)) {
      const nuevaLista = [...desbloqueados, retoEncontrado.id]
      actualizarPerfil({ retosDesbloqueados: nuevaLista })
    }

    // Detener la cámara
    detenerCamara()

    // Mostrar confirmación y redirigir
    setRetoDesbloqueado(retoEncontrado)
    setTimeout(() => {
      navigate(`/reto/${retoEncontrado.id}`)
    }, 1800)
  }

  // Iniciar la cámara con html5-qrcode
  const iniciarCamara = async () => {
    try {
      setErrorCamara('')
      setErrorManual('')

      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(contenedorId)
      }

      const configuracion = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0
      }

      await scannerRef.current.start(
        { facingMode: 'environment' }, // Cámara trasera en móviles
        configuracion,
        (decodedText) => {
          procesarCodigo(decodedText)
        },
        () => {
          // Ignorar frames sin código QR
        }
      )

      setCamaraActiva(true)
    } catch (err) {
      setCamaraActiva(false)
      if (err?.name === 'NotAllowedError' || String(err).includes('Permission')) {
        setErrorCamara('Se denegó el permiso para usar la cámara. Puedes escribir el código de la tarjeta abajo.')
      } else {
        setErrorCamara('No se detectó una cámara disponible. Usa el ingreso manual de código abajo.')
      }
    }
  }

  // Detener la cámara
  const detenerCamara = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop()
      } catch {
        // Silencioso
      }
    }
    setCamaraActiva(false)
  }

  // Limpiar scanner al desmontar
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        if (scannerRef.current.isScanning) {
          scannerRef.current.stop().catch(() => {})
        }
        scannerRef.current.clear()
      }
    }
  }, [])

  // Manejo de envío manual
  const handleDesbloqueoManual = (e) => {
    e.preventDefault()
    if (!codigoManual.trim()) {
      setErrorManual('Por favor escribe el código de tu tarjeta.')
      return
    }
    procesarCodigo(codigoManual)
  }

  return (
    <div className={styles.contenedorEscaner}>
      {/* Mascota Bit dando instrucciones */}
      <div className={styles.bitInstruccion}>
        <PersonajeBit
          area="informatica"
          estado={retoDesbloqueado ? 'celebrando' : 'reposo'}
          tamano="md"
          mensaje={
            retoDesbloqueado
              ? `¡Excelente! Desbloqueaste el reto "${retoDesbloqueado.titulo}". ¡Cargando editor!`
              : 'Apunta la cámara al código QR de tu tarjeta física. ¡Asegúrate de que haya buena luz!'
          }
        />
      </div>

      <div className={styles.tarjetaEscaner}>
        <div className={styles.encabezado}>
          <h1 className={styles.titulo}>Escáner de Flashcards STEAM</h1>
          <p className={styles.subtitulo}>
            Escanea el código QR al reverso de tu tarjeta física o escribe el código de 6 dígitos.
          </p>
        </div>

        {/* Notificación de Éxito al Desbloquear */}
        {retoDesbloqueado && (
          <div className={styles.cajaExito}>
            <CheckCircle2 size={24} />
            <div>
              <strong>¡Tarjeta desbloqueada con éxito!</strong>
              <p>Abriendo reto: <strong>{retoDesbloqueado.titulo}</strong> ({retoDesbloqueado.id})</p>
            </div>
          </div>
        )}

        {/* Visor de la Cámara */}
        <div className={styles.areaVisor}>
          <div id={contenedorId} className={styles.elementoCamara} />

          {/* Guía visual cuando la cámara está activa */}
          {camaraActiva && (
            <div className={styles.marcoGuia} aria-hidden="true">
              <div className={`${styles.esquina} ${styles.esquinaTL}`} />
              <div className={`${styles.esquina} ${styles.esquinaTR}`} />
              <div className={`${styles.esquina} ${styles.esquinaBL}`} />
              <div className={`${styles.esquina} ${styles.esquinaBR}`} />
              <div className={styles.lineaEscaneo} />
            </div>
          )}

          {/* Placeholder cuando la cámara no está activa */}
          {!camaraActiva && !retoDesbloqueado && (
            <div className={styles.placeholderCamara}>
              <div className={styles.iconoCamaraGrande}>
                <Camera size={44} />
              </div>
              <p>Presiona el botón para encender la cámara del dispositivo.</p>
              <button
                type="button"
                onClick={iniciarCamara}
                className={styles.botonIniciarCamara}
              >
                <Camera size={18} />
                <span>Iniciar Escáner</span>
              </button>
            </div>
          )}
        </div>

        {/* Controles de cámara activa */}
        {camaraActiva && (
          <div className={styles.controlesCamara}>
            <button
              type="button"
              onClick={detenerCamara}
              className={styles.btnDetenerCamara}
            >
              <CameraOff size={16} />
              <span>Detener cámara</span>
            </button>
          </div>
        )}

        {/* Alerta de error en cámara si no hay permiso */}
        {errorCamara && (
          <div className={styles.alertaErrorCamara}>
            <AlertCircle size={18} />
            <p>{errorCamara}</p>
          </div>
        )}

        {/* Separador o alternativa manual */}
        <div className={styles.divisorO}>
          <span>o ingresa el código manual</span>
        </div>

        {/* Formulario de Código Manual */}
        <form onSubmit={handleDesbloqueoManual} className={styles.formManual}>
          <div className={styles.campoInputManual}>
            <Keyboard size={18} className={styles.iconoInput} />
            <input
              type="text"
              value={codigoManual}
              onChange={(e) => setCodigoManual(e.target.value)}
              placeholder="Ej: MAT-001 o M01"
              className={styles.inputCodigo}
            />
            <button type="submit" className={styles.btnDesbloquearManual}>
              <span>Desbloquear</span>
              <ArrowRight size={16} />
            </button>
          </div>

          {errorManual && (
            <span className={styles.errorTextoManual}>⚠️ {errorManual}</span>
          )}
        </form>

        {/* Acceso rápido de demostración con tarjetas de ejemplo */}
        <div className={styles.seccionTarjetasDemo}>
          <span className={styles.textoTarjetasDemo}>
            <Sparkles size={14} />
            <span>Códigos de flashcards para prueba rápida:</span>
          </span>
          <div className={styles.chipsCodigos}>
            {['MAT-001', 'MAT-002', 'CIE-001', 'CIE-002', 'INF-001', 'INF-002'].map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => procesarCodigo(code)}
                className={styles.chipCodigo}
              >
                {code}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
