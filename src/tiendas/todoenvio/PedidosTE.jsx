import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowRight, Bell, ChevronDown, ChevronRight, CircleCheck, FastForward, Mail, MapPin, QrCode, Search, Settings, Truck, UserRound } from 'lucide-react'
import { Modal, Recordatorio, useAvisoSimulador, useUrl } from '../../components/comun/Simulador'
import { useNota, useNotas } from '../../components/comun/Notas'
import { ExitoPedido } from '../../components/comun/Pedido'
import { useSim } from '../../store/useSim'
import { euros, fechaCompleta, fechaCorta, fechaLarga, textoOpciones } from '../../lib/formato'
import { estadoEnvio, nombreMetodo, resumenEstado } from '../../lib/todoenvio'
import { BASE, DOMINIO, T, useTienda } from './comun'

export function ConfirmacionTE() {
  const { id } = useParams()
  const t = useTienda()
  const navigate = useNavigate()
  const { mostrar } = useNotas()
  const [modal, setModal] = useState(true)
  const p = t.pedidos.find((x) => x.id === id)
  useUrl(`${DOMINIO}/gp/buy/thankyou/handlers/display.html?orderId=${id}`)
  if (!p) return <p className="p-6">No se ha encontrado el pedido.</p>
  const cerrar = () => {
    setModal(false)
    mostrar('justificante')
    mostrar('movimientos-banco')
  }
  return (
    <div className="space-y-3 bg-white p-4">
      <Recordatorio />
      <div className="rounded-xl border-2 border-te-verde p-4">
        <p className="flex items-center gap-2 text-2xl font-extrabold text-te-verde">
          <CircleCheck size={30} aria-hidden /> Pedido realizado, gracias.
        </p>
        <p className="mt-2 text-lg">Se ha enviado la confirmación a {p.email}.</p>
        <p className="mt-3 text-lg"><b>Número de pedido:</b> {p.id}</p>
        <p className="text-lg"><b>Llegada:</b> <span className="text-te-verde first-letter:uppercase">{fechaLarga(new Date(p.entrega.fecha))}</span></p>
        <p className="text-lg"><b>Enviar a:</b> {p.direccion.nombre}, {p.direccion.calle}, {p.direccion.localidad}</p>
        <p className="text-lg"><b>Total:</b> {euros(p.total)}</p>
        <p className="text-lg"><b>Te quedan:</b> {euros(t.saldo)} de saldo de prácticas</p>
      </div>
      <Link to={`${BASE}/seguimiento/${p.id}`} className="te-btn-amarillo flex min-h-12 w-full items-center justify-center gap-2 rounded-full">
        <Truck size={20} aria-hidden /> Seguir el paquete
      </Link>
      <button onClick={() => navigate(`${BASE}/correo/${p.id}`)} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-slate-400">
        <Mail size={20} aria-hidden /> Ver el correo con el justificante
      </button>
      <Link to={`${BASE}/pedidos/${p.id}`} className="flex min-h-12 w-full items-center justify-center rounded-full border border-slate-400">
        Revisar o gestionar tus pedidos
      </Link>
      <Link to={BASE} className="flex min-h-12 w-full items-center justify-center text-te-enlace hover:underline">
        Seguir comprando
      </Link>
      {modal && <ExitoPedido onCerrar={cerrar} onVerCorreo={() => navigate(`${BASE}/correo/${p.id}`)} colorBoton="bg-[#1b2a41] hover:bg-black" />}
    </div>
  )
}

export function CuentaTE() {
  const t = useTienda()
  const cerrarSesion = useSim((s) => s.cerrarSesion)
  const avisar = useAvisoSimulador()
  const navigate = useNavigate()
  const [perfil, setPerfil] = useState(false)
  useUrl(`${DOMINIO}/gp/css/homepage.html`)
  const salir = () => {
    cerrarSesion(T)
    navigate(BASE)
  }
  if (!t.usuario)
    return (
      <div className="p-4">
        <h1 className="text-2xl font-extrabold">Tu cuenta</h1>
        <p className="mt-2 text-lg">Identifícate para ver tus pedidos y gestionar tu cuenta.</p>
        <button onClick={() => navigate(`${BASE}/identificacion`)} className="te-btn-amarillo mt-4 min-h-12 w-full rounded-full text-[1.05rem]">
          Identifícate
        </button>
        <p className="mt-3 text-center">
          ¿Eres un cliente nuevo?{' '}
          <Link to={`${BASE}/identificacion`} className="text-te-enlace hover:underline">Empieza aquí</Link>
        </p>
      </div>
    )
  const AJUSTES = [
    ['Sus pagos', `${BASE}/cartera`],
    ['Sus direcciones', `${BASE}/direcciones`],
    ['Inicio de sesión y seguridad'],
    ['Preferencias de compra', `${BASE}/cartera`],
    ['Saldo de la tarjeta regalo', `${BASE}/tarjeta-regalo`],
    ['Historial de búsqueda'],
  ]
  return (
    <div className="p-4">
      <div className="flex items-center justify-between">
        <button onClick={() => setPerfil(true)} className="flex min-h-11 items-center gap-2 text-xl">
          <UserRound className="rounded-full bg-slate-200 p-1" size={34} aria-hidden /> Hola, <b>{t.usuario.nombre.split(' ')[0]}</b> <ChevronDown size={18} aria-hidden />
        </button>
        <div className="flex gap-1">
          <button onClick={() => avisar()} className="rounded-full p-2 hover:bg-slate-100" aria-label="Ajustes"><Settings /></button>
          <button onClick={() => navigate(`${BASE}/correo`)} className="rounded-full p-2 hover:bg-slate-100" aria-label="Notificaciones"><Bell /></button>
        </div>
      </div>
      <div className="ocultar-scroll mt-3 flex gap-2 overflow-x-auto">
        {[
          ['Pedidos', `${BASE}/pedidos`],
          ['Volver a comprar', `${BASE}/pedidos`],
          ['Cuenta', `${BASE}/cartera`],
          ['Listas', null],
        ].map(([x, to]) => (
          <button key={x} onClick={() => (to ? navigate(to) : avisar())} className="min-h-11 shrink-0 rounded-full border border-slate-400 px-5">{x}</button>
        ))}
      </div>

      <Link to={`${BASE}/pedidos`} className="mt-5 flex items-center justify-between">
        <h2 className="text-2xl font-extrabold">Mis pedidos</h2>
        <ArrowRight aria-hidden />
      </Link>
      {t.pedidos.length ? (
        <div className="ocultar-scroll mt-2 flex gap-3 overflow-x-auto">
          {t.pedidos.flatMap((p) =>
            p.lineas.map((l, i) => (
              <Link key={p.id + i} to={`${BASE}/pedidos/${p.id}`} className="flex h-36 w-36 shrink-0 items-center justify-center rounded-lg border border-slate-300 p-2">
                <img src={l.imagen} alt={l.titulo} className="max-h-full object-contain" />
              </Link>
            )),
          )}
        </div>
      ) : (
        <p className="mt-2 text-te-gris">Todavía no has hecho ningún pedido.</p>
      )}

      <h2 className="mt-6 text-2xl font-extrabold">Configuración de la cuenta</h2>
      <ul className="mt-2 overflow-hidden rounded-xl bg-[#f0f2f2]">
        {AJUSTES.map(([x, to]) => (
          <li key={x} className="border-b border-white last:border-0">
            <button onClick={() => (to ? navigate(to) : avisar())} className="flex min-h-14 w-full items-center justify-between px-4 text-left text-[1.05rem]">
              {x} <ChevronRight size={20} aria-hidden />
            </button>
          </li>
        ))}
      </ul>
      <button onClick={salir} className="mt-6 min-h-12 w-full rounded-full border border-slate-400 text-[1.05rem]">Cerrar sesión</button>

      {perfil && (
        <Modal titulo="¿Quién está comprando?" onCerrar={() => setPerfil(false)}>
          <p className="flex items-center gap-3">
            <UserRound className="rounded-full bg-sky-200 p-1.5" size={44} aria-hidden />
            <span><b className="block">{t.usuario.nombre.split(' ')[0]}</b><span className="text-te-gris">Titular de la cuenta</span></span>
          </p>
          <p className="mt-4 text-center text-sm text-te-gris">Sesión iniciada como {t.usuario.email}</p>
          <button onClick={() => { cerrarSesion(T); navigate(`${BASE}/identificacion`) }} className="mt-2 min-h-12 w-full rounded-full border border-slate-400">Cambiar de cuenta</button>
          <button onClick={salir} className="mt-2 min-h-11 w-full text-te-enlace">Cerrar sesión</button>
        </Modal>
      )}
    </div>
  )
}

const FILTROS_PEDIDOS = {
  Todos: () => true,
  'En curso': (p, e) => !e.cancelado && e.etapa < 4,
  Entregados: (p, e) => !e.cancelado && e.etapa === 4,
  Cancelados: (p, e) => e.cancelado,
}

export function PedidosTE() {
  const t = useTienda()
  const [texto, setTexto] = useState('')
  const [filtro, setFiltro] = useState('Todos')
  useUrl(`${DOMINIO}/gp/css/order-history`)
  useNota('seguimiento', t.pedidos.length > 0)
  const q = texto.trim().toLowerCase()
  const lista = t.pedidos.filter((p) => FILTROS_PEDIDOS[filtro](p, estadoEnvio(p)) && (!q || p.lineas.some((l) => l.titulo.toLowerCase().includes(q)) || p.id.includes(q)))
  const conDevolucion = t.pedidos.filter((p) => p.devoluciones?.some((d) => !d.reembolsada))
  const comprados = [...new Map(t.pedidos.flatMap((p) => p.lineas).map((l) => [l.id, l])).values()]
  return (
    <div className="p-4">
      <h1 className="text-2xl font-extrabold">Mis pedidos</h1>
      <div className="mt-3 border-b border-slate-300 pb-3">
        <label className="flex items-center gap-2 rounded-lg border border-slate-400 px-3">
          <Search size={20} className="text-te-enlace" aria-hidden />
          <input value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Buscar todos los pedidos" className="min-h-11 w-full outline-none" aria-label="Buscar todos los pedidos" />
        </label>
        <div className="ocultar-scroll mt-2 flex gap-2 overflow-x-auto">
          {Object.keys(FILTROS_PEDIDOS).map((f) => (
            <button key={f} onClick={() => setFiltro(f)} aria-pressed={filtro === f} className={`min-h-10 shrink-0 rounded-lg border px-3 ${filtro === f ? 'border-[#007185] bg-[#edfdff] font-bold' : 'border-slate-400'}`}>{f}</button>
          ))}
        </div>
      </div>

      {conDevolucion.length > 0 && (
        <section className="mt-4">
          <h2 className="text-xl font-extrabold">Tus devoluciones</h2>
          <ul className="ocultar-scroll mt-2 flex gap-3 overflow-x-auto">
            {conDevolucion.map((p) => (
              <li key={p.id} className="w-64 shrink-0">
                <Link to={`${BASE}/pedidos/${p.id}`} className="flex items-center gap-3 rounded-xl bg-[#f0f2f2] p-3">
                  <img src={p.lineas[0].imagen} alt="" className="h-16 w-16 rounded bg-white object-contain p-1" />
                  <span className="text-[0.98rem]">Lleva tu devolución al punto elegido</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {comprados.length > 0 && (
        <section className="mt-4 border-b-8 border-te-fondo pb-4">
          <h2 className="text-xl font-extrabold">Volver a comprar</h2>
          <div className="ocultar-scroll mt-2 flex gap-2 overflow-x-auto">
            {comprados.map((l) => (
              <Link key={l.id} to={`${BASE}/producto/${l.id}`} className="h-24 w-24 shrink-0 rounded-lg bg-[#f7f7f7] p-2">
                <img src={l.imagen} alt={l.titulo} className="h-full w-full object-contain mix-blend-multiply" />
              </Link>
            ))}
          </div>
        </section>
      )}

      <h2 className="mt-4 text-xl font-extrabold">Historial de compras</h2>
      <p className="text-te-gris">Últimos tres meses</p>
      {!t.usuario && (
        <p className="mt-3">
          <Link to={`${BASE}/identificacion`} className="text-te-enlace underline">Identifícate</Link> para ver tus pedidos.
        </p>
      )}
      {t.usuario && !t.pedidos.length && <p className="mt-3 text-lg">Todavía no has realizado ningún pedido en Todoenvío.</p>}
      {t.pedidos.length > 0 && !lista.length && <p className="mt-3 text-lg">No hay pedidos con ese filtro.</p>}
      <ul className="mt-3 space-y-3" data-nota="seguimiento">
        {lista.map((p) => {
          const e = resumenEstado(p)
          return (
            <li key={p.id}>
              <Link to={`${BASE}/pedidos/${p.id}`} className="flex overflow-hidden rounded-xl border border-slate-300 hover:bg-slate-50">
                <span className="flex w-28 shrink-0 items-center justify-center bg-[#f7f7f7] p-2">
                  <img src={p.lineas[0].imagen} alt="" className="max-h-24 object-contain mix-blend-multiply" />
                </span>
                <span className="flex flex-1 flex-col justify-center p-3">
                  <b className={`text-[1.05rem] first-letter:uppercase ${e.tono === 'verde' ? 'text-te-verde' : ''}`}>{e.titulo}</b>
                  <span className="text-te-gris">{e.detalle}</span>
                  <span className="text-sm text-te-gris">{p.lineas.length} {p.lineas.length === 1 ? 'producto' : 'productos'} · {euros(p.total)}</span>
                </span>
                <ChevronRight className="m-auto mr-2 shrink-0" aria-hidden />
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export function DetallePedidoTE() {
  const { id } = useParams()
  const t = useTienda()
  const navigate = useNavigate()
  const avisar = useAvisoSimulador()
  const procesar = useSim((s) => s.procesarDevoluciones)
  const p = t.pedidos.find((x) => x.id === id)
  useUrl(`${DOMINIO}/gp/your-account/order-details?orderID=${id}`)
  useNota('seguimiento')
  if (!p) return <p className="p-6">No se ha encontrado el pedido.</p>
  const e = resumenEstado(p)
  const { puedeCancelar, puedeDevolver, cancelado, etapa } = e.e
  const devolucionPendiente = p.devoluciones?.some((d) => !d.reembolsada)
  return (
    <div className="space-y-4 p-4">
      <Link to={`${BASE}/pedidos`} className="text-te-enlace hover:underline">‹ Mis pedidos</Link>

      <section className="rounded-xl border border-slate-300 p-4">
        <h1 className={`text-2xl font-extrabold first-letter:uppercase ${e.tono === 'verde' ? 'text-te-verde' : ''}`}>{e.titulo}</h1>
        <p className="text-lg">{e.detalle}</p>
        <div className="mt-3 space-y-2">
          {!cancelado && (
            <Link to={`${BASE}/seguimiento/${p.id}`} data-nota="seguimiento" className="te-btn-amarillo flex min-h-12 items-center justify-center gap-2 rounded-full">
              <MapPin size={20} aria-hidden /> Seguir el paquete
            </Link>
          )}
          {puedeCancelar && (
            <Link to={`${BASE}/pedidos/${p.id}/cancelar`} data-nota="cancelar" className="flex min-h-12 items-center justify-center rounded-full border border-slate-400">Cancelar los productos</Link>
          )}
          {!puedeCancelar && !cancelado && etapa < 4 && <p className="text-te-gris">Este pedido ya ha salido del almacén y no se puede cancelar. Cuando lo recibas, podrás devolverlo.</p>}
          {puedeDevolver && (
            <Link to={`${BASE}/pedidos/${p.id}/devolver`} data-nota="devolucion" className="flex min-h-12 items-center justify-center rounded-full border border-slate-400">Devolver o reemplazar productos</Link>
          )}
          {devolucionPendiente && (
            <button onClick={() => procesar(p.id)} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-indigo-500 bg-indigo-50 font-bold text-indigo-800">
              <FastForward size={20} aria-hidden /> Simular que la tienda recibe la devolución
            </button>
          )}
          {etapa === 4 && !cancelado && (
            <button onClick={() => avisar('En una tienda real, aquí podrías contar tu experiencia con el producto.')} className="min-h-12 w-full rounded-full border border-slate-400">Escribir una opinión del producto</button>
          )}
        </div>
      </section>

      <section className="rounded-xl border border-slate-300 p-4">
        <h2 className="text-xl font-bold">Productos</h2>
        <ul className="mt-2 space-y-3">
          {p.lineas.map((l, i) => (
            <li key={i} className={`flex gap-3 ${l.cancelada ? 'opacity-60' : ''}`}>
              <img src={l.imagen} alt="" className="h-20 w-20 shrink-0 rounded bg-[#f7f7f7] object-contain p-1" />
              <div>
                <Link to={`${BASE}/producto/${l.id}`} className="text-te-enlace hover:underline">{l.titulo}</Link>
                {Object.keys(l.opciones || {}).length > 0 && <p className="text-sm">{textoOpciones(l.opciones)}</p>}
                <p className="text-sm text-te-gris">Vendido por: {l.vendedor}</p>
                <p>{euros(l.precio)} · Cantidad: {l.cantidad}</p>
                {l.cancelada && <p className="font-semibold text-te-rojo">Cancelado</p>}
                {l.devuelta && <p className="font-semibold">Devolución solicitada</p>}
              </div>
            </li>
          ))}
        </ul>
        <Link to={`${BASE}/producto/${p.lineas[0].id}`} className="te-btn-amarillo mt-3 flex min-h-12 items-center justify-center rounded-full">Volver a comprar</Link>
      </section>

      <section className="rounded-xl border border-slate-300 p-4 text-[1.02rem]">
        <h2 className="text-xl font-bold">Detalles del pedido</h2>
        <p className="mt-1"><b>Fecha del pedido:</b> {fechaCompleta(new Date(p.creado))}</p>
        <p><b>N.º de pedido:</b> {p.id}</p>
        <button onClick={() => navigate(`${BASE}/correo/${p.id}`)} className="mt-1 min-h-10 text-left text-te-enlace hover:underline">Ver el correo de confirmación (justificante)</button>
        <h2 className="mt-3 text-xl font-bold">Dirección de envío</h2>
        <p className="mt-1">
          {p.direccion.nombre}<br />
          {p.direccion.calle} {p.direccion.piso}<br />
          {p.direccion.codigoPostal} {p.direccion.localidad} ({p.direccion.provincia})
        </p>
        <h2 className="mt-3 text-xl font-bold">Método de pago</h2>
        <p>{nombreMetodo(p.pago)}</p>
        <h2 className="mt-3 text-xl font-bold">Resumen</h2>
        <dl className="mt-1 max-w-sm space-y-0.5">
          <div className="flex justify-between"><dt>Productos:</dt><dd>{euros(p.subtotal)}</dd></div>
          <div className="flex justify-between"><dt>Envío:</dt><dd>{p.envio ? euros(p.envio) : 'GRATIS'}</dd></div>
          <div className="flex justify-between font-bold"><dt>Total del pedido:</dt><dd>{euros(p.total)}</dd></div>
          {p.reembolsado > 0 && <div className="flex justify-between font-bold text-te-verde"><dt>Reembolsado:</dt><dd>{euros(p.reembolsado)}</dd></div>}
        </dl>
      </section>
    </div>
  )
}

function SeleccionProductos({ p, lineas, marcadas, setMarcadas }) {
  return (
    <ul className="mt-3 divide-y divide-slate-200 rounded-xl border border-slate-300">
      {lineas.map(({ l, i }) => (
        <li key={i}>
          <label className="flex cursor-pointer items-center gap-3 p-3">
            <input
              type="checkbox"
              checked={marcadas.includes(i)}
              onChange={() => setMarcadas(marcadas.includes(i) ? marcadas.filter((x) => x !== i) : [...marcadas, i])}
              className="h-6 w-6 shrink-0 accent-[#007185]"
            />
            <img src={l.imagen} alt="" className="h-16 w-16 shrink-0 rounded bg-[#f7f7f7] object-contain p-1" />
            <span>
              <span className="line-clamp-2">{l.titulo}</span>
              <span className="text-te-gris">Cantidad: {l.cantidad} · {euros(l.precio * l.cantidad)}</span>
            </span>
          </label>
        </li>
      ))}
    </ul>
  )
}

const selectCampo = 'min-h-12 w-full rounded-lg border border-slate-400 bg-[#f0f2f2] px-3 text-[1.05rem] shadow-sm'
const MOTIVOS_CANCELAR = ['He encontrado un precio mejor', 'El pedido ha sido creado por error', 'Ya no lo necesito', 'El plazo de entrega es demasiado largo', 'Necesito cambiar la dirección o el pago', 'Otro motivo']

export function CancelarPedidoTE() {
  const { id } = useParams()
  const t = useTienda()
  const cancelar = useSim((s) => s.cancelarLineas)
  const [marcadas, setMarcadas] = useState([])
  const [motivo, setMotivo] = useState('')
  const [hecho, setHecho] = useState(null)
  const [error, setError] = useState(false)
  useUrl(`${DOMINIO}/gp/css/order/edit.html?orderID=${id}`)
  useNota('cancelar-pedido', !hecho)
  const p = t.pedidos.find((x) => x.id === id)
  if (!p) return <p className="p-6">No se ha encontrado el pedido.</p>

  if (hecho !== null)
    return (
      <div className="space-y-3 p-4">
        <div className="rounded-xl border-2 border-te-verde p-4">
          <p className="flex items-center gap-2 text-xl font-extrabold text-te-verde"><CircleCheck aria-hidden /> Productos cancelados</p>
          <p className="mt-2 text-lg">Se han devuelto <b>{euros(hecho)}</b> a tu método de pago.</p>
          <p className="text-lg">Saldo de prácticas: <b>{euros(t.saldo)}</b></p>
          <p className="mt-1 text-te-gris">En una compra real, el reembolso puede tardar unos días en aparecer en tu banco.</p>
        </div>
        <Link to={`${BASE}/correo`} className="flex min-h-12 items-center justify-center gap-2 rounded-full border border-slate-400"><Mail size={20} aria-hidden /> Ver el correo de cancelación</Link>
        <Link to={`${BASE}/pedidos`} className="te-btn-amarillo flex min-h-12 items-center justify-center rounded-full">Ir a Mis pedidos</Link>
      </div>
    )

  const estado = estadoEnvio(p)
  if (!estado.puedeCancelar)
    return (
      <div className="space-y-3 p-4">
        <h1 className="text-2xl font-extrabold">No se puede cancelar</h1>
        <p className="text-lg">Este pedido ya ha salido del almacén o ya estaba cancelado. Cuando lo recibas podrás devolverlo gratis.</p>
        <Link to={`${BASE}/pedidos/${p.id}`} className="te-btn-amarillo flex min-h-12 items-center justify-center rounded-full">Volver al pedido</Link>
      </div>
    )

  const lineas = p.lineas.map((l, i) => ({ l, i })).filter(({ l }) => !l.cancelada)
  const confirmar = () => {
    if (!marcadas.length) return setError(true)
    setHecho(cancelar(p.id, marcadas, motivo))
  }
  return (
    <div className="p-4" data-nota="cancelar">
      <h1 className="text-2xl font-extrabold">Cancelar los productos</h1>
      <p className="mt-1 text-te-gris">Pedido n.º {p.id}</p>
      <p className="mt-3 font-bold">Marca los productos que quieres cancelar</p>
      <SeleccionProductos p={p} lineas={lineas} marcadas={marcadas} setMarcadas={(m) => { setMarcadas(m); setError(false) }} />
      <button onClick={() => { setMarcadas(lineas.map((x) => x.i)); setError(false) }} className="mt-2 min-h-11 text-te-enlace hover:underline">Seleccionar todos</button>
      <label className="mt-3 block">
        <span className="font-bold">Motivo de la cancelación (opcional)</span>
        <select value={motivo} onChange={(e) => setMotivo(e.target.value)} className={`${selectCampo} mt-1`}>
          <option value="">Selecciona un motivo</option>
          {MOTIVOS_CANCELAR.map((m) => <option key={m}>{m}</option>)}
        </select>
      </label>
      {error && <p role="alert" className="mt-3 rounded-lg bg-sky-50 p-3 font-semibold text-sky-900 ring-1 ring-sky-600">Marca al menos un producto para poder cancelarlo.</p>}
      <button onClick={confirmar} className="te-btn-amarillo mt-4 min-h-12 w-full rounded-full text-[1.05rem]">Cancelar los productos marcados</button>
      <Link to={`${BASE}/pedidos/${p.id}`} className="mt-2 flex min-h-12 items-center justify-center text-te-enlace hover:underline">Volver sin cancelar</Link>
    </div>
  )
}

const MOTIVOS_DEVOLVER = ['Ya no lo necesito', 'No es lo que esperaba', 'La talla o el tamaño no es correcto', 'El producto está dañado o no funciona', 'He recibido un producto equivocado', 'He encontrado un precio mejor']
const METODOS_DEVOLVER = [
  { id: 'punto', titulo: 'Entregar en un punto de recogida', texto: 'Sin imprimir nada: enseña un código QR. GRATIS' },
  { id: 'casa', titulo: 'Recogida en tu domicilio', texto: 'Un mensajero pasa a recogerlo. GRATIS' },
]

export function DevolverPedidoTE() {
  const { id } = useParams()
  const t = useTienda()
  const iniciar = useSim((s) => s.iniciarDevolucion)
  const [marcadas, setMarcadas] = useState([])
  const [motivo, setMotivo] = useState('')
  const [metodo, setMetodo] = useState('punto')
  const [hecho, setHecho] = useState(null)
  const [faltan, setFaltan] = useState('')
  useUrl(`${DOMINIO}/returns/cart/${id}`)
  useNota('desistimiento', !hecho)
  const p = t.pedidos.find((x) => x.id === id)
  if (!p) return <p className="p-6">No se ha encontrado el pedido.</p>

  if (hecho !== null)
    return (
      <div className="space-y-3 p-4">
        <div className="rounded-xl border-2 border-te-verde p-4">
          <p className="flex items-center gap-2 text-xl font-extrabold text-te-verde"><CircleCheck aria-hidden /> Devolución iniciada</p>
          <p className="mt-2 text-lg">Tu reembolso de <b>{euros(hecho)}</b> se procesará cuando recibamos el producto.</p>
        </div>
        {metodo === 'punto' ? (
          <div className="flex flex-col items-center rounded-xl border border-slate-300 p-4 text-center">
            <QrCode size={150} strokeWidth={1.1} aria-hidden />
            <p className="mt-2 text-lg">Enseña este código en el punto de recogida.</p>
            <p className="text-sm text-te-gris">Código ficticio del simulador</p>
          </div>
        ) : (
          <p className="rounded-xl border border-slate-300 p-4 text-lg">Un mensajero pasará a recogerlo por tu domicilio el {fechaCorta(new Date(Date.now() + 86400000))}.</p>
        )}
        <Link to={`${BASE}/pedidos/${p.id}`} className="te-btn-amarillo flex min-h-12 items-center justify-center rounded-full">Ver el pedido</Link>
      </div>
    )

  const estado = estadoEnvio(p)
  if (!estado.puedeDevolver)
    return (
      <div className="space-y-3 p-4">
        <h1 className="text-2xl font-extrabold">No hay productos para devolver</h1>
        <p className="text-lg">Podrás devolver el pedido cuando se haya entregado.</p>
        <Link to={`${BASE}/pedidos/${p.id}`} className="te-btn-amarillo flex min-h-12 items-center justify-center rounded-full">Volver al pedido</Link>
      </div>
    )

  const lineas = p.lineas.map((l, i) => ({ l, i })).filter(({ l }) => !l.cancelada && !l.devuelta)
  const confirmar = () => {
    if (!marcadas.length) return setFaltan('Marca al menos un producto para devolverlo.')
    if (!motivo) return setFaltan('Elige el motivo de la devolución.')
    setHecho(iniciar(p.id, marcadas, motivo, metodo))
  }
  return (
    <div className="p-4" data-nota="devolucion">
      <h1 className="text-2xl font-extrabold">Devolver productos</h1>
      <p className="mt-3 font-bold">¿Qué quieres devolver?</p>
      <SeleccionProductos p={p} lineas={lineas} marcadas={marcadas} setMarcadas={(m) => { setMarcadas(m); setFaltan('') }} />
      <label className="mt-4 block">
        <span className="font-bold">¿Por qué lo devuelves?</span>
        <select value={motivo} onChange={(e) => { setMotivo(e.target.value); setFaltan('') }} className={`${selectCampo} mt-1`}>
          <option value="">Selecciona un motivo</option>
          {MOTIVOS_DEVOLVER.map((m) => <option key={m}>{m}</option>)}
        </select>
      </label>
      <fieldset className="mt-4 space-y-2">
        <legend className="mb-1 font-bold">¿Cómo quieres devolverlo?</legend>
        {METODOS_DEVOLVER.map((m) => (
          <label key={m.id} className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 ${metodo === m.id ? 'border-[#e77600] bg-[#fcf5ee]' : 'border-slate-300'}`}>
            <input type="radio" name="metodo" checked={metodo === m.id} onChange={() => setMetodo(m.id)} className="mt-1 h-6 w-6 accent-[#e77600]" />
            <span><b className="block">{m.titulo}</b>{m.texto}</span>
          </label>
        ))}
      </fieldset>
      <p className="mt-3 text-te-gris">El importe se devolverá a: {nombreMetodo(p.pago)}</p>
      {faltan && <p role="alert" className="mt-3 rounded-lg bg-sky-50 p-3 font-semibold text-sky-900 ring-1 ring-sky-600">{faltan}</p>}
      <button onClick={confirmar} className="te-btn-amarillo mt-4 min-h-12 w-full rounded-full text-[1.05rem]">Confirmar la devolución</button>
    </div>
  )
}
