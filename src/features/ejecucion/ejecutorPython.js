/**
 * Servicio de Ejecución de Python en el Navegador con Pyodide (Web Worker)
 * - Sección 10.4 y 18: Ejecución segura y aislada en cliente sin bloquear la UI
 * - Límite de tiempo: 5 segundos para código del estudiante (evita bucles infinitos)
 * - Separación entre descarga/carga inicial de Pyodide y tiempo de cómputo del alumno
 * - Evaluador inteligente de funciones (invoca def con parámetros de prueba)
 * - Traductor pedagógico de errores de Python a español claro
 */

const WORKER_SCRIPT = `
let pyodideInstance = null;

async function inicializarPyodide() {
  if (!pyodideInstance) {
    self.postMessage({ tipo: "ESTADO", mensaje: "Cargando motor de Python (Pyodide WebAssembly)..." });
    try {
      importScripts("https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js");
    } catch (e) {
      importScripts("https://unpkg.com/pyodide@0.25.0/full/pyodide.js");
    }

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
      // 1. Asegurar que Pyodide esté en memoria (tiempo de descarga no cuenta para el timeout del alumno)
      const py = await inicializarPyodide();

      // Notificar al hilo principal que Pyodide ya está listo y el código del alumno comienza
      self.postMessage({ tipo: "INICIO_EJECUCION_USUARIO", id });

      // Redirigir stdout y stderr para capturar prints
      const preparacion = \`
import sys
import io
sys.stdout = io.StringIO()
sys.stderr = io.StringIO()
\`;
      await py.runPythonAsync(preparacion);

      // 2. Ejecutar el código del estudiante
      await py.runPythonAsync(codigo);

      // Obtener lo que imprimió el estudiante
      const salidaCapturada = await py.runPythonAsync("sys.stdout.getvalue()");

      // Si no hay casos de prueba (modo "Probar código"), terminar aquí
      if (!pruebas || pruebas.length === 0) {
        self.postMessage({
          tipo: "RESULTADO_EJECUCION",
          id,
          exito: true,
          salida: salidaCapturada || "(El programa terminó sin imprimir nada)"
        });
        return;
      }

      // 3. Extraer nombre de la función principal definida por el estudiante (ej: def calcular_total)
      const matchFuncion = codigo.match(/def\\s+([a-zA-Z0-9_]+)\\s*\\(/);
      const nombreFuncion = matchFuncion ? matchFuncion[1] : null;

      // 4. Validar cada caso de prueba
      const resultadosPruebas = [];
      let todasAprobadas = true;

      for (let i = 0; i < pruebas.length; i++) {
        const caso = pruebas[i];
        try {
          // Limpiar stdout antes de la prueba
          await py.runPythonAsync("sys.stdout = io.StringIO()");

          let llamada = String(caso.entrada).trim();

          // Si el código definió una función y la entrada son solo parámetros (ej: '5000' o '3500, 5000'),
          // envolver en la llamada a la función: calcular_total(5000)
          if (nombreFuncion && !llamada.includes('(') && !llamada.startsWith(nombreFuncion)) {
            llamada = \`\${nombreFuncion}(\${caso.entrada})\`;
          }

          let resultadoStr = "";
          let evaluado = undefined;

          try {
            evaluado = await py.runPythonAsync(llamada);
            resultadoStr = evaluado !== undefined ? String(evaluado) : "";
          } catch (evalErr) {
            // Si no retornó valor con return, verificar si imprimió con print
            resultadoStr = await py.runPythonAsync("sys.stdout.getvalue().strip()");
            if (!resultadoStr) {
              throw evalErr;
            }
          }

          // Si el resultado capturado está vacío pero se imprimió en stdout
          if (!resultadoStr) {
            const printSalida = await py.runPythonAsync("sys.stdout.getvalue().strip()");
            if (printSalida) resultadoStr = printSalida;
          }

          const esperadoLimpio = String(caso.salida).trim();
          const obtenidoLimpio = String(resultadoStr).trim();

          // Comparación exacta
          let aprobada = (esperadoLimpio === obtenidoLimpio);

          // Comparación numérica tolerante (ej: 4250 === 4250.0)
          if (!aprobada && !isNaN(Number(esperadoLimpio)) && !isNaN(Number(obtenidoLimpio))) {
            aprobada = Math.abs(Number(esperadoLimpio) - Number(obtenidoLimpio)) < 0.001;
          }

          // Comparación por inclusión en salida
          if (!aprobada && obtenidoLimpio.includes(esperadoLimpio)) {
            aprobada = true;
          }

          if (!aprobada) todasAprobadas = false;

          resultadosPruebas.push({
            numero: i + 1,
            aprobada,
            oculta: caso.oculta,
            entrada: caso.oculta ? "(Oculta para evaluación)" : llamada,
            esperado: caso.oculta ? "(Oculta)" : caso.salida,
            obtenido: caso.oculta ? (aprobada ? "Superada" : "Incorrecto") : (obtenidoLimpio || "Sin salida")
          });
        } catch (casoErr) {
          todasAprobadas = false;
          resultadosPruebas.push({
            numero: i + 1,
            aprobada: false,
            oculta: caso.oculta,
            entrada: caso.oculta ? "(Oculta)" : caso.entrada,
            esperado: caso.oculta ? "(Oculta)" : caso.salida,
            obtenido: "Error: " + casoErr.message
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
 * Traduce los errores más comunes de Python a lenguaje amigable para estudiantes de grado octavo
 */
export function traducirErrorPython(errorTexto) {
  if (!errorTexto) return 'Ocurrió un error inesperado al ejecutar tu código.'

  if (errorTexto.includes("Missing parentheses in call to 'print'")) {
    return '🔎 En Python 3, la función print() requiere paréntesis. Escribe: print(...) y no print sin paréntesis.'
  }

  if (errorTexto.includes('SyntaxError')) {
    if (errorTexto.includes('unexpected EOF') || errorTexto.includes('was never closed')) {
      return '🔎 Revisa tu código: puede faltar cerrar un paréntesis (), corchete [] o comillas.'
    }
    if (errorTexto.includes("expected ':'")) {
      return '🔎 Recuerda poner dos puntos (:) al final de tu función def, condición if o ciclo.'
    }
    return '🔎 Error de sintaxis: Revisa tu código, puede faltar un paréntesis () o los dos puntos (:).'
  }

  if (errorTexto.includes('IndentationError')) {
    return '📐 Revisa los espacios (sangría): el código dentro de tu función debe llevar tabulación o 4 espacios.'
  }

  if (errorTexto.includes('NameError')) {
    const coincidencia = errorTexto.match(/name '(\w+)' is not defined/)
    const nombreVar = coincidencia ? ` "${coincidencia[1]}"` : ''
    return `💡 Estás usando una variable o función${nombreVar} que no ha sido definida o está mal escrita.`
  }

  if (errorTexto.includes('TypeError')) {
    if (errorTexto.includes('unsupported operand type')) {
      return '🔢 Error de tipos: intentaste operar tipos incompatibles (por ejemplo sumar texto con números).'
    }
    return '💡 Revisa los tipos de datos que estás utilizando en las operaciones.'
  }

  if (errorTexto.includes('ZeroDivisionError')) {
    return '⚠️ División por cero: en matemáticas no es posible dividir entre 0.'
  }

  if (errorTexto.includes('IndexError')) {
    return '📋 Estás intentando acceder a una posición de la lista que no existe.'
  }

  return `⚠️ ${errorTexto.split('\n').pop() || errorTexto}`
}

let workerInstancia = null
let workerBlobUrl = null
let pyodideListo = false

function obtenerWorker() {
  if (!workerInstancia) {
    const blob = new Blob([WORKER_SCRIPT], { type: 'application/javascript' })
    workerBlobUrl = URL.createObjectURL(blob)
    workerInstancia = new Worker(workerBlobUrl)
  }
  return workerInstancia
}

/**
 * Ejecuta código Python en el Web Worker con temporizador de seguridad de 5 segundos
 * (El temporizador solo corre durante la ejecución del código del alumno, no durante la descarga inicial)
 */
export function ejecutarEnWorker({ codigo, pruebas = [], tipo = 'EJECUTAR', onProgreso = null }) {
  return new Promise((resolve) => {
    const worker = obtenerWorker()
    const id = Date.now().toString()
    let timeoutEjecucion = null

    // Timeout de inicialización global amplio (40s) en caso de caída extrema de red
    const timeoutDescarga = setTimeout(() => {
      resolve({
        exito: false,
        salida: '',
        error: '🌐 La descarga de las librerías de Python está tardando más de lo esperado. Revisa tu conexión a internet e inténtalo de nuevo.'
      })
    }, 45000)

    const manejarMensaje = (e) => {
      if (e.data.id && e.data.id !== id && e.data.tipo !== 'ESTADO') return

      // Mensaje de estado de progreso para la consola
      if (e.data.tipo === 'ESTADO' && onProgreso) {
        onProgreso(e.data.mensaje)
        return
      }

      // Pyodide está cargado y el código del alumno empieza a correr
      if (e.data.tipo === 'INICIO_EJECUCION_USUARIO') {
        clearTimeout(timeoutDescarga)
        pyodideListo = true

        // AQUÍ ES DONDE ARRANCA EL TEMPORIZADOR DE 5 SEGUNDOS PARA EL CÓDIGO DEL ALUMNO
        timeoutEjecucion = setTimeout(() => {
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
        return
      }

      // Limpiar temporizadores al recibir el resultado
      clearTimeout(timeoutDescarga)
      if (timeoutEjecucion) clearTimeout(timeoutEjecucion)
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
 * Precalienta el motor Pyodide en segundo plano
 */
export function precalentarPyodide() {
  try {
    const worker = obtenerWorker()
    worker.postMessage({ tipo: 'INICIALIZAR', id: 'init' })
  } catch {
    // Silencioso
  }
}
