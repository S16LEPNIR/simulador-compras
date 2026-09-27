import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowRight, Bell, ChevronRight, CircleCheck, Mail, Search, Settings, UserRound } from 'lucide-react'
import { Recordatorio, useAvisoSimulador, useUrl } from '../../components/comun/Simulador'
import { useNota, useNotas } from '../../components/comun/Notas'
import { ExitoPedido, Seguimiento, textoEstado } from '../../components/comun/Pedido'
import { useSim } from '../../store/useSim'
import { euros, fechaCompleta, fechaLarga, textoOpciones } from '../../lib/formato'
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
          <CircleCheck size={30} /> Pedido realizado, gracias.
        </p>
        <p className="mt-2 text-lg">Se ha enviado la confirmación a {p.email}.</p>
        <p className="mt-3 text-lg">
          <b>Número de pedido:</b> {p.id}
        </p>
        <p className="text-lg">
          <b>Llegada:</b> <span className="text-te-verde first-letter:uppercase">{fechaLarga(new Date(p.entrega.fecha))}</span>
        </p>
        <p className="text-lg">
          <b>Enviar a:</b> {p.direccion.nombre}, {p.direccion.calle}, {p.direccion.localidad}
        </p>
        <p className="text-lg">
          <b>Total:</b> {euros(p.total)}
        </p>
      </div>
      <button onClick={() => navigate(`${BASE}/correo/${p.id}`)} className="te-btn-amarillo flex min-h-12 w-full items-center justify-center gap-2 rounded-full">
        <Mail size={20} /> Ver el correo con el justificante
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
  useUrl(`${DOMINIO}/gp/css/homepage.html`)
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
          <Link to={`${BASE}/identificacion`} className="text-te-enlace hover:underline">
            Empieza aquí
          </Link>
        </p>
      </div>
    )
  return (
    <div className="p-4">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-2 text-xl">
          <UserRound className="rounded-full bg-slate-200 p-1" size={34} /> Hola, <b>{t.usuario.nombre.split(' ')[0]}</b>
        </p>
        <div className="flex gap-1">
          <button onClick={() => avisar()} className="rounded-full p-2 hover:bg-slate-100" aria-label="Ajustes">
            <Settings />
          </button>
          <button onClick={() => avisar()} className="rounded-full p-2 hover:bg-slate-100" aria-label="Notificaciones">
            <Bell />
          </button>
        </div>
      </div>
      <div className="ocultar-scroll mt-3 flex gap-2 overflow-x-auto">
        {[
          ['Pedidos', `${BASE}/pedidos`],
          ['Volver a comprar', `${BASE}/pedidos`],
          ['Cuenta', null],
          ['Listas', null],
        ].map(([x, to]) => (
          <button key={x} onClick={() => (to ? navigate(to) : avisar())} className="min-h-11 shrink-0 rounded-full border border-slate-400 px-5">
            {x}
          </button>
        ))}
      </div>

      <Link to={`${BASE}/pedidos`} className="mt-5 flex items-center justify-between">
        <h2 className="text-2xl font-extrabold">Mis pedidos</h2>
        <ArrowRight />
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
        {['Sus pagos', 'Sus direcciones', 'Inicio de sesión y seguridad', 'Preferencias de compra', 'Historial de búsqueda', 'Preferencias de anuncios'].map((x) => (
          <li key={x} className="border-b border-white last:border-0">
            <button onClick={() => avisar()} className="flex min-h-14 w-full items-center justify-between px-4 text-left text-[1.05rem]">
              {x} <ChevronRight size={20} />
            </button>
          </li>
        ))}
      </ul>
      <button
        onClick={() => {
          cerrarSesion(T)
          navigate(BASE)
        }}
        className="mt-6 min-h-12 w-full rounded-full border border-slate-400 text-[1.05rem]"
      >
        Cerrar sesión
      </button>
    </div>
  )
}

export function PedidosTE() {
  const t = useTienda()
  const avisar = useAvisoSimulador()
  useUrl(`${DOMINIO}/gp/css/order-history`)
  useNota('seguimiento', t.pedidos.length > 0)
  return (
    <div className="p-4">
      <h1 className="text-2xl font-extrabold">Mis pedidos</h1>
      <div className="mt-3 flex items-center gap-2 border-b border-slate-300 pb-3">
        <label className="flex flex-1 items-center gap-2 rounded-lg border border-slate-400 px-3">
          <Search size={20} className="text-te-enlace" />
          <input placeholder="Buscar todos los pedidos" className="min-h-11 w-full outline-none" aria-label="Buscar todos los pedidos" />
        </label>
        <button onClick={() => avisar()} className="flex min-h-11 items-center gap-1 px-2">
          Filtrar <ChevronRight size={18} />
        </button>
      </div>

      <h2 className="mt-4 text-xl font-extrabold">Historial de compras</h2>
      <p className="text-te-gris">Últimos tres meses</p>
      {!t.usuario && !t.pedidos.length && (
        <p className="mt-3">
          <Link to={`${BASE}/identificacion`} className="text-te-enlace underline">
            Identifícate
          </Link>{' '}
          para ver tus pedidos.
        </p>
      )}
      {t.usuario && !t.pedidos.length && <p className="mt-3 text-lg">Todavía no has realizado ningún pedido en Todoenvío.</p>}
      <ul className="mt-3 space-y-3" data-nota="seguimiento">
        {t.pedidos.map((p) => {
          const e = textoEstado(p)
          return (
            <li key={p.id}>
              <Link to={`${BASE}/pedidos/${p.id}`} className="flex overflow-hidden rounded-xl border border-slate-300 hover:bg-slate-50">
                <span className="flex w-28 shrink-0 items-center justify-center bg-[#f7f7f7] p-2">
                  <img src={p.lineas[0].imagen} alt="" className="max-h-24 object-contain" />
                </span>
                <span className="flex flex-1 flex-col justify-center p-3">
                  <b className={`text-[1.05rem] first-letter:uppercase ${e.i === 4 ? '' : 'text-te-verde'}`}>{e.titulo}</b>
                  <span className="text-te-gris">{e.detalle}</span>
                  <span className="text-sm text-te-gris">
                    {p.lineas.length} {p.lineas.length === 1 ? 'producto' : 'productos'} · {euros(p.total)}
                  </span>
                </span>
                <ChevronRight className="m-auto mr-2 shrink-0" />
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
  const { mostrar } = useNotas()
  const navigate = useNavigate()
  const p = t.pedidos.find((x) => x.id === id)
  useUrl(`${DOMINIO}/gp/your-account/order-details?orderID=${id}`)
  useNota('seguimiento')
  if (!p) return <p className="p-6">No se ha encontrado el pedido.</p>
  return (
    <div className="space-y-4 p-4">
      <Link to={`${BASE}/pedidos`} className="text-te-enlace hover:underline">
        ‹ Mis pedidos
      </Link>
      <h1 className="text-2xl font-extrabold">Detalles del pedido</h1>
      <div className="rounded-xl border border-slate-300 p-4 text-[1.02rem]">
        <p>
          <b>Fecha del pedido:</b> {fechaCompleta(new Date(p.creado))}
        </p>
        <p>
          <b>N.º de pedido:</b> {p.id}
        </p>
        <p>
          <b>Total del pedido:</b> {euros(p.total)}
        </p>
        <button onClick={() => navigate(`${BASE}/correo/${p.id}`)} className="mt-2 min-h-10 text-te-enlace hover:underline">
          Ver el correo de confirmación (justificante)
        </button>
      </div>
      <section className="rounded-xl border border-slate-300 p-4">
        <h2 className="text-xl font-bold">Seguimiento del paquete</h2>
        <Seguimiento tienda={T} pedido={p} color="#007600" />
      </section>
      <section className="rounded-xl border border-slate-300 p-4">
        <h2 className="text-xl font-bold">Productos</h2>
        <ul className="mt-2 space-y-3">
          {p.lineas.map((l, i) => (
            <li key={i} className="flex gap-3">
              <img src={l.imagen} alt="" className="h-20 w-20 shrink-0 rounded bg-[#f7f7f7] object-contain p-1" />
              <div>
                <Link to={`${BASE}/producto/${l.id}`} className="text-te-enlace hover:underline">
                  {l.titulo}
                </Link>
                {Object.keys(l.opciones || {}).length > 0 && <p className="text-sm">{textoOpciones(l.opciones)}</p>}
                <p className="text-sm text-te-gris">Vendido por: {l.vendedor}</p>
                <p>
                  {euros(l.precio)} · Cantidad: {l.cantidad}
                </p>
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <button onClick={() => mostrar('desistimiento', { forzar: true })} data-nota="devolucion" className="min-h-12 flex-1 rounded-full border border-slate-400">
            Devolver o reemplazar productos
          </button>
          <Link to={`${BASE}/producto/${p.lineas[0].id}`} className="te-btn-amarillo flex min-h-12 flex-1 items-center justify-center rounded-full">
            Volver a comprar
          </Link>
        </div>
      </section>
      <section className="rounded-xl border border-slate-300 p-4 text-[1.02rem]">
        <h2 className="text-xl font-bold">Dirección de envío</h2>
        <p className="mt-1">
          {p.direccion.nombre}
          <br />
          {p.direccion.calle} {p.direccion.piso}
          <br />
          {p.direccion.codigoPostal} {p.direccion.localidad} ({p.direccion.provincia})
        </p>
        <h2 className="mt-3 text-xl font-bold">Método de pago</h2>
        <p>Tarjeta que termina en {p.pago.ultimos4}</p>
      </section>
    </div>
  )
}
