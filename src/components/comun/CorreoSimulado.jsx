import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Inbox, Mail, Printer, ShieldAlert, Star, TriangleAlert } from 'lucide-react'
import { Modal, useAvisoSimulador, useUrl } from './Simulador'
import { useNota, useNotas } from './Notas'
import { useSim } from '../../store/useSim'
import { euros, fechaCompleta, fechaLarga, hora, ivaIncluido, textoOpciones } from '../../lib/formato'
import { LogoGalerias, LogoTodoenvio } from './Logos'

const TIENDAS = {
  todoenvio: {
    nombre: 'Todoenvío',
    remitente: 'Todoenvío <confirmacion-pedido@todoenvio.es>',
    asunto: (p) => `Tu pedido de Todoenvío n.º ${p.id}`,
    Logo: () => <LogoTodoenvio alto={30} />,
    cabecera: 'bg-gradient-to-b from-[#f8d9b0] to-[#efbd84]',
    boton: 'bg-[#ffd814] text-[#0f1111] border border-[#f2c200]',
    pedidos: '/todoenvio/pedidos',
    textoPedidos: 'Ver o gestionar el pedido en «Mis pedidos»',
  },
  galerias: {
    nombre: 'Galerías Olmo',
    remitente: 'Galerías Olmo <pedidos@galeriasolmo.es>',
    asunto: (p) => `Confirmación de tu compra ${p.id} en Galerías Olmo`,
    Logo: () => <LogoGalerias alto={36} />,
    cabecera: 'bg-white border-b-4 border-[#0b7a3e]',
    boton: 'bg-black text-white',
    pedidos: '/galerias/mis-compras',
    textoPedidos: 'Consultar el estado en «Mis compras»',
  },
}

const FALSO = {
  id: 'falso',
  remitente: 'Aviso Entregas <notificacion@entregas-paquete-urgente.info>',
  asunto: '⚠ ÚLTIMO AVISO: Su paquete está retenido',
}

function Justificante({ tienda, pedido }) {
  const c = TIENDAS[tienda]
  const d = pedido.direccion
  const creado = new Date(pedido.creado)
  return (
    <article data-nota="justificante" className="overflow-hidden rounded-xl border border-slate-300 bg-white">
      <div className={`flex items-center justify-between px-5 py-4 ${c.cabecera}`}>
        <c.Logo />
        <span className="text-sm font-semibold">Confirmación de pedido</span>
      </div>
      <div className="space-y-4 p-5 text-[1.02rem] leading-relaxed">
        <p className="text-lg">
          Hola, <b>{pedido.nombre.split(' ')[0]}</b>:
        </p>
        <p>Gracias por tu compra. Hemos recibido tu pedido y te avisaremos cuando se envíe.</p>
        <div className="rounded-lg bg-slate-100 p-4">
          <p>
            <b>Número de pedido:</b> {pedido.id}
          </p>
          <p>
            <b>Fecha del pedido:</b> {fechaCompleta(creado)}, {hora(creado)}
          </p>
          <p>
            <b>{pedido.recogida ? 'Recogida estimada' : 'Entrega estimada'}:</b> <span className="first-letter:uppercase">{fechaLarga(new Date(pedido.entrega.fecha))}</span>
          </p>
          <p>
            <b>Forma de entrega:</b> {pedido.entrega.detalle}
          </p>
        </div>
        <div>
          <p className="font-bold">{pedido.recogida ? 'Recogida en:' : 'Se enviará a:'}</p>
          {pedido.recogida ? (
            <p>
              {pedido.recogida.nombre}
              <br />
              {pedido.recogida.direccion}
            </p>
          ) : (
            <p>
              {d.nombre}
              <br />
              {d.calle} {d.piso}
              <br />
              {d.codigoPostal} {d.localidad} ({d.provincia})
            </p>
          )}
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="border-b-2 border-slate-300">
              <th className="py-2">Producto</th>
              <th className="py-2 text-center">Cant.</th>
              <th className="py-2 text-right">Precio</th>
            </tr>
          </thead>
          <tbody>
            {pedido.lineas.map((l, i) => (
              <tr key={i} className="border-b border-slate-200 align-top">
                <td className="py-2 pr-2">
                  {l.titulo}
                  {Object.keys(l.opciones || {}).length > 0 && <span className="block text-sm text-slate-600">{textoOpciones(l.opciones)}</span>}
                  <span className="block text-sm text-slate-600">Vendido por: {l.vendedor}</span>
                </td>
                <td className="py-2 text-center">{l.cantidad}</td>
                <td className="py-2 text-right">{euros(l.precio * l.cantidad)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <dl className="ml-auto max-w-xs space-y-1">
          <div className="flex justify-between">
            <dt>Subtotal:</dt>
            <dd>{euros(pedido.subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Gastos de envío:</dt>
            <dd>{pedido.envio ? euros(pedido.envio) : 'Gratis'}</dd>
          </div>
          <div className="flex justify-between border-t border-slate-300 pt-1 text-lg font-extrabold">
            <dt>Total pagado:</dt>
            <dd>{euros(pedido.total)}</dd>
          </div>
          <p className="text-right text-sm text-slate-600">IVA incluido ({euros(ivaIncluido(pedido.total))})</p>
        </dl>
        <p>
          <b>Forma de pago:</b> tarjeta terminada en {pedido.pago.ultimos4}
        </p>
        <Link to={c.pedidos} className={`flex min-h-12 items-center justify-center rounded-full px-5 font-bold ${c.boton}`}>
          {c.textoPedidos}
        </Link>
        <p className="border-t border-slate-200 pt-3 text-sm text-slate-600">
          Tienes 14 días naturales desde la entrega para desistir de la compra. Conserva este correo como justificante. {c.nombre} nunca te pedirá tus
          contraseñas ni los datos de tu tarjeta por correo electrónico. (Mensaje ficticio generado por el simulador).
        </p>
      </div>
    </article>
  )
}

function CorreoFalso() {
  const [aviso, setAviso] = useState(false)
  const { leer } = useNotas()
  const explicacion =
    'Este correo es un intento de fraude. Fíjate: el remitente es una dirección extraña, mete prisa, pide un pago y te manda a un enlace. Nunca pulses en esos enlaces.'
  return (
    <article className="rounded-xl border border-slate-300 bg-white p-5 text-[1.02rem] leading-relaxed">
      <p className="text-2xl font-extrabold text-red-700">Su paquete está RETENIDO</p>
      <p className="mt-3">Estimado cliente:</p>
      <p>
        No hemos podido entregar su paquete porque hay <b>tasas de aduana pendientes de 1,99 €</b>. Si no paga en las próximas <b>24 horas</b>, el
        paquete será devuelto y perderá su compra.
      </p>
      <p className="mt-2">Introduzca los datos de su tarjeta en el siguiente enlace para liberar el envío:</p>
      <button
        onClick={() => {
          setAviso(true)
          leer(explicacion)
        }}
        className="mt-4 min-h-12 w-full rounded bg-red-600 px-4 text-lg font-bold text-white"
      >
        PAGAR AHORA Y RECIBIR MI PAQUETE
      </button>
      <p className="mt-3 text-sm text-slate-500">Departamento de Envíos · Este es un mensaje automático</p>
      {aviso && (
        <Modal titulo="¡Cuidado! Es un correo falso" onCerrar={() => setAviso(false)}>
          <div className="flex gap-3">
            <ShieldAlert size={40} className="shrink-0 text-red-700" aria-hidden />
            <div className="space-y-2 text-[1.05rem]">
              <p>
                En la vida real, <b>no pulses nunca</b> en este tipo de enlaces. Fíjate en las señales de alarma:
              </p>
              <ul className="list-disc space-y-1 pl-5">
                <li>El remitente es una dirección rara, que no es la de la tienda.</li>
                <li>Mete prisa («24 horas», «último aviso»).</li>
                <li>Pide un pago pequeño y los datos de tu tarjeta.</li>
                <li>No dice tu nombre ni el número de pedido.</li>
              </ul>
              <p>Si tienes dudas, entra tú mismo en la web de la tienda y revisa «Mis pedidos». Luego borra el correo.</p>
            </div>
          </div>
          <button onClick={() => setAviso(false)} className="mt-4 min-h-12 w-full rounded-xl bg-slate-900 text-lg font-bold text-white">
            Entendido
          </button>
        </Modal>
      )}
    </article>
  )
}

export default function CorreoSimulado({ tienda }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const avisar = useAvisoSimulador()
  const pedidos = useSim((s) => s.tiendas[tienda].pedidos)
  const c = TIENDAS[tienda]
  const pedidoAbierto = pedidos.find((p) => p.id === id)
  const email = pedidos[0]?.email || 'tu-correo@correo-ficticio.es'
  useUrl(`https://www.correo-ficticio.es/bandeja-de-entrada${id ? `/mensaje/${id === 'falso' ? '81723' : id.replace(/\D/g, '').slice(-5)}` : ''}`)
  useNota('correos-falsos', true, 1500)
  const base = `/${tienda}/correo`

  const mensajes = [
    ...pedidos.map((p) => ({ id: p.id, remitente: c.remitente, asunto: c.asunto(p), fecha: new Date(p.creado), resumen: `Gracias por tu pedido. Total: ${euros(p.total)}` })),
    { ...FALSO, fecha: new Date(Date.now() - 3600 * 1000 * 5), resumen: 'Pague las tasas pendientes en 24 horas o perderá su paquete...' },
  ].sort((a, b) => b.fecha - a.fecha)
  const abierto = id ? mensajes.find((m) => m.id === id) : null

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900">
      <header className="flex items-center gap-3 bg-sky-800 px-4 py-3 text-white">
        <Mail size={26} aria-hidden />
        <div className="min-w-0">
          <p className="text-lg font-bold">Correo Ficticio</p>
          <p className="truncate text-sm text-sky-100">{email}</p>
        </div>
      </header>
      <main className="mx-auto max-w-3xl p-3 pb-10">
        <div className="mb-3 rounded-lg bg-indigo-50 p-3 text-indigo-950 ring-1 ring-indigo-300">
          Este es un <b>correo simulado</b>. En una compra real recibirías el justificante en tu correo electrónico de verdad.
        </div>

        {!abierto && (
          <section data-nota="bandeja" className="overflow-hidden rounded-xl bg-white shadow">
            <h1 className="flex items-center gap-2 border-b border-slate-200 px-4 py-3 text-xl font-bold">
              <Inbox /> Bandeja de entrada
            </h1>
            <ul>
              {mensajes.map((m) => (
                <li key={m.id}>
                  <Link to={`${base}/${m.id}`} className="flex gap-3 border-b border-slate-100 px-4 py-3 hover:bg-slate-50">
                    <Star size={20} className="mt-1 shrink-0 text-slate-400" aria-hidden />
                    <div className="min-w-0 flex-1">
                      <p className="flex justify-between gap-2">
                        <b className="truncate">{m.remitente.split(' <')[0]}</b>
                        <span className="shrink-0 text-sm text-slate-600">{hora(m.fecha)}</span>
                      </p>
                      <p className="truncate font-semibold">{m.asunto}</p>
                      <p className="truncate text-slate-600">{m.resumen}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {abierto && (
          <div>
            <button onClick={() => navigate(base)} className="mb-3 flex min-h-11 items-center gap-2 font-semibold text-sky-800">
              <ArrowLeft /> Volver a la bandeja de entrada
            </button>
            <div className="mb-3 rounded-xl bg-white p-4 shadow">
              <h1 className="text-xl font-bold">{abierto.asunto}</h1>
              <p className="mt-1 break-all text-[0.98rem]">
                <b>De:</b> {abierto.remitente}
              </p>
              <p className="text-[0.98rem]">
                <b>Para:</b> {email}
              </p>
              {id === 'falso' && (
                <p className="mt-2 flex items-center gap-2 rounded bg-amber-50 p-2 text-amber-900">
                  <TriangleAlert size={18} /> ¿Reconoces este remitente? Revisa bien antes de pulsar enlaces.
                </p>
              )}
            </div>
            {id === 'falso' ? <CorreoFalso /> : <Justificante tienda={tienda} pedido={pedidoAbierto} />}
            {id !== 'falso' && (
              <button
                onClick={() => avisar('En tu correo real puedes guardar este mensaje en una carpeta, imprimirlo o descargarlo en PDF.')}
                className="mt-3 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border-2 border-slate-400 bg-white font-semibold"
              >
                <Printer /> Guardar o imprimir el justificante
              </button>
            )}
          </div>
        )}

        <Link to={c.pedidos} className="mt-5 flex min-h-12 items-center justify-center rounded-xl bg-slate-800 px-4 font-bold text-white">
          Volver a la tienda {c.nombre}
        </Link>
      </main>
    </div>
  )
}
