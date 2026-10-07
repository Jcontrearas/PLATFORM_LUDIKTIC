// Filtro básico de nombres ofensivos o inapropiados (Requisito Sección 17)
const PALABRAS_NO_PERMITIDAS = [
  'admin', 'root', 'moderador', 'docente', 'profe',
  'idiota', 'estupido', 'tonto', 'bobo', 'mierda', 'puta', 'puto', 'marica',
  'hp', 'hdp', 'gonorrea', 'malparido', 'imbecil', 'carechimba'
]

export function validarNombreUsuario(nombre) {
  if (!nombre || typeof nombre !== 'string') {
    return { valido: false, mensaje: 'Por favor ingresa un nombre de usuario.' }
  }

  const limpio = nombre.trim().toLowerCase()

  if (limpio.length < 3) {
    return { valido: false, mensaje: 'El nombre de usuario debe tener al menos 3 caracteres.' }
  }

  if (limpio.length > 15) {
    return { valido: false, mensaje: 'El nombre de usuario no puede tener más de 15 caracteres.' }
  }

  // Solo letras, números y guiones bajos (fácil de recordar para jóvenes de 13 a 15)
  if (!/^[a-zA-Z0-9_]+$/.test(limpio)) {
    return { valido: false, mensaje: 'Usa solo letras, números o guion bajo (sin espacios).' }
  }

  for (const palabra of PALABRAS_NO_PERMITIDAS) {
    if (limpio.includes(palabra)) {
      return { valido: false, mensaje: 'Ese nombre no está permitido. Elige un apodo amigable.' }
    }
  }

  return { valido: true, nombre: limpio }
}
