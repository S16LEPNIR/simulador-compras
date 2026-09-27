import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { useSim } from '../../store/useSim'
import { Estrellas } from '../../components/comun/Simulador'
import { descuento, euros } from '../../lib/formato'

export const G = 'galerias'
export const BASE = '/galerias'
export const DOMINIO = 'https://www.galeriasolmo.es'
export const PASARELA = 'https://pasarelapagos.galeriasolmo.es'
export const TPV = 'https://tpv.pagoseguro-bancario.es'

export const useTienda = () => useSim((s) => s.tiendas[G])

// Menú de categorías (cualquier categoría muestra los mismos 10 productos)
export const CATEGORIAS = [
  { nombre: 'Supermercado', subs: ['Aceites y vinagres', 'Despensa', 'Bodega', 'Desayuno'] },
  { nombre: 'Moda, zapatos y accesorios', subs: ['Hombre', 'Mujer', 'Zapatos', 'Bolsos'] },
  { nombre: 'Joyería y relojes', subs: ['Relojes', 'Joyas', 'Gafas de sol'] },
  { nombre: 'Belleza y perfumería', subs: ['Perfumes', 'Cosmética', 'Cuidado personal'] },
  { nombre: 'Hogar y decoración', subs: ['Textil hogar', 'Menaje', 'Decoración', 'Iluminación'] },
  { nombre: 'Electrodomésticos', subs: ['Pequeño electrodoméstico', 'Cafeteras', 'Cocina', 'Climatización'] },
  { nombre: 'Electrónica', subs: ['Móviles', 'Auriculares', 'Televisores', 'Fotografía'] },
  { nombre: 'Informática', subs: ['Portátiles', 'Tabletas', 'Impresoras'] },
  { nombre: 'Deporte', subs: ['Calzado deportivo', 'Senderismo', 'Fitness', 'Ciclismo'] },
  { nombre: 'Libros', subs: ['Novela', 'Letra grande', 'Cocina', 'Viajes'] },
  { nombre: 'Salud y bienestar', subs: ['Tensiómetros', 'Ortopedia', 'Parafarmacia'] },
  { nombre: 'Juguetes', subs: ['Juegos de mesa', 'Puzles', 'Construcciones'] },
  { nombre: 'Oportunidades', subs: ['Outlet', 'Últimas unidades'] },
]

export const slug = (t) =>
  t
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

export const rutaCategoria = (nombre) => `${BASE}/c/${slug(nombre)}`
export const nombreCategoria = (s) => {
  for (const c of CATEGORIAS) {
    if (slug(c.nombre) === s) return c.nombre
    const sub = c.subs.find((x) => slug(x) === s)
    if (sub) return sub
  }
  return 'Todos los productos'
}

export const envioGratisDesde = 30
export const costeEnvioEstandar = 3.95

export function BotonNegro({ children, className = '', ...rest }) {
  return (
    <button className={`min-h-12 w-full bg-black px-4 font-montse text-[0.98rem] uppercase tracking-wider text-white hover:bg-[#333] ${className}`} {...rest}>
      {children}
    </button>
  )
}

export function Valoracion({ p }) {
  return (
    <span className="inline-flex items-center gap-1 text-sm">
      <Estrellas valor={p.valoracion} tam={14} color="#1a1a1a" vacio="#dddddd" />
      <span className="text-go-suave">({p.numValoraciones.toLocaleString('es-ES')})</span>
    </span>
  )
}

export function PrecioGO({ p, precio = p.precio, grande = false }) {
  const dto = descuento(p)
  return (
    <div className={`flex flex-wrap items-baseline gap-x-2 ${grande ? 'text-2xl' : 'text-[1.05rem]'}`}>
      {p.precioAnterior && <s className={`text-go-suave ${grande ? 'text-lg' : 'text-sm'}`}>{euros(p.precioAnterior)}</s>}
      <span className={`font-semibold ${p.precioAnterior ? 'text-go-rojo' : ''}`}>{euros(precio)}</span>
      {dto > 0 && <span className={`bg-go-rojo px-1.5 font-semibold text-white ${grande ? 'text-base' : 'text-xs'}`}>-{dto}%</span>}
    </div>
  )
}

export function TarjetaProducto({ p, onFavorito }) {
  return (
    <article className="relative">
      <Link to={`${BASE}/p/${p.id}`} className="block">
        <div className="flex aspect-[4/5] items-center justify-center bg-go-gris p-3">
          <img src={p.imagenes[0]} alt={p.tituloCorto} className="max-h-full object-contain mix-blend-multiply" loading="lazy" />
        </div>
        <p className="mt-2 text-sm font-bold uppercase tracking-wide">{p.marca}</p>
        <p className="line-clamp-2 text-[0.98rem] leading-snug">{p.tituloCorto}</p>
        <PrecioGO p={p} />
        <Valoracion p={p} />
      </Link>
      <button onClick={onFavorito} className="absolute right-2 top-2 rounded-full bg-white/90 p-2 shadow" aria-label="Guardar en favoritos">
        <Heart size={20} />
      </button>
    </article>
  )
}
