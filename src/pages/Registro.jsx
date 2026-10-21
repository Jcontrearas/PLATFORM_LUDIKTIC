import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../features/auth/ProveedorAuth'
import { AVATARES } from '../data/avatares'
import { validarNombreUsuario } from '../data/filtroPalabras'
import PersonajeBit from '../components/PersonajeBit'
import Escena3D from '../components/Escena3D'
import LogoLudiktic from '../components/LogoLudiktic'
import { UserPlus, ArrowLeft, Check, Sparkles } from 'lucide-react'
import styles from './Registro.module.css'

export default function Registro() {
  const [nombreUsuario, setNombreUsuario]         = useState('')
  const [contrasena, setContrasena]               = useState('')
  const [confirmarClave, setConfirmarClave]       = useState('')
  const [codigoCurso, setCodigoCurso]             = useState('8A-2026')
  const [avatarSeleccionado, setAvatarSeleccionado] = useState(AVATARES[0].id)
  const [cargando, setCargando]                   = useState(false)
  const [error, setError]                         = useState('')

  const { registro } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()

    // 1. Validar nombre de usuario con filtro pedagógico
    const validacion = validarNombreUsuario(nombreUsuario)
    if (!validacion.valido) {
      setError(validacion.mensaje)
      return
    }

    // 2. Validar contraseña
    if (contrasena.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }

    if (contrasena !== confirmarClave) {
      setError('Las contraseñas no coinciden. Por favor verifícalas.')
      return
    }

    // 3. Validar código de curso
    if (!codigoCurso.trim()) {
      setError('Por favor ingresa el código de tu curso (ej: 8A-2026).')
      return
    }

    try {
      setError('')
      setCargando(true)
      await registro({
        nombreUsuario: validacion.nombre,
        contrasena,
        curso: codigoCurso.trim().toUpperCase(),
        avatarId: avatarSeleccionado
      })
      navigate('/', { replace: true })
    } catch (err) {
      setError(err.message || 'Error al registrar la cuenta.')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className={styles.pantallaRegistro}>
      <Escena3D modo="fondo-login" fondo={true} />
      <div className={styles.fondoGradiente} aria-hidden="true" />

      <div className={styles.tarjetaRegistro}>
        {/* Cabecera con retorno */}
        <div className={styles.barraSuperior}>
          <Link to="/login" className={styles.botonVolver} aria-label="Volver al login">
            <ArrowLeft size={18} />
            <span>Volver</span>
          </Link>
          <span className={styles.badgePaso}>Paso 1 de 1 · Perfil</span>
        </div>

        {/* Mascota Bit motivacional */}
        <div className={styles.contenedorBit}>
          <PersonajeBit
            area="ciencias"
            estado="celebrando"
            tamano="sm"
            mensaje="¡Elige tu avatar STEAM y crea tu cuenta para empezar a ganar puntos!"
          />
        </div>

        <div className={styles.encabezado} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
          <LogoLudiktic tamano="md" link={false} subtitulo="REGISTRO DE ESTUDIANTE" />
          <h1 className={styles.titulo} style={{ fontSize: '1.4rem' }}>Crea tu cuenta</h1>
          <p className={styles.subtitulo}>Sin correos ni datos personales · Solo para tu curso</p>
        </div>

        {error && (
          <div className={styles.cajaError} role="alert">
            <span>⚠️ {error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.formulario}>
          {/* Selector de Avatar */}
          <div className={styles.campo}>
            <label className={styles.etiqueta}>
              <Sparkles size={16} />
              <span>Elige tu avatar STEAM</span>
            </label>
            <div className={styles.cuadriculaAvatares}>
              {AVATARES.map((av) => {
                const esActivo = avatarSeleccionado === av.id
                return (
                  <button
                    key={av.id}
                    type="button"
                    onClick={() => setAvatarSeleccionado(av.id)}
                    className={`${styles.itemAvatar} ${esActivo ? styles.avatarActivo : ''}`}
                    style={{ borderColor: esActivo ? av.color : undefined }}
                    aria-label={`Seleccionar avatar ${av.nombre}`}
                  >
                    <span className={styles.emojiAvatar}>{av.emoji}</span>
                    <span className={styles.nombreAvatar}>{av.nombre}</span>
                    {esActivo && <div className={styles.checkAvatar}><Check size={12} /></div>}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Nombre de usuario */}
          <div className={styles.campo}>
            <label htmlFor="usuario" className={styles.etiqueta}>
              Nombre de usuario o apodo
            </label>
            <input
              id="usuario"
              type="text"
              value={nombreUsuario}
              onChange={(e) => setNombreUsuario(e.target.value)}
              placeholder="Ej: camila_code"
              autoComplete="username"
              className={styles.input}
              required
            />
            <span className={styles.ayudaInput}>Aparecerá en la tabla de clasificación. Usa letras y números.</span>
          </div>

          {/* Código de Curso */}
          <div className={styles.campo}>
            <label htmlFor="curso" className={styles.etiqueta}>
              Código de tu curso
            </label>
            <input
              id="curso"
              type="text"
              value={codigoCurso}
              onChange={(e) => setCodigoCurso(e.target.value)}
              placeholder="Ej: 8A-2026"
              className={styles.input}
              required
            />
            <span className={styles.ayudaInput}>Entregado por tu docente de tecnología o matemáticas.</span>
          </div>

          {/* Fila de contraseñas */}
          <div className={styles.filaCampos}>
            <div className={styles.campo}>
              <label htmlFor="clave" className={styles.etiqueta}>
                Contraseña
              </label>
              <input
                id="clave"
                type="password"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className={styles.input}
                required
              />
            </div>

            <div className={styles.campo}>
              <label htmlFor="confirmar" className={styles.etiqueta}>
                Confirmar
              </label>
              <input
                id="confirmar"
                type="password"
                value={confirmarClave}
                onChange={(e) => setConfirmarClave(e.target.value)}
                placeholder="Repite la clave"
                className={styles.input}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={cargando}
            className={styles.botonRegistrar}
          >
            <UserPlus size={20} />
            <span>{cargando ? 'Creando perfil...' : '¡Listo, registrarme!'}</span>
          </button>
        </form>

        <div className={styles.pieRegistro}>
          <span>¿Ya tienes una cuenta creada?</span>
          <Link to="/login" className={styles.enlaceLogin}>Iniciar sesión</Link>
        </div>
      </div>
    </div>
  )
}
