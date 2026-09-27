import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { CircleCheck, Minus, Plus, Trash } from 'lucide-react'
import { useAvisoSimulador, useUrl, Carrusel } from '../../components/comun/Simulador'
import { useNota } from '../../components/comun/Notas'
import { useSim } from '../../store/useSim'
import { euros, imagenSegunOpciones, producto, textoOpciones, totales } from '../../lib/formato'
import { BASE, DOMINIO, MiniProducto, Precio, T, useTienda } from './comun'

export default function CestaTE() {
  useUrl(`${DOMINIO}/gp/cart/view.html`)
  const t = useTienda()
  const cambiar = useSim((s) => s.cambiarCantidad)
  const eliminar = useSim((s) => s.eliminarDeCesta)
  const actualizar = useSim((s) => s.actualizar)
  const navigate = useNavigate()
  const avisar = useAvisoSimulador()
  const [params] = useSearchParams()
  const anadido = params.get('anadido')
  const { det, subtotal, unidades, envioVendedores } = totales(t.carrito)
  useNota('cesta', det.length > 0)

  const tramitar = () => {
    actualizar(T, { compraYa: null })
    navigate(t.usuario ? `${BASE}/tramitar/direccion` : `${BASE}/identificacion?siguiente=direccion`)
  }

  if (!det.length)
    return (
      <div className="px-3 py-4">
        <div className="flex items-center gap-4 bg-white p-4">
          <svg viewBox="0 0 120 90" className="h-24 w-32 shrink-0" aria-hidden>
            <ellipse cx="60" cy="80" rx="55" ry="6" fill="#e6f3f6" />
            <path d="M15 20 h14 l10 42 h52 l10 -32 h-68" fill="none" stroke="#1b2a41" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" />
            <path d="M40 34 h58 l-8 24 h-44 z" fill="#ffd814" />
            <circle cx="46" cy="72" r="5" fill="#1b2a41" />
            <circle cx="86" cy="72" r="5" fill="#1b2a41" />
          </svg>
          <div>
            <h1 className="text-2xl font-extrabold">Tu cesta de Todoenvío está vacía</h1>
            <p className="mt-1 text-te-gris">Aquí van cosas buenas</p>
            <Link to={BASE} className="mt-2 inline-block min-h-10 py-2 text-te-enlace hover:underline">
              Continúa desde donde lo dejaste
            </Link>
          </div>
        </div>
        <section className="mt-3 bg-white p-4">
          <h2 className="text-xl font-extrabold">Productos que te pueden interesar</h2>
          <p className="text-sm text-te-gris">Patrocinado</p>
          <Carrusel className="mt-3">
            {['p01', 'p09', 'p05', 'p06', 'p08'].map((id) => (
              <MiniProducto key={id} p={producto(id)} />
            ))}
          </Carrusel>
        </section>
      </div>
    )

  return (
    <div className="pb-4 md:grid md:grid-cols-[1fr_320px] md:gap-4 md:p-4">
      <div className="md:order-2">
        {anadido && (
          <p role="status" className="flex items-center gap-2 bg-white px-4 py-3 text-lg font-bold text-te-verde md:rounded-lg">
            <CircleCheck className="shrink-0" /> Añadido a la cesta
          </p>
        )}
        <div className="mt-2 bg-white p-4 md:sticky md:top-16 md:mt-0 md:rounded-lg" data-nota="resumen">
          <p className="text-xl">
            Subtotal ({unidades} {unidades === 1 ? 'producto' : 'productos'}): <b>{euros(subtotal)}</b>
          </p>
          {envioVendedores > 0 && <p className="mt-1 text-[0.98rem] text-te-rojo">+ {euros(envioVendedores)} de gastos de envío de vendedores externos</p>}
          <button onClick={tramitar} className="te-btn-amarillo mt-3 min-h-12 w-full rounded-full text-[1.05rem]">
            Tramitar pedido ({unidades} {unidades === 1 ? 'producto' : 'productos'})
          </button>
        </div>
      </div>

      <div className="mt-2 bg-white md:mt-0 md:rounded-lg" data-nota="cesta">
        <h1 className="border-b border-slate-200 px-4 py-3 text-2xl font-extrabold">Cesta</h1>
        <ul>
          {det.map((l) => (
            <li key={l.clave} className="flex gap-3 border-b border-slate-200 p-4">
              <Link to={`${BASE}/producto/${l.id}`} className="flex h-28 w-28 shrink-0 items-center justify-center rounded bg-[#f7f7f7] p-1.5">
                <img src={imagenSegunOpciones(l.p, l.opciones)} alt="" className="max-h-full object-contain mix-blend-multiply" />
              </Link>
              <div className="min-w-0 flex-1">
                <Link to={`${BASE}/producto/${l.id}`} className="line-clamp-2 leading-snug hover:underline">
                  {l.p.titulo}
                </Link>
                <Precio valor={l.precio} />
                {l.opciones && Object.keys(l.opciones).length > 0 && <p className="text-sm">{textoOpciones(l.opciones)}</p>}
                <p className="text-sm text-te-verde">En stock</p>
                {l.p.vendedor.externo && (
                  <p className="text-sm text-te-gris">
                    Vendido por {l.p.vendedor.nombre} · Envío {l.p.costeEnvio > 0 ? euros(l.p.costeEnvio) : 'gratis'}
                  </p>
                )}
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <div className="flex items-center overflow-hidden rounded-full border-2 border-te-amarillo">
                    <button
                      onClick={() => cambiar(T, l.clave, l.cantidad - 1)}
                      className="flex h-11 w-11 items-center justify-center hover:bg-slate-100"
                      aria-label={l.cantidad === 1 ? 'Eliminar producto' : 'Quitar una unidad'}
                    >
                      {l.cantidad === 1 ? <Trash size={19} /> : <Minus size={19} />}
                    </button>
                    <span className="w-8 text-center text-lg font-bold" aria-live="polite" aria-label={`Cantidad ${l.cantidad}`}>
                      {l.cantidad}
                    </span>
                    <button onClick={() => cambiar(T, l.clave, l.cantidad + 1)} className="flex h-11 w-11 items-center justify-center hover:bg-slate-100" aria-label="Añadir una unidad">
                      <Plus size={19} />
                    </button>
                  </div>
                  <button onClick={() => eliminar(T, l.clave)} className="min-h-10 rounded-full border border-slate-400 px-4 hover:bg-slate-50">
                    Eliminar
                  </button>
                  <button onClick={() => avisar('«Guardar para más tarde» no está disponible en el simulador.')} className="min-h-10 rounded-full border border-slate-400 px-4 hover:bg-slate-50">
                    Guardar para más tarde
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <p className="px-4 py-3 text-right text-lg">
          Subtotal ({unidades} {unidades === 1 ? 'producto' : 'productos'}): <b>{euros(subtotal)}</b>
        </p>
      </div>
    </div>
  )
}
