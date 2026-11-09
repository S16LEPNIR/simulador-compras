import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { CreditCard, Gift, Info, LoaderCircle, Plus, Store, Truck, TriangleAlert } from 'lucide-react'
import { AvisoCampos, BotonEjemplo, Modal, Recordatorio, revisarCampos, useAvisoSimulador, useUrl } from '../../components/comun/Simulador'
import { useNota, useNotas } from '../../components/comun/Notas'
import { useSim } from '../../store/useSim'
import ej from '../../data/ejemplo.json'
import { euros, fechaLarga, imagenSegunOpciones, ivaIncluido, numeroPedidoTodoenvio, sumarDias, textoOpciones, totales } from '../../lib/formato'
import { nombreCortoMetodo, nombreMetodo, redondear } from '../../lib/todoenvio'
import { BarraPracticas, BASE, CabeceraCheckout, DOMINIO, T, useTienda } from './comun'
import { AnadirMetodo, DibujoTarjeta, ModalSaldo } from './PagosTE'

export const PROVINCIAS = [
  'A Coruña', 'Álava', 'Albacete', 'Alicante', 'Almería', 'Asturias', 'Ávila', 'Badajoz', 'Baleares', 'Barcelona', 'Burgos', 'Cáceres', 'Cádiz',
  'Cantabria', 'Castellón', 'Ceuta', 'Ciudad Real', 'Córdoba', 'Cuenca', 'Girona', 'Granada', 'Guadalajara', 'Guipúzcoa', 'Huelva', 'Huesca',
  'Jaén', 'La Rioja', 'Las Palmas', 'León', 'Lleida', 'Lugo', 'Madrid', 'Málaga', 'Melilla', 'Murcia', 'Navarra', 'Ourense', 'Palencia',
  'Pontevedra', 'Salamanca', 'Santa Cruz de Tenerife', 'Segovia', 'Sevilla', 'Soria', 'Tarragona', 'Teruel', 'Toledo', 'Valencia', 'Valladolid',
  'Vizcaya', 'Zamora', 'Zaragoza',
]

const campo =
  'min-h-12 w-full rounded-md border border-[#888c8c] bg-white px-3 text-[1.05rem] shadow-inner focus:border-[#e77600] focus:outline-none focus:ring-2 focus:ring-[#e77600]/40'

// Líneas que se están comprando: la cesta o, si se pulsó «Comprar ya», solo ese producto
function useCompra() {
  const t = useTienda()
  const [params] = useSearchParams()
  const compraYa = params.get('modo') === 'compraya' && t.compraYa
  const lineas = compraYa ? [t.compraYa] : t.carrito
  const q = compraYa ? '?modo=compraya' : ''
  return { t, lineas, q, compraYa: !!compraYa, ...totales(lineas) }
}

function Guardia({ compra, children, necesita = [] }) {
  if (!compra.lineas.length) return <Navigate to={`${BASE}/cesta`} replace />
  if (!compra.t.usuario) return <Navigate to={`${BASE}/identificacion?siguiente=direccion${compra.q ? '&modo=compraya' : ''}`} replace />
  if (necesita.includes('direccion') && !compra.t.direccion) return <Navigate to={`${BASE}/tramitar/direccion${compra.q}`} replace />
  if (necesita.includes('pago') && !compra.t.pago) return <Navigate to={`${BASE}/tramitar/pago${compra.q}`} replace />
  return children
}

function Marco({ paso, unidades, children }) {
  return (
    <div className="min-h-screen bg-[#f5f6f6] font-sans text-te-tinta">
      <BarraPracticas />
      <CabeceraCheckout titulo={`Tramitar pedido (${unidades} ${unidades === 1 ? 'producto' : 'productos'})`} paso={paso} />
      <main className="mx-auto max-w-3xl px-3 py-4 pb-12">{children}</main>
    </div>
  )
}

const direccionEnBlanco = (nombre = '') => ({ pais: 'España', nombre, telefono: '', calle: '', piso: '', codigoPostal: '', localidad: '', provincia: '' })

// Formulario de dirección: se usa en la compra y en «Mis direcciones»
export function FormDireccion({ inicial, onGuardar, textoBoton = 'Usar esta dirección' }) {
  const [v, setV] = useState(inicial)
  const [faltan, setFaltan] = useState([])
  const cambia = (k) => (e) => setV({ ...v, [k]: e.target.value })

  const enviar = (e) => {
    e.preventDefault()
    const f = revisarCampos(v, [
      ['nombre', 'Nombre y apellidos'],
      ['telefono', 'Número de teléfono'],
      ['calle', 'Dirección (calle y número)'],
      ['codigoPostal', 'Código postal'],
      ['localidad', 'Localidad'],
      ['provincia', 'Provincia'],
    ])
    setFaltan(f)
    if (!f.length) onGuardar(v)
  }

  return (
    <>
      <AvisoCampos faltan={faltan} className="mt-3" />
      <form onSubmit={enviar} noValidate data-nota="formulario" className="mt-3 space-y-3 rounded-xl border border-slate-300 bg-white p-4">
        <BotonEjemplo
          onClick={() => {
            setV({ ...v, nombre: ej.nombreCompleto, telefono: ej.telefono, calle: ej.calle, piso: ej.piso, codigoPostal: ej.codigoPostal, localidad: ej.localidad, provincia: ej.provincia })
            setFaltan([])
          }}
        />
        <label className="block">
          <span className="font-bold">País/Región</span>
          <select value={v.pais} onChange={cambia('pais')} className={`${campo} mt-1`}>
            <option>España</option>
            <option>Portugal</option>
          </select>
        </label>
        <label className="block">
          <span className="font-bold">Nombre y apellidos</span>
          <input value={v.nombre} onChange={cambia('nombre')} autoComplete="off" className={`${campo} mt-1`} />
        </label>
        <label className="block">
          <span className="font-bold">Número de teléfono</span>
          <input value={v.telefono} onChange={cambia('telefono')} inputMode="tel" autoComplete="off" className={`${campo} mt-1`} />
          <span className="text-sm text-te-gris">Puede usarse para ayudar en la entrega</span>
        </label>
        <label className="block">
          <span className="font-bold">Dirección</span>
          <input value={v.calle} onChange={cambia('calle')} placeholder="Nombre de la calle y número" autoComplete="off" className={`${campo} mt-1`} />
        </label>
        <input value={v.piso} onChange={cambia('piso')} placeholder="Piso, puerta, escalera (opcional)" aria-label="Piso, puerta, escalera (opcional)" autoComplete="off" className={campo} />
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="font-bold">Código postal</span>
            <input value={v.codigoPostal} onChange={cambia('codigoPostal')} inputMode="numeric" autoComplete="off" className={`${campo} mt-1`} />
          </label>
          <label className="block">
            <span className="font-bold">Localidad</span>
            <input value={v.localidad} onChange={cambia('localidad')} autoComplete="off" className={`${campo} mt-1`} />
          </label>
        </div>
        <label className="block">
          <span className="font-bold">Provincia</span>
          <select value={v.provincia} onChange={cambia('provincia')} className={`${campo} mt-1`}>
            <option value="">Selecciona</option>
            {PROVINCIAS.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </label>
        <button type="submit" className="te-btn-amarillo min-h-12 w-full rounded-full text-[1.05rem]">
          {textoBoton}
        </button>
      </form>
    </>
  )
}

export function EditarDireccionTE() {
  const t = useTienda()
  const guardar = useSim((s) => s.guardarDireccion)
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const existente = t.direcciones.find((d) => d.id === params.get('id'))
  useUrl(`${DOMINIO}/a/addresses/add`)
  useNota('direccion-envio')
  return (
    <div className="p-4">
      <h1 className="text-2xl font-extrabold">{existente ? 'Editar la dirección' : 'Agregar una dirección nueva'}</h1>
      <Recordatorio className="mt-3" />
      <FormDireccion
        inicial={existente || direccionEnBlanco(t.usuario?.nombre)}
        textoBoton={existente ? 'Guardar los cambios' : 'Agregar dirección'}
        onGuardar={(d) => {
          guardar(d)
          navigate(`${BASE}/direcciones`)
        }}
      />
    </div>
  )
}

// ================= 1. DIRECCIÓN =================
export function DireccionTE() {
  const compra = useCompra()
  const { t } = compra
  const guardar = useSim((s) => s.guardarDireccion)
  const elegir = useSim((s) => s.elegirDireccion)
  const navigate = useNavigate()
  const [nueva, setNueva] = useState(!t.direcciones.length)
  useUrl(`${DOMINIO}/gp/buy/addressselect/handlers/display.html`)
  useNota('direccion-envio')
  const seguir = () => navigate(`${BASE}/tramitar/pago${compra.q}`)

  return (
    <Guardia compra={compra}>
      <Marco paso={1} unidades={compra.unidades}>
        <Recordatorio />
        {nueva ? (
          <>
            <h2 className="mt-4 text-2xl font-bold">Añadir una dirección de envío</h2>
            <FormDireccion
              inicial={direccionEnBlanco(t.usuario?.nombre)}
              onGuardar={(d) => {
                guardar(d)
                seguir()
              }}
            />
            {t.direcciones.length > 0 && (
              <button onClick={() => setNueva(false)} className="mt-3 min-h-11 w-full text-center text-te-enlace hover:underline">
                Usar una dirección guardada
              </button>
            )}
          </>
        ) : (
          <>
            <h2 className="mt-4 text-2xl font-bold">Selecciona una dirección de envío</h2>
            <fieldset className="mt-3 space-y-2">
              <legend className="sr-only">Direcciones guardadas</legend>
              {t.direcciones.map((d) => (
                <label key={d.id} className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 bg-white p-4 ${t.direccion?.id === d.id ? 'border-[#e77600] bg-[#fcf5ee]' : 'border-slate-300'}`}>
                  <input type="radio" name="direccion" checked={t.direccion?.id === d.id} onChange={() => elegir(d.id)} className="mt-1 h-6 w-6 accent-[#e77600]" />
                  <span>
                    <b className="block">{d.nombre}</b>
                    {d.calle} {d.piso}, {d.codigoPostal} {d.localidad} ({d.provincia})
                  </span>
                </label>
              ))}
            </fieldset>
            <button onClick={() => setNueva(true)} className="mt-3 flex min-h-12 items-center gap-2 text-te-enlace hover:underline">
              <Plus size={18} aria-hidden /> Añadir una dirección nueva
            </button>
            <button onClick={seguir} className="te-btn-amarillo mt-3 min-h-12 w-full rounded-full text-[1.05rem]">
              Usar esta dirección
            </button>
          </>
        )}
      </Marco>
    </Guardia>
  )
}

// ================= OPCIONES DE ENTREGA =================
export function opcionesEntregaTE(det) {
  const dias = Math.max(1, ...det.map((l) => l.p.diasEntrega))
  const base = sumarDias(dias)
  return [
    { id: 'estandar', titulo: fechaLarga(base), detalle: 'Entrega estándar', coste: 0, fecha: base.toISOString() },
    { id: 'rapida', titulo: `${fechaLarga(base)}, de 07:00 a 13:00`, detalle: 'Entrega más rápida por la mañana', coste: 1.99, fecha: base.toISOString() },
    { id: 'agrupada', titulo: fechaLarga(sumarDias(dias + 2)), detalle: 'Entrega agrupada: menos cajas y menos viajes', coste: 0, fecha: sumarDias(dias + 2).toISOString() },
    { id: 'punto', titulo: fechaLarga(sumarDias(dias + 1)), detalle: 'Recogida en un punto de recogida o taquilla cercana', coste: 0, fecha: sumarDias(dias + 1).toISOString(), punto: true },
  ]
}

// ================= 2. PAGO =================
export function PagoTE() {
  const compra = useCompra()
  const { t } = compra
  const elegir = useSim((s) => s.elegirMetodoPago)
  const canjear = useSim((s) => s.canjearRegalo)
  const navigate = useNavigate()
  const avisar = useAvisoSimulador()
  const [anadiendo, setAnadiendo] = useState(!t.metodosPago.length)
  const [saldoNuevo, setSaldoNuevo] = useState(false)
  const [codigo, setCodigo] = useState('')
  useUrl(`${DOMINIO}/gp/buy/payselect/handlers/display.html`)
  useNota('pago-seguro')
  useNota('datos-guardados', t.metodosPago.length > 0, 1500)
  const seguir = () => navigate(`${BASE}/tramitar/revisar${compra.q}`)

  return (
    <Guardia compra={compra} necesita={['direccion']}>
      <Marco paso={2} unidades={compra.unidades}>
        <Recordatorio />
        <h2 className="mt-4 text-2xl font-bold">Selecciona un método de pago</h2>
        {t.metodosPago.length > 0 && (
          <fieldset className="mt-3 space-y-2">
            <legend className="font-bold">Tus tarjetas y cuentas</legend>
            {t.metodosPago.map((m) => (
              <label key={m.id} className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 bg-white p-4 ${t.pago?.id === m.id ? 'border-[#e77600] bg-[#fcf5ee]' : 'border-slate-300'}`}>
                <input type="radio" name="pago" checked={t.pago?.id === m.id} onChange={() => elegir(m.id)} className="h-6 w-6 accent-[#e77600]" />
                <DibujoTarjeta m={m} />
                <span className="min-w-0">
                  <b className="block">{nombreCortoMetodo(m)}</b>
                  <span className="block truncate text-[0.95rem] text-te-gris">{m.titular}{m.caducidad ? ` · Caduca ${m.caducidad}` : ''}</span>
                </span>
              </label>
            ))}
          </fieldset>
        )}
        {t.metodosPago.length > 0 && !anadiendo && (
          <button onClick={() => setAnadiendo(true)} className="mt-3 flex min-h-12 items-center gap-2 text-te-enlace hover:underline">
            <Plus size={18} aria-hidden /> Añadir otra tarjeta o medio de pago
          </button>
        )}
        {anadiendo && (
          <div className="mt-3">
            <h3 className="mb-2 font-bold">Añadir un método de pago</h3>
            <AnadirMetodo
              onAnadido={(primero) => {
                setAnadiendo(false)
                if (primero) setSaldoNuevo(true)
              }}
            />
          </div>
        )}
        <div className="mt-3 rounded-xl border-2 border-slate-300 bg-white p-4">
          <p className="flex items-center gap-2 font-bold">
            <Gift size={20} aria-hidden /> Tarjetas regalo, cupones y códigos promocionales
          </p>
          <div className="mt-2 flex gap-2">
            <input value={codigo} onChange={(e) => setCodigo(e.target.value)} placeholder="Introduce el código" aria-label="Código promocional" autoComplete="off" className={campo} />
            <button
              onClick={() => {
                if (canjear(codigo)) {
                  setCodigo('')
                  avisar('Código aplicado: se ha añadido el importe a tu saldo.')
                } else avisar('Ese código no es válido o ya se ha usado.')
              }}
              className="min-h-12 shrink-0 rounded-full border border-slate-400 bg-white px-4"
            >
              Aplicar
            </button>
          </div>
        </div>
        {t.pago && (
          <button onClick={seguir} className="te-btn-amarillo mt-4 min-h-12 w-full rounded-full text-[1.05rem]">
            Usar este método de pago
          </button>
        )}
        {saldoNuevo && <ModalSaldo onContinuar={() => setSaldoNuevo(false)} />}
      </Marco>
    </Guardia>
  )
}

// Construye el pedido y lo cobra. Si no hay saldo suficiente devuelve la señal para avisar.
export function useRealizarPedido() {
  const crearPedido = useSim((s) => s.crearPedido)
  const navigate = useNavigate()
  const [procesando, setProcesando] = useState(false)
  const [sinSaldo, setSinSaldo] = useState(null)
  const hecho = useRef(false)
  const temporizador = useRef(null)
  useEffect(() => () => clearTimeout(temporizador.current), [])

  const realizar = ({ t, det, subtotal, envio, total, entrega, esCompraYa }) => {
    if (hecho.current || procesando) return
    setProcesando(true)
    temporizador.current = setTimeout(() => {
      setProcesando(false)
      if ((t.saldo ?? 0) < total) return setSinSaldo({ total, saldo: t.saldo ?? 0 })
      const pedido = {
        id: numeroPedidoTodoenvio(),
        tienda: T,
        creado: Date.now(),
        lineas: det.map((l) => ({
          id: l.id,
          opciones: l.opciones,
          cantidad: l.cantidad,
          precio: l.precio,
          titulo: l.p.tituloCorto,
          imagen: imagenSegunOpciones(l.p, l.opciones),
          vendedor: l.p.vendedor.externo ? l.p.vendedor.nombre : 'Todoenvío',
        })),
        direccion: t.direccion,
        entrega,
        pago: t.pago,
        subtotal,
        envio,
        total,
        email: t.usuario.email,
        nombre: t.usuario.nombre,
        esCompraYa,
      }
      hecho.current = true
      navigate(`${BASE}/pedido-realizado/${pedido.id}`)
      crearPedido(T, pedido)
    }, 1500)
  }
  return { realizar, procesando, sinSaldo, cerrarSinSaldo: () => setSinSaldo(null), hecho }
}

export function Procesando() {
  return (
    <div role="status" className="fixed inset-0 z-[65] flex flex-col items-center justify-center gap-3 bg-white/90 font-sans text-xl">
      <LoaderCircle size={52} className="animate-spin text-[#e77600]" aria-hidden />
      Procesando tu pago…
    </div>
  )
}

export function ModalSinSaldo({ datos, onCerrar, q = '' }) {
  const { mostrar } = useNotas()
  useEffect(() => mostrar('saldo-insuficiente'), [mostrar])
  return (
    <Modal titulo="No se ha podido completar el pago" onCerrar={onCerrar}>
      <div className="flex gap-3 rounded-lg border border-[#c40000] bg-[#fff5f5] p-3">
        <TriangleAlert className="mt-0.5 shrink-0 text-[#c40000]" aria-hidden />
        <p>Tu método de pago ha sido rechazado porque no tienes saldo suficiente para este pedido.</p>
      </div>
      <dl className="mt-3 space-y-1 text-lg">
        <div className="flex justify-between"><dt>Total del pedido:</dt><dd className="font-bold">{euros(datos.total)}</dd></div>
        <div className="flex justify-between"><dt>Saldo disponible:</dt><dd className="font-bold">{euros(datos.saldo)}</dd></div>
        <div className="flex justify-between text-te-rojo"><dt>Te faltan:</dt><dd className="font-bold">{euros(redondear(datos.total - datos.saldo))}</dd></div>
      </dl>
      <Link to={`${BASE}/cesta`} className="te-btn-amarillo mt-4 flex min-h-12 items-center justify-center rounded-full">Modificar la cesta</Link>
      <Link to={`${BASE}/tramitar/pago${q}`} className="mt-2 flex min-h-12 items-center justify-center rounded-full border border-slate-400">Cambiar el método de pago</Link>
    </Modal>
  )
}

// ================= 3. REVISAR =================
export function RevisarTE() {
  const compra = useCompra()
  const { t, det, subtotal, envioVendedores } = compra
  const actualizar = useSim((s) => s.actualizar)
  const avisar = useAvisoSimulador()
  const { mostrar } = useNotas()
  const [ops] = useState(() => opcionesEntregaTE(det))
  const [sel, setSel] = useState(t.entrega?.id || 'estandar')
  const { realizar, procesando, sinSaldo, cerrarSinSaldo, hecho } = useRealizarPedido()
  useUrl(`${DOMINIO}/gp/buy/spc/handlers/display.html`)
  useNota('revisar-pedido')
  useNota('opciones-entrega', true, 3000)

  // Tras comprar, la cesta se vacía: evitamos que la protección nos devuelva a la cesta
  if (hecho.current) return null
  if (!compra.lineas.length || !t.usuario || !t.direccion || !t.pago) return <Guardia compra={compra} necesita={['direccion', 'pago']} />

  const entrega = ops.find((o) => o.id === sel) || ops[0]
  const envio = redondear(entrega.coste + envioVendedores)
  const total = redondear(subtotal + envio)
  const d = t.direccion
  const saldo = t.saldo ?? 0
  const llega = saldo >= total

  const comprar = () => {
    actualizar(T, { entrega })
    realizar({ t, det, subtotal, envio, total, entrega, esCompraYa: compra.compraYa })
  }

  const Fila = ({ etiqueta, children, cambiar }) => (
    <div className="flex gap-3 border-b border-slate-200 py-3 last:border-0">
      <span className="w-20 shrink-0 text-te-enlace">{etiqueta}</span>
      <div className="min-w-0 flex-1">{children}</div>
      {cambiar && (
        <Link to={`${BASE}/tramitar/${cambiar}${compra.q}`} className="shrink-0 text-te-enlace hover:underline">
          Cambiar
        </Link>
      )}
    </div>
  )

  return (
    <Marco paso={3} unidades={compra.unidades}>
      <Recordatorio />
      <h2 className="mt-4 text-2xl font-bold">Revisar el pedido</h2>
      <div className="mt-3 rounded-xl bg-white px-4 ring-1 ring-slate-300">
        <Fila etiqueta="Enviar a" cambiar="direccion">
          <p className="font-bold">{d.nombre}</p>
          <p>{d.calle} {d.piso}, {d.codigoPostal} {d.localidad} ({d.provincia})</p>
        </Fila>
        <Fila etiqueta="Pago" cambiar="pago">
          <p className="flex items-center gap-2"><CreditCard size={18} aria-hidden /> {nombreMetodo(t.pago)}</p>
        </Fila>
      </div>

      <fieldset data-nota="opciones-entrega" className="mt-3 rounded-xl bg-white p-4 ring-1 ring-slate-300">
        <legend className="float-left mb-2 w-full text-lg font-bold">Elige una opción de entrega</legend>
        <div className="clear-both space-y-2">
          {ops.map((o) => (
            <label key={o.id} className={`flex cursor-pointer items-start gap-3 rounded-lg border-2 p-3 ${sel === o.id ? 'border-[#e77600] bg-[#fcf5ee]' : 'border-slate-200'}`}>
              <input
                type="radio"
                name="entrega"
                checked={sel === o.id}
                onChange={() => {
                  setSel(o.id)
                  if (o.punto) mostrar('recogida-tienda')
                }}
                className="mt-1 h-6 w-6 accent-[#e77600]"
              />
              <span className="flex-1">
                <b className="block text-te-verde first-letter:uppercase">{o.titulo}</b>
                <span className="flex items-center gap-2">
                  {o.punto ? <Store size={18} aria-hidden /> : <Truck size={18} aria-hidden />}
                  <span>{o.coste ? <b>{euros(o.coste)}</b> : <b>GRATIS</b>} – {o.detalle}</span>
                </span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <section className="mt-3 rounded-xl bg-white p-4 ring-1 ring-slate-300">
        <h3 className="font-bold">Productos</h3>
        <ul className="mt-2 space-y-3">
          {det.map((l) => (
            <li key={l.clave} className="flex gap-3">
              <img src={imagenSegunOpciones(l.p, l.opciones)} alt="" className="h-20 w-20 shrink-0 rounded bg-[#f7f7f7] object-contain p-1" />
              <div className="text-[0.98rem]">
                <p className="line-clamp-2 font-semibold">{l.p.titulo}</p>
                {Object.keys(l.opciones || {}).length > 0 && <p>{textoOpciones(l.opciones)}</p>}
                <p><b className="text-te-rojo">{euros(l.precio)}</b> · Cantidad: {l.cantidad}</p>
                <p className="text-te-gris">Vendido por: {l.p.vendedor.externo ? l.p.vendedor.nombre : 'Todoenvío'}</p>
                {l.p.costeEnvio > 0 && <p className="text-te-rojo">Envío del vendedor: {euros(l.p.costeEnvio)}</p>}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section data-nota="resumen" className="mt-3 rounded-xl bg-white p-4 ring-1 ring-slate-300">
        <h3 className="text-lg font-bold">Resumen del pedido</h3>
        <dl className="mt-2 space-y-1 text-[1.02rem]">
          <div className="flex justify-between"><dt>Productos:</dt><dd>{euros(subtotal)}</dd></div>
          <div className="flex justify-between"><dt>Envío:</dt><dd>{envio ? euros(envio) : 'GRATIS'}</dd></div>
          {envioVendedores > 0 && <p className="text-sm text-te-gris">Incluye {euros(envioVendedores)} de envío de vendedores externos.</p>}
          <div className="flex justify-between border-t border-slate-200 pt-2 text-xl font-bold text-te-rojo"><dt>Total:</dt><dd>{euros(total)}</dd></div>
          <p className="text-sm text-te-gris">(incluye impuestos: {euros(ivaIncluido(total))} de IVA)</p>
        </dl>
        <div className={`mt-3 rounded-lg p-3 font-sans ring-1 ${llega ? 'bg-indigo-50 text-indigo-950 ring-indigo-300' : 'bg-red-50 text-red-950 ring-red-400'}`}>
          <p className="flex justify-between"><span>Saldo de prácticas:</span> <b>{euros(saldo)}</b></p>
          {llega ? (
            <p className="flex justify-between"><span>Te quedará después:</span> <b>{euros(redondear(saldo - total))}</b></p>
          ) : (
            <p className="font-bold">No te llega para este pedido: te faltan {euros(redondear(total - saldo))}.</p>
          )}
        </div>
        <button onClick={comprar} className="te-btn-naranja mt-4 min-h-14 w-full rounded-full text-lg font-semibold">
          Comprar ahora
        </button>
        <p className="mt-3 flex gap-2 text-sm text-te-gris">
          <Info size={16} className="mt-0.5 shrink-0" />
          <span>
            Al completar tu pedido aceptas nuestras{' '}
            <button onClick={() => avisar()} className="text-te-enlace underline">Condiciones de uso y venta</button>
            . Consulta nuestro{' '}
            <button onClick={() => avisar()} className="text-te-enlace underline">Aviso de privacidad</button>.
          </span>
        </p>
      </section>
      {procesando && <Procesando />}
      {sinSaldo && <ModalSinSaldo datos={sinSaldo} onCerrar={cerrarSinSaldo} q={compra.q} />}
    </Marco>
  )
}
