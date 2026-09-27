import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ChevronDown, CircleCheck, Heart, RotateCcw, ShoppingBag, SlidersHorizontal, Store, ThumbsUp, Truck } from 'lucide-react'
import { Carrusel, Estrellas, Modal, useAvisoSimulador, useUrl } from '../../components/comun/Simulador'
import { useNota, useNotaAlVer, useNotas } from '../../components/comun/Notas'
import { useSim } from '../../store/useSim'
import { euros, fechaResena, imagenSegunOpciones, opcionesPorDefecto, precioConOpciones, producto, productos, textoOpciones } from '../../lib/formato'
import { BASE, BotonNegro, DOMINIO, G, PrecioGO, TarjetaProducto, Valoracion, envioGratisDesde, nombreCategoria, rutaCategoria, slug } from './comun'

// ======================= INICIO =======================
export function InicioGO() {
  useUrl(`${DOMINIO}/`)
  useNota('https-candado')
  useNota('categorias', true, 1200)
  const avisar = useAvisoSimulador()
  return (
    <div>
      <section data-nota="banner" className="relative overflow-hidden bg-[#2b2622] text-white">
        <img src="img/productos/p10/2.jpg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" />
        <div className="relative flex min-h-[26rem] flex-col items-center justify-center px-6 py-14 text-center">
          <p className="text-[1.05rem]">Del 28 de septiembre al 11 de octubre</p>
          <p className="mt-3 text-3xl font-light sm:text-4xl">Semana del Hogar | 15% de regalo*</p>
          <p className="mt-3 max-w-md text-lg">Para canjear en tus próximas compras de hogar superiores a 50 €.</p>
          <Link to={rutaCategoria('Hogar y decoración')} className="mt-6 flex min-h-12 items-center bg-white px-7 text-[1.05rem] text-black hover:bg-slate-100">
            Descubre más
          </Link>
          <p className="mt-6 text-sm opacity-80">*Promoción ficticia · Anuncio</p>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-3 bg-go-gris px-4 py-5 sm:grid-cols-3">
        {[
          [Truck, 'Envío gratis', `En pedidos superiores a ${envioGratisDesde} €`],
          [Store, 'Recogida gratis en tienda', 'En 2-4 días laborables'],
          [RotateCcw, 'Devolución gratuita', 'Tienes 30 días para devolver'],
        ].map(([Icono, t, d]) => (
          <button key={t} onClick={() => avisar(`${t}: ${d}.`)} className="flex items-center gap-3 bg-white p-4 text-left">
            <Icono size={30} strokeWidth={1.5} className="shrink-0 text-go-verde" />
            <span>
              <b className="block">{t}</b>
              <span className="text-go-suave">{d}</span>
            </span>
          </button>
        ))}
      </section>

      <section className="px-4 py-6">
        <h2 className="text-2xl font-light">Compra por categorías</h2>
        <div data-nota="menu-categorias" className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ['Electrónica', 'p01'],
            ['Electrodomésticos', 'p05'],
            ['Moda, zapatos y accesorios', 'p03'],
            ['Deporte', 'p07'],
            ['Supermercado', 'p08'],
            ['Libros', 'p06'],
            ['Salud y bienestar', 'p09'],
            ['Hogar y decoración', 'p10'],
          ].map(([c, id]) => (
            <Link key={c} to={rutaCategoria(c)} className="group">
              <div className="flex aspect-square items-center justify-center bg-go-gris p-4">
                <img src={producto(id).imagenes[0]} alt="" className="max-h-full object-contain mix-blend-multiply transition group-hover:scale-105" loading="lazy" />
              </div>
              <p className="mt-2 text-[1.02rem] underline-offset-4 group-hover:underline">{c}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="px-4 py-4">
        <h2 className="text-2xl font-light">Lo más vendido</h2>
        <Carrusel className="mt-4">
          {['p02', 'p04', 'p09', 'p01', 'p08', 'p06'].map((id) => (
            <div key={id} className="w-44 shrink-0 snap-start sm:w-52">
              <TarjetaProducto p={producto(id)} onFavorito={() => avisar('Los favoritos no están disponibles en el simulador.')} />
            </div>
          ))}
        </Carrusel>
      </section>

      <section className="mx-4 my-6 flex flex-col items-center gap-3 bg-go-verde px-6 py-8 text-center text-white">
        <p className="text-2xl font-light">Oportunidades de otoño</p>
        <p className="text-lg">Hasta -25% en una selección de electrónica y calzado</p>
        <Link to={rutaCategoria('Oportunidades')} className="flex min-h-12 items-center bg-white px-6 text-black">
          Ver oportunidades
        </Link>
      </section>
    </div>
  )
}

// ======================= CATEGORÍA =======================
export function CategoriaGO() {
  const { cat } = useParams()
  const [params] = useSearchParams()
  const avisar = useAvisoSimulador()
  const q = params.get('q')
  const titulo = cat === 'busqueda' ? `Resultados para «${q || 'todo'}»` : nombreCategoria(cat)
  useUrl(cat === 'busqueda' ? `${DOMINIO}/buscar/?s=${slug(q || '')}` : `${DOMINIO}/${cat}/`)
  useNota('listado')
  useNota('precio-comparar', true, 2000)
  const [orden, setOrden] = useState('relevancia')
  const lista = [...productos].sort((a, b) => (orden === 'precio-asc' ? a.precio - b.precio : orden === 'precio-desc' ? b.precio - a.precio : 0))
  return (
    <div className="px-4 py-4">
      <nav aria-label="Ruta de navegación" className="text-sm text-go-suave">
        <Link to={BASE} className="underline">
          Inicio
        </Link>{' '}
        › <span>{titulo}</span>
      </nav>
      <h1 className="mt-2 text-3xl font-light">{titulo}</h1>
      <p className="text-go-suave">{lista.length} artículos</p>
      <div className="mt-4 flex gap-2">
        <button onClick={() => avisar('En el simulador todas las categorías muestran los mismos productos.')} className="flex min-h-12 flex-1 items-center justify-center gap-2 border border-black">
          <SlidersHorizontal size={18} /> Filtrar
        </button>
        <label className="flex min-h-12 flex-1 items-center border border-black px-2">
          <span className="sr-only">Ordenar</span>
          <select value={orden} onChange={(e) => setOrden(e.target.value)} className="w-full bg-transparent">
            <option value="relevancia">Ordenar: Relevancia</option>
            <option value="precio-asc">Precio: menor a mayor</option>
            <option value="precio-desc">Precio: mayor a menor</option>
          </select>
        </label>
      </div>
      <div data-nota="listado" className="mt-5 grid grid-cols-2 gap-x-3 gap-y-6 md:grid-cols-4">
        {lista.map((p) => (
          <TarjetaProducto key={p.id} p={p} onFavorito={() => avisar('Los favoritos no están disponibles en el simulador.')} />
        ))}
      </div>
    </div>
  )
}

// ======================= FICHA DE PRODUCTO =======================
function Acordeon({ titulo, children, abierto: inicial = false, nota }) {
  const [abierto, setAbierto] = useState(inicial)
  return (
    <section className="border-b border-slate-300" data-nota={nota}>
      <h2>
        <button onClick={() => setAbierto(!abierto)} aria-expanded={abierto} className="flex min-h-16 w-full items-center justify-between text-left text-lg">
          {titulo}
          <ChevronDown className={`transition ${abierto ? 'rotate-180' : ''}`} />
        </button>
      </h2>
      {abierto && <div className="pb-5">{children}</div>}
    </section>
  )
}

function OpinionesGO({ p }) {
  const ref = useRef(null)
  useNotaAlVer(ref, 'resenas')
  const [utiles, setUtiles] = useState({})
  return (
    <div ref={ref}>
      <div className="flex items-center gap-3">
        <span className="text-4xl font-light">{p.valoracion.toFixed(1).replace('.', ',')}</span>
        <div>
          <Estrellas valor={p.valoracion} tam={20} color="#1a1a1a" vacio="#dddddd" />
          <p className="text-sm text-go-suave">{p.numValoraciones.toLocaleString('es-ES')} opiniones</p>
        </div>
      </div>
      <ul className="mt-4 divide-y divide-slate-200">
        {p.resenas.map((r) => (
          <li key={r.autor + r.fecha} className="py-4">
            <div className="flex items-center justify-between gap-2">
              <Estrellas valor={r.estrellas} tam={16} color="#1a1a1a" vacio="#dddddd" />
              <span className="text-sm text-go-suave">{fechaResena(r.fecha)}</span>
            </div>
            <p className="mt-1 font-bold">{r.titulo}</p>
            <p className="mt-1 leading-relaxed">{r.texto}</p>
            <p className="mt-1 text-sm">
              {r.autor} ·{' '}
              <span className="inline-flex items-center gap-1 text-go-verde">
                <CircleCheck size={14} /> Compra verificada
              </span>
            </p>
            <button
              onClick={() => setUtiles({ ...utiles, [r.autor]: !utiles[r.autor] })}
              aria-pressed={!!utiles[r.autor]}
              className={`mt-2 flex min-h-10 items-center gap-2 border px-4 text-sm ${utiles[r.autor] ? 'border-go-verde bg-green-50 text-go-verde' : 'border-slate-400'}`}
            >
              <ThumbsUp size={16} /> Útil ({r.utiles + (utiles[r.autor] ? 1 : 0)})
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

function PreguntasGO({ p }) {
  const ref = useRef(null)
  useNotaAlVer(ref, 'preguntas-clientes')
  return (
    <ul ref={ref} className="space-y-4">
      {p.preguntas.map((q) => (
        <li key={q.pregunta}>
          <p className="font-bold">P: {q.pregunta}</p>
          <p className="mt-1">R: {q.respuesta}</p>
          <p className="text-sm text-go-suave">{q.autor}</p>
        </li>
      ))}
    </ul>
  )
}

export function ProductoGO() {
  const { id } = useParams()
  return <FichaGO key={id} id={id} />
}

function FichaGO({ id }) {
  const p = producto(id) || producto('p01')
  const navigate = useNavigate()
  const anadir = useSim((s) => s.anadirACesta)
  const avisar = useAvisoSimulador()
  const { mostrar } = useNotas()
  const [opciones, setOpciones] = useState(() => opcionesPorDefecto(p))
  const [indice, setIndice] = useState(0)
  const [aviso, setAviso] = useState(null)
  const [anadido, setAnadido] = useState(false)
  const carril = useRef(null)

  useUrl(`${DOMINIO}/${slug(p.categoria)}/${p.ref.toLowerCase()}-${slug(p.tituloCorto)}/`)
  useNota('precio-final')
  useNota('vendedor', p.vendedor.externo, 1500)
  useNota('variantes', (p.variantes?.length || 0) > 0, 2000)

  useEffect(() => {
    const c = carril.current
    if (c) c.scrollTo({ left: c.clientWidth * indice, behavior: 'smooth' })
  }, [indice])

  const precio = precioConOpciones(p, opciones)
  const falta = p.variantes?.find((v) => !opciones[v.nombre])
  const vendedor = p.vendedor.externo ? p.vendedor.nombre : 'Galerías Olmo'

  return (
    <div className="pb-6">
      <nav aria-label="Ruta de navegación" className="px-4 pt-3 text-sm text-go-suave">
        <Link to={BASE} className="underline">
          Inicio
        </Link>{' '}
        ›{' '}
        <Link to={rutaCategoria(p.categoria)} className="underline">
          {p.categoria}
        </Link>
      </nav>
      <div className="md:grid md:grid-cols-2 md:gap-8 md:px-4 md:pt-4">
        <div>
          <div
            ref={carril}
            onScroll={(e) => {
              const c = e.currentTarget
              const i = Math.round(c.scrollLeft / c.clientWidth)
              if (i !== indice) setIndice(i)
            }}
            className="ocultar-scroll mt-3 flex snap-x snap-mandatory overflow-x-auto"
          >
            {p.imagenes.map((src, i) => (
              <div key={src} className="flex aspect-[4/5] w-full shrink-0 snap-center items-center justify-center bg-go-gris p-6">
                <img src={src} alt={`${p.tituloCorto}, imagen ${i + 1}`} className="max-h-full object-contain mix-blend-multiply" />
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-2 py-3">
            {p.imagenes.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndice(i)}
                className={`h-2.5 rounded-full transition-all ${i === indice ? 'w-8 bg-black' : 'w-2.5 bg-slate-300'}`}
                aria-label={`Ver imagen ${i + 1}`}
                aria-current={i === indice}
              />
            ))}
          </div>
        </div>

        <div className="space-y-5 px-4">
          <div>
            <button onClick={() => avisar()} className="text-sm font-bold uppercase tracking-wider underline">
              {p.marca}
            </button>
            <h1 className="mt-1 text-2xl font-light leading-snug">{p.titulo}</h1>
            <p className="mt-1 text-sm text-go-suave">Ref. {p.ref}</p>
            <a href="#opiniones-go" className="mt-1 inline-block">
              <Valoracion p={p} />
            </a>
          </div>

          <div data-nota="precio">
            <PrecioGO p={p} precio={precio} grande />
            <p className="text-sm text-go-suave">IVA incluido{p.unidad ? ` · ${p.unidad}` : ''}</p>
            <p className="mt-2">
              {p.costeEnvio > 0 ? (
                <>
                  Gastos de envío del vendedor: <b>{euros(p.costeEnvio)}</b>
                </>
              ) : (
                <>
                  Envío <b>gratis</b> a partir de {envioGratisDesde} €
                </>
              )}
            </p>
          </div>

          {p.variantes?.length > 0 && (
            <div data-nota="variantes" className="space-y-4">
              {p.variantes.map((v) => (
                <div key={v.nombre} id={`go-var-${v.nombre}`}>
                  <p>
                    {v.nombre}: <b>{opciones[v.nombre] || 'Selecciona'}</b>
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {v.opciones.map((o) =>
                      o.imagen !== undefined ? (
                        <button
                          key={o.valor}
                          onClick={() => {
                            setOpciones({ ...opciones, [v.nombre]: o.valor })
                            setIndice(o.imagen)
                          }}
                          aria-pressed={opciones[v.nombre] === o.valor}
                          aria-label={`${v.nombre} ${o.valor}`}
                          className={`h-20 w-16 border-2 bg-go-gris p-1 ${opciones[v.nombre] === o.valor ? 'border-black' : 'border-transparent'}`}
                        >
                          <img src={p.imagenes[o.imagen]} alt="" className="h-full w-full object-contain mix-blend-multiply" />
                        </button>
                      ) : (
                        <button
                          key={o.valor}
                          disabled={o.agotado}
                          onClick={() => {
                            setOpciones({ ...opciones, [v.nombre]: o.valor })
                            setAviso(null)
                          }}
                          aria-pressed={opciones[v.nombre] === o.valor}
                          aria-label={`${v.nombre} ${o.valor}${o.agotado ? ', agotado' : ''}`}
                          className={`min-h-12 min-w-12 border px-3 ${opciones[v.nombre] === o.valor ? 'border-2 border-black font-bold' : 'border-slate-400'} ${
                            o.agotado ? 'text-slate-400 line-through' : ''
                          }`}
                        >
                          {o.valor}
                          {o.extra ? <span className="block text-xs">+{euros(o.extra)}</span> : null}
                        </button>
                      ),
                    )}
                  </div>
                  {v.guia && (
                    <button onClick={() => avisar('Guía de tallas: consulta las medidas en la ficha del producto de la tienda real.')} className="mt-2 min-h-10 text-sm underline">
                      Guía de tallas
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {aviso && (
            <p role="alert" className="bg-sky-50 p-3 font-semibold text-sky-900 ring-1 ring-sky-600">
              {aviso}
            </p>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => {
                if (falta) {
                  setAviso(`Selecciona ${falta.nombre.toLowerCase()} para añadir el producto a la cesta.`)
                  document.getElementById(`go-var-${falta.nombre}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                  return
                }
                anadir(G, p.id, opciones, 1)
                setAnadido(true)
              }}
              className="flex min-h-14 flex-1 items-center justify-center gap-2 bg-black text-[1.02rem] uppercase tracking-wider text-white hover:bg-[#333]"
            >
              <ShoppingBag size={20} /> Añadir a la cesta
            </button>
            <button onClick={() => avisar('Los favoritos no están disponibles en el simulador.')} className="flex h-14 w-14 items-center justify-center border border-black" aria-label="Guardar en favoritos">
              <Heart />
            </button>
          </div>

          <ul className="space-y-3 bg-go-gris p-4 text-[0.98rem]">
            <li className="flex gap-3">
              <Truck className="shrink-0" size={22} /> {p.costeEnvio > 0 ? `Envío a domicilio: ${euros(p.costeEnvio)} (lo gestiona el vendedor)` : `Envío a domicilio gratis a partir de ${envioGratisDesde} €`}
            </li>
            <li className="flex gap-3">
              <Store className="shrink-0" size={22} /> {p.vendedor.externo ? 'No disponible para recogida en tienda' : 'Recogida gratis en tienda en 2-4 días'}
            </li>
            <li className="flex gap-3">
              <RotateCcw className="shrink-0" size={22} />
              <button onClick={() => mostrar('desistimiento', { forzar: true })} data-nota="devolucion" className="text-left underline">
                Devolución gratuita en 30 días
              </button>
            </li>
          </ul>
          <p data-nota="vendedor" className="border border-slate-300 p-3 text-[0.98rem]">
            Vendido y enviado por <b>{vendedor}</b>
            {p.vendedor.externo && <span className="block text-sm text-go-suave">Vendedor externo: gestiona el envío, los plazos y la garantía.</span>}
          </p>

          <div className="border-t border-slate-300">
            <Acordeon titulo="Descripción" abierto>
              <p className="leading-relaxed">{p.descripcion}</p>
              <ul className="mt-3 list-disc space-y-1 pl-5">
                {p.puntos.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </Acordeon>
            <Acordeon titulo="Características">
              <dl className="divide-y divide-slate-200">
                {p.caracteristicas.map(([k, v]) => (
                  <div key={k} className="grid grid-cols-2 gap-2 py-2">
                    <dt className="text-go-suave">{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
            </Acordeon>
            <div id="opiniones-go">
              <Acordeon titulo={`Opiniones (${p.resenas.length})`} nota="resenas">
                <OpinionesGO p={p} />
              </Acordeon>
            </div>
            <Acordeon titulo={`Preguntas y respuestas (${p.preguntas.length})`} nota="preguntas">
              <PreguntasGO p={p} />
            </Acordeon>
          </div>
        </div>
      </div>

      <section className="mt-8 px-4">
        <h2 className="text-2xl font-light">También te puede interesar</h2>
        <Carrusel className="mt-4">
          {p.relacionados.map((r) => (
            <div key={r} className="w-44 shrink-0 snap-start">
              <TarjetaProducto p={producto(r)} onFavorito={() => avisar('Los favoritos no están disponibles en el simulador.')} />
            </div>
          ))}
        </Carrusel>
      </section>

      {anadido && (
        <Modal titulo="Producto añadido a tu cesta" onCerrar={() => setAnadido(false)} className="font-montse" ancho="max-w-md">
          <div className="flex gap-3">
            <img src={imagenSegunOpciones(p, opciones)} alt="" className="h-24 w-20 shrink-0 bg-go-gris object-contain p-1" />
            <div>
              <p className="text-sm font-bold uppercase">{p.marca}</p>
              <p>{p.tituloCorto}</p>
              {Object.keys(opciones).length > 0 && <p className="text-sm">{textoOpciones(opciones)}</p>}
              <p className="font-semibold">{euros(precio)}</p>
            </div>
          </div>
          <div className="mt-5 space-y-2">
            <BotonNegro onClick={() => navigate(`${BASE}/cesta`)}>Ver cesta</BotonNegro>
            <button onClick={() => setAnadido(false)} className="min-h-12 w-full border border-black text-[0.98rem] uppercase tracking-wider">
              Seguir comprando
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}

