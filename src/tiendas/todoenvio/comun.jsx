import { Link, useNavigate } from 'react-router-dom'
import { Check, GraduationCap, Lock, Mail, Wallet } from 'lucide-react'
import { LogoTodoenvio } from '../../components/comun/Logos'
import { useSim } from '../../store/useSim'
import { Estrellas } from '../../components/comun/Simulador'
import { cuando, descuento, euros, partesPrecio, sumarDias } from '../../lib/formato'
import { SALDO_INICIAL } from '../../lib/todoenvio'

export const T = 'todoenvio'
export const BASE = '/todoenvio'
export const DOMINIO = 'https://www.todoenvio.es'

export const useTienda = () => useSim((s) => s.tiendas[T])

// Categorías reales de la tienda: cada una muestra solo sus productos
export const CATEGORIAS = [
  { nombre: 'Ofertas y ahorros', img: 'img/productos/p04/1.jpg', subs: ['Ofertas del día'] },
  { nombre: 'Electrónica', img: 'img/productos/p01/1.jpg', subs: ['Auriculares', 'Móviles', 'Radios'] },
  { nombre: 'Hogar y cocina', img: 'img/productos/p10/1.jpg', subs: ['Freidoras', 'Cafeteras', 'Mantas'] },
  { nombre: 'Moda', img: 'img/productos/p14/1.jpg', subs: ['Camisetas', 'Rebecas'] },
  { nombre: 'Salud', img: 'img/productos/p18/1.jpg', subs: ['Tensiómetros', 'Pastilleros'] },
  { nombre: 'Alimentación', img: 'img/productos/p17/1.jpg', subs: ['Aceite', 'Miel'] },
  { nombre: 'Libros', img: 'img/productos/p15/1.jpg', subs: ['Novela', 'Recetarios'] },
  { nombre: 'Deportes', img: 'img/productos/p16/1.jpg', subs: ['Zapatillas', 'Bicicletas'] },
  { nombre: 'Bricolaje y jardín', img: 'img/productos/p12/1.jpg', subs: ['Taladros', 'Regaderas'] },
  { nombre: 'Juguetes y juegos', img: 'img/productos/p13/1.jpg', subs: ['Ajedrez', 'Dominó'] },
]

export const rutaCategoria = (nombre) => `${BASE}/buscar?k=${encodeURIComponent(nombre)}`
export const slug = (t) =>
  t
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

// Precio con los céntimos pequeños, como en la tienda real
export function Precio({ valor, grande = false, className = '' }) {
  const { entero, cent } = partesPrecio(valor)
  return (
    <span className={`inline-flex items-start leading-none text-te-tinta ${className}`} aria-label={euros(valor)}>
      <span aria-hidden className={grande ? 'text-[2.4rem] font-normal' : 'text-[1.6rem] font-normal'}>
        {entero}
      </span>
      <span aria-hidden className={grande ? 'mt-1 text-base' : 'mt-0.5 text-[0.8rem]'}>
        {cent} €
      </span>
    </span>
  )
}

export function Valoracion({ p, compacta = false }) {
  return (
    <span className="inline-flex items-center gap-1 text-[0.95rem]">
      <span className="text-te-tinta">{p.valoracion.toFixed(1).replace('.', ',')}</span>
      <Estrellas valor={p.valoracion} tam={compacta ? 14 : 16} />
      <span className="text-te-enlace">({p.numValoraciones.toLocaleString('es-ES')})</span>
    </span>
  )
}

// Insignia de envío rápido propia (no imita ninguna marca real)
export function Rapido() {
  return (
    <span className="inline-flex items-center gap-0.5 font-bold text-[#1a73c7]">
      <Check size={15} strokeWidth={3.5} className="text-te-naranja" aria-hidden />
      <span className="italic">rápido</span>
    </span>
  )
}

export function textoEntrega(p) {
  const d = sumarDias(p.diasEntrega)
  if (p.costeEnvio > 0) return { gratis: false, texto: `Envío ${euros(p.costeEnvio)}`, fecha: d, cuando: cuando(d) }
  return { gratis: true, texto: 'Entrega GRATIS', fecha: d, cuando: cuando(d) }
}

export function BotonTE({ tipo = 'amarillo', children, className = '', ...rest }) {
  const cls = tipo === 'naranja' ? 'te-btn-naranja' : tipo === 'blanco' ? 'bg-white border border-[#888c8c] hover:bg-slate-50' : 'te-btn-amarillo'
  return (
    <button className={`min-h-12 w-full rounded-full px-4 text-[1.02rem] shadow-sm ${cls} ${className}`} {...rest}>
      {children}
    </button>
  )
}

// Fila de producto en los resultados de búsqueda / categoría
export function FilaProducto({ p, indice }) {
  const navigate = useNavigate()
  const anadir = useSim((s) => s.anadirACesta)
  const e = textoEntrega(p)
  const tieneTalla = p.variantes?.some((v) => v.nombre === 'Talla')
  const dto = descuento(p)
  const insignia = indice === 0 ? 'Patrocinado' : indice === 2 ? 'Más vendido' : null
  const opcionesDef = Object.fromEntries((p.variantes || []).map((v) => [v.nombre, v.opciones[0].valor]))
  return (
    <article className="flex gap-3 border-b border-slate-200 bg-white p-3 md:flex-col md:rounded-lg md:border md:p-4">
      <Link to={`${BASE}/producto/${p.id}`} className="flex w-36 shrink-0 items-center justify-center rounded-md bg-[#f7f7f7] p-2 md:w-full">
        <img src={p.imagenes[0]} alt={p.tituloCorto} className="aspect-square w-full object-contain mix-blend-multiply" loading="lazy" />
      </Link>
      <div className="min-w-0 flex-1">
        {insignia === 'Más vendido' && <span className="mb-1 inline-block rounded bg-[#c45500] px-1.5 py-0.5 text-sm font-semibold text-white">Más vendido</span>}
        {insignia === 'Patrocinado' && <p className="text-sm text-te-gris">Patrocinado</p>}
        <Link to={`${BASE}/producto/${p.id}`} className="line-clamp-3 text-[1.02rem] leading-snug text-te-tinta hover:text-[#c7511f]">
          {p.titulo}
        </Link>
        <div className="mt-1">
          <Valoracion p={p} compacta />
        </div>
        <div className="mt-1 flex flex-wrap items-end gap-2">
          {dto > 0 && <span className="text-lg text-te-oferta">-{dto} %</span>}
          <Precio valor={p.precio} />
        </div>
        {p.precioAnterior && (
          <p className="text-sm text-te-gris">
            Precio anterior: <s>{euros(p.precioAnterior)}</s>
          </p>
        )}
        <p className="mt-1 text-[0.95rem]">
          {e.gratis && <Rapido />} {e.texto} <b>{e.cuando}</b>
        </p>
        {p.vendedor.externo && <p className="text-sm text-te-gris">Vendido por {p.vendedor.nombre}</p>}
        <div className="mt-2 max-w-60">
          {tieneTalla || p.variantes?.length > 1 ? (
            <BotonTE tipo="blanco" onClick={() => navigate(`${BASE}/producto/${p.id}`)}>
              Ver las opciones de compra
            </BotonTE>
          ) : (
            <BotonTE
              onClick={() => {
                anadir(T, p.id, opcionesDef, 1)
                navigate(`${BASE}/cesta?anadido=${p.id}`)
              }}
            >
              Añadir a la cesta
            </BotonTE>
          )}
        </div>
      </div>
    </article>
  )
}

// Tarjeta pequeña para carruseles
export function MiniProducto({ p, ancho = 'w-40' }) {
  return (
    <Link to={`${BASE}/producto/${p.id}`} className={`${ancho} shrink-0 snap-start`}>
      <div className="flex aspect-square items-center justify-center rounded-md bg-[#f7f7f7] p-2">
        <img src={p.imagenes[0]} alt="" className="max-h-full object-contain mix-blend-multiply" loading="lazy" />
      </div>
      <p className="mt-1 line-clamp-2 text-[0.95rem] text-te-enlace">{p.tituloCorto}</p>
      <Valoracion p={p} compacta />
      <div>
        <Precio valor={p.precio} />
      </div>
    </Link>
  )
}

// Franja del simulador (no es parte de la tienda): enseña el saldo de prácticas y da acceso al correo simulado
export function BarraPracticas() {
  const t = useTienda()
  if (!t.usuario) return null
  return (
    <div className="flex items-center justify-between gap-2 bg-indigo-100 px-3 py-1 font-sans text-[0.98rem] text-indigo-950">
      {t.saldo === null ? (
        <Link to={`${BASE}/cartera/anadir`} className="flex min-h-10 items-center gap-1.5 font-semibold underline">
          <GraduationCap size={18} aria-hidden /> Añade una tarjeta y recibe {euros(SALDO_INICIAL)} para practicar
        </Link>
      ) : (
        <Link to={`${BASE}/cartera`} className="flex min-h-10 items-center gap-1.5" data-nota="saldo">
          <Wallet size={18} aria-hidden /> Saldo de prácticas: <b>{euros(t.saldo)}</b>
        </Link>
      )}
      <Link to={`${BASE}/correo`} className="flex min-h-10 shrink-0 items-center gap-1.5 font-semibold underline">
        <Mail size={18} aria-hidden /> Mi correo
      </Link>
    </div>
  )
}

// Cabecera sencilla para identificación y tramitación del pedido
export function CabeceraCheckout({ titulo, paso }) {
  const PASOS = ['Dirección', 'Pago', 'Revisar']
  return (
    <header className="border-b border-slate-300 bg-gradient-to-b from-white to-slate-100 px-4 py-3">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
        <Link to={BASE} aria-label="Ir al inicio de Todoenvío" className="shrink-0">
          <LogoTodoenvio alto={26} />
        </Link>
        {titulo && <h1 className="text-right text-lg font-semibold text-te-tinta">{titulo}</h1>}
        <Lock size={20} className="shrink-0 text-te-gris" aria-label="Página segura" />
      </div>
      {paso && (
        <ol className="mx-auto mt-3 flex max-w-3xl items-center justify-between gap-1 text-sm" aria-label="Pasos de la compra">
          {PASOS.map((n, i) => (
            <li key={n} className="flex flex-1 flex-col items-center gap-1" aria-current={i + 1 === paso ? 'step' : undefined}>
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold ${
                  i + 1 < paso ? 'bg-te-verde text-white' : i + 1 === paso ? 'bg-[#e77600] text-white' : 'bg-slate-300 text-slate-700'
                }`}
              >
                {i + 1 < paso ? <Check size={16} strokeWidth={3} /> : i + 1}
              </span>
              <span className={i + 1 === paso ? 'font-bold text-[#c45500]' : 'text-te-gris'}>{n}</span>
            </li>
          ))}
        </ol>
      )}
    </header>
  )
}
