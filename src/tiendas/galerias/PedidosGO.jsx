import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ChevronRight, CircleCheck, Mail, Store, Truck } from 'lucide-react'
import { AvisoCampos, BotonEjemplo, Recordatorio, useUrl } from '../../components/comun/Simulador'
import { useNota, useNotas } from '../../components/comun/Notas'
import { ExitoPedido, Seguimiento, textoEstado } from '../../components/comun/Pedido'
import { euros, fechaCompleta, fechaLarga, textoOpciones } from '../../lib/formato'
import { BASE, BotonNegro, DOMINIO, G, useTienda } from './comun'

export function ConfirmacionGO() {
  const { id } = useParams()
  const t = useTienda()
  const navigate = useNavigate()
  const { mostrar } = useNotas()
  const [modal, setModal] = useState(true)
  const p = t.pedidos.find((x) => x.id === id)
  useUrl(`${DOMINIO}/compra/confirmacion/?pedido=${id}`)
  if (!p) return <p className="p-6">No se ha encontrado el pedido.</p>
  const cerrar = () => {
    setModal(false)
    mostrar('justificante')
    mostrar('movimientos-banco')
  }
  return (
    <div className="space-y-5 px-4 py-6">
      <Recordatorio />
      <div className="text-center">
        <CircleCheck size={56} className="mx-auto text-go-verde" aria-hidden />
        <h1 className="mt-2 text-3xl font-light">¡Gracias por tu compra, {p.nombre.split(' ')[0]}!</h1>
        <p className="mt-2 text-lg">
          Número de pedido: <b>{p.id}</b>
        </p>
        <p className="text-go-suave">Te hemos enviado la confirmación a {p.email}</p>
      </div>
      <div className="bg-go-gris p-4 text-[1.05rem]">
        {p.recogida ? (
          <p className="flex gap-3">
            <Store className="shrink-0" /> <span>{p.recogida.texto} en <b>{p.recogida.nombre}</b> ({p.recogida.lugar}). Te avisaremos cuando esté listo.</span>
          </p>
        ) : (
          <p className="flex gap-3">
            <Truck className="shrink-0" />
            <span>
              {p.entrega.detalle}. Dirección: {p.direccion.calle} {p.direccion.piso}, {p.direccion.codigoPostal} {p.direccion.localidad}.
            </span>
          </p>
        )}
        <p className="mt-2 text-lg font-semibold">Total pagado: {euros(p.total)}</p>
      </div>
      <BotonNegro onClick={() => navigate(`${BASE}/correo/${p.id}`)}>Ver el correo con el justificante</BotonNegro>
      <button onClick={() => navigate(`${BASE}/mis-compras/${p.id}`)} className="min-h-12 w-full border border-black uppercase tracking-wider">
        Ir a Mis compras
      </button>
      <Link to={BASE} className="flex min-h-12 items-center justify-center underline">
        Seguir comprando
      </Link>
      {modal && <ExitoPedido onCerrar={cerrar} onVerCorreo={() => navigate(`${BASE}/correo/${p.id}`)} colorBoton="bg-go-verde hover:bg-go-verde-oscuro" />}
    </div>
  )
}

export function MisComprasGO() {
  const t = useTienda()
  const [consulta, setConsulta] = useState({ email: '', pedido: '' })
  const [verificado, setVerificado] = useState(false)
  const [faltan, setFaltan] = useState([])
  useUrl(`${DOMINIO}/mi-cuenta/mis-compras/`)
  useNota('seguimiento', t.pedidos.length > 0)
  const propios = t.usuario ? t.pedidos.filter((p) => !p.invitado && p.email?.toLowerCase() === t.usuario.email.toLowerCase()) : []
  const invitado = verificado ? t.pedidos.filter((p) => p.id === consulta.pedido.trim()) : []
  const lista = [...propios, ...invitado.filter((x) => !propios.includes(x))]

  const consultar = () => {
    const p = t.pedidos.find((x) => x.id === consulta.pedido.trim() && x.email?.toLowerCase() === consulta.email.trim().toLowerCase())
    if (!p) return setFaltan(['No encontramos ningún pedido con ese correo y número. Revisa los datos del correo de confirmación.'])
    setFaltan([])
    setVerificado(true)
  }

  return (
    <div className="px-4 py-6">
      <h1 className="text-3xl font-light">Mis compras</h1>
      {!t.usuario && (
        <section className="mt-4 space-y-3 border border-slate-300 p-4">
          <p className="text-lg">¿Compraste como invitado? Consulta tu pedido con el correo electrónico y el número de pedido que aparecen en el justificante.</p>
          <input
            value={consulta.email}
            onChange={(e) => setConsulta({ ...consulta, email: e.target.value })}
            placeholder="Correo electrónico"
            aria-label="Correo electrónico"
            autoComplete="off"
            className="min-h-14 w-full border border-slate-400 px-4"
          />
          <input
            value={consulta.pedido}
            onChange={(e) => setConsulta({ ...consulta, pedido: e.target.value })}
            placeholder="Número de pedido"
            aria-label="Número de pedido"
            autoComplete="off"
            className="min-h-14 w-full border border-slate-400 px-4"
          />
          <AvisoCampos faltan={faltan} />
          <BotonNegro onClick={consultar}>Consultar pedido</BotonNegro>
          {t.pedidos.length > 0 && (
            <BotonEjemplo
              onClick={() => {
                setConsulta({ email: t.pedidos[0].email, pedido: t.pedidos[0].id })
                setFaltan([])
              }}
            />
          )}
          <p className="text-sm text-go-suave">
            ¿Tienes cuenta?{' '}
            <Link to={`${BASE}/acceso`} className="underline">
              Inicia sesión
            </Link>{' '}
            para ver todas tus compras.
          </p>
        </section>
      )}
      {t.usuario && !lista.length && <p className="mt-4 text-lg">Todavía no has hecho ninguna compra con esta cuenta.</p>}
      <ul className="mt-5 space-y-3" data-nota="seguimiento">
        {lista.map((p) => {
          const e = textoEstado(p)
          return (
            <li key={p.id}>
              <Link to={`${BASE}/mis-compras/${p.id}`} className="flex gap-4 border border-slate-300 p-4 hover:bg-slate-50">
                <img src={p.lineas[0].imagen} alt="" className="h-24 w-20 shrink-0 bg-go-gris object-contain p-1" />
                <div className="flex-1">
                  <p className="text-sm text-go-suave">Pedido {p.id}</p>
                  <p className="text-sm text-go-suave">{fechaCompleta(new Date(p.creado))}</p>
                  <p className={`mt-1 font-semibold first-letter:uppercase ${e.i === 4 ? '' : 'text-go-verde'}`}>{p.recogida && e.i === 4 ? 'Recogido' : e.detalle}</p>
                  <p>{euros(p.total)}</p>
                </div>
                <ChevronRight className="self-center" />
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export function DetalleCompraGO() {
  const { id } = useParams()
  const t = useTienda()
  const navigate = useNavigate()
  const { mostrar } = useNotas()
  const p = t.pedidos.find((x) => x.id === id)
  useUrl(`${DOMINIO}/mi-cuenta/mis-compras/${id}/`)
  useNota('seguimiento')
  if (!p) return <p className="p-6">No se ha encontrado el pedido.</p>
  return (
    <div className="space-y-5 px-4 py-6">
      <Link to={`${BASE}/mis-compras`} className="underline">
        ‹ Mis compras
      </Link>
      <h1 className="text-3xl font-light">Pedido {p.id}</h1>
      <p className="text-go-suave">
        Realizado el {fechaCompleta(new Date(p.creado))} · Total {euros(p.total)}
      </p>
      <section className="border border-slate-300 p-4">
        <h2 className="text-xl">Estado del pedido</h2>
        <p className="mt-1 text-go-suave">
          {p.recogida ? `${p.recogida.texto} en ${p.recogida.nombre}` : `Llegada estimada: ${fechaLarga(new Date(p.entrega.fecha))}`}
        </p>
        <Seguimiento tienda={G} pedido={p} color="#0b7a3e" />
      </section>
      <section className="border border-slate-300 p-4">
        <h2 className="text-xl">Artículos</h2>
        <ul className="mt-2 divide-y divide-slate-200">
          {p.lineas.map((l, i) => (
            <li key={i} className="flex gap-3 py-3">
              <img src={l.imagen} alt="" className="h-20 w-16 shrink-0 bg-go-gris object-contain p-1" />
              <div>
                <Link to={`${BASE}/p/${l.id}`} className="underline">
                  {l.titulo}
                </Link>
                {Object.keys(l.opciones || {}).length > 0 && <p className="text-sm">{textoOpciones(l.opciones)}</p>}
                <p className="text-sm text-go-suave">Vendido por {l.vendedor}</p>
                <p>
                  {l.cantidad} x {euros(l.precio)}
                </p>
              </div>
            </li>
          ))}
        </ul>
        <button onClick={() => mostrar('desistimiento', { forzar: true })} data-nota="devolucion" className="mt-3 min-h-12 w-full border border-black uppercase tracking-wider">
          Solicitar devolución
        </button>
      </section>
      <button onClick={() => navigate(`${BASE}/correo/${p.id}`)} className="flex min-h-12 w-full items-center justify-center gap-2 bg-black uppercase tracking-wider text-white">
        <Mail size={20} /> Ver el correo de confirmación
      </button>
    </div>
  )
}
