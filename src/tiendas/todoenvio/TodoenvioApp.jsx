import { useState } from 'react'
import { Link, NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, Camera, ChevronDown, ChevronRight, House, MapPin, Menu, Search, ShoppingCart, User } from 'lucide-react'
import { LogoTodoenvio } from '../../components/comun/Logos'
import { useAvisoSimulador } from '../../components/comun/Simulador'
import { BASE, CATEGORIAS, rutaCategoria, useTienda } from './comun'
import InicioTE from './InicioTE'
import { BuscarTE, ExplorarTE } from './CatalogoTE'
import ProductoTE from './ProductoTE'
import CestaTE from './CestaTE'
import AccesoTE from './AccesoTE'
import { DireccionTE, EntregaTE, PagoTE, RevisarTE } from './CheckoutTE'
import { ConfirmacionTE, CuentaTE, DetallePedidoTE, PedidosTE } from './PedidosTE'
import CorreoSimulado from '../../components/comun/CorreoSimulado'

function Cabecera() {
  const t = useTienda()
  const navigate = useNavigate()
  const { pathname, search } = useLocation()
  const avisar = useAvisoSimulador()
  const inicial = new URLSearchParams(search).get('k') || ''
  const [texto, setTexto] = useState(inicial)
  const enInicio = pathname === BASE || pathname === BASE + '/'
  const unidades = t.carrito.reduce((s, l) => s + l.cantidad, 0)

  return (
    <header className="te-cabecera text-te-tinta">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-3 pt-2">
        <Link to={BASE} className="flex min-h-11 items-center rounded px-1" aria-label="Todoenvío, ir al inicio">
          <LogoTodoenvio alto={28} />
        </Link>
        <div className="flex items-center gap-1">
          <Link to={`${BASE}/tu`} className="flex min-h-11 items-center rounded px-2 text-[0.98rem] hover:underline">
            {t.usuario ? (
              <>
                Hola, <b className="ml-1">{t.usuario.nombre.split(' ')[0]}</b>
              </>
            ) : (
              <>
                Identifícate <ChevronRight size={18} />
              </>
            )}
          </Link>
          <Link to={`${BASE}/pedidos`} className="hidden min-h-11 items-center rounded px-2 text-[0.98rem] hover:underline md:flex">
            Devoluciones y pedidos
          </Link>
          <Link to={`${BASE}/cesta`} data-nota="cesta" className="relative hidden min-h-11 items-center gap-1 rounded px-2 font-bold md:flex" aria-label={`Cesta, ${unidades} productos`}>
            <ShoppingCart size={28} />
            <span className="absolute left-5 top-0 text-sm font-extrabold text-[#c45500]">{unidades}</span>
            Cesta
          </Link>
        </div>
      </div>

      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault()
          navigate(`${BASE}/buscar?k=${encodeURIComponent(texto.trim() || 'Todo')}`)
        }}
        className="mx-auto flex max-w-6xl items-center gap-2 px-3 py-2"
      >
        {!enInicio && (
          <button type="button" onClick={() => navigate(-1)} className="rounded-full p-2 hover:bg-black/5 md:hidden" aria-label="Volver atrás">
            <ArrowLeft size={24} />
          </button>
        )}
        <div data-nota="buscador" className="flex flex-1 items-center rounded-full bg-white shadow ring-1 ring-black/15 focus-within:ring-2 focus-within:ring-[#e77600]">
          <Search size={22} className="ml-3 shrink-0 text-te-tinta" aria-hidden />
          <input
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Buscar o hacer una pregunta"
            aria-label="Buscar en Todoenvío"
            className="min-h-12 w-full rounded-full bg-transparent px-3 text-[1.05rem] outline-none placeholder:text-te-gris"
          />
          <button type="button" onClick={() => avisar('La búsqueda por foto no está disponible en el simulador.')} className="mr-2 rounded-full p-2 text-te-tinta hover:bg-slate-100" aria-label="Buscar con una foto">
            <Camera size={22} />
          </button>
        </div>
        <button type="submit" className="hidden min-h-12 rounded-full bg-[#febd69] px-5 font-semibold ring-1 ring-black/10 hover:bg-[#f3a847] md:block">
          Buscar
        </button>
      </form>

      <button
        onClick={() => avisar(t.direccion ? 'Puedes cambiar la dirección durante la tramitación del pedido.' : 'Añadirás tu dirección al tramitar el pedido.')}
        className="flex min-h-11 w-full items-center gap-2 bg-black/[0.06] px-4 text-left text-[0.98rem]"
      >
        <MapPin size={20} aria-hidden />
        <span className="mx-auto w-full max-w-6xl truncate">
          {t.direccion ? (
            <>
              Enviar a {t.direccion.nombre.split(' ')[0]} - {t.direccion.localidad} {t.direccion.codigoPostal}
            </>
          ) : (
            'Selecciona la dirección de entrega'
          )}
          <ChevronDown size={16} className="ml-1 inline" />
        </span>
      </button>

      <nav className="hidden bg-[#1b2a41] text-white md:block" aria-label="Categorías">
        <div className="ocultar-scroll mx-auto flex max-w-6xl items-center gap-1 overflow-x-auto px-2">
          <Link to={`${BASE}/explorar`} className="flex min-h-10 items-center gap-1 whitespace-nowrap rounded px-2 font-bold hover:outline hover:outline-1">
            <Menu size={20} /> Todo
          </Link>
          {CATEGORIAS.slice(0, 8).map((c) => (
            <Link key={c.nombre} to={rutaCategoria(c.nombre)} className="flex min-h-10 items-center whitespace-nowrap rounded px-2 hover:outline hover:outline-1">
              {c.nombre}
            </Link>
          ))}
        </div>
      </nav>
    </header>
  )
}

function BarraInferior() {
  const t = useTienda()
  const unidades = t.carrito.reduce((s, l) => s + l.cantidad, 0)
  const item = (to, icono, texto, extra = {}) => (
    <NavLink
      to={to}
      end={to === BASE}
      {...extra}
      className={({ isActive }) =>
        `relative flex min-h-16 flex-1 flex-col items-center justify-center gap-0.5 text-[0.85rem] font-semibold ${isActive ? 'text-[#007185]' : 'text-te-tinta'}`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && <span className="absolute left-1/2 top-0 h-1 w-10 -translate-x-1/2 rounded-b bg-[#007185]" />}
          {icono}
          {texto}
        </>
      )}
    </NavLink>
  )
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-slate-300 bg-white md:hidden" aria-label="Menú principal">
      {item(BASE, <House size={26} />, 'Inicio')}
      {item(`${BASE}/tu`, <User size={26} />, 'Tú')}
      {item(
        `${BASE}/cesta`,
        <span className="relative">
          <ShoppingCart size={28} />
          <span className="absolute -top-1 left-1/2 -translate-x-1/2 text-[0.8rem] font-extrabold text-[#c45500]">{unidades}</span>
        </span>,
        'Cesta',
        { 'data-nota': 'cesta', 'aria-label': `Cesta, ${unidades} productos` },
      )}
      {item(`${BASE}/explorar`, <Menu size={26} />, 'Explorar', { 'data-nota': 'menu-categorias' })}
    </nav>
  )
}

function Pie() {
  const avisar = useAvisoSimulador()
  return (
    <footer className="mt-6 pb-20 md:pb-0">
      <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="min-h-12 w-full bg-[#37475a] text-white hover:bg-[#485769]">
        Volver arriba
      </button>
      <div className="bg-[#232f3e] px-4 py-6 text-[0.95rem] text-white">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-3 md:grid-cols-4">
          {['Conócenos', 'Ayuda', 'Devoluciones', 'Condiciones de uso', 'Aviso de privacidad', 'Cookies', 'Trabaja con nosotros', 'Vender en Todoenvío'].map((x) => (
            <button key={x} onClick={() => avisar()} className="min-h-10 text-left hover:underline">
              {x}
            </button>
          ))}
        </div>
      </div>
      <div className="bg-[#131a22] px-4 py-4 text-center text-sm text-slate-300">
        © 2026 Todoenvío · Tienda ficticia creada para practicar. No es una web real.
      </div>
    </footer>
  )
}

function ConCabecera({ children, fondo = 'bg-white' }) {
  return (
    <div className={`min-h-screen font-sans text-te-tinta ${fondo}`}>
      <Cabecera />
      <main className="mx-auto max-w-6xl">{children}</main>
      <Pie />
      <BarraInferior />
    </div>
  )
}

export default function TodoenvioApp() {
  const { pathname } = useLocation()
  return (
    <Routes>
      <Route index element={<ConCabecera fondo="bg-te-fondo"><InicioTE /></ConCabecera>} />
      <Route path="explorar" element={<ConCabecera><ExplorarTE /></ConCabecera>} />
      <Route path="buscar" element={<ConCabecera key={pathname}><BuscarTE /></ConCabecera>} />
      <Route path="producto/:id" element={<ConCabecera><ProductoTE /></ConCabecera>} />
      <Route path="cesta" element={<ConCabecera fondo="bg-te-fondo"><CestaTE /></ConCabecera>} />
      <Route path="tu" element={<ConCabecera><CuentaTE /></ConCabecera>} />
      <Route path="pedidos" element={<ConCabecera><PedidosTE /></ConCabecera>} />
      <Route path="pedidos/:id" element={<ConCabecera><DetallePedidoTE /></ConCabecera>} />
      <Route path="identificacion" element={<AccesoTE />} />
      <Route path="tramitar/direccion" element={<DireccionTE />} />
      <Route path="tramitar/entrega" element={<EntregaTE />} />
      <Route path="tramitar/pago" element={<PagoTE />} />
      <Route path="tramitar/revisar" element={<RevisarTE />} />
      <Route path="pedido-realizado/:id" element={<ConCabecera><ConfirmacionTE /></ConCabecera>} />
      <Route path="correo" element={<CorreoSimulado tienda="todoenvio" />} />
      <Route path="correo/:id" element={<CorreoSimulado tienda="todoenvio" />} />
      <Route path="*" element={<ConCabecera fondo="bg-te-fondo"><InicioTE /></ConCabecera>} />
    </Routes>
  )
}
