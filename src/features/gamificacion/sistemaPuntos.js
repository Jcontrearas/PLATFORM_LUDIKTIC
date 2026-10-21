/**
 * Sistema de Gamificación STEAM (Sección 11 del prompt maestro)
 * - Puntos base, bonificaciones, penalizaciones por pistas
 * - Niveles (1 al 5)
 * - Catálogo de 8 insignias con validación automática
 * - Servicio de clasificación en tiempo real
 */

import { collection, query, orderBy, limit, getDocs, onSnapshot, where } from 'firebase/firestore'
import { db } from '../../firebase'
import { tieneFirebaseConfigurado } from '../auth/authService'

// 1. Escala de Niveles
export const NIVELES = [
  { nivel: 1, nombre: 'Explorador',    min: 0,    max: 99,   color: '#38BDF8', emoji: '🧭' },
  { nivel: 2, nombre: 'Aprendiz',      min: 100,  max: 299,  color: '#34D399', emoji: '🌱' },
  { nivel: 3, nombre: 'Inventor',      min: 300,  max: 599,  color: '#818CF8', emoji: '⚙️' },
  { nivel: 4, nombre: 'Científico',    min: 600,  max: 999,  color: '#F472B6', emoji: '🔬' },
  { nivel: 5, nombre: 'Maestro STEAM', min: 1000, max: 9999, color: '#FBBF24', emoji: '👑' },
]

export function calcularNivel(puntosTotales = 0) {
  const actual = NIVELES.find(n => puntosTotales >= n.min && puntosTotales <= n.max) || NIVELES[NIVELES.length - 1]
  const puntosEnNivel = puntosTotales - actual.min
  const rango = (actual.max - actual.min) + 1
  const porcentaje = actual.nivel === 5 ? 100 : Math.min(100, Math.round((puntosEnNivel / rango) * 100))

  return {
    ...actual,
    puntosEnNivel,
    rango,
    porcentaje,
    puntosFaltantes: actual.nivel === 5 ? 0 : (actual.max + 1) - puntosTotales
  }
}

// 2. Catálogo de 8 Insignias (Sección 11.4)
export const INSIGNIAS = [
  {
    id: 'primer-codigo',
    nombre: 'Primer Código',
    desc: 'Resuelve tu primer reto de programación en Python.',
    emoji: '🚀',
    requisito: (perfil) => (perfil?.retosResueltos?.length || 0) >= 1
  },
  {
    id: 'cazador-qr',
    nombre: 'Cazador de QR',
    desc: 'Escanea y desbloquea 5 flashcards físicas.',
    emoji: '📸',
    requisito: (perfil) => (perfil?.retosDesbloqueados?.length || 0) >= 5
  },
  {
    id: 'mente-matematica',
    nombre: 'Mente Matemática',
    desc: 'Supera 5 retos del área de Matemáticas.',
    emoji: '📐',
    requisito: (perfil) => (perfil?.puntosPorArea?.matematicas || 0) >= 50
  },
  {
    id: 'pequeno-newton',
    nombre: 'Pequeño Newton',
    desc: 'Supera 5 retos del área de Ciencias.',
    emoji: '🔬',
    requisito: (perfil) => (perfil?.puntosPorArea?.ciencias || 0) >= 50
  },
  {
    id: 'hacker-steam',
    nombre: 'Hacker STEAM',
    desc: 'Supera 5 retos del área de Informática.',
    emoji: '💻',
    requisito: (perfil) => (perfil?.puntosPorArea?.informatica || 0) >= 50
  },
  {
    id: 'mente-steam',
    nombre: 'Mente STEAM',
    desc: 'Resuelve al menos un reto de cada una de las 3 áreas.',
    emoji: '🌟',
    requisito: (perfil) => {
      const p = perfil?.puntosPorArea || {}
      return (p.matematicas || 0) > 0 && (p.ciencias || 0) > 0 && (p.informatica || 0) > 0
    }
  },
  {
    id: 'racha-fuego',
    nombre: 'Racha de Fuego',
    desc: 'Alcanza una racha de 3 días consecutivos.',
    emoji: '🔥',
    requisito: (perfil) => (perfil?.racha || 0) >= 3
  },
  {
    id: 'imparable',
    nombre: 'Imparable',
    desc: 'Supera un reto en el primer intento sin usar pistas.',
    emoji: '⚡',
    requisito: (perfil) => Boolean(perfil?.logroImparable)
  }
]

/**
 * Evalúa el perfil y devuelve las nuevas insignias obtenidas
 */
export function evaluarInsignias(perfil) {
  const yaObtenidas = perfil?.insignias || []
  const nuevas = []

  for (const ins of INSIGNIAS) {
    if (!yaObtenidas.includes(ins.id) && ins.requisito(perfil)) {
      nuevas.push(ins)
    }
  }

  return nuevas
}

// 3. Estudiantes de Demostración para Ranking local / Netlify
export const RANKING_DEMO = [
  { uid: 'u1', nombreUsuario: 'valentina_code', avatar: 'cientifica', curso: '8A-2026', puntosTotal: 345, racha: 5, nivel: 3, nombreNivel: 'Inventor', puntosPorArea: { matematicas: 120, ciencias: 150, informatica: 75 } },
  { uid: 'u2', nombreUsuario: 'mateo_steam',     avatar: 'robot-bit',  curso: '8A-2026', puntosTotal: 290, racha: 4, nivel: 2, nombreNivel: 'Aprendiz', puntosPorArea: { matematicas: 100, ciencias: 90, informatica: 100 } },
  { uid: 'u3', nombreUsuario: 'camila_py',       avatar: 'programador',curso: '8A-2026', puntosTotal: 260, racha: 3, nivel: 2, nombreNivel: 'Aprendiz', puntosPorArea: { matematicas: 80, ciencias: 90, informatica: 90 } },
  { uid: 'u4', nombreUsuario: 'lucas_mat',       avatar: 'matematico', curso: '8A-2026', puntosTotal: 210, racha: 2, nivel: 2, nombreNivel: 'Aprendiz', puntosPorArea: { matematicas: 130, ciencias: 40, informatica: 40 } },
  { uid: 'u5', nombreUsuario: 'sofia_bio',       avatar: 'alquimista', curso: '8B-2026', puntosTotal: 180, racha: 2, nivel: 2, nombreNivel: 'Aprendiz', puntosPorArea: { matematicas: 40, ciencias: 110, informatica: 30 } },
  { uid: 'u6', nombreUsuario: 'daniel_dev',      avatar: 'ingeniero',  curso: '8A-2026', puntosTotal: 150, racha: 1, nivel: 2, nombreNivel: 'Aprendiz', puntosPorArea: { matematicas: 40, ciencias: 30, informatica: 80 } },
  { uid: 'u7', nombreUsuario: 'andres_space',    avatar: 'astronauta', curso: '8B-2026', puntosTotal: 95,  racha: 1, nivel: 1, nombreNivel: 'Explorador', puntosPorArea: { matematicas: 35, ciencias: 35, informatica: 25 } },
  { uid: 'u8', nombreUsuario: 'mariana_art',     avatar: 'artista-digital', curso: '8B-2026', puntosTotal: 70, racha: 1, nivel: 1, nombreNivel: 'Explorador', puntosPorArea: { matematicas: 20, ciencias: 20, informatica: 30 } }
]

/**
 * Escucha la tabla de clasificación en tiempo real
 */
export function escucharRanking({ curso = 'todos', area = 'general', usuarioActual = null, alActualizar }) {
  if (tieneFirebaseConfigurado()) {
    try {
      const colUsuarios = collection(db, 'usuarios')
      // Consultar usuarios ordenados por puntosTotal
      const q = query(colUsuarios, orderBy('puntosTotal', 'desc'), limit(50))

      const cancelar = onSnapshot(q, (snapshot) => {
        let lista = snapshot.docs.map(d => ({ uid: d.id, ...d.data() }))

        // Filtro por curso si aplica
        if (curso !== 'todos') {
          lista = lista.filter(u => u.curso === curso)
        }

        // Ordenar por área si se seleccionó una específica
        if (area !== 'general') {
          lista.sort((a, b) => (b.puntosPorArea?.[area] || 0) - (a.puntosPorArea?.[area] || 0))
        }

        alActualizar(lista)
      }, (error) => {
        console.error('Error al escuchar ranking:', error)
        // Fallback a demo si falla la conexión
        alActualizar(obtenerRankingDemo(curso, area, usuarioActual))
      })

      return cancelar
    } catch {
      // Fallback a lista demo
    }
  }

  // Modo local / demostración
  const lista = obtenerRankingDemo(curso, area, usuarioActual)
  alActualizar(lista)
  return () => {}
}

function obtenerRankingDemo(curso, area, usuarioActual) {
  let combinada = [...RANKING_DEMO]

  // Si hay un usuario logueado en la sesión, integrarlo en el ranking
  if (usuarioActual && !combinada.some(u => u.uid === usuarioActual.uid || u.nombreUsuario === usuarioActual.nombreUsuario)) {
    combinada.push({
      uid: usuarioActual.uid || 'yo',
      nombreUsuario: usuarioActual.nombreUsuario || 'Tú',
      avatar: usuarioActual.avatar || 'robot-bit',
      curso: usuarioActual.curso || '8A-2026',
      puntosTotal: usuarioActual.puntosTotal || 0,
      racha: usuarioActual.racha || 1,
      nivel: usuarioActual.nivel || 1,
      nombreNivel: usuarioActual.nombreNivel || 'Explorador',
      puntosPorArea: usuarioActual.puntosPorArea || { matematicas: 0, ciencias: 0, informatica: 0 },
      esUsuarioActual: true
    })
  }

  // Filtrar por curso
  if (curso !== 'todos') {
    combinada = combinada.filter(u => u.curso === curso)
  }

  // Ordenar según área o general
  if (area === 'general') {
    combinada.sort((a, b) => (b.puntosTotal || 0) - (a.puntosTotal || 0))
  } else {
    combinada.sort((a, b) => (b.puntosPorArea?.[area] || 0) - (a.puntosPorArea?.[area] || 0))
  }

  return combinada
}
