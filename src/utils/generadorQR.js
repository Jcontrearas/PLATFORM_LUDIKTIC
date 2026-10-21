/**
 * Generador de Códigos QR nativo y 100% autónomo (sin dependencias externas)
 * Algoritmo estándar de Kazuhiko Arase para QR Code (ISO/IEC 18004)
 * Genera SVG y DataURLs para las flashcards impresas y visualización web.
 */

// Tablas Galois Field GF(256)
const EXP_TABLE = new Uint8Array(256)
const LOG_TABLE = new Uint8Array(256)
for (let i = 0, x = 1; i < 256; i++) {
  EXP_TABLE[i] = x
  LOG_TABLE[x] = i
  x = (x << 1) ^ (x & 0x80 ? 0x11d : 0)
}

function glog(n) {
  if (n < 1) throw new Error('glog(' + n + ')')
  return LOG_TABLE[n]
}

function gexp(n) {
  while (n < 0) n += 255
  while (n >= 255) n -= 255
  return EXP_TABLE[n]
}

class Polynomial {
  constructor(num, shift) {
    let offset = 0
    while (offset < num.length && num[offset] === 0) offset++
    this.num = new Uint8Array(num.length - offset + shift)
    for (let i = 0; i < num.length - offset; i++) {
      this.num[i] = num[offset + i]
    }
  }

  get(index) {
    return this.num[index]
  }

  getLength() {
    return this.num.length
  }

  multiply(e) {
    const num = new Uint8Array(this.getLength() + e.getLength() - 1)
    for (let i = 0; i < this.getLength(); i++) {
      for (let j = 0; j < e.getLength(); j++) {
        num[i + j] ^= gexp(glog(this.get(i)) + glog(e.get(j)))
      }
    }
    return new Polynomial(num, 0)
  }

  mod(e) {
    if (this.getLength() - e.getLength() < 0) return this
    const ratio = glog(this.get(0)) - glog(e.get(0))
    const num = new Uint8Array(this.getLength())
    for (let i = 0; i < this.getLength(); i++) num[i] = this.get(i)
    for (let i = 0; i < e.getLength(); i++) {
      num[i] ^= gexp(glog(e.get(i)) + ratio)
    }
    return new Polynomial(num, 0).mod(e)
  }
}

// Configuración de bloques de corrección de error (Nivel M)
const RS_BLOCK_TABLE = [
  // Version 1..5 [totalDataBytes, ecBytesPerBlock]
  [16, 10], // V1
  [28, 16], // V2
  [44, 26], // V3
  [64, 36], // V4
  [86, 48]  // V5
]

class QRCodeModel {
  constructor(typeNumber, errorCorrectLevel) {
    this.typeNumber = typeNumber
    this.errorCorrectLevel = errorCorrectLevel
    this.modules = null
    this.moduleCount = 0
    this.dataList = []
  }

  addData(data) {
    this.dataList.push(data)
  }

  isDark(row, col) {
    return this.modules[row][col]
  }

  getModuleCount() {
    return this.moduleCount
  }

  make() {
    this.moduleCount = this.typeNumber * 4 + 17
    this.modules = Array.from({ length: this.moduleCount }, () => new Array(this.moduleCount).fill(null))

    // Patrones de posición
    this.setupPositionProbePattern(0, 0)
    this.setupPositionProbePattern(this.moduleCount - 7, 0)
    this.setupPositionProbePattern(0, this.moduleCount - 7)
    this.setupTimingPattern()
    this.setupPositionAdjustPattern()
    this.setupTypeInfo(false, 0)

    const data = this.createData()
    this.mapData(data, 0)
  }

  setupPositionProbePattern(row, col) {
    for (let r = -1; r <= 7; r++) {
      if (row + r <= -1 || this.moduleCount <= row + r) continue
      for (let c = -1; c <= 7; c++) {
        if (col + c <= -1 || this.moduleCount <= col + c) continue
        if ((0 <= r && r <= 6 && (c === 0 || c === 6)) ||
            (0 <= c && c <= 6 && (r === 0 || r === 6)) ||
            (2 <= r && r <= 4 && 2 <= c && c <= 4)) {
          this.modules[row + r][col + c] = true
        } else {
          this.modules[row + r][col + c] = false
        }
      }
    }
  }

  setupTimingPattern() {
    for (let r = 8; r < this.moduleCount - 8; r++) {
      if (this.modules[r][6] !== null) continue
      this.modules[r][6] = (r % 2 === 0)
    }
    for (let c = 8; c < this.moduleCount - 8; c++) {
      if (this.modules[6][c] !== null) continue
      this.modules[6][c] = (c % 2 === 0)
    }
  }

  setupPositionAdjustPattern() {
    if (this.typeNumber <= 1) return
    const pos = this.typeNumber === 2 ? [6, 18] :
                this.typeNumber === 3 ? [6, 22] :
                this.typeNumber === 4 ? [6, 26] : [6, 30]
    for (let i = 0; i < pos.length; i++) {
      for (let j = 0; j < pos.length; j++) {
        const row = pos[i], col = pos[j]
        if (this.modules[row][col] !== null) continue
        for (let r = -2; r <= 2; r++) {
          for (let c = -2; c <= 2; c++) {
            this.modules[row + r][col + c] = (Math.abs(r) === 2 || Math.abs(c) === 2 || (r === 0 && c === 0))
          }
        }
      }
    }
  }

  setupTypeInfo(test, maskPattern) {
    const data = (1 << 3) | maskPattern // Error level M = 0
    let bits = data << 10
    while (bits >= 1024) bits ^= (0x537 << (Math.floor(Math.log2(bits)) - 10))
    const format = ((data << 10) | bits) ^ 0x5412

    for (let i = 0; i < 15; i++) {
      const mod = !test && ((format >> i) & 1) === 1
      if (i < 6) this.modules[i][8] = mod
      else if (i < 8) this.modules[i + 1][8] = mod
      else this.modules[this.moduleCount - 15 + i][8] = mod

      if (i < 8) this.modules[8][this.moduleCount - i - 1] = mod
      else if (i < 9) this.modules[8][15 - i - 1 + 1] = mod
      else this.modules[8][15 - i - 1] = mod
    }
    this.modules[this.moduleCount - 8][8] = !test
  }

  createData() {
    const buffer = []
    // Modo 8-bit Byte
    buffer.push(0x40 | (this.dataList[0].length >> 4))
    buffer.push((this.dataList[0].length << 4) & 0xff)

    for (let i = 0; i < this.dataList[0].length; i++) {
      const code = this.dataList[0].charCodeAt(i)
      buffer[buffer.length - 1] |= (code >> 4)
      buffer.push((code << 4) & 0xff)
    }

    const conf = RS_BLOCK_TABLE[this.typeNumber - 1]
    const totalData = conf[0]
    const ecCount = conf[1]

    while (buffer.length < totalData) {
      buffer.push(buffer.length % 2 === 0 ? 0xec : 0x11)
    }

    // Reed Solomon
    let ecPoly = new Polynomial([1], 0)
    for (let i = 0; i < ecCount; i++) {
      ecPoly = ecPoly.multiply(new Polynomial([1, gexp(i)], 0))
    }
    const rawData = new Polynomial(buffer.slice(0, totalData), ecCount)
    const mod = rawData.mod(ecPoly)
    const ecBytes = new Uint8Array(ecCount)
    for (let i = 0; i < ecCount; i++) {
      const modIndex = i + mod.getLength() - ecCount
      ecBytes[i] = (modIndex >= 0) ? mod.get(modIndex) : 0
    }

    return [...buffer.slice(0, totalData), ...ecBytes]
  }

  mapData(data, maskPattern) {
    let inc = -1
    let row = this.moduleCount - 1
    let bitIndex = 7
    let byteIndex = 0

    for (let col = this.moduleCount - 1; col > 0; col -= 2) {
      if (col === 6) col--
      while (true) {
        for (let c = 0; c < 2; c++) {
          if (this.modules[row][col - c] === null) {
            let dark = false
            if (byteIndex < data.length) {
              dark = (((data[byteIndex] >>> bitIndex) & 1) === 1)
            }
            // Máscara (row + col) % 2 === 0
            const mask = ((row + (col - c)) % 2 === 0)
            this.modules[row][col - c] = mask ? !dark : dark
            bitIndex--
            if (bitIndex === -1) {
              byteIndex++
              bitIndex = 7
            }
          }
        }
        row += inc
        if (row < 0 || this.moduleCount <= row) {
          row -= inc
          inc = -inc
          break
        }
      }
    }
  }
}

/**
 * Genera una matriz de módulos booleanos para un texto dado
 */
export function generarMatrizQR(texto) {
  let version = 1
  if (texto.length > 14) version = 2
  if (texto.length > 26) version = 3
  if (texto.length > 42) version = 4
  if (texto.length > 60) version = 5

  const qr = new QRCodeModel(version, 0)
  qr.addData(texto)
  qr.make()
  return qr
}

/**
 * Genera un DataURL SVG para mostrar o imprimir el código QR
 */
export function generarDataURLQR(texto, opciones = {}) {
  const qr = generarMatrizQR(texto)
  const count = qr.getModuleCount()
  const cellSize = opciones.cellSize || 6
  const margin = opciones.margin || 2
  const size = (count + margin * 2) * cellSize

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">`
  svg += `<rect width="${size}" height="${size}" fill="#FFFFFF"/>`
  svg += `<g fill="#0F172A">`

  for (let r = 0; r < count; r++) {
    for (let c = 0; c < count; c++) {
      if (qr.isDark(r, c)) {
        const x = (c + margin) * cellSize
        const y = (r + margin) * cellSize
        svg += `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}"/>`
      }
    }
  }

  svg += `</g></svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}
