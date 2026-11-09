import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CODIGO_REGALO, ESPERA_REEMBOLSO, IMPORTE_REGALO, SALDO_INICIAL, adelantoSiguientePaso, nombreMetodo, redondear } from '../lib/todoenvio'

const TE = 'todoenvio'

// Datos que pertenecen a cada cuenta (en Todoenvío, cada cuenta tiene los suyos)
const datosCuenta = () => ({
  metodosPago: [], // { id, tipo: 'credito'|'debito'|'bizum'|'cuenta', ultimos4, titular, caducidad } Nunca se guarda el número completo ni el CVV
  saldo: null, // null hasta que se añade el primer método de pago
  movimientos: [], // transacciones de la cartera
  direcciones: [],
  direccion: null, // dirección seleccionada
  pago: null, // método de pago seleccionado (el predeterminado)
  entrega: null, // opción de entrega elegida
  pedidos: [],
  correosCuenta: [], // correos de alta de la cuenta
  codigosRegalo: [],
})
const CAMPOS_CUENTA = Object.keys(datosCuenta())

// Estado de cada tienda. Todo se guarda en el navegador (localStorage).
const tiendaInicial = () => ({
  ...datosCuenta(),
  carrito: [], // { clave, id, cantidad, opciones: { Color: 'Azul', Talla: 'L' } }
  guardados: [], // «Guardado para más tarde»
  cuentas: [], // cuentas ficticias creadas: { nombre, email }
  perfiles: {}, // datos de las cuentas que no tienen la sesión iniciada
  usuario: null, // cuenta con la sesión iniciada
  invitado: null, // { email } si se compra como invitado
  comprador: null, // datos del comprador (Galerías Olmo)
  recogida: null, // tienda de recogida (Galerías Olmo)
  modoEntrega: 'envio', // 'envio' | 'recogida'
  compraYa: null, // compra directa de un solo producto (botón «Comprar ya»)
})

const estadoInicial = () => ({
  voz: true,
  notasVistas: {},
  tiendas: { todoenvio: tiendaInicial(), galerias: tiendaInicial() },
})

export const claveLinea = (id, opciones = {}) => id + '|' + Object.entries(opciones).map(([k, v]) => `${k}:${v}`).join(';')

const nuevoId = (prefijo) => prefijo + Date.now().toString(36) + Math.floor(Math.random() * 1296).toString(36)
const claveCuenta = (email) => email.trim().toLowerCase()
const movimiento = (datos) => ({ id: nuevoId('mv'), fecha: Date.now(), ...datos })

// Al cambiar de cuenta se guardan los datos de la anterior y se cargan los de la nueva
function cambioDeCuenta(t, usuario) {
  const perfiles = { ...t.perfiles }
  if (t.usuario) perfiles[claveCuenta(t.usuario.email)] = Object.fromEntries(CAMPOS_CUENTA.map((c) => [c, t[c]]))
  const datos = (usuario && perfiles[claveCuenta(usuario.email)]) || datosCuenta()
  return { ...datos, perfiles, usuario, invitado: null }
}

const importeLineas = (p, indices) => redondear(indices.reduce((s, i) => s + p.lineas[i].precio * p.lineas[i].cantidad, 0))

export const useSim = create(
  persist(
    (set, get) => {
      const tienda = (nombre) => get().tiendas[nombre]
      const actualizar = (nombre, cambios) =>
        set((s) => ({ tiendas: { ...s.tiendas, [nombre]: { ...s.tiendas[nombre], ...cambios } } }))
      const cambiarPedido = (id, cambios) =>
        actualizar(TE, { pedidos: tienda(TE).pedidos.map((p) => (p.id === id ? { ...p, ...(typeof cambios === 'function' ? cambios(p) : cambios) } : p)) })
      // Devuelve dinero al saldo y lo anota en las transacciones
      const reembolsar = (t, importe, concepto, pedidoId, metodo) => ({
        saldo: redondear((t.saldo || 0) + importe),
        movimientos: [movimiento({ concepto, importe, estado: 'Reembolsado', metodo, pedidoId }), ...t.movimientos],
      })

      return {
        ...estadoInicial(),

        alternarVoz: () => set((s) => ({ voz: !s.voz })),
        marcarNotaVista: (id) => set((s) => ({ notasVistas: { ...s.notasVistas, [id]: true } })),

        actualizar,

        anadirACesta: (nombre, id, opciones = {}, cantidad = 1) => {
          const t = tienda(nombre)
          const clave = claveLinea(id, opciones)
          const existe = t.carrito.find((l) => l.clave === clave)
          const carrito = existe
            ? t.carrito.map((l) => (l.clave === clave ? { ...l, cantidad: Math.min(10, l.cantidad + cantidad) } : l))
            : [...t.carrito, { clave, id, opciones, cantidad }]
          actualizar(nombre, { carrito })
        },

        cambiarCantidad: (nombre, clave, cantidad) => {
          const t = tienda(nombre)
          const carrito =
            cantidad <= 0
              ? t.carrito.filter((l) => l.clave !== clave)
              : t.carrito.map((l) => (l.clave === clave ? { ...l, cantidad: Math.min(10, cantidad) } : l))
          actualizar(nombre, { carrito })
        },

        eliminarDeCesta: (nombre, clave) => get().cambiarCantidad(nombre, clave, 0),

        guardarParaMasTarde: (clave) => {
          const t = tienda(TE)
          const linea = t.carrito.find((l) => l.clave === clave)
          if (!linea) return
          actualizar(TE, { carrito: t.carrito.filter((l) => l.clave !== clave), guardados: [linea, ...t.guardados.filter((l) => l.clave !== clave)] })
        },

        moverACesta: (clave) => {
          const t = tienda(TE)
          const linea = t.guardados.find((l) => l.clave === clave)
          if (!linea) return
          actualizar(TE, { guardados: t.guardados.filter((l) => l.clave !== clave) })
          get().anadirACesta(TE, linea.id, linea.opciones, linea.cantidad)
        },

        eliminarGuardado: (clave) => actualizar(TE, { guardados: tienda(TE).guardados.filter((l) => l.clave !== clave) }),

        registrar: (nombre, nombreCompleto, email) => {
          const t = tienda(nombre)
          const cuentas = [...t.cuentas.filter((c) => c.email.toLowerCase() !== email.toLowerCase()), { nombre: nombreCompleto, email }]
          const usuario = { nombre: nombreCompleto, email }
          actualizar(nombre, nombre === TE ? { cuentas, ...cambioDeCuenta(t, usuario) } : { cuentas, usuario, invitado: null })
        },

        iniciarSesion: (nombre, email) => {
          const t = tienda(nombre)
          const cuenta = t.cuentas.find((c) => c.email.toLowerCase() === email.toLowerCase())
          const usuario = cuenta || { nombre: email.split('@')[0], email }
          actualizar(nombre, nombre === TE ? cambioDeCuenta(t, usuario) : { usuario, invitado: null })
        },

        cerrarSesion: (nombre) => actualizar(nombre, nombre === TE ? cambioDeCuenta(tienda(TE), null) : { usuario: null, invitado: null }),

        anadirCorreoCuenta: (correo) => actualizar(TE, { correosCuenta: [{ id: nuevoId('cc'), fecha: Date.now(), ...correo }, ...tienda(TE).correosCuenta] }),

        // ---------- Cartera ----------
        // Con el primer método de pago se reciben los 500 € de prácticas. Devuelve si ha sido el primero.
        anadirMetodoPago: (datos) => {
          const t = tienda(TE)
          const metodo = { ...datos, id: nuevoId('mp') }
          const primero = t.saldo === null
          actualizar(TE, {
            metodosPago: [...t.metodosPago, metodo],
            pago: metodo,
            saldo: primero ? SALDO_INICIAL : t.saldo,
            movimientos: primero
              ? [movimiento({ concepto: 'Saldo de prácticas del simulador', importe: SALDO_INICIAL, estado: 'Abonado', metodo: nombreMetodo(metodo) }), ...t.movimientos]
              : t.movimientos,
          })
          return primero
        },

        elegirMetodoPago: (id) => {
          const t = tienda(TE)
          actualizar(TE, { pago: t.metodosPago.find((m) => m.id === id) || t.pago })
        },

        eliminarMetodoPago: (id) => {
          const t = tienda(TE)
          const metodosPago = t.metodosPago.filter((m) => m.id !== id)
          actualizar(TE, { metodosPago, pago: t.pago?.id === id ? metodosPago[0] || null : t.pago })
        },

        // Devuelve true si el código era válido y aún no se había usado
        canjearRegalo: (codigo) => {
          const t = tienda(TE)
          const c = codigo.trim().toUpperCase()
          if (c !== CODIGO_REGALO || t.codigosRegalo.includes(c) || t.saldo === null) return false
          actualizar(TE, {
            codigosRegalo: [...t.codigosRegalo, c],
            saldo: redondear(t.saldo + IMPORTE_REGALO),
            movimientos: [movimiento({ concepto: 'Tarjeta regalo canjeada', importe: IMPORTE_REGALO, estado: 'Abonado', metodo: 'Tarjeta regalo' }), ...t.movimientos],
          })
          return true
        },

        // ---------- Direcciones ----------
        guardarDireccion: (datos) => {
          const t = tienda(TE)
          const direccion = datos.id ? datos : { ...datos, id: nuevoId('dir') }
          const existe = t.direcciones.some((d) => d.id === direccion.id)
          actualizar(TE, {
            direcciones: existe ? t.direcciones.map((d) => (d.id === direccion.id ? direccion : d)) : [...t.direcciones, direccion],
            direccion,
          })
        },

        elegirDireccion: (id) => {
          const t = tienda(TE)
          actualizar(TE, { direccion: t.direcciones.find((d) => d.id === id) || t.direccion })
        },

        eliminarDireccion: (id) => {
          const t = tienda(TE)
          const direcciones = t.direcciones.filter((d) => d.id !== id)
          actualizar(TE, { direcciones, direccion: t.direccion?.id === id ? direcciones[0] || null : t.direccion })
        },

        // ---------- Pedidos ----------
        crearPedido: (nombre, pedido) => {
          const t = tienda(nombre)
          const cambios = { pedidos: [pedido, ...t.pedidos], compraYa: null }
          if (!pedido.esCompraYa) cambios.carrito = []
          if (nombre === TE) {
            cambios.saldo = redondear(t.saldo - pedido.total)
            cambios.movimientos = [movimiento({ concepto: 'Compra en Todoenvío', importe: -pedido.total, estado: 'Cobrado', metodo: nombreMetodo(pedido.pago), pedidoId: pedido.id }), ...t.movimientos]
          }
          actualizar(nombre, cambios)
        },

        // Galerías Olmo: avance por pasos
        avanzarPedido: (nombre, id) => {
          const t = tienda(nombre)
          actualizar(nombre, {
            pedidos: t.pedidos.map((p) => (p.id === id ? { ...p, avancesManuales: (p.avancesManuales || 0) + 1 } : p)),
          })
        },

        // Todoenvío: salta al siguiente paso o a la siguiente parada de la furgoneta
        avanzarEnvio: (id) => cambiarPedido(id, (p) => ({ adelantoMs: (p.adelantoMs || 0) + adelantoSiguientePaso(p) + 1 })),

        actualizarPedido: (id, cambios) => cambiarPedido(id, cambios),

        cancelarLineas: (id, indices, motivo) => {
          const t = tienda(TE)
          const p = t.pedidos.find((x) => x.id === id)
          const validos = indices.filter((i) => !p.lineas[i].cancelada)
          if (!validos.length) return 0
          const lineas = p.lineas.map((l, i) => (validos.includes(i) ? { ...l, cancelada: true } : l))
          const todas = lineas.every((l) => l.cancelada)
          // Si se cancela todo el pedido se devuelven también los gastos de envío
          const importe = redondear(importeLineas(p, validos) + (todas ? p.envio : 0))
          const fecha = Date.now()
          const pedidos = t.pedidos.map((x) =>
            x.id === id
              ? {
                  ...x,
                  lineas,
                  cancelado: todas ? { fecha, motivo } : x.cancelado,
                  reembolsado: redondear((x.reembolsado || 0) + importe),
                  cancelaciones: [...(x.cancelaciones || []), { fecha, motivo, importe, titulos: validos.map((i) => p.lineas[i].titulo) }],
                }
              : x,
          )
          actualizar(TE, { pedidos, ...reembolsar(t, importe, 'Cancelación de pedido', id, nombreMetodo(p.pago)) })
          return importe
        },

        iniciarDevolucion: (id, indices, motivo, metodo) => {
          const importe = importeLineas(tienda(TE).pedidos.find((x) => x.id === id), indices)
          cambiarPedido(id, (p) => ({
            lineas: p.lineas.map((l, i) => (indices.includes(i) ? { ...l, devuelta: true } : l)),
            devoluciones: [...(p.devoluciones || []), { fecha: Date.now(), motivo, metodo, indices, importe, titulos: indices.map((i) => p.lineas[i].titulo), reembolsada: false }],
          }))
          return importe
        },

        // Emite los reembolsos de las devoluciones ya «recibidas» (pasado un rato, o al momento si se fuerza un pedido)
        procesarDevoluciones: (forzarId = null, ahora = Date.now()) => {
          const t = tienda(TE)
          let cambios = { saldo: t.saldo, movimientos: t.movimientos }
          let hubo = false
          const pedidos = t.pedidos.map((p) => {
            if (!p.devoluciones?.some((d) => !d.reembolsada && (p.id === forzarId || ahora - d.fecha >= ESPERA_REEMBOLSO))) return p
            const devoluciones = p.devoluciones.map((d) => {
              if (d.reembolsada || (p.id !== forzarId && ahora - d.fecha < ESPERA_REEMBOLSO)) return d
              hubo = true
              cambios = reembolsar({ ...t, ...cambios }, d.importe, 'Reembolso por devolución', p.id, nombreMetodo(p.pago))
              return { ...d, reembolsada: true, fechaReembolso: ahora }
            })
            const importe = devoluciones.filter((d) => d.reembolsada).reduce((s, d) => s + d.importe, 0)
            return { ...p, devoluciones, reembolsado: redondear(importe + (p.cancelaciones || []).reduce((s, c) => s + c.importe, 0)) }
          })
          if (hubo) actualizar(TE, { pedidos, ...cambios })
        },

        reiniciar: () => set({ ...estadoInicial(), voz: get().voz }),
      }
    },
    {
      name: 'simulador-compras-ciberaula-v1',
      // Completa con valores por defecto lo que guardó una versión anterior del simulador
      merge: (guardado, actual) => {
        if (!guardado) return actual
        const completar = (t = {}) => {
          const metodosPago = t.metodosPago ?? (t.pago ? [{ ...t.pago, id: t.pago.id || nuevoId('mp') }] : [])
          return {
            ...tiendaInicial(),
            ...t,
            metodosPago,
            pago: t.pago ? metodosPago.find((m) => m.ultimos4 === t.pago.ultimos4) || t.pago : null,
            saldo: t.saldo !== undefined ? t.saldo : t.pago ? SALDO_INICIAL : null,
            direcciones: t.direcciones ?? (t.direccion ? [{ ...t.direccion, id: t.direccion.id || nuevoId('dir') }] : []),
          }
        }
        return {
          ...actual,
          ...guardado,
          tiendas: { todoenvio: completar(guardado.tiendas?.todoenvio), galerias: { ...tiendaInicial(), ...guardado.tiendas?.galerias } },
        }
      },
    },
  ),
)

// Estados del seguimiento de Galerías Olmo. El pedido avanza solo (1 paso cada 2 minutos) o con el botón «Simular avance».
export const ESTADOS_PEDIDO = ['Pedido realizado', 'Preparando', 'Enviado', 'En reparto', 'Entregado']
export const MINUTOS_POR_ESTADO = 2

export function indiceEstado(pedido, ahora = Date.now()) {
  const porTiempo = Math.floor((ahora - pedido.creado) / (MINUTOS_POR_ESTADO * 60 * 1000))
  return Math.min(ESTADOS_PEDIDO.length - 1, Math.max(0, porTiempo) + (pedido.avancesManuales || 0))
}
