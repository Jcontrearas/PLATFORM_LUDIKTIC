/**
 * Servicio de Ejecución de Python en el Navegador con Pyodide (Web Worker)
 * - Sección 10.4 y 18: Ejecución segura y aislada en cliente sin bloquear la UI
 * - Límite de tiempo: 5 segundos para evitar bucles infinitos en celulares
 * - Traductor amigable de errores de Python a español sencillo
 */

// Código en texto del Web Worker que ejecuta Pyodide
const WORKER_SCRIPT = `
importScripts("https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js");

let pyodideInstance = null;

async function inicializarPyodide() {
  if (!pyodideInstance) {
    pyodideInstance = await loadPyodide({
      indexURL: "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/"
    });
  }
  return pyodideInstance;
}

self.onmessage = async (e) => {
  const { tipo, codigo, pruebas, id } = e.data;

  if (tipo === "INICIALIZAR") {
    try {
      await inicializarPyodide();
      self.postMessage({ tipo: "INICIALIZADO", id });
    } catch (err) {
      self.postMessage({ tipo: "ERROR_INICIALIZACION", error: err.message, id });
    }
    return;
  }

  if (tipo === "EJECUTAR") {
    try {
      const py = await inicializarPyodide();

      // Redirigir stdout y stderr a un buffer en Python
      const preparacion = \`
import sys
import io
sys.stdout = io.StringIO()
sys.stderr = io.StringIO()
\`;
      await py.runPythonAsync(preparacion);

      // Ejecutar el código del estudiante
      await py.runPythonAsync(codigo);

      // Obtener la salida capturada de print()
      const salidaCapturada = await py.runPythonAsync("sys.stdout.getvalue()");

      // Si no hay pruebas que validar, solo retornar la salida
      if (!pruebas || pruebas.length === 0) {
        self.postMessage({
          tipo: "RESULTADO_EJECUCION",
          id,
          exito: true,
          salida: salidaCapturada || "(El programa terminó sin imprimir nada)"
        });
        return;
      }

      // Validar cada caso de prueba
      const resultadosPruebas = [];
      let todasAprobadas = true;

      for (let i = 0; i < pruebas.length; i++) {
        const caso = pruebas[i];
        try {
          // Resetear stdout antes de la prueba
          await py.runPythonAsync("sys.stdout = io.StringIO()");

          // Ejecutar prueba: si la plantilla define una función, probamos su retorno o su print
          // Evaluamos la llamada con la entrada del caso
          const codigoPrueba = \`
try:
    _steam_res = repr(eval(f"""\${caso.entrada}"""))
except:
    _steam_res = str(eval(f"""\${caso.entrada}"""))
\`;
          // Alternativa flexible: ejecutar la llamada directamente
          let resultadoStr = "";
          try {
            const evaluacion = await py.runPythonAsync(caso.entrada);
            resultadoStr = evaluacion !== undefined ? String(evaluacion) : "";
          } catch (evalErr) {
            // Si la entrada no es expresión evaluable sola, leer salida de print
            resultadoStr = await py.runPythonAsync("sys.stdout.getvalue().strip()");
          }

          const salidaEsperadaLimpia = String(caso.salida).trim();
          const salidaObtenidaLimpia = String(resultadoStr).trim();

          const aprobada = (salidaEsperadaLimpia === salidaObtenidaLimpia) ||
            salidaObtenidaLimpia.includes(salidaEsperadaLimpia);

          if (!aprobada) todasAprobadas = false;

          resultadosPruebas.push({
            numero: i + 1,
            aprobada,
            oculta: caso.oculta,
            entrada: caso.oculta ? "(Oculta para examen)" : caso.entrada,
            esperado: caso.oculta ? "(Oculta)" : caso.salida,
            obtenido: caso.oculta ? (aprobada ? "Superada" : "Incorrecto") : (resultadoStr || "Sin salida")
          });
        } catch (casoErr) {
          todasAprobadas = false;
          resultadosPruebas.push({
            numero: i + 1,
            aprobada: false,
            oculta: caso.oculta,
            entrada: caso.oculta ? "(Oculta)" : caso.entrada,
            esperado: caso.oculta ? "(Oculta)" : caso.salida,
            error: casoErr.message
          });
        }
      }

      self.postMessage({
        tipo: "RESULTADO_PRUEBAS",
        id,
        exito: todasAprobadas,
        salida: salidaCapturada,
        resultadosPruebas
      });
    } catch (error) {
      self.postMessage({
        tipo: "ERROR_EJECUCION",
        id,
        exito: false,
        errorRaw: error.message
      });
    }
  }
};
`;

/**
 * Traduce los errores más comunes de Python a lenguaje comprensible
 * para estudiantes de grado octavo (Sección 10.4)
 */
export function traducirErrorPython(errorTexto) {
  if (!errorTexto) return 'Ocurrió un error inesperado al ejecutar tu código.'

  if (errorTexto.includes('SyntaxError')) {
    if (errorTexto.includes('unexpected EOF') || errorTexto.includes('was never closed')) {
      return '🔎 Revisa tu código: puede faltar cerrar un paréntesis, corchete o comilla.'
    }
    if (errorTexto.includes('expected \':\'')) {
      return '🔎 Recuerda poner los dos puntos (:) al final de tu función, if o ciclo for.'
    }
    return '🔎 Error de sintaxis: Revisa tu código, puede faltar un paréntesis () o los dos puntos (:).'
  }

  if (errorTexto.includes('IndentationError')) {
    return '📐 Revisa la sangría (espacios): el código dentro de funciones, if y ciclos debe llevar tabulación.'
  }

  if (errorTexto.includes('NameError')) {
    const coincidencia = errorTexto.match(/name '(\w+)' is not defined/)
    const nombreVar = coincidencia ? ` "${coincidencia[1]}"` : ''
    return `💡 Estás usando una variable o función${nombreVar} que no has creado todavía.`
  }

  if (errorTexto.includes('TypeError')) {
    if (errorTexto.includes('unsupported operand type')) {
      return '🔢 Cuidado con los tipos: intentaste mezclar números con texto (o tipos incompatibles).'
    }
    return '💡 Revisa los tipos de datos que estás sumando, comparando o pasando a la función.'
  }

  if (errorTexto.includes('ZeroDivisionError')) {
    return '⚠️ División por cero: en matemáticas no se puede dividir un número entre 0.'
  }

  if (errorTexto.includes('IndexError')) {
    return '📋 Estás intentando acceder a una posición de la lista que no existe.'
  }

  if (errorTexto.includes('KeyError')) {
    return '🔑 Estás buscando una clave en el diccionario que no existe.'
  }

  return `⚠️ ${errorTexto.split('\n').pop() || errorTexto}`
}

let workerInstancia = null
let workerBlobUrl   = null

function obtenerWorker() {
  if (!workerInstancia) {
    const blob = new Blob([WORKER_SCRIPT], { type: 'application/javascript' })
    workerBlobUrl = URL.createObjectURL(blob)
    workerInstancia = new Worker(workerBlobUrl)
  }
  return workerInstancia
}

/**
 * Ejecuta código Python con límite de tiempo (5 segundos)
 */
export function ejecutarEnWorker({ codigo, pruebas = [], tipo = 'EJECUTAR' }) {
  return new Promise((resolve, reject) => {
    const worker = obtenerWorker()
    const id = Date.now().toString()

    // Temporizador de seguridad: 5 segundos límite (Sección 10.4)
    const timeout = setTimeout(() => {
      // Si expira, matamos el worker para detener ciclos infinitos y creamos uno nuevo
      if (workerInstancia) {
        workerInstancia.terminate()
        workerInstancia = null
      }
      resolve({
        exito: false,
        salida: '',
        error: '⏱️ Tu programa tardó más de 5 segundos. Puede haber un ciclo infinito (while True).'
      })
    }, 5500)

    const manejarMensaje = (e) => {
      if (e.data.id !== id) return

      clearTimeout(timeout)
      worker.removeEventListener('message', manejarMensaje)

      if (e.data.tipo === 'ERROR_EJECUCION') {
        resolve({
          exito: false,
          salida: '',
          error: traducirErrorPython(e.data.errorRaw)
        })
      } else if (e.data.tipo === 'RESULTADO_EJECUCION') {
        resolve({
          exito: true,
          salida: e.data.salida,
          error: null
        })
      } else if (e.data.tipo === 'RESULTADO_PRUEBAS') {
        resolve({
          exito: e.data.exito,
          salida: e.data.salida,
          resultadosPruebas: e.data.resultadosPruebas,
          error: null
        })
      }
    }

    worker.addEventListener('message', manejarMensaje)
    worker.postMessage({ tipo, codigo, pruebas, id })
  })
}

/**
 * Pre-calentar el motor Pyodide en segundo plano
 */
export function precalentarPyodide() {
  try {
    const worker = obtenerWorker()
    worker.postMessage({ tipo: 'INICIALIZAR', id: 'init' })
  } catch {
    // Silencioso
  }
}
