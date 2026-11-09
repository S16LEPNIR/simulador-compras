import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ChevronDown, ChevronUp, SlidersHorizontal, X } from 'lucide-react'
import { Modal, useUrl } from '../../components/comun/Simulador'
import { useNota } from '../../components/comun/Notas'
import { productosTE } from '../../lib/formato'
import { FILTROS_TE, buscarProductos } from '../../lib/todoenvio'
import { BASE, CATEGORIAS, DOMINIO, FilaProducto, MiniProducto, rutaCategoria, slug } from './comun'

export function ExplorarTE() {
  useUrl(`${DOMINIO}/gp/navigation`)
  useNota('categorias')
  const [abierta, setAbierta] = useState(null)
  return (
    <div className="p-4">
      <h1 className="text-2xl font-extrabold">Tus accesos directos</h1>
      <div className="mt-3 flex flex-wrap gap-2">
        <Link to={`${BASE}/pedidos`} className="flex min-h-11 items-center rounded-full border border-slate-400 px-5">Mis pedidos</Link>
        <Link to={`${BASE}/cartera`} className="flex min-h-11 items-center rounded-full border border-slate-400 px-5">Mi cartera</Link>
        <Link to={`${BASE}/cesta`} className="flex min-h-11 items-center rounded-full border border-slate-400 px-5">Mi cesta</Link>
      </div>

      <h2 className="mt-6 text-2xl font-extrabold">Comprar por categoría</h2>
      <ul className="mt-3 space-y-2" data-nota="menu-categorias">
        {CATEGORIAS.map((c, i) => (
          <li key={c.nombre} className="overflow-hidden rounded-xl border border-slate-300">
            <button onClick={() => setAbierta(abierta === i ? null : i)} aria-expanded={abierta === i} className="flex min-h-16 w-full items-center gap-3 bg-white pr-4 text-left text-[1.05rem]">
              <span className="flex h-16 w-16 shrink-0 items-center justify-center bg-[#f3f3f3] p-1.5">
                <img src={c.img} alt="" className="max-h-full object-contain mix-blend-multiply" />
              </span>
              <span className="flex-1">{c.nombre}</span>
              {abierta === i ? <ChevronUp aria-hidden /> : <ChevronDown aria-hidden />}
            </button>
            {abierta === i && (
              <ul className="border-t border-slate-200 bg-[#f7fafa]">
                <li>
                  <Link to={rutaCategoria(c.nombre)} className="flex min-h-12 items-center px-5 font-bold text-te-enlace">Ver todo en {c.nombre}</Link>
                </li>
                {c.subs.map((s) => (
                  <li key={s}>
                    <Link to={rutaCategoria(s)} className="flex min-h-12 items-center border-t border-slate-200 px-5">{s}</Link>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

const CHIPS = ['Ofertas del día', 'Envío gratis', '4 estrellas o más', 'Recíbelo mañana', 'Vendido por Todoenvío']
const GRUPOS = {
  'Filtros sugeridos': CHIPS,
  'Envío': ['Envío gratis', 'Recíbelo mañana', 'Vendido por Todoenvío'],
  'Opiniones de clientes': ['4 estrellas o más'],
  'Precio y ofertas': ['Ofertas del día', 'Hasta 25 €', 'De 25 € a 100 €', 'Más de 100 €'],
}
const ORDENES = {
  destacados: ['Destacados', () => 0],
  'precio-asc': ['Precio: de menor a mayor', (a, b) => a.precio - b.precio],
  'precio-desc': ['Precio: de mayor a menor', (a, b) => b.precio - a.precio],
  valoracion: ['Mejor valorados', (a, b) => b.valoracion - a.valoracion],
}

// Los filtros del mismo tipo (por ejemplo, dos rangos de precio) se suman; los de distinto tipo se combinan
const PRECIOS = ['Hasta 25 €', 'De 25 € a 100 €', 'Más de 100 €']
function aplicarFiltros(lista, activos) {
  const precios = activos.filter((f) => PRECIOS.includes(f))
  const otros = activos.filter((f) => !PRECIOS.includes(f))
  return lista.filter((p) => otros.every((f) => FILTROS_TE[f](p)) && (!precios.length || precios.some((f) => FILTROS_TE[f](p))))
}

export function BuscarTE() {
  const [params] = useSearchParams()
  const k = params.get('k') || 'Todo'
  useUrl(`${DOMINIO}/s?k=${slug(k)}`)
  useNota('listado')
  useNota('precio-comparar', true, 2000)
  const [filtros, setFiltros] = useState(false)
  const [grupo, setGrupo] = useState('Filtros sugeridos')
  const [activos, setActivos] = useState([])
  const [orden, setOrden] = useState('destacados')

  const base = buscarProductos(k)
  const lista = [...aplicarFiltros(base, activos)].sort(ORDENES[orden][1])
  const alternar = (f) => setActivos(activos.includes(f) ? activos.filter((x) => x !== f) : [...activos, f])

  return (
    <div className="pb-4">
      <div className="ocultar-scroll flex items-center gap-2 overflow-x-auto border-b border-slate-200 bg-white px-3 py-2">
        <button onClick={() => setFiltros(true)} className="flex min-h-10 shrink-0 items-center gap-1 rounded-lg border border-slate-400 px-3" aria-label="Abrir filtros">
          <SlidersHorizontal size={20} aria-hidden /> Filtros {activos.length > 0 && <b>({activos.length})</b>}
        </button>
        {CHIPS.map((f) => (
          <button key={f} onClick={() => alternar(f)} aria-pressed={activos.includes(f)} className={`flex min-h-10 shrink-0 items-center gap-1 rounded-lg border px-3 ${activos.includes(f) ? 'border-[#007185] bg-[#edfdff] font-bold' : 'border-slate-400'}`}>
            {f} {activos.includes(f) && <X size={16} aria-hidden />}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 bg-white px-3 py-2">
        <p className="text-[1.02rem]">
          {lista.length} {lista.length === 1 ? 'resultado' : 'resultados'}{k !== 'Todo' && <> para <b className="text-[#c45500]">«{k}»</b></>}
        </p>
        <label className="flex items-center gap-1">
          <span className="sr-only">Ordenar por</span>
          <select value={orden} onChange={(e) => setOrden(e.target.value)} className="min-h-10 rounded-lg border border-slate-400 bg-[#f0f2f2] px-2">
            {Object.entries(ORDENES).map(([id, [txt]]) => <option key={id} value={id}>{txt}</option>)}
          </select>
        </label>
      </div>
      {lista.length > 0 ? (
        <div data-nota="listado" className="md:grid md:grid-cols-3 md:gap-3 md:p-3 lg:grid-cols-4">
          {lista.map((p, i) => <FilaProducto key={p.id} p={p} indice={i} />)}
        </div>
      ) : (
        <section className="bg-white p-4">
          <h1 className="text-xl font-extrabold">No se han encontrado resultados</h1>
          <p className="mt-1">{activos.length ? 'Prueba a quitar alguno de los filtros.' : 'Revisa cómo lo has escrito o busca con otra palabra, por ejemplo «radio» o «miel».'}</p>
          {activos.length > 0 && <button onClick={() => setActivos([])} className="te-btn-amarillo mt-3 min-h-12 rounded-full px-6">Quitar los filtros</button>}
          <h2 className="mt-5 text-xl font-extrabold">Otros productos que te pueden interesar</h2>
          <div className="mt-3 flex snap-x gap-3 overflow-x-auto pb-2">
            {productosTE.slice(0, 8).map((p) => <MiniProducto key={p.id} p={p} />)}
          </div>
        </section>
      )}

      {filtros && (
        <Modal titulo="Filtros" onCerrar={() => setFiltros(false)}>
          <div className="flex min-h-64 gap-3">
            <div className="w-28 shrink-0 bg-[#f0f2f2] text-[0.95rem]">
              {Object.keys(GRUPOS).map((g) => (
                <button key={g} onClick={() => setGrupo(g)} aria-pressed={grupo === g} className={`min-h-14 w-full border-l-4 px-2 text-left ${grupo === g ? 'border-te-enlace bg-white font-bold text-te-enlace' : 'border-transparent'}`}>{g}</button>
              ))}
            </div>
            <div className="flex flex-1 flex-wrap content-start gap-2">
              {GRUPOS[grupo].map((f) => (
                <button key={f} onClick={() => alternar(f)} aria-pressed={activos.includes(f)} className={`min-h-11 rounded-lg border px-3 ${activos.includes(f) ? 'border-[#007185] bg-[#edfdff] font-bold' : 'border-slate-400'}`}>{f}</button>
              ))}
            </div>
          </div>
          <div className="mt-5 flex gap-3">
            <button onClick={() => setActivos([])} className="min-h-12 flex-1 rounded-full border border-slate-400">Borrar todo</button>
            <button onClick={() => setFiltros(false)} className="te-btn-amarillo min-h-12 flex-1 rounded-full">Mostrar {lista.length} {lista.length === 1 ? 'resultado' : 'resultados'}</button>
          </div>
        </Modal>
      )}
    </div>
  )
}
