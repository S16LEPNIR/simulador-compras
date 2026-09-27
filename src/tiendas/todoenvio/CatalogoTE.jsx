import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ChevronDown, ChevronUp, SlidersHorizontal, X } from 'lucide-react'
import { Modal, useAvisoSimulador, useUrl } from '../../components/comun/Simulador'
import { useNota } from '../../components/comun/Notas'
import { productos } from '../../lib/formato'
import { BASE, CATEGORIAS, DOMINIO, FilaProducto, rutaCategoria, slug } from './comun'

export function ExplorarTE() {
  useUrl(`${DOMINIO}/gp/navigation`)
  useNota('categorias')
  const [abierta, setAbierta] = useState(null)
  return (
    <div className="p-4">
      <h1 className="text-2xl font-extrabold">Tus accesos directos</h1>
      <div className="mt-3 flex flex-wrap gap-2">
        <Link to={`${BASE}/pedidos`} className="flex min-h-11 items-center rounded-full border border-slate-400 px-5">
          Mis pedidos
        </Link>
        <Link to={`${BASE}/cesta`} className="flex min-h-11 items-center rounded-full border border-slate-400 px-5">
          Mi cesta
        </Link>
      </div>

      <h2 className="mt-6 text-2xl font-extrabold">Comprar por categoría</h2>
      <ul className="mt-3 space-y-2" data-nota="menu-categorias">
        {CATEGORIAS.map((c, i) => (
          <li key={c.nombre} className="overflow-hidden rounded-xl border border-slate-300">
            <button
              onClick={() => setAbierta(abierta === i ? null : i)}
              aria-expanded={abierta === i}
              className="flex min-h-16 w-full items-center gap-3 bg-white pr-4 text-left text-[1.05rem]"
            >
              <span className="flex h-16 w-16 shrink-0 items-center justify-center bg-[#f3f3f3] p-1.5">
                <img src={c.img} alt="" className="max-h-full object-contain mix-blend-multiply" />
              </span>
              <span className="flex-1">{c.nombre}</span>
              {abierta === i ? <ChevronUp /> : <ChevronDown />}
            </button>
            {abierta === i && (
              <ul className="border-t border-slate-200 bg-[#f7fafa]">
                <li>
                  <Link to={rutaCategoria(c.nombre)} className="flex min-h-12 items-center px-5 font-bold text-te-enlace">
                    Ver todo en {c.nombre}
                  </Link>
                </li>
                {c.subs.map((s) => (
                  <li key={s}>
                    <Link to={rutaCategoria(s)} className="flex min-h-12 items-center border-t border-slate-200 px-5">
                      {s}
                    </Link>
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

const FILTROS = ['Ofertas del día', 'Envío gratis', '4 estrellas o más', 'Recíbelo mañana', 'Vendido por Todoenvío']

export function BuscarTE() {
  const [params] = useSearchParams()
  const k = params.get('k') || 'Todo'
  useUrl(`${DOMINIO}/s?k=${slug(k)}`)
  useNota('listado')
  useNota('precio-comparar', true, 2000)
  const avisar = useAvisoSimulador()
  const [filtros, setFiltros] = useState(false)
  const [activos, setActivos] = useState([])

  // Si el texto buscado coincide con algún producto, lo mostramos primero (pero siempre se ven los 10)
  const q = slug(k)
  const lista = [...productos].sort((a, b) => {
    const pa = slug(a.titulo + ' ' + a.categoria).includes(q) ? 0 : 1
    const pb = slug(b.titulo + ' ' + b.categoria).includes(q) ? 0 : 1
    return pa - pb
  })

  return (
    <div className="pb-4">
      <div className="ocultar-scroll flex items-center gap-2 overflow-x-auto border-b border-slate-200 bg-white px-3 py-2">
        <button onClick={() => setFiltros(true)} className="flex min-h-10 shrink-0 items-center gap-1 rounded-lg border border-slate-400 px-3" aria-label="Abrir filtros">
          <SlidersHorizontal size={20} /> Filtros {activos.length > 0 && <b>({activos.length})</b>}
        </button>
        {FILTROS.map((f) => (
          <button
            key={f}
            onClick={() => setActivos(activos.includes(f) ? activos.filter((x) => x !== f) : [...activos, f])}
            aria-pressed={activos.includes(f)}
            className={`flex min-h-10 shrink-0 items-center gap-1 rounded-lg border px-3 ${activos.includes(f) ? 'border-[#007185] bg-[#edfdff] font-bold' : 'border-slate-400'}`}
          >
            {f} {activos.includes(f) && <X size={16} />}
          </button>
        ))}
      </div>
      <div className="bg-white px-3 py-2">
        <p className="text-[1.02rem]">
          Más de 10.000 resultados para <b className="text-[#c45500]">«{k}»</b>
        </p>
        {activos.length > 0 && <p className="text-sm text-te-gris">En el simulador, los filtros no cambian los resultados.</p>}
      </div>
      <div data-nota="listado" className="md:grid md:grid-cols-3 md:gap-3 md:p-3 lg:grid-cols-4">
        {lista.map((p, i) => (
          <FilaProducto key={p.id} p={p} indice={i} />
        ))}
      </div>
      <p className="px-3 py-4 text-center text-sm text-te-gris">
        ¿Necesitas ayuda? Visita la sección de ayuda o{' '}
        <button className="text-te-enlace underline" onClick={() => avisar()}>
          contacta con nosotros
        </button>
        .
      </p>

      {filtros && (
        <Modal titulo="Filtros" onCerrar={() => setFiltros(false)}>
          <p className="mb-2 text-sm text-te-gris">Filtros sugeridos</p>
          <div className="flex flex-wrap gap-2">
            {[...FILTROS, 'Marcas populares', 'Precio: hasta 50 €', 'Precio: 50 € a 100 €'].map((f) => (
              <button
                key={f}
                onClick={() => setActivos(activos.includes(f) ? activos.filter((x) => x !== f) : [...activos, f])}
                aria-pressed={activos.includes(f)}
                className={`min-h-11 rounded-lg border px-4 ${activos.includes(f) ? 'border-[#007185] bg-[#edfdff] font-bold' : 'border-slate-400'}`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="mt-5 flex gap-3">
            <button onClick={() => setActivos([])} className="min-h-12 flex-1 rounded-full border border-slate-400">
              Borrar todo
            </button>
            <button onClick={() => setFiltros(false)} className="te-btn-amarillo min-h-12 flex-1 rounded-full">
              Mostrar resultados
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
