import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { auth, db } from '../../firebase'
import {
  tieneFirebaseConfigurado,
  iniciarSesion,
  registrarEstudiante,
  cerrarSesion,
  obtenerSesionLocal
} from './authService'

const ContextoAuth = createContext(null)

export function ProveedorAuth({ children }) {
  const [usuario, setUsuario]   = useState(null)
  const [perfil, setPerfil]     = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    // Si Firebase está activo, escuchar cambios de sesión en Firebase
    if (tieneFirebaseConfigurado()) {
      const cancelar = onAuthStateChanged(auth, async (userFirebase) => {
        if (userFirebase) {
          setUsuario(userFirebase)
          try {
            const refDoc = doc(db, 'usuarios', userFirebase.uid)
            const snapDoc = await getDoc(refDoc)
            if (snapDoc.exists()) {
              setPerfil(snapDoc.data())
            }
          } catch {
            // Error de conexión a Firestore
          }
        } else {
          setUsuario(null)
          setPerfil(null)
        }
        setCargando(false)
      })
      return cancelar
    }

    // Modo local / demostración
    const sesion = obtenerSesionLocal()
    if (sesion) {
      setUsuario(sesion.usuario)
      setPerfil(sesion.perfil)
    }
    setCargando(false)
  }, [])

  // Métodos expuestos para la UI
  const login = async (nombreUsuario, contrasena) => {
    const res = await iniciarSesion(nombreUsuario, contrasena)
    setUsuario(res.usuario)
    setPerfil(res.perfil)
    return res
  }

  const registro = async (datos) => {
    const res = await registrarEstudiante(datos)
    setUsuario(res.usuario)
    setPerfil(res.perfil)
    return res
  }

  const logout = async () => {
    await cerrarSesion()
    setUsuario(null)
    setPerfil(null)
  }

  const actualizarPerfil = async (nuevosDatos) => {
    const perfilActualizado = { ...perfil, ...nuevosDatos }
    setPerfil(perfilActualizado)

    if (tieneFirebaseConfigurado() && usuario?.uid) {
      try {
        const refDoc = doc(db, 'usuarios', usuario.uid)
        await updateDoc(refDoc, nuevosDatos)
      } catch {
        // En caso de fallo de red
      }
    } else {
      // Actualizar sesión local
      const sesion = obtenerSesionLocal()
      if (sesion) {
        sesion.perfil = perfilActualizado
        localStorage.setItem('steam_sesion_activa', JSON.stringify(sesion))
      }
    }
  }

  const valor = {
    usuario,
    perfil,
    cargando,
    esDocente: perfil?.rol === 'docente',
    login,
    registro,
    logout,
    actualizarPerfil
  }

  return (
    <ContextoAuth.Provider value={valor}>
      {children}
    </ContextoAuth.Provider>
  )
}

export function useAuth() {
  const contexto = useContext(ContextoAuth)
  if (!contexto) {
    throw new Error('useAuth debe usarse dentro de ProveedorAuth')
  }
  return contexto
}
