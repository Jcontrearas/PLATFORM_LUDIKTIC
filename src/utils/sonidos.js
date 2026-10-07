/**
 * Utilidades de retroalimentación sensorial (Sonido sintético y vibración háptica)
 * - Sección 8.2: Al detectar el código QR: vibra y reproduce sonido sutil
 * - Usa Web Audio API nativo (no requiere descargar archivos mp3)
 */

export function reproducirBeepExito() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext
    if (!AudioContext) return
    const ctx = new AudioContext()

    // Tono futurista de dos notas ascendentes (Do - Sol)
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.connect(gain)
    gain.connect(ctx.destination)

    const now = ctx.currentTime
    osc.frequency.setValueAtTime(587.33, now) // Re
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.12) // La

    gain.gain.setValueAtTime(0.2, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25)

    osc.start(now)
    osc.stop(now + 0.25)
  } catch {
    // Silencioso si el navegador bloquea audio antes de interacción
  }
}

export function vibrarExito() {
  try {
    if ('vibrate' in navigator) {
      navigator.vibrate([80, 40, 80])
    }
  } catch {
    // Silencioso
  }
}
