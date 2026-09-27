import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Pause, Play } from 'lucide-react'
import { useUrl, Carrusel } from '../../components/comun/Simulador'
import { useNota, useNotas } from '../../components/comun/Notas'
import { descuento, euros, productos, producto } from '../../lib/formato'
import { BASE, CATEGORIAS, DOMINIO, MiniProducto, Precio, rutaCategoria } from './comun'

function CuentaAtras() {
  const [s, setS] = useState(3 * 3600 - 19)
  useEffect(() => {
    const i = setInterval(() => setS((x) => (x > 0 ? x - 1 : 3 * 3600)), 1000)
    return () => clearInterval(i)
  }, [])
  const f = (n) => String(n).padStart(2, '0')
  return (
    <span className="font-mono tabular-nums">
      {f(Math.floor(s / 3600))}:{f(Math.floor((s % 3600) / 60))}:{f(s % 60)}
    </span>
  )
}

const SLIDES = [
  {
    fondo: 'from-[#0f5e63] to-[#1c8b86]',
    titulo: 'Semana del Hogar',
    texto: 'Hasta −30 % en pequeño electrodoméstico',
    img: 'img/productos/p04/1.jpg',
    to: rutaCategoria('Hogar y cocina'),
  },
  {
    fondo: 'from-[#b33a1f] to-[#e2692f]',
    titulo: 'Oferta flash',
    texto: 'Auriculares AirWave 5 por solo 49,99 €',
    img: 'img/productos/p01/3.jpg',
    to: `${BASE}/producto/p01`,
    cuenta: true,
  },
  {
    fondo: 'from-[#2f4858] to-[#33658a]',
    titulo: 'Lecturas para el otoño',
    texto: 'Ediciones en letra grande, envío gratis',
    img: 'img/productos/p06/1.jpg',
    to: rutaCategoria('Libros'),
  },
]

function Banner() {
  const [i, setI] = useState(0)
  const [pausa, setPausa] = useState(false)
  const { mostrar } = useNotas()
  useEffect(() => {
    if (pausa) return
    const t = setInterval(() => setI((x) => (x + 1) % SLIDES.length), 6500)
    return () => clearInterval(t)
  }, [pausa])
  useEffect(() => {
    if (SLIDES[i].cuenta) mostrar('ofertas-urgencia')
  }, [i, mostrar])
  const s = SLIDES[i]
  return (
    <section data-nota="banner" className="relative" aria-roledescription="carrusel" aria-label="Promociones">
      <Link to={s.to} className={`flex min-h-56 items-center gap-3 overflow-hidden bg-gradient-to-r ${s.fondo} px-5 pb-12 pt-5 text-white sm:min-h-64 md:rounded-b-lg`}>
        <div className="flex-1">
          <p className="text-3xl font-extrabold leading-tight sm:text-4xl">{s.titulo}</p>
          <p className="mt-2 text-lg sm:text-xl">{s.texto}</p>
          {s.cuenta && (
            <p className="mt-3 inline-block rounded bg-black/30 px-3 py-1 text-lg font-bold">
              ¡Termina en <CuentaAtras />!
            </p>
          )}
          <span className="mt-3 block text-sm opacity-90">Anuncio · Promoción ficticia</span>
        </div>
        <div className="flex h-40 w-36 shrink-0 items-center justify-center rounded-xl bg-white/95 p-2 sm:h-48 sm:w-48">
          <img src={s.img} alt="" className="max-h-full object-contain" />
        </div>
      </Link>
      <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-2">
        {SLIDES.map((_, k) => (
          <button
            key={k}
            onClick={() => setI(k)}
            className={`h-3 w-3 rounded-full ${k === i ? 'bg-white' : 'bg-white/50'}`}
            aria-label={`Ver promoción ${k + 1}`}
            aria-current={k === i}
          />
        ))}
      </div>
      <button
        onClick={() => setPausa(!pausa)}
        className="absolute bottom-2 left-3 rounded-full bg-black/40 p-2 text-white"
        aria-label={pausa ? 'Reanudar carrusel' : 'Pausar carrusel'}
      >
        {pausa ? <Play size={16} /> : <Pause size={16} />}
      </button>
    </section>
  )
}

function Tarjeta({ titulo, children, enlace, textoEnlace = 'Ver más' }) {
  return (
    <section className="bg-white p-4 md:rounded-lg">
      <h2 className="text-xl font-extrabold">{titulo}</h2>
      <div className="mt-3">{children}</div>
      {enlace && (
        <Link to={enlace} className="mt-3 inline-block min-h-10 py-2 text-te-enlace hover:underline">
          {textoEnlace}
        </Link>
      )}
    </section>
  )
}

export default function InicioTE() {
  useUrl(`${DOMINIO}/`)
  useNota('https-candado')
  useNota('buscador', true, 1200)
  const ofertas = productos.filter((p) => descuento(p) > 0)

  return (
    <div className="pb-4">
      <div className="ocultar-scroll flex gap-2 overflow-x-auto bg-white px-3 py-2">
        {['Ofertas del día', 'Electrónica', 'Hogar', 'Moda', 'Libros', 'Alimentación', 'Salud'].map((c) => (
          <Link key={c} to={`${BASE}/buscar?k=${encodeURIComponent(c)}`} className="flex min-h-10 shrink-0 items-center rounded-full bg-[#1b2a41] px-4 font-bold text-white">
            {c}
          </Link>
        ))}
        <Link to={`${BASE}/explorar`} className="flex min-h-10 shrink-0 items-center rounded-full border border-slate-400 bg-white px-4 font-bold">
          Ver todo
        </Link>
      </div>
      <Banner />

      <div className="mt-3 grid gap-3 md:grid-cols-2 md:px-3 lg:grid-cols-3">
        <Tarjeta titulo="Ofertas del día" enlace={rutaCategoria('Ofertas y ahorros')} textoEnlace="Ver todas las ofertas">
          <div className="grid grid-cols-2 gap-3">
            {ofertas.slice(0, 4).map((p) => (
              <Link key={p.id} to={`${BASE}/producto/${p.id}`}>
                <div className="flex aspect-square items-center justify-center rounded bg-[#f7f7f7] p-2">
                  <img src={p.imagenes[0]} alt="" className="max-h-full object-contain mix-blend-multiply" loading="lazy" />
                </div>
                <p className="mt-1 flex items-center gap-2">
                  <span className="rounded bg-te-oferta px-1.5 py-0.5 text-sm font-bold text-white">-{descuento(p)} %</span>
                  <span className="text-sm font-bold text-te-oferta">Oferta</span>
                </p>
                <p className="line-clamp-1 text-[0.95rem]">{p.tituloCorto}</p>
              </Link>
            ))}
          </div>
        </Tarjeta>

        <Tarjeta titulo="Comprar por categoría" enlace={`${BASE}/explorar`} textoEnlace="Ver todas las categorías">
          <div className="grid grid-cols-2 gap-3" data-nota="menu-categorias">
            {CATEGORIAS.slice(3, 7).map((c) => (
              <Link key={c.nombre} to={rutaCategoria(c.nombre)}>
                <div className="flex aspect-square items-center justify-center rounded bg-[#f7f7f7] p-2">
                  <img src={c.img} alt="" className="max-h-full object-contain mix-blend-multiply" loading="lazy" />
                </div>
                <p className="mt-1 text-[0.95rem]">{c.nombre}</p>
              </Link>
            ))}
          </div>
        </Tarjeta>

        <Tarjeta titulo="Para ti">
          <p className="-mt-2 mb-2 text-sm text-te-gris">Patrocinado</p>
          {(() => {
            const p = producto('p09')
            return (
              <Link to={`${BASE}/producto/${p.id}`} className="flex gap-3">
                <div className="flex h-40 w-40 shrink-0 items-center justify-center rounded bg-[#f7f7f7] p-2">
                  <img src={p.imagenes[0]} alt="" className="max-h-full object-contain mix-blend-multiply" />
                </div>
                <div>
                  <p className="line-clamp-3">{p.titulo}</p>
                  <Precio valor={p.precio} />
                  <p className="text-sm text-te-gris">
                    Precio anterior: <s>{euros(p.precioAnterior)}</s>
                  </p>
                </div>
              </Link>
            )
          })()}
        </Tarjeta>
      </div>

      <section className="mt-3 bg-white p-4 md:mx-3 md:rounded-lg">
        <h2 className="text-xl font-extrabold">Los más vendidos en Hogar y cocina</h2>
        <Carrusel className="mt-3">
          {['p04', 'p05', 'p10', 'p08', 'p09'].map((id) => (
            <MiniProducto key={id} p={producto(id)} />
          ))}
        </Carrusel>
      </section>

      <section className="mt-3 bg-white p-4 md:mx-3 md:rounded-lg">
        <h2 className="text-xl font-extrabold">Inspirado en tus intereses</h2>
        <Carrusel className="mt-3">
          {['p06', 'p01', 'p07', 'p03', 'p02'].map((id) => (
            <MiniProducto key={id} p={producto(id)} />
          ))}
        </Carrusel>
      </section>
    </div>
  )
}
