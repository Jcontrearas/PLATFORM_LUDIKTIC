import { createContext, useContext, useEffect, useState } from 'react'

const ContextoTema = createContext(null)

export function ProveedorTema({ children }) {
  // Detectar preferencia del sistema: oscuro por defecto
  const [modoOscuro, setModoOscuro] = useState(() => {
    const guardado = localStorage.getItem('steam-tema')
    if (guardado !== null) return guardado === 'oscuro'
    return true // Oscuro por defecto (mejor para programar)
  })

  useEffect(() => {
    // Aplicar o quitar clase en <html> para activar modo claro
    if (modoOscuro) {
      document.documentElement.classList.remove('modo-claro')
    } else {
      document.documentElement.classList.add('modo-claro')
    }
    localStorage.setItem('steam-tema', modoOscuro ? 'oscuro' : 'claro')
  }, [modoOscuro])

  const alternarTema = () => setModoOscuro(prev => !prev)

  return (
    <ContextoTema.Provider value={{ modoOscuro, alternarTema }}>
      {children}
    </ContextoTema.Provider>
  )
}

export function useTema() {
  const contexto = useContext(ContextoTema)
  if (!contexto) {
    throw new Error('useTema debe usarse dentro de ProveedorTema')
  }
  return contexto
}
