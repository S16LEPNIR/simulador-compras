import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Estado de cada tienda. Todo se guarda en el navegador (localStorage).
const tiendaInicial = () => ({
  carrito: [], // { clave, id, cantidad, opciones: { Color: 'Azul', Talla: 'L' } }
  cuentas: [], // cuentas ficticias creadas: { nombre, email }
  usuario: null, // cuenta con la sesión iniciada
  invitado: null, // { email } si se compra como invitado
  direccion: null,
  entrega: null, // opción de entrega elegida
  pago: null, // { tipo, ultimos4, titular }
  comprador: null, // datos del comprador (Galerías Olmo)
  recogida: null, // tienda de recogida (Galerías Olmo)
  modoEntrega: 'envio', // 'envio' | 'recogida'
  compraYa: null, // compra directa de un solo producto (botón «Comprar ya»)
  pedidos: [],
})

const estadoInicial = () => ({
  voz: true,
  notasVistas: {},
  tiendas: { todoenvio: tiendaInicial(), galerias: tiendaInicial() },
})

export const claveLinea = (id, opciones = {}) => id + '|' + Object.entries(opciones).map(([k, v]) => `${k}:${v}`).join(';')

export const useSim = create(
  persist(
    (set, get) => ({
      ...estadoInicial(),

      alternarVoz: () => set((s) => ({ voz: !s.voz })),
      marcarNotaVista: (id) => set((s) => ({ notasVistas: { ...s.notasVistas, [id]: true } })),

      actualizar: (tienda, cambios) =>
        set((s) => ({ tiendas: { ...s.tiendas, [tienda]: { ...s.tiendas[tienda], ...cambios } } })),

      anadirACesta: (tienda, id, opciones = {}, cantidad = 1) => {
        const t = get().tiendas[tienda]
        const clave = claveLinea(id, opciones)
        const existe = t.carrito.find((l) => l.clave === clave)
        const carrito = existe
          ? t.carrito.map((l) => (l.clave === clave ? { ...l, cantidad: Math.min(10, l.cantidad + cantidad) } : l))
          : [...t.carrito, { clave, id, opciones, cantidad }]
        get().actualizar(tienda, { carrito })
      },

      cambiarCantidad: (tienda, clave, cantidad) => {
        const t = get().tiendas[tienda]
        const carrito =
          cantidad <= 0
            ? t.carrito.filter((l) => l.clave !== clave)
            : t.carrito.map((l) => (l.clave === clave ? { ...l, cantidad: Math.min(10, cantidad) } : l))
        get().actualizar(tienda, { carrito })
      },

      eliminarDeCesta: (tienda, clave) => get().cambiarCantidad(tienda, clave, 0),

      registrar: (tienda, nombre, email) => {
        const t = get().tiendas[tienda]
        const cuentas = [...t.cuentas.filter((c) => c.email.toLowerCase() !== email.toLowerCase()), { nombre, email }]
        get().actualizar(tienda, { cuentas, usuario: { nombre, email }, invitado: null })
      },

      iniciarSesion: (tienda, email) => {
        const t = get().tiendas[tienda]
        const cuenta = t.cuentas.find((c) => c.email.toLowerCase() === email.toLowerCase())
        get().actualizar(tienda, { usuario: cuenta || { nombre: email.split('@')[0], email }, invitado: null })
      },

      cerrarSesion: (tienda) => get().actualizar(tienda, { usuario: null, invitado: null }),

      crearPedido: (tienda, pedido) => {
        const t = get().tiendas[tienda]
        const cambios = { pedidos: [pedido, ...t.pedidos], compraYa: null }
        if (!pedido.esCompraYa) cambios.carrito = []
        get().actualizar(tienda, cambios)
      },

      avanzarPedido: (tienda, id) => {
        const t = get().tiendas[tienda]
        get().actualizar(tienda, {
          pedidos: t.pedidos.map((p) => (p.id === id ? { ...p, avancesManuales: (p.avancesManuales || 0) + 1 } : p)),
        })
      },

      reiniciar: () => set({ ...estadoInicial(), voz: get().voz }),
    }),
    { name: 'simulador-compras-ciberaula-v1' },
  ),
)

// Estados del seguimiento. El pedido avanza solo (1 paso cada 2 minutos) o con el botón «Simular avance».
export const ESTADOS_PEDIDO = ['Pedido realizado', 'Preparando', 'Enviado', 'En reparto', 'Entregado']
export const MINUTOS_POR_ESTADO = 2

export function indiceEstado(pedido, ahora = Date.now()) {
  const porTiempo = Math.floor((ahora - pedido.creado) / (MINUTOS_POR_ESTADO * 60 * 1000))
  return Math.min(ESTADOS_PEDIDO.length - 1, Math.max(0, porTiempo) + (pedido.avancesManuales || 0))
}
