import { useState } from 'react'
import { Link, Route, Routes, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Heart, Menu, Search, ShoppingBag, User, X } from 'lucide-react'
import { LogoGalerias } from '../../components/comun/Logos'
import { useAvisoSimulador } from '../../components/comun/Simulador'
import { useSim } from '../../store/useSim'
import CorreoSimulado from '../../components/comun/CorreoSimulado'
import { BASE, CATEGORIAS, G, rutaCategoria, useTienda } from './comun'
import { CategoriaGO, InicioGO, ProductoGO } from './CatalogoGO'
import CestaGO from './CestaGO'
import { AccesoGO, InvitadoGO } from './AccesoGO'
import { EntregaGO, ResumenGO } from './CompraGO'
import { PasarelaGO, TpvGO, VerificacionGO } from './PagoGO'
import { ConfirmacionGO, DetalleCompraGO, MisComprasGO } from './PedidosGO'

function Panel({ lado = 'izquierda', titulo, onCerrar, children }) {
  return (
    <div className="fixed inset-0 z-[55] bg-black/50" onClick={onCerrar}>
      <aside
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={typeof titulo === 'string' ? titulo : 'Menú'}
        className={`absolute top-0 h-full w-full max-w-md overflow-y-auto bg-white font-montse text-go-texto shadow-2xl ${lado === 'izquierda' ? 'left-0' : 'right-0'}`}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          {titulo}
          <button onClick={onCerrar} className="rounded-full p-2 hover:bg-slate-100" aria-label="Cerrar">
            <X size={28} />
          </button>
        </div>
        {children}
      </aside>
    </div>
  )
}

function MenuCategorias({ onCerrar }) {
  const [abierta, setAbierta] = useState(null)
  const navigate = useNavigate()
  const ir = (nombre) => {
    onCerrar()
    navigate(rutaCategoria(nombre))
  }
  return (
    <Panel titulo={<LogoGalerias alto={34} />} onCerrar={onCerrar}>
      {abierta === null ? (
        <ul data-nota="menu-categorias" className="px-5">
          <li>
            <Link to={BASE} onClick={onCerrar} className="flex min-h-16 items-center justify-between border-b border-slate-200 text-[1.05rem]">
              Inicio <ArrowRight size={22} />
            </Link>
          </li>
          {CATEGORIAS.map((c, i) => (
            <li key={c.nombre}>
              <button onClick={() => setAbierta(i)} className="flex min-h-16 w-full items-center justify-between border-b border-slate-200 text-left text-[1.05rem]">
                {c.nombre} <ArrowRight size={22} />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="px-5">
          <button onClick={() => setAbierta(null)} className="flex min-h-14 items-center gap-2 font-semibold">
            <ArrowLeft size={22} /> Volver
          </button>
          <p className="py-2 text-xl font-bold">{CATEGORIAS[abierta].nombre}</p>
          <ul>
            <li>
              <button onClick={() => ir(CATEGORIAS[abierta].nombre)} className="flex min-h-14 w-full items-center justify-between border-b border-slate-200 text-left font-semibold underline">
                Ver todo
              </button>
            </li>
            {CATEGORIAS[abierta].subs.map((s) => (
              <li key={s}>
                <button onClick={() => ir(s)} className="flex min-h-14 w-full items-center justify-between border-b border-slate-200 text-left text-[1.05rem]">
                  {s} <ArrowRight size={20} />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Panel>
  )
}

function Accesos({ onCerrar }) {
  const t = useTienda()
  const cerrarSesion = useSim((s) => s.cerrarSesion)
  const avisar = useAvisoSimulador()
  const navigate = useNavigate()
  const ir = (to) => {
    onCerrar()
    navigate(to)
  }
  return (
    <Panel lado="derecha" titulo={<p className="text-2xl">Accesos</p>} onCerrar={onCerrar}>
      <div className="px-5 py-6">
        {t.usuario ? (
          <p className="text-lg">
            Hola, <b>{t.usuario.nombre.split(' ')[0]}</b>
          </p>
        ) : (
          <button onClick={() => ir(`${BASE}/acceso`)} className="min-h-12 rounded-full bg-black px-6 text-[1.02rem] text-white hover:bg-[#333]">
            Iniciar sesión o crear cuenta
          </button>
        )}
        <ul className="mt-6 pl-2">
          {[
            ['Mis compras', `${BASE}/mis-compras`],
            ['Cupones y promociones', null],
            ['Mi cuenta', t.usuario ? null : `${BASE}/acceso`],
            ['Galerías Olmo Plus', null],
          ].map(([x, to]) => (
            <li key={x}>
              <button onClick={() => (to ? ir(to) : avisar())} className="flex min-h-16 w-full items-center border-b border-slate-200 text-left text-[1.05rem] text-go-suave">
                {x}
              </button>
            </li>
          ))}
        </ul>
        {t.usuario && (
          <button
            onClick={() => {
              cerrarSesion(G)
              onCerrar()
            }}
            className="mt-6 min-h-12 w-full border border-black text-[1.02rem]"
          >
            Cerrar sesión
          </button>
        )}
        <button onClick={() => avisar()} className="mt-10 w-full border border-slate-300 p-4 text-left">
          <span className="block">Cambiar a Canarias</span>
          <span className="text-sm text-go-suave">Para ver el catálogo de productos</span>
        </button>
      </div>
    </Panel>
  )
}

function Cabecera() {
  const t = useTienda()
  const navigate = useNavigate()
  const avisar = useAvisoSimulador()
  const [menu, setMenu] = useState(false)
  const [accesos, setAccesos] = useState(false)
  const [q, setQ] = useState('')
  const unidades = t.carrito.reduce((s, l) => s + l.cantidad, 0)
  return (
    <header className="bg-white font-montse">
      <button onClick={() => avisar('La aplicación no está disponible en el simulador.')} className="block min-h-10 w-full bg-black px-3 text-center text-[0.95rem] text-white">
        Descárgate aquí nuestra App <span className="underline">Ver</span>
      </button>
      <div className="mx-auto flex max-w-6xl items-center gap-0.5 px-2 py-2 sm:gap-2 sm:px-3">
        <button onClick={() => setMenu(true)} className="rounded p-2 hover:bg-slate-100" aria-label="Abrir el menú de categorías" data-nota="menu-categorias">
          <Menu size={28} strokeWidth={1.6} />
        </button>
        <Link to={BASE} aria-label="Galerías Olmo, ir al inicio" className="mr-auto min-w-0">
          <LogoGalerias alto={34} className="max-w-full" />
        </Link>
        <button onClick={() => setAccesos(true)} className="rounded p-2 hover:bg-slate-100" aria-label={t.usuario ? `Mi cuenta, ${t.usuario.nombre}` : 'Iniciar sesión'}>
          <User size={26} strokeWidth={1.6} />
        </button>
        <button onClick={() => avisar('Los favoritos no están disponibles en el simulador.')} className="rounded p-2 hover:bg-slate-100" aria-label="Favoritos">
          <Heart size={26} strokeWidth={1.6} />
        </button>
        <Link to={`${BASE}/cesta`} data-nota="cesta" className="relative rounded p-2 hover:bg-slate-100" aria-label={`Cesta, ${unidades} productos`}>
          <ShoppingBag size={26} strokeWidth={1.6} />
          {unidades > 0 && (
            <span className="absolute bottom-1 right-0 flex h-5 min-w-5 items-center justify-center rounded-full bg-black px-1 text-xs font-bold text-white">{unidades}</span>
          )}
        </Link>
      </div>
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault()
          navigate(`${BASE}/c/busqueda?q=${encodeURIComponent(q)}`)
        }}
        className="mx-auto max-w-6xl px-3 pb-3"
      >
        <div data-nota="buscador" className="flex items-center rounded-full border border-black pl-5 pr-1">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="¿Qué estás buscando?"
            aria-label="Buscar en Galerías Olmo"
            className="min-h-12 w-full bg-transparent text-[1.05rem] outline-none placeholder:text-go-suave"
          />
          <button type="submit" className="flex h-10 w-12 items-center justify-center rounded-full bg-go-gris" aria-label="Buscar">
            <Search size={20} />
          </button>
        </div>
      </form>
      <nav className="hidden border-y border-slate-200 md:block" aria-label="Categorías">
        <div className="ocultar-scroll mx-auto flex max-w-6xl gap-5 overflow-x-auto px-3">
          {CATEGORIAS.slice(0, 9).map((c) => (
            <Link key={c.nombre} to={rutaCategoria(c.nombre)} className="flex min-h-11 items-center whitespace-nowrap text-[0.95rem] hover:underline">
              {c.nombre}
            </Link>
          ))}
        </div>
      </nav>
      {menu && <MenuCategorias onCerrar={() => setMenu(false)} />}
      {accesos && <Accesos onCerrar={() => setAccesos(false)} />}
    </header>
  )
}

function Pie() {
  const avisar = useAvisoSimulador()
  return (
    <footer className="mt-10 bg-[#1f1f1f] px-5 py-8 font-montse text-white">
      <div className="mx-auto grid max-w-6xl gap-6 sm:grid-cols-3">
        {[
          ['Atención al cliente', ['Ayuda', 'Devoluciones', 'Seguimiento de pedidos', 'Contacto']],
          ['Servicios', ['Recogida en tienda', 'Tarjeta Galerías Olmo', 'Listas de regalo', 'Tarifa plana de envíos']],
          ['La empresa', ['Quiénes somos', 'Nuestras tiendas', 'Trabaja con nosotros', 'Sostenibilidad']],
        ].map(([t, ls]) => (
          <div key={t}>
            <p className="font-bold">{t}</p>
            <ul className="mt-2 space-y-1">
              {ls.map((l) => (
                <li key={l}>
                  <button onClick={() => avisar()} className="min-h-9 text-left text-[0.95rem] text-slate-300 hover:underline">
                    {l}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="mx-auto mt-8 max-w-6xl border-t border-white/20 pt-4 text-sm text-slate-300">
        © 2026 Galerías Olmo S.A. · Empresa ficticia creada para practicar compras online. No es una web real.
      </p>
    </footer>
  )
}

function ConCabecera({ children }) {
  return (
    <div className="min-h-screen bg-white font-montse text-go-texto">
      <Cabecera />
      <main className="mx-auto max-w-6xl">{children}</main>
      <Pie />
    </div>
  )
}

export default function GaleriasApp() {
  return (
    <Routes>
      <Route index element={<ConCabecera><InicioGO /></ConCabecera>} />
      <Route path="c/:cat" element={<ConCabecera><CategoriaGO /></ConCabecera>} />
      <Route path="p/:id" element={<ConCabecera><ProductoGO /></ConCabecera>} />
      <Route path="cesta" element={<ConCabecera><CestaGO /></ConCabecera>} />
      <Route path="mis-compras" element={<ConCabecera><MisComprasGO /></ConCabecera>} />
      <Route path="mis-compras/:id" element={<ConCabecera><DetalleCompraGO /></ConCabecera>} />
      <Route path="acceso" element={<AccesoGO />} />
      <Route path="invitado" element={<InvitadoGO />} />
      <Route path="compra/entrega" element={<EntregaGO />} />
      <Route path="compra/resumen" element={<ResumenGO />} />
      <Route path="compra/pago" element={<PasarelaGO />} />
      <Route path="compra/tpv" element={<TpvGO />} />
      <Route path="compra/verificacion" element={<VerificacionGO />} />
      <Route path="compra/confirmacion/:id" element={<ConCabecera><ConfirmacionGO /></ConCabecera>} />
      <Route path="correo" element={<CorreoSimulado tienda="galerias" />} />
      <Route path="correo/:id" element={<CorreoSimulado tienda="galerias" />} />
      <Route path="*" element={<ConCabecera><InicioGO /></ConCabecera>} />
    </Routes>
  )
}
