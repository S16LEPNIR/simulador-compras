import productos from '../data/productos.json'
import productosExtraTE from '../data/productos-todoenvio.json'

const fmtEuros = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 })

export const euros = (n) => fmtEuros.format(n).replace(/ /g, ' ')

// Separa un precio en parte entera y céntimos (para mostrar los céntimos pequeños, como en las tiendas reales)
export function partesPrecio(n) {
  const [entero, cent] = n.toFixed(2).split('.')
  return { entero, cent }
}

// Galerías Olmo usa los 10 productos comunes; Todoenvío, los 20
export const productosTE = [...productos, ...productosExtraTE]
export const producto = (id) => productosTE.find((p) => p.id === id)
export { productos }

// Precio de un producto según las opciones elegidas (algunas opciones suman un extra)
export function precioConOpciones(p, opciones = {}) {
  let extra = 0
  for (const v of p.variantes || []) {
    const op = v.opciones.find((o) => o.valor === opciones[v.nombre])
    if (op?.extra) extra += op.extra
  }
  return Math.round((p.precio + extra) * 100) / 100
}

export const descuento = (p) => (p.precioAnterior ? Math.round((1 - p.precio / p.precioAnterior) * 100) : 0)

export function opcionesPorDefecto(p) {
  const o = {}
  for (const v of p.variantes || []) {
    const disponible = v.opciones.find((x) => !x.agotado)
    // Para tallas no preseleccionamos: el alumno debe elegir
    if (v.nombre !== 'Talla') o[v.nombre] = disponible.valor
  }
  return o
}

export function imagenSegunOpciones(p, opciones = {}) {
  for (const v of p.variantes || []) {
    const op = v.opciones.find((o) => o.valor === opciones[v.nombre])
    if (op?.imagen !== undefined) return p.imagenes[op.imagen]
  }
  return p.imagenes[0]
}

export const textoOpciones = (opciones = {}) =>
  Object.entries(opciones)
    .map(([k, v]) => `${k}: ${v}`)
    .join(' · ')

// ---------- Fechas ----------
const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']

export function sumarDias(dias, desde = new Date()) {
  const d = new Date(desde)
  d.setDate(d.getDate() + dias)
  if (d.getDay() === 0) d.setDate(d.getDate() + 1) // no se entrega en domingo
  return d
}

export const fechaLarga = (d) => `${DIAS[d.getDay()]}, ${d.getDate()} de ${MESES[d.getMonth()]}`
export const fechaCorta = (d) => `${d.getDate()} de ${MESES[d.getMonth()]}`
export const fechaCompleta = (d) => `${d.getDate()} de ${MESES[d.getMonth()]} de ${d.getFullYear()}`
export const fechaNumerica = (d) =>
  `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
export const hora = (d) => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
export const fechaResena = (iso) => fechaCompleta(new Date(iso + 'T12:00:00'))

// Días relativos legibles: «mañana», «pasado mañana» o la fecha
export function cuando(d) {
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  const diff = Math.round((x - hoy) / 86400000)
  if (diff === 1) return 'mañana'
  if (diff === 2) return 'pasado mañana'
  return fechaLarga(d)
}

const aleatorio = (n) => Array.from({ length: n }, () => Math.floor(Math.random() * 10)).join('')
export const numeroPedidoTodoenvio = () => `408-${aleatorio(7)}-${aleatorio(7)}`
export const numeroPedidoGalerias = () => `GO${new Date().getFullYear()}${aleatorio(8)}`

// ---------- Resumen de una lista de líneas ----------
export function lineasDetalladas(lineas) {
  return lineas.map((l) => {
    const p = producto(l.id)
    const precio = precioConOpciones(p, l.opciones)
    return { ...l, p, precio, total: Math.round(precio * l.cantidad * 100) / 100 }
  })
}

export function totales(lineas) {
  const det = lineasDetalladas(lineas)
  const subtotal = Math.round(det.reduce((s, l) => s + l.total, 0) * 100) / 100
  // Gastos de envío del vendedor externo: se cobran una vez por vendedor
  const vendedores = {}
  for (const l of det) if (l.p.costeEnvio > 0) vendedores[l.p.vendedor.nombre] = Math.max(vendedores[l.p.vendedor.nombre] || 0, l.p.costeEnvio)
  const envioVendedores = Math.round(Object.values(vendedores).reduce((a, b) => a + b, 0) * 100) / 100
  const unidades = det.reduce((s, l) => s + l.cantidad, 0)
  return { det, subtotal, envioVendedores, unidades }
}

// El IVA ya va incluido en el precio: calculamos la parte de IVA (21 %) solo para mostrar el desglose
export const ivaIncluido = (total) => Math.round((total - total / 1.21) * 100) / 100
