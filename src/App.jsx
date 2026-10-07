import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { ProveedorAuth } from './features/auth/ProveedorAuth'
import { ProveedorTema } from './features/tema/ProveedorTema'
import RutaProtegida from './components/RutaProtegida'
import LayoutPrincipal from './components/LayoutPrincipal'
import CargandoPantalla from './components/CargandoPantalla'

// Carga diferida de pantallas para mejor rendimiento
const Login         = lazy(() => import('./pages/Login'))
const Registro      = lazy(() => import('./pages/Registro'))
const Inicio        = lazy(() => import('./pages/Inicio'))
const Areas         = lazy(() => import('./pages/Areas'))
const Reto          = lazy(() => import('./pages/Reto'))
const Escaner       = lazy(() => import('./pages/Escaner'))
const Clasificacion = lazy(() => import('./pages/Clasificacion'))
const Perfil        = lazy(() => import('./pages/Perfil'))
const PanelDocente  = lazy(() => import('./pages/PanelDocente'))

export default function App() {
  return (
    <ProveedorTema>
      <ProveedorAuth>
        <BrowserRouter>
          <Suspense fallback={<CargandoPantalla />}>
            <Routes>
              {/* Rutas públicas de autenticación */}
              <Route path="/login"    element={<Login />} />
              <Route path="/registro" element={<Registro />} />

              {/* Rutas protegidas dentro del Layout Principal con navegación */}
              <Route element={<RutaProtegida />}>
                <Route element={<LayoutPrincipal />}>
                  <Route path="/"               element={<Inicio />} />
                  <Route path="/areas"          element={<Areas />} />
                  <Route path="/reto/:id"       element={<Reto />} />
                  <Route path="/escanear"       element={<Escaner />} />
                  <Route path="/clasificacion"  element={<Clasificacion />} />
                  <Route path="/perfil"         element={<Perfil />} />
                  <Route path="/docente"        element={<PanelDocente />} />
                </Route>
              </Route>

              {/* Redirigir cualquier ruta desconocida al inicio */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </ProveedorAuth>
    </ProveedorTema>
  )
}
