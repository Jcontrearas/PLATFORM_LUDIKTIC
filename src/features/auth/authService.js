import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut
} from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db } from '../../firebase'
import { AVATARES } from '../../data/avatares'

const CLAVE_LOCAL_USUARIOS = 'steam_usuarios_locales'
const CLAVE_LOCAL_SESION   = 'steam_sesion_activa'

// Detecta si Firebase tiene credenciales válidas en .env
export function tieneFirebaseConfigurado() {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY
  return Boolean(apiKey && !apiKey.includes('REEMPLAZA') && apiKey.length > 10)
}

// Genera el correo ficticio interno (los estudiantes nunca lo ven)
export function generarCorreoFicticio(nombreUsuario) {
  return `${nombreUsuario.toLowerCase().trim()}@steam.local`
}

// Usuarios de demostración precargados para pruebas inmediatas
const USUARIOS_DEMO = [
  {
    uid: 'demo-estudiante-1',
    nombreUsuario: 'samuel_steam',
    contrasena: 'steam123',
    rol: 'estudiante',
    curso: '8A-2026',
    avatar: 'robot-bit',
    puntosTotal: 120,
    puntosPorArea: { matematicas: 45, ciencias: 50, informatica: 25 },
    nivel: 2,
    nombreNivel: 'Aprendiz',
    insignias: ['primer-codigo', 'mente-steam'],
    racha: 3,
    retosDesbloqueados: ['MAT-001', 'CIE-001', 'INF-001']
  },
  {
    uid: 'demo-docente-1',
    nombreUsuario: 'profe_steam',
    contrasena: 'docente123',
    rol: 'docente',
    curso: '8A-2026',
    avatar: 'cientifica',
    puntosTotal: 500,
    puntosPorArea: { matematicas: 200, ciencias: 150, informatica: 150 },
    nivel: 4,
    nombreNivel: 'Científico',
    insignias: ['primer-codigo', 'matematico', 'cazador-qr'],
    racha: 7,
    retosDesbloqueados: ['MAT-001', 'MAT-002', 'CIE-001', 'INF-001']
  }
]

function obtenerUsuariosLocales() {
  try {
    const raw = localStorage.getItem(CLAVE_LOCAL_USUARIOS)
    if (!raw) {
      localStorage.setItem(CLAVE_LOCAL_USUARIOS, JSON.stringify(USUARIOS_DEMO))
      return USUARIOS_DEMO
    }
    return JSON.parse(raw)
  } catch {
    return USUARIOS_DEMO
  }
}

function guardarUsuariosLocales(lista) {
  try {
    localStorage.setItem(CLAVE_LOCAL_USUARIOS, JSON.stringify(lista))
  } catch {
    // Silencioso
  }
}

/**
 * Iniciar sesión con nombre de usuario y contraseña
 */
export async function iniciarSesion(nombreUsuario, contrasena) {
  const usuarioLimpio = nombreUsuario.trim().toLowerCase()
  const emailFicticio = generarCorreoFicticio(usuarioLimpio)

  if (tieneFirebaseConfigurado()) {
    try {
      const cred = await signInWithEmailAndPassword(auth, emailFicticio, contrasena)
      const refDoc = doc(db, 'usuarios', cred.user.uid)
      const snapDoc = await getDoc(refDoc)
      if (snapDoc.exists()) {
        return { usuario: cred.user, perfil: snapDoc.data() }
      }
      // Perfil base si no existiese aún
      const perfilBase = {
        uid: cred.user.uid,
        nombreUsuario: usuarioLimpio,
        rol: 'estudiante',
        curso: '8A-2026',
        avatar: 'robot-bit',
        puntosTotal: 0,
        puntosPorArea: { matematicas: 0, ciencias: 0, informatica: 0 },
        nivel: 1,
        nombreNivel: 'Explorador',
        insignias: [],
        racha: 1,
        retosDesbloqueados: []
      }
      await setDoc(refDoc, perfilBase)
      return { usuario: cred.user, perfil: perfilBase }
    } catch (error) {
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        throw new Error('Usuario o contraseña incorrectos.')
      }
      throw new Error('No se pudo iniciar sesión. Verifica tu conexión.')
    }
  }

  // Modo local de demostración (garantiza funcionamiento sin configurar Firebase)
  const usuarios = obtenerUsuariosLocales()
  const encontrado = usuarios.find(
    u => u.nombreUsuario.toLowerCase() === usuarioLimpio && u.contrasena === contrasena
  )

  if (!encontrado) {
    throw new Error('Usuario o contraseña incorrectos.')
  }

  const { contrasena: _, ...perfilSinClave } = encontrado
  const sesionMock = { uid: encontrado.uid, email: emailFicticio, displayName: encontrado.nombreUsuario }
  localStorage.setItem(CLAVE_LOCAL_SESION, JSON.stringify({ usuario: sesionMock, perfil: perfilSinClave }))

  return { usuario: sesionMock, perfil: perfilSinClave }
}

/**
 * Registrar un nuevo estudiante
 */
export async function registrarEstudiante({ nombreUsuario, contrasena, curso, avatarId }) {
  const usuarioLimpio = nombreUsuario.trim().toLowerCase()
  const emailFicticio = generarCorreoFicticio(usuarioLimpio)

  const nuevoPerfil = {
    nombreUsuario: usuarioLimpio,
    rol: 'estudiante',
    curso: (curso || '8A-2026').trim().toUpperCase(),
    avatar: avatarId || AVATARES[0].id,
    puntosTotal: 0,
    puntosPorArea: { matematicas: 0, ciencias: 0, informatica: 0 },
    nivel: 1,
    nombreNivel: 'Explorador',
    insignias: [],
    racha: 1,
    retosDesbloqueados: ['MAT-001', 'CIE-001', 'INF-001'], // Retos básicos iniciales
    fechaCreacion: new Date().toISOString()
  }

  if (tieneFirebaseConfigurado()) {
    try {
      const cred = await createUserWithEmailAndPassword(auth, emailFicticio, contrasena)
      nuevoPerfil.uid = cred.user.uid
      await setDoc(doc(db, 'usuarios', cred.user.uid), nuevoPerfil)
      return { usuario: cred.user, perfil: nuevoPerfil }
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('Ese nombre de usuario ya está en uso. Elige otro.')
      }
      if (error.code === 'auth/weak-password') {
        throw new Error('La contraseña debe tener al menos 6 caracteres.')
      }
      throw new Error('Ocurrió un error al registrarse. Intenta de nuevo.')
    }
  }

  // Modo local
  const usuarios = obtenerUsuariosLocales()
  const yaExiste = usuarios.some(u => u.nombreUsuario.toLowerCase() === usuarioLimpio)
  if (yaExiste) {
    throw new Error('Ese nombre de usuario ya está en uso. Elige otro.')
  }

  const uidGenerado = `local-${Date.now()}`
  nuevoPerfil.uid = uidGenerado

  usuarios.push({ ...nuevoPerfil, contrasena })
  guardarUsuariosLocales(usuarios)

  const sesionMock = { uid: uidGenerado, email: emailFicticio, displayName: usuarioLimpio }
  localStorage.setItem(CLAVE_LOCAL_SESION, JSON.stringify({ usuario: sesionMock, perfil: nuevoPerfil }))

  return { usuario: sesionMock, perfil: nuevoPerfil }
}

/**
 * Cerrar sesión
 */
export async function cerrarSesion() {
  if (tieneFirebaseConfigurado()) {
    try {
      await firebaseSignOut(auth)
    } catch {
      // Ignorar error de red al salir
    }
  }
  localStorage.removeItem(CLAVE_LOCAL_SESION)
}

/**
 * Obtener sesión persistida en modo local
 */
export function obtenerSesionLocal() {
  try {
    const raw = localStorage.getItem(CLAVE_LOCAL_SESION)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}
