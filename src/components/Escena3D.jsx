import React, { useRef, useEffect } from 'react'
import styles from './Escena3D.module.css'

/**
 * Motor 3D nativo de alto rendimiento (Sección 4 y 18 del prompt maestro)
 * Proyección en perspectiva 3D por GPU (Canvas), ultra ligero, a 60 FPS,
 * optimizado para celulares de 360px y computadores sin sobrecargar la memoria.
 *
 * Soporta interactividad táctil/ratón y 4 modos STEAM:
 * - 'fondo-login': Tríada espacial con poliedros STEAM y partículas estelares
 * - 'carpeta-matematicas': Icosaedro 3D fractal con aristas neón
 * - 'carpeta-ciencias': Modelo atómico 3D con electrones orbitales
 * - 'carpeta-informatica': Cubo chip holográfico con núcleo rotatorio
 */

// Geometría 3D: Icosaedro regular (12 vértices, 20 caras)
const PHI = (1 + Math.sqrt(5)) / 2
const VERTICES_ICOSAEDRO = [
  [-1,  PHI, 0], [ 1,  PHI, 0], [-1, -PHI, 0], [ 1, -PHI, 0],
  [ 0, -1,  PHI], [ 0,  1,  PHI], [ 0, -1, -PHI], [ 0,  1, -PHI],
  [ PHI, 0, -1], [ PHI, 0,  1], [-PHI, 0, -1], [-PHI, 0,  1]
].map(([x, y, z]) => {
  const len = Math.hypot(x, y, z)
  return [x / len, y / len, z / len]
})

const CARAS_ICOSAEDRO = [
  [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
  [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
  [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
  [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]
]

// Geometría 3D: Cubo (8 vértices, 12 aristas)
const VERTICES_CUBO = [
  [-1, -1, -1], [ 1, -1, -1], [ 1,  1, -1], [-1,  1, -1],
  [-1, -1,  1], [ 1, -1,  1], [ 1,  1,  1], [-1,  1,  1]
]
const ARISTAS_CUBO = [
  [0,1], [1,2], [2,3], [3,0],
  [4,5], [5,6], [6,7], [7,4],
  [0,4], [1,5], [2,6], [3,7]
]

// Geometría 3D: Octaedro (6 vértices, 8 caras)
const VERTICES_OCTAEDRO = [
  [ 1, 0, 0], [-1, 0, 0], [0,  1, 0],
  [0, -1, 0], [ 0, 0, 1], [0, 0, -1]
]
const CARAS_OCTAEDRO = [
  [0,2,4], [2,1,4], [1,3,4], [3,0,4],
  [2,0,5], [1,2,5], [3,1,5], [0,3,5]
]

// Funciones de rotación 3D
function rotarX(v, a) {
  const cos = Math.cos(a), sin = Math.sin(a)
  return [v[0], v[1] * cos - v[2] * sin, v[1] * sin + v[2] * cos]
}
function rotarY(v, a) {
  const cos = Math.cos(a), sin = Math.sin(a)
  return [v[0] * cos + v[2] * sin, v[1], -v[0] * sin + v[2] * cos]
}
function rotarZ(v, a) {
  const cos = Math.cos(a), sin = Math.sin(a)
  return [v[0] * cos - v[1] * sin, v[0] * sin + v[1] * cos, v[2]]
}

export default function Escena3D({
  modo = 'fondo-login',
  fondo = false,
  className = ''
}) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId
    let rotacion = { x: 0.3, y: 0.4 }
    let velocidadMouse = { x: 0, y: 0 }
    let dragging = false
    let prevMouse = { x: 0, y: 0 }
    let tiempo = 0

    // Ajuste de resolución Retina / High-DPI
    const actualizarTamano = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = (rect.width || 300) * dpr
      canvas.height = (rect.height || 200) * dpr
      ctx.scale(dpr, dpr)
    }

    actualizarTamano()
    window.addEventListener('resize', actualizarTamano)

    // Interacción táctil / mouse suave
    const onMouseDown = (e) => {
      dragging = true
      prevMouse = { x: e.clientX || e.touches?.[0]?.clientX, y: e.clientY || e.touches?.[0]?.clientY }
    }
    const onMouseMove = (e) => {
      if (!dragging) return
      const cx = e.clientX || e.touches?.[0]?.clientX
      const cy = e.clientY || e.touches?.[0]?.clientY
      if (cx === undefined || cy === undefined) return
      const dx = cx - prevMouse.x
      const dy = cy - prevMouse.y
      rotacion.y += dx * 0.015
      rotacion.x += dy * 0.015
      velocidadMouse = { x: dy * 0.005, y: dx * 0.005 }
      prevMouse = { x: cx, y: cy }
    }
    const onMouseUp = () => { dragging = false }

    canvas.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    canvas.addEventListener('touchstart', onMouseDown, { passive: true })
    window.addEventListener('touchmove', onMouseMove, { passive: true })
    window.addEventListener('touchend', onMouseUp)

    // Partículas estelares para modo fondo
    const PARTICULAS = Array.from({ length: 45 }, () => ({
      x: (Math.random() - 0.5) * 800,
      y: (Math.random() - 0.5) * 600,
      z: Math.random() * 500 + 100,
      radio: Math.random() * 2 + 1,
      color: Math.random() > 0.5 ? '#38BDF8' : '#C084FC',
      velocidad: Math.random() * 0.5 + 0.3
    }))

    // Proyección en perspectiva 3D
    const proyectar = (v, escala, cx, cy, distanciaCam = 400) => {
      const factor = distanciaCam / (distanciaCam + v[2])
      return [cx + v[0] * escala * factor, cy + v[1] * escala * factor, v[2]]
    }

    // Bucle de renderizado 60 FPS
    const render = () => {
      tiempo += 0.016
      const rect = canvas.getBoundingClientRect()
      const w = rect.width || 300
      const h = rect.height || 200
      const cx = w / 2
      const cy = h / 2

      ctx.clearRect(0, 0, w, h)

      // Inercia rotatoria
      if (!dragging) {
        rotacion.y += 0.008 + velocidadMouse.y
        rotacion.x += 0.004 + velocidadMouse.x
        velocidadMouse.x *= 0.95
        velocidadMouse.y *= 0.95
      }

      // -------------------------------------------------------------
      // MODO 1: FONDO LOGIN (Tríada STEAM 3D)
      // -------------------------------------------------------------
      if (modo === 'fondo-login') {
        // 1. Partículas estelares 3D flotantes
        PARTICULAS.forEach(p => {
          p.z -= p.velocidad
          if (p.z < 20) p.z = 500
          const k = 250 / p.z
          const px = cx + p.x * k
          const py = cy + p.y * k
          const alfa = Math.min(1, Math.max(0, 1 - p.z / 500))
          ctx.beginPath()
          ctx.arc(px, py, p.radio * k, 0, Math.PI * 2)
          ctx.fillStyle = p.color
          ctx.globalAlpha = alfa * 0.7
          ctx.fill()
        })
        ctx.globalAlpha = 1

        // 2. Icosaedro Azul (Matemáticas) - Arriba izquierda
        const escalaMat = Math.min(w, h) * 0.12
        const posMat = [cx - w * 0.3, cy - h * 0.22]
        const rMat = { x: rotacion.x * 0.8 + tiempo * 0.3, y: rotacion.y * 0.9 }

        const verticesMat = VERTICES_ICOSAEDRO.map(v => {
          let p = rotarX(v, rMat.x)
          p = rotarY(p, rMat.y)
          return proyectar(p, escalaMat, posMat[0], posMat[1])
        })

        // Dibujar aristas brillantes de Matemáticas
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)'
        ctx.lineWidth = 1.5
        CARAS_ICOSAEDRO.forEach(([i, j, k]) => {
          ctx.beginPath()
          ctx.moveTo(verticesMat[i][0], verticesMat[i][1])
          ctx.lineTo(verticesMat[j][0], verticesMat[j][1])
          ctx.lineTo(verticesMat[k][0], verticesMat[k][1])
          ctx.closePath()
          ctx.fillStyle = 'rgba(37, 99, 235, 0.06)'
          ctx.fill()
          ctx.stroke()
        })

        // 3. Átomo Esmeralda (Ciencias) - Arriba derecha
        const posCien = [cx + w * 0.32, cy - h * 0.2]
        const escalaCien = Math.min(w, h) * 0.1
        // Núcleo
        ctx.beginPath()
        ctx.arc(posCien[0], posCien[1], escalaCien * 0.25, 0, Math.PI * 2)
        ctx.fillStyle = '#10B981'
        ctx.shadowColor = '#34D399'
        ctx.shadowBlur = 15
        ctx.fill()
        ctx.shadowBlur = 0

        // Órbitas rotatorias
        for (let ring = 0; ring < 2; ring++) {
          const anguloRing = ring === 0 ? 0.8 : -0.8
          ctx.beginPath()
          ctx.ellipse(posCien[0], posCien[1], escalaCien * 1.1, escalaCien * 0.38, anguloRing + tiempo * 0.2, 0, Math.PI * 2)
          ctx.strokeStyle = ring === 0 ? 'rgba(132, 204, 22, 0.5)' : 'rgba(16, 185, 129, 0.5)'
          ctx.lineWidth = 1.5
          ctx.stroke()

          // Electrón orbitando
          const eAngulo = tiempo * (ring === 0 ? 3 : -2.5)
          const ex = posCien[0] + Math.cos(eAngulo) * (escalaCien * 1.1) * Math.cos(anguloRing) - Math.sin(eAngulo) * (escalaCien * 0.38) * Math.sin(anguloRing)
          const ey = posCien[1] + Math.cos(eAngulo) * (escalaCien * 1.1) * Math.sin(anguloRing) + Math.sin(eAngulo) * (escalaCien * 0.38) * Math.cos(anguloRing)
          ctx.beginPath()
          ctx.arc(ex, ey, 3.5, 0, Math.PI * 2)
          ctx.fillStyle = '#A3E635'
          ctx.fill()
        }

        // 4. Cubo Chip Morado (Informática) - Abajo centro
        const posInf = [cx, cy + h * 0.32]
        const escalaInf = Math.min(w, h) * 0.11
        const rInf = { x: rotacion.x * 0.7, y: rotacion.y + tiempo * 0.4 }

        const verticesInf = VERTICES_CUBO.map(v => {
          let p = rotarX(v, rInf.x)
          p = rotarY(p, rInf.y)
          return proyectar(p, escalaInf * 0.6, posInf[0], posInf[1])
        })

        ctx.strokeStyle = 'rgba(192, 132, 252, 0.5)'
        ctx.lineWidth = 1.5
        ARISTAS_CUBO.forEach(([a, b]) => {
          ctx.beginPath()
          ctx.moveTo(verticesInf[a][0], verticesInf[a][1])
          ctx.lineTo(verticesInf[b][0], verticesInf[b][1])
          ctx.stroke()
        })
      }

      // -------------------------------------------------------------
      // MODO 2: CARPETA MATEMÁTICAS (Icosaedro interactivo rotatorio)
      // -------------------------------------------------------------
      else if (modo === 'carpeta-matematicas') {
        const escala = Math.min(w, h) * 0.36
        const vertices = VERTICES_ICOSAEDRO.map(v => {
          let p = rotarX(v, rotacion.x)
          p = rotarY(p, rotacion.y)
          return proyectar(p, escala, cx, cy)
        })

        // Ordenar caras por profundidad (Painter's algorithm)
        const carasOrdenadas = CARAS_ICOSAEDRO.map(([a, b, c]) => {
          const zMedia = (vertices[a][2] + vertices[b][2] + vertices[c][2]) / 3
          return { indices: [a, b, c], z: zMedia }
        }).sort((f1, f2) => f1.z - f2.z)

        carasOrdenadas.forEach(({ indices: [a, b, c] }) => {
          const vA = vertices[a]
          const vB = vertices[b]
          const vC = vertices[c]

          ctx.beginPath()
          ctx.moveTo(vA[0], vA[1])
          ctx.lineTo(vB[0], vB[1])
          ctx.lineTo(vC[0], vC[1])
          ctx.closePath()

          // Relleno degradado 3D
          ctx.fillStyle = 'rgba(37, 99, 235, 0.22)'
          ctx.fill()
          ctx.strokeStyle = '#38BDF8'
          ctx.lineWidth = 2
          ctx.stroke()
        })
      }

      // -------------------------------------------------------------
      // MODO 3: CARPETA CIENCIAS (Átomo orbital cuántico)
      // -------------------------------------------------------------
      else if (modo === 'carpeta-ciencias') {
        const escala = Math.min(w, h) * 0.38

        // Núcleo central con resplandor
        const radioNucleo = escala * 0.22
        const gradienteNucleo = ctx.createRadialGradient(cx - 4, cy - 4, 2, cx, cy, radioNucleo)
        gradienteNucleo.addColorStop(0, '#6EE7B7')
        gradienteNucleo.addColorStop(0.7, '#10B981')
        gradienteNucleo.addColorStop(1, '#059669')

        ctx.beginPath()
        ctx.arc(cx, cy, radioNucleo, 0, Math.PI * 2)
        ctx.fillStyle = gradienteNucleo
        ctx.shadowColor = '#34D399'
        ctx.shadowBlur = 18
        ctx.fill()
        ctx.shadowBlur = 0

        // 3 Anillos orbitales en 3D
        const orbitas = [
          { angulo: 0.6, vel: 2.2, color: '#34D399', eColor: '#A3E635' },
          { angulo: -0.6, vel: -2.6, color: '#84CC16', eColor: '#6EE7B7' },
          { angulo: 1.57, vel: 1.8, color: '#10B981', eColor: '#FDE047' }
        ]

        orbitas.forEach((orb) => {
          ctx.beginPath()
          ctx.ellipse(cx, cy, escala * 0.9, escala * 0.32, orb.angulo + rotacion.y * 0.2, 0, Math.PI * 2)
          ctx.strokeStyle = orb.color
          ctx.lineWidth = 2
          ctx.stroke()

          // Electrón
          const eAng = tiempo * orb.vel + rotacion.x
          const ex = cx + Math.cos(eAng) * (escala * 0.9) * Math.cos(orb.angulo) - Math.sin(eAng) * (escala * 0.32) * Math.sin(orb.angulo)
          const ey = cy + Math.cos(eAng) * (escala * 0.9) * Math.sin(orb.angulo) + Math.sin(eAng) * (escala * 0.32) * Math.cos(orb.angulo)

          ctx.beginPath()
          ctx.arc(ex, ey, 4.5, 0, Math.PI * 2)
          ctx.fillStyle = orb.eColor
          ctx.shadowColor = orb.eColor
          ctx.shadowBlur = 10
          ctx.fill()
          ctx.shadowBlur = 0
        })
      }

      // -------------------------------------------------------------
      // MODO 4: CARPETA INFORMÁTICA (Cubo CPU con núcleo flotante)
      // -------------------------------------------------------------
      else if (modo === 'carpeta-informatica') {
        const escala = Math.min(w, h) * 0.34

        // 1. Cubo exterior wireframe
        const verticesCubo = VERTICES_CUBO.map(v => {
          let p = rotarX(v, rotacion.x)
          p = rotarY(p, rotacion.y)
          return proyectar(p, escala * 0.55, cx, cy)
        })

        ctx.strokeStyle = '#C084FC'
        ctx.lineWidth = 2.2
        ARISTAS_CUBO.forEach(([a, b]) => {
          ctx.beginPath()
          ctx.moveTo(verticesCubo[a][0], verticesCubo[a][1])
          ctx.lineTo(verticesCubo[b][0], verticesCubo[b][1])
          ctx.stroke()
        })

        // 2. Núcleo Octaedro interno contra-rotatorio
        const verticesOct = VERTICES_OCTAEDRO.map(v => {
          let p = rotarX(v, -rotacion.x * 1.2)
          p = rotarY(p, -rotacion.y * 1.2)
          return proyectar(p, escala * 0.28, cx, cy)
        })

        CARAS_OCTAEDRO.forEach(([a, b, c]) => {
          ctx.beginPath()
          ctx.moveTo(verticesOct[a][0], verticesOct[a][1])
          ctx.lineTo(verticesOct[b][0], verticesOct[b][1])
          ctx.lineTo(verticesOct[c][0], verticesOct[c][1])
          ctx.closePath()
          ctx.fillStyle = 'rgba(124, 58, 237, 0.45)'
          ctx.fill()
          ctx.strokeStyle = '#EC4899'
          ctx.lineWidth = 1.2
          ctx.stroke()
        })
      }

      animId = requestAnimationFrame(render)
    }

    render()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', actualizarTamano)
      canvas.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
      canvas.removeEventListener('touchstart', onMouseDown)
      window.removeEventListener('touchmove', onMouseMove)
      window.removeEventListener('touchend', onMouseUp)
    }
  }, [modo])

  return (
    <div
      className={`${styles.contenedorCanvas} ${fondo ? styles.fondoAbsoluto : ''} ${className}`}
      title="Elemento 3D interactivo STEAM · Toca o arrastra para rotar"
    >
      <canvas ref={canvasRef} className={styles.canvas3D} />
    </div>
  )
}
