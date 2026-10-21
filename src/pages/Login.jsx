import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../features/auth/ProveedorAuth'
import PersonajeBit from '../components/PersonajeBit'
import Escena3D from '../components/Escena3D'
import LogoLudiktic from '../components/LogoLudiktic'
import { LogIn, Sparkles, UserCheck, Shield } from 'lucide-react'
import styles from './Login.module.css'

export default function Login() {
  const [usuario, setUsuario]         = useState('')
  const [contrasena, setContrasena]   = useState('')
  const [cargando, setCargando]       = useState(false)
  const [error, setError]             = useState('')

  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const destino = location.state?.desde?.pathname || '/'

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!usuario.trim() || !contrasena) {
      setError('Por favor completa todos los campos.')
      return
    }

    try {
      setError('')
      setCargando(true)
      await login(usuario, contrasena)
      navigate(destino, { replace: true })
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión.')
    } finally {
      setCargando(false)
    }
  }

  // Accesos rápidos para demostración en clase o evaluación
  const handleAccesoRapido = async (tipo) => {
    try {
      setError('')
      setCargando(true)
      if (tipo === 'estudiante') {
        await login('samuel_steam', 'steam123')
      } else {
        await login('profe_steam', 'docente123')
      }
      navigate(destino, { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className={styles.pantallaLogin}>
      <Escena3D modo="fondo-login" fondo={true} />
      <div className={styles.fondoGradiente} aria-hidden="true" />

      <div className={styles.tarjetaLogin}>
        {/* Mascota Bit de bienvenida */}
        <div className={styles.contenedorBit}>
          <PersonajeBit
            area="general"
            estado="reposo"
            tamano="md"
            mensaje="¡Hola! Bienvenido a tu plataforma STEAM. ¿Listo para programar?"
          />
        </div>

        {/* Encabezado LUDIKTIC */}
        <div className={styles.encabezado} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <LogoLudiktic tamano="lg" link={false} subtitulo="PLATAFORMA STEAM · GRADO 8°" />
          <p className={styles.subtitulo} style={{ margin: 0 }}>
            Resuelve retos con Python, escanea flashcards y compite en tiempo real
          </p>
        </div>

        {/* Mensaje de error si ocurre */}
        {error && (
          <div className={styles.cajaError} role="alert">
            <span>⚠️ {error}</span>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className={styles.formulario}>
          <div className={styles.campo}>
            <label htmlFor="usuario" className={styles.etiqueta}>
              Nombre de usuario
            </label>
            <input
              id="usuario"
              type="text"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              placeholder="Ej: mateo_code"
              autoComplete="username"
              className={styles.input}
              required
            />
          </div>

          <div className={styles.campo}>
            <label htmlFor="contrasena" className={styles.etiqueta}>
              Contraseña
            </label>
            <input
              id="contrasena"
              type="password"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              placeholder="Tu contraseña secreta"
              autoComplete="current-password"
              className={styles.input}
              required
            />
          </div>

          <button
            type="submit"
            disabled={cargando}
            className={styles.botonEntrar}
          >
            <LogIn size={20} />
            <span>{cargando ? 'Entrando...' : 'Entrar a la plataforma'}</span>
          </button>
        </form>

        {/* Enlace para registrarse */}
        <div className={styles.pieFormulario}>
          <span>¿Eres nuevo en el curso?</span>
          <Link to="/registro" className={styles.enlaceRegistro}>
            <Sparkles size={16} />
            <span>Crear mi cuenta</span>
          </Link>
        </div>

        {/* Accesos rápidos de demostración */}
        <div className={styles.seccionDemo}>
          <span className={styles.textoDemo}>Acceso rápido de demostración:</span>
          <div className={styles.botonesDemo}>
            <button
              type="button"
              onClick={() => handleAccesoRapido('estudiante')}
              className={styles.btnDemoEstudiante}
              disabled={cargando}
            >
              <UserCheck size={16} />
              <span>Estudiante (Samuel)</span>
            </button>
            <button
              type="button"
              onClick={() => handleAccesoRapido('docente')}
              className={styles.btnDemoDocente}
              disabled={cargando}
            >
              <Shield size={16} />
              <span>Docente (Profe)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
