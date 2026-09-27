import { useEffect, useState } from 'react'
import { Check, CircleCheck, FastForward, Mail, Package, PackageCheck, Truck, Warehouse } from 'lucide-react'
import { Modal } from './Simulador'
import { useSim, ESTADOS_PEDIDO, MINUTOS_POR_ESTADO, indiceEstado } from '../../store/useSim'
import { hablar } from '../../lib/voz'
import { fechaLarga, hora } from '../../lib/formato'

export const TEXTO_EXITO =
  '¡Pedido realizado con éxito! En una compra real, en unos minutos recibirías un correo electrónico con el justificante de tu compra. Te recomendamos guardarlo por si necesitas hacer una devolución o reclamación.'

// Ventana que aparece al confirmar la compra
export function ExitoPedido({ onVerCorreo, onCerrar, colorBoton = 'bg-green-700 hover:bg-green-800' }) {
  useEffect(() => {
    if (useSim.getState().voz) {
      const t = setTimeout(() => hablar(TEXTO_EXITO), 300)
      return () => clearTimeout(t)
    }
  }, [])
  const [titulo, ...resto] = TEXTO_EXITO.split('! ')
  return (
    <Modal onCerrar={onCerrar} ancho="max-w-md">
      <div className="text-center" data-nota="justificante">
        <CircleCheck size={64} className="mx-auto text-green-700" aria-hidden />
        <h2 className="mt-2 text-2xl font-extrabold text-green-800">{titulo}!</h2>
        <p className="mt-3 text-lg leading-relaxed">{resto.join('! ')}</p>
        <button onClick={onVerCorreo} className={`mt-5 flex min-h-14 w-full items-center justify-center gap-2 rounded-xl text-lg font-bold text-white ${colorBoton}`}>
          <Mail /> Ver el correo con el justificante
        </button>
        <button onClick={onCerrar} className="mt-3 min-h-12 w-full rounded-xl border-2 border-slate-400 text-lg font-semibold">
          Cerrar
        </button>
      </div>
    </Modal>
  )
}

const ICONOS = [Check, Warehouse, Package, Truck, PackageCheck]

// Seguimiento del pedido: avanza solo con el tiempo o con el botón «Simular avance del pedido»
export function Seguimiento({ tienda, pedido, color = '#007600', claseBoton = '' }) {
  const avanzar = useSim((s) => s.avanzarPedido)
  const [, refrescar] = useState(0)
  useEffect(() => {
    const i = setInterval(() => refrescar((x) => x + 1), 5000)
    return () => clearInterval(i)
  }, [])
  const actual = indiceEstado(pedido)
  const llegada = new Date(pedido.entrega.fecha)
  return (
    <div data-nota="seguimiento">
      <ol className="relative mt-2">
        {ESTADOS_PEDIDO.map((e, i) => {
          const Icono = ICONOS[i]
          const hecho = i <= actual
          return (
            <li key={e} className="relative flex gap-3 pb-5 last:pb-0">
              {i < ESTADOS_PEDIDO.length - 1 && (
                <span className="absolute left-[19px] top-10 h-[calc(100%-2.5rem)] w-1 rounded" style={{ background: i < actual ? color : '#d5d9d9' }} />
              )}
              <span
                className="relative z-[1] flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-4"
                style={{ background: hecho ? color : '#fff', borderColor: hecho ? color : '#d5d9d9', color: hecho ? '#fff' : '#8a8f8f' }}
              >
                <Icono size={18} strokeWidth={2.5} />
              </span>
              <div className="pt-1.5">
                <p className={`text-[1.05rem] ${i === actual ? 'font-extrabold' : hecho ? 'font-semibold' : 'text-slate-500'}`}>{e}</p>
                {i === actual && i < 4 && <p className="text-sm text-slate-600">Estado actual</p>}
                {i === 0 && <p className="text-sm text-slate-600">{`${fechaLarga(new Date(pedido.creado))}, ${hora(new Date(pedido.creado))}`}</p>}
                {i === 4 && <p className="text-sm text-slate-600">{hecho ? 'Tu paquete se ha entregado' : `Llegada estimada: ${fechaLarga(llegada)}`}</p>}
              </div>
            </li>
          )
        })}
      </ol>
      {actual < 4 ? (
        <button
          onClick={() => avanzar(tienda, pedido.id)}
          className={`mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-indigo-500 bg-indigo-50 font-bold text-indigo-800 hover:bg-indigo-100 ${claseBoton}`}
        >
          <FastForward size={20} /> Simular avance del pedido
        </button>
      ) : (
        <p className="mt-3 rounded-lg bg-green-50 p-3 font-semibold text-green-900">Pedido entregado. Recuerda: tienes 14 días para devolverlo si no te convence.</p>
      )}
      <p className="mt-2 text-sm text-slate-600">
        En el simulador el pedido avanza solo un paso cada {MINUTOS_POR_ESTADO} minutos, o puedes pulsar el botón.
      </p>
    </div>
  )
}

export function textoEstado(pedido) {
  const i = indiceEstado(pedido)
  const llegada = fechaLarga(new Date(pedido.entrega.fecha))
  if (i === 4) return { titulo: 'Entregado', detalle: 'Tu paquete se ha entregado', i }
  if (i === 3) return { titulo: 'En reparto: llega hoy', detalle: 'El repartidor está de camino', i }
  return { titulo: `Llega el ${llegada}`, detalle: ESTADOS_PEDIDO[i], i }
}
