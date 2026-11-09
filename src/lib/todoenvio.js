// Lógica propia de la tienda Todoenvío: reloj del reparto, textos de estado, búsqueda y correos.
import { descuento, euros, fechaCorta, fechaLarga, productosTE } from './formato'

export const SALDO_INICIAL = 500
export const CODIGO_REGALO = 'REGALO25'
export const IMPORTE_REGALO = 25
export const redondear = (n) => Math.round(n * 100) / 100

// ---------- Reloj del pedido (en el simulador el tiempo va acelerado) ----------
export const ETAPAS = ['Pedido realizado', 'Preparando', 'Enviado', 'En reparto', 'Entregado']
const SEG = 1000
// Momento (en ms desde la compra) en que empieza cada etapa
export const INICIO_ETAPA = [0, 180 * SEG, 360 * SEG, 480 * SEG, 720 * SEG]
export const PARADAS = 8
const REPARTO = INICIO_ETAPA[4] - INICIO_ETAPA[3]
const POR_PARADA = REPARTO / PARADAS
// Parte de cada tramo en la que la furgoneta se mueve; el resto está parada entregando
const PARTE_EN_MARCHA = 0.75
export const ESPERA_REEMBOLSO = 120 * SEG

export const transcurrido = (p, ahora = Date.now()) => Math.max(0, ahora - p.creado + (p.adelantoMs || 0))

export function estadoEnvio(p, ahora = Date.now()) {
  const t = transcurrido(p, ahora)
  let etapa = 4
  for (let i = 0; i < 4; i++) {
    if (t < INICIO_ETAPA[i + 1]) {
      etapa = i
      break
    }
  }
  let recorrido = etapa === 4 ? 1 : 0
  let paradasHechas = etapa === 4 ? PARADAS : 0
  if (etapa === 3) {
    const tramo = (t - INICIO_ETAPA[3]) / POR_PARADA
    paradasHechas = Math.floor(tramo)
    recorrido = (paradasHechas + Math.min(1, (tramo - paradasHechas) / PARTE_EN_MARCHA)) / PARADAS
  }
  return {
    etapa,
    recorrido,
    paradasHechas,
    paradasRestantes: PARADAS - paradasHechas,
    minutosRestantes: Math.max(0, Math.ceil((INICIO_ETAPA[4] - t) / 60000)),
    cancelado: !!p.cancelado,
    // Como en la tienda real: se puede cancelar hasta que el paquete sale del almacén
    puedeCancelar: !p.cancelado && etapa < 2 && p.lineas.some((l) => !l.cancelada),
    puedeDevolver: !p.cancelado && etapa === 4 && p.lineas.some((l) => !l.cancelada && !l.devuelta),
  }
}

// Milisegundos que hay que adelantar para llegar al siguiente paso (o a la siguiente parada del reparto)
export function adelantoSiguientePaso(p, ahora = Date.now()) {
  const t = transcurrido(p, ahora)
  const { etapa } = estadoEnvio(p, ahora)
  if (etapa === 4) return 0
  if (etapa === 3) return INICIO_ETAPA[3] + POR_PARADA * (Math.floor((t - INICIO_ETAPA[3]) / POR_PARADA) + 1) - t
  return INICIO_ETAPA[etapa + 1] - t
}

export function instanteEtapa(p, etapa, ahora = Date.now()) {
  return new Date(Math.max(p.creado, Math.min(ahora, p.creado + INICIO_ETAPA[etapa] - (p.adelantoMs || 0))))
}

export const numeroSeguimiento = (id) => `TE${id.replace(/\D/g, '').slice(-9)}ES`

export function resumenEstado(p, ahora = Date.now()) {
  const e = estadoEnvio(p, ahora)
  const llegada = fechaLarga(new Date(p.entrega.fecha))
  const dev = p.devoluciones?.[0]
  if (e.cancelado) return { titulo: 'Cancelado', detalle: `Reembolso de ${euros(p.reembolsado || 0)} en tu saldo`, tono: 'gris', e }
  if (dev)
    return dev.reembolsada
      ? { titulo: 'Reembolso emitido', detalle: `Se han devuelto ${euros(dev.importe)} a tu saldo`, tono: 'gris', e }
      : { titulo: 'Devolución iniciada', detalle: 'Tu reembolso se procesará cuando recibamos el producto.', tono: 'gris', e }
  if (e.etapa === 4) return { titulo: `Entregado el ${fechaCorta(instanteEtapa(p, 4, ahora))}`, detalle: 'Se ha dejado en tu dirección', tono: 'normal', e }
  if (e.etapa === 3)
    return { titulo: 'Llega hoy', detalle: e.paradasRestantes > 1 ? `En reparto: a ${e.paradasRestantes} paradas` : 'En reparto: tu entrega es la siguiente', tono: 'verde', e }
  return { titulo: `Llega el ${llegada}`, detalle: ETAPAS[e.etapa], tono: 'verde', e }
}

// ---------- Métodos de pago ----------
export function nombreMetodo(m) {
  if (!m) return ''
  if (m.tipo === 'bizum') return `Bizum, móvil terminado en ${m.ultimos4}`
  if (m.tipo === 'cuenta') return `Cuenta bancaria terminada en ${m.ultimos4}`
  if (m.tipo === 'debito') return `Tarjeta de débito terminada en ${m.ultimos4}`
  if (m.tipo === 'credito') return `Tarjeta de crédito terminada en ${m.ultimos4}`
  return `Tarjeta terminada en ${m.ultimos4}`
}

export function nombreCortoMetodo(m) {
  if (!m) return ''
  if (m.tipo === 'bizum') return `Bizum •••• ${m.ultimos4}`
  if (m.tipo === 'cuenta') return `Cuenta •••• ${m.ultimos4}`
  if (m.tipo === 'debito') return `Débito •••• ${m.ultimos4}`
  if (m.tipo === 'credito') return `Crédito •••• ${m.ultimos4}`
  return `Tarjeta •••• ${m.ultimos4}`
}

// Las cifras finales del dato escrito; si no hay cifras (vale cualquier cosa), se inventan
export function ultimasCifras(texto) {
  const n = String(texto).replace(/\D/g, '')
  return n.length >= 4 ? n.slice(-4) : String(Math.floor(1000 + Math.random() * 9000))
}

// Algoritmo de Luhn: si un número lo cumple, podría ser una tarjeta de verdad
export function pareceTarjetaReal(numero) {
  const n = String(numero).replace(/\D/g, '')
  if (n.length < 13 || n.length > 19) return false
  let suma = 0
  for (let i = 0; i < n.length; i++) {
    let d = +n[n.length - 1 - i]
    if (i % 2) {
      d *= 2
      if (d > 9) d -= 9
    }
    suma += d
  }
  return suma % 10 === 0
}

// ---------- Búsqueda ----------
const normalizar = (s) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')

const VACIAS = new Set(['de', 'del', 'la', 'el', 'los', 'las', 'y', 'con', 'para', 'en', 'un', 'una', 'por', 'a'])
const raiz = (p) => (p.length > 4 && p.endsWith('es') ? p.slice(0, -2) : p.length > 3 && p.endsWith('s') ? p.slice(0, -1) : p)

// Palabras con las que la gente busca y que no aparecen en el título
const ETIQUETAS = {
  p01: 'cascos musica electronica',
  p02: 'telefono smartphone',
  p03: 'ropa hombre',
  p04: 'cocina electrodomestico',
  p05: 'cafe electrodomestico',
  p06: 'novela lectura',
  p07: 'calzado caminar',
  p08: 'despensa',
  p09: 'tension medico',
  p10: 'calor textil',
  p11: 'musica transistor',
  p12: 'plantas riego',
  p13: 'juego mesa',
  p14: 'chaqueta jersey ropa mujer hombre',
  p15: 'cocina recetas',
  p16: 'bici ciclismo',
  p17: 'despensa dulce',
  p18: 'pastillas medicinas',
  p19: 'herramientas bricolaje',
  p20: 'juego mesa fichas',
}
const texto = Object.fromEntries(productosTE.map((p) => [p.id, normalizar(`${p.titulo} ${p.tituloCorto} ${p.categoria} ${p.marca} ${ETIQUETAS[p.id] || ''}`)]))

export const CATEGORIAS_TE = [...new Set(productosTE.map((p) => p.categoria))]

export function buscarProductos(k) {
  const q = normalizar((k || '').trim())
  if (!q || q === 'todo') return productosTE
  if (q.startsWith('ofertas')) return productosTE.filter((p) => descuento(p) > 0)
  const categoria = CATEGORIAS_TE.find((c) => normalizar(c) === q)
  if (categoria) return productosTE.filter((p) => p.categoria === categoria)
  const palabras = q.split(/[^a-z0-9]+/).filter((w) => w && !VACIAS.has(w)).map(raiz)
  if (!palabras.length) return productosTE
  return productosTE.filter((p) => palabras.every((w) => texto[p.id].includes(w)))
}

export const FILTROS_TE = {
  'Ofertas del día': (p) => descuento(p) > 0,
  'Envío gratis': (p) => !p.costeEnvio,
  '4 estrellas o más': (p) => p.valoracion >= 4,
  'Recíbelo mañana': (p) => p.diasEntrega === 1,
  'Vendido por Todoenvío': (p) => !p.vendedor.externo,
  'Hasta 25 €': (p) => p.precio <= 25,
  'De 25 € a 100 €': (p) => p.precio > 25 && p.precio <= 100,
  'Más de 100 €': (p) => p.precio > 100,
}

// ---------- Correos que genera cada pedido ----------
export function correosPedidoTE(p, ahora = Date.now()) {
  const e = estadoEnvio(p, ahora)
  const producto = p.lineas[0].titulo + (p.lineas.length > 1 ? ` y ${p.lineas.length - 1} más` : '')
  const lista = []
  if (e.cancelado || p.cancelaciones?.length) {
    for (const [i, c] of (p.cancelaciones || []).entries())
      lista.push({ id: `${p.id}~cancelado${i}`, tipo: 'cancelado', asunto: `Cancelación del pedido ${p.id}`, fecha: new Date(c.fecha), resumen: `Se han cancelado productos. Reembolso: ${euros(c.importe)}`, pedido: p, datos: c })
  }
  const paradoEn = p.cancelado ? 1 : e.etapa
  if (paradoEn >= 2) lista.push({ id: `${p.id}~enviado`, tipo: 'enviado', asunto: `Enviado: ${producto}`, fecha: instanteEtapa(p, 2, ahora), resumen: 'Tu paquete ya está en camino', pedido: p })
  if (paradoEn >= 3) lista.push({ id: `${p.id}~reparto`, tipo: 'reparto', asunto: `En reparto: ${producto}`, fecha: instanteEtapa(p, 3, ahora), resumen: 'Tu paquete llega hoy. Sigue la furgoneta en el mapa', pedido: p })
  if (paradoEn >= 4) lista.push({ id: `${p.id}~entregado`, tipo: 'entregado', asunto: `Entregado: ${producto}`, fecha: instanteEtapa(p, 4, ahora), resumen: 'Tu paquete se ha entregado', pedido: p })
  for (const [i, d] of (p.devoluciones || []).entries()) {
    lista.push({ id: `${p.id}~devolucion${i}`, tipo: 'devolucion', asunto: `Devolución del pedido ${p.id}`, fecha: new Date(d.fecha), resumen: `Instrucciones para devolver tu producto. Reembolso previsto: ${euros(d.importe)}`, pedido: p, datos: d })
    if (d.reembolsada)
      lista.push({ id: `${p.id}~reembolso${i}`, tipo: 'reembolso', asunto: `Reembolso emitido del pedido ${p.id}`, fecha: new Date(d.fechaReembolso), resumen: `Te hemos devuelto ${euros(d.importe)}`, pedido: p, datos: d })
  }
  return lista
}
