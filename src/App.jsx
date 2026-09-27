import { HashRouter, Route, Routes } from 'react-router-dom'
import Inicio from './Inicio'
import Creditos from './Creditos'
import { Simulador } from './components/comun/Simulador'
import TodoenvioApp from './tiendas/todoenvio/TodoenvioApp'
import GaleriasApp from './tiendas/galerias/GaleriasApp'

// HashRouter: las rutas van detrás de «#», así funciona en GitHub Pages sin configuración extra
export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/creditos" element={<Creditos />} />
        <Route
          path="/todoenvio/*"
          element={
            <Simulador>
              <TodoenvioApp />
            </Simulador>
          }
        />
        <Route
          path="/galerias/*"
          element={
            <Simulador>
              <GaleriasApp />
            </Simulador>
          }
        />
        <Route path="*" element={<Inicio />} />
      </Routes>
    </HashRouter>
  )
}
