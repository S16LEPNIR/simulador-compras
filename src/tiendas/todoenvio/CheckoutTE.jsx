import { useRef, useState } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { CreditCard, Gift, Info, Landmark, Lock, Smartphone, Store, Truck } from 'lucide-react'
import { AvisoCampos, BotonEjemplo, Recordatorio, revisarCampos, useAvisoSimulador, useUrl } from '../../components/comun/Simulador'
import { useNota, useNotas } from '../../components/comun/Notas'
import { useSim } from '../../store/useSim'
import ej from '../../data/ejemplo.json'
import { euros, fechaLarga, imagenSegunOpciones, ivaIncluido, numeroPedidoTodoenvio, sumarDias, textoOpciones, totales } from '../../lib/formato'
import { BASE, CabeceraCheckout, DOMINIO, T, useTienda } from './comun'

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
  if (necesita.includes('entrega') && !compra.t.entrega) return <Navigate to={`${BASE}/tramitar/entrega${compra.q}`} replace />
  if (necesita.includes('pago') && !compra.t.pago) return <Navigate to={`${BASE}/tramitar/pago${compra.q}`} replace />
  return children
}

function Marco({ paso, unidades, children }) {
  return (
    <div className="min-h-screen bg-[#f5f6f6] font-sans text-te-tinta">
      <CabeceraCheckout titulo={`Tramitar pedido (${unidades} ${unidades === 1 ? 'producto' : 'productos'})`} paso={paso} />
      <main className="mx-auto max-w-3xl px-3 py-4 pb-12">{children}</main>
    </div>
  )
}

// ================= 1. DIRECCIÓN =================
export function DireccionTE() {
  const compra = useCompra()
  const { t } = compra
  const actualizar = useSim((s) => s.actualizar)
  const navigate = useNavigate()
  const [v, setV] = useState(
    t.direccion || { pais: 'España', nombre: t.usuario?.nombre || '', telefono: '', calle: '', piso: '', codigoPostal: '', localidad: '', provincia: '' },
  )
  const [faltan, setFaltan] = useState([])
  useUrl(`${DOMINIO}/gp/buy/addressselect/handlers/display.html`)
  useNota('direccion-envio')
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
    if (f.length) return
    actualizar(T, { direccion: v })
    navigate(`${BASE}/tramitar/entrega${compra.q}`)
  }

  return (
    <Guardia compra={compra}>
      <Marco paso={1} unidades={compra.unidades}>
        <Recordatorio />
        <h2 className="mt-4 text-2xl font-bold">Añadir una dirección de envío</h2>
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
          <label className="flex min-h-11 items-center gap-2">
            <input type="checkbox" defaultChecked className="h-5 w-5" /> Usar como mi dirección predeterminada
          </label>
          <button type="submit" className="te-btn-amarillo min-h-12 w-full rounded-full text-[1.05rem]">
            Usar esta dirección
          </button>
        </form>
      </Marco>
    </Guardia>
  )
}

// ================= 2. ENTREGA =================
export function opcionesEntregaTE(det) {
  const dias = Math.max(1, ...det.map((l) => l.p.diasEntrega))
  const base = sumarDias(dias)
  return [
    { id: 'estandar', titulo: fechaLarga(base), detalle: 'Entrega estándar', coste: 0, fecha: base },
    { id: 'rapida', titulo: `${fechaLarga(base)}, de 07:00 a 13:00`, detalle: 'Entrega más rápida por la mañana', coste: 1.99, fecha: base },
    { id: 'agrupada', titulo: fechaLarga(sumarDias(dias + 2)), detalle: 'Entrega agrupada: menos cajas y menos viajes', coste: 0, fecha: sumarDias(dias + 2) },
    { id: 'punto', titulo: fechaLarga(sumarDias(dias + 1)), detalle: 'Recogida en un punto de recogida o taquilla cercana', coste: 0, fecha: sumarDias(dias + 1), punto: true },
  ]
}

export function EntregaTE() {
  const compra = useCompra()
  const { t, det } = compra
  const actualizar = useSim((s) => s.actualizar)
  const navigate = useNavigate()
  const ops = opcionesEntregaTE(det)
  const [sel, setSel] = useState(t.entrega?.id || 'estandar')
  const { mostrar } = useNotas()
  useUrl(`${DOMINIO}/gp/buy/shipoptionselect/handlers/display.html`)
  useNota('opciones-entrega')

  return (
    <Guardia compra={compra} necesita={['direccion']}>
      <Marco paso={2} unidades={compra.unidades}>
        <h2 className="text-2xl font-bold">Elige una opción de entrega</h2>
        {t.direccion && (
          <p className="mt-2 rounded-lg bg-white p-3 ring-1 ring-slate-300">
            <b>Enviar a:</b> {t.direccion.nombre}, {t.direccion.calle} {t.direccion.piso}, {t.direccion.codigoPostal} {t.direccion.localidad}{' '}
            <Link to={`${BASE}/tramitar/direccion${compra.q}`} className="text-te-enlace hover:underline">
              Cambiar
            </Link>
          </p>
        )}
        <fieldset data-nota="opciones-entrega" className="mt-3 space-y-2">
          <legend className="sr-only">Opciones de entrega</legend>
          {ops.map((o) => (
            <label
              key={o.id}
              className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 bg-white p-4 ${sel === o.id ? 'border-[#e77600] bg-[#fcf5ee]' : 'border-slate-300'}`}
            >
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
                <b className="block text-[1.05rem] text-te-verde first-letter:uppercase">{o.titulo}</b>
                <span className="flex items-center gap-2">
                  {o.punto ? <Store size={18} /> : <Truck size={18} />}
                  <span>
                    {o.coste ? <b>{euros(o.coste)}</b> : <b>GRATIS</b>} – {o.detalle}
                  </span>
                </span>
              </span>
            </label>
          ))}
        </fieldset>

        <section className="mt-4 rounded-xl bg-white p-4 ring-1 ring-slate-300">
          <h3 className="font-bold">Productos del envío</h3>
          <ul className="mt-2 space-y-3">
            {det.map((l) => (
              <li key={l.clave} className="flex gap-3">
                <img src={imagenSegunOpciones(l.p, l.opciones)} alt="" className="h-16 w-16 rounded bg-[#f7f7f7] object-contain p-1" />
                <div className="text-[0.98rem]">
                  <p className="line-clamp-2">{l.p.tituloCorto}</p>
                  <p className="text-te-gris">
                    Cantidad: {l.cantidad} · Vendido por {l.p.vendedor.externo ? l.p.vendedor.nombre : 'Todoenvío'}
                  </p>
                  {l.p.costeEnvio > 0 && <p className="text-te-rojo">Envío del vendedor: {euros(l.p.costeEnvio)}</p>}
                </div>
              </li>
            ))}
          </ul>
        </section>

        <button
          onClick={() => {
            const o = ops.find((x) => x.id === sel)
            actualizar(T, { entrega: { ...o, fecha: o.fecha.toISOString() } })
            navigate(`${BASE}/tramitar/pago${compra.q}`)
          }}
          className="te-btn-amarillo mt-4 min-h-12 w-full rounded-full text-[1.05rem]"
        >
          Continuar
        </button>
      </Marco>
    </Guardia>
  )
}

// ================= 3. PAGO =================
const formatearTarjeta = (s) =>
  s
    .replace(/\D/g, '')
    .slice(0, 19)
    .replace(/(.{4})/g, '$1 ')
    .trim()

export function revisarTarjeta(v) {
  const f = revisarCampos(v, [
    ['numero', 'Número de tarjeta'],
    ['titular', 'Nombre que aparece en la tarjeta'],
    ['caducidad', 'Fecha de vencimiento'],
    ['cvv', 'Código de seguridad (CVV)'],
  ])
  const n = v.numero.replace(/\D/g, '')
  if (v.numero && n.length < 12) f.push('El número de tarjeta suele tener 16 cifras (puedes inventarlo)')
  if (v.caducidad && !/^\s*\d{1,2}\s*\/\s*\d{2,4}\s*$/.test(v.caducidad)) f.push('Escribe la fecha de vencimiento como MM/AA, por ejemplo 12/30')
  if (v.cvv && !/^\d{3,4}$/.test(v.cvv.trim())) f.push('El código de seguridad (CVV) son 3 cifras que están en el reverso de la tarjeta')
  return f
}

export function PagoTE() {
  const compra = useCompra()
  const { t } = compra
  const actualizar = useSim((s) => s.actualizar)
  const navigate = useNavigate()
  const avisar = useAvisoSimulador()
  const [metodo, setMetodo] = useState(t.pago ? 'guardada' : 'tarjeta')
  const [v, setV] = useState({ numero: '', titular: '', caducidad: '', cvv: '' })
  const [faltan, setFaltan] = useState([])
  const [codigo, setCodigo] = useState('')
  useUrl(`${DOMINIO}/gp/buy/payselect/handlers/display.html`)
  useNota('pago-seguro')
  useNota('datos-guardados', !!t.pago, 1500)
  const cambia = (k) => (e) => setV({ ...v, [k]: k === 'numero' ? formatearTarjeta(e.target.value) : e.target.value })

  const continuar = () => {
    if (metodo === 'guardada') return navigate(`${BASE}/tramitar/revisar${compra.q}`)
    if (metodo !== 'tarjeta') {
      setFaltan(['Esta forma de pago es solo decorativa en el simulador. Elige «Tarjeta de crédito o débito».'])
      return
    }
    const f = revisarTarjeta(v)
    setFaltan(f)
    if (f.length) return
    const n = v.numero.replace(/\D/g, '')
    // Buena práctica: nunca guardamos el número completo, solo las 4 últimas cifras
    actualizar(T, { pago: { tipo: 'Tarjeta', ultimos4: n.slice(-4), titular: v.titular.toUpperCase(), caducidad: v.caducidad } })
    navigate(`${BASE}/tramitar/revisar${compra.q}`)
  }

  const opcion = ({ id, icono, titulo, texto, children }) => (
    <div className={`rounded-xl border-2 bg-white ${metodo === id ? 'border-[#e77600] bg-[#fcf5ee]' : 'border-slate-300'}`}>
      <label className="flex cursor-pointer items-start gap-3 p-4">
        <input type="radio" name="pago" checked={metodo === id} onChange={() => { setMetodo(id); setFaltan([]) }} className="mt-1 h-6 w-6 accent-[#e77600]" />
        <span className="flex-1">
          <span className="flex items-center gap-2 text-[1.05rem] font-bold">
            {icono} {titulo}
          </span>
          {texto && <span className="block text-[0.95rem] text-te-gris">{texto}</span>}
        </span>
      </label>
      {metodo === id && children && <div className="px-4 pb-4">{children}</div>}
    </div>
  )

  return (
    <Guardia compra={compra} necesita={['direccion', 'entrega']}>
      <Marco paso={3} unidades={compra.unidades}>
        <Recordatorio />
        <h2 className="mt-4 text-2xl font-bold">Selecciona un método de pago</h2>
        <AvisoCampos faltan={faltan} className="mt-3" />
        <div data-nota="metodos-pago" className="mt-3 space-y-2">
          {t.pago &&
            opcion({
              id: 'guardada',
              icono: <CreditCard size={20} />,
              titulo: `Tarjeta que termina en ${t.pago.ultimos4}`,
              texto: `${t.pago.titular} · Caduca ${t.pago.caducidad}`,
            })}
          {opcion({ id: 'tarjeta', icono: <CreditCard size={20} />, titulo: t.pago ? 'Añadir otra tarjeta de crédito o débito' : 'Tarjeta de crédito o débito', texto: 'Se aceptan las principales tarjetas', children: (
            <div className="space-y-3" data-nota="formulario">
              <BotonEjemplo
                onClick={() => {
                  setV({ numero: ej.tarjetaNumero, titular: ej.tarjetaTitular, caducidad: ej.tarjetaCaducidad, cvv: ej.tarjetaCvv })
                  setFaltan([])
                }}
              />
              <label className="block">
                <span className="font-bold">Número de tarjeta</span>
                <input value={v.numero} onChange={cambia('numero')} inputMode="numeric" autoComplete="off" placeholder="0000 0000 0000 0000" className={`${campo} mt-1 tracking-wider`} />
              </label>
              <label className="block">
                <span className="font-bold">Nombre en la tarjeta</span>
                <input value={v.titular} onChange={cambia('titular')} autoComplete="off" className={`${campo} mt-1`} />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="font-bold">Vencimiento</span>
                  <input value={v.caducidad} onChange={cambia('caducidad')} placeholder="MM/AA" inputMode="numeric" autoComplete="off" className={`${campo} mt-1`} />
                </label>
                <label className="block">
                  <span className="font-bold">CVV</span>
                  <input value={v.cvv} onChange={cambia('cvv')} inputMode="numeric" maxLength={4} autoComplete="off" className={`${campo} mt-1`} />
                </label>
              </div>
              <p className="flex gap-2 text-sm text-te-gris">
                <Lock size={16} className="mt-0.5 shrink-0" /> El CVV son las 3 cifras del reverso de la tarjeta. Nunca te lo pedirán por teléfono ni por correo.
              </p>
            </div>
          ) })}
          {opcion({ id: 'bizum', icono: <Smartphone size={20} />, titulo: 'Bizum', texto: 'Paga con tu número de móvil (decorativo en el simulador)' })}
          {opcion({ id: 'plazos', icono: <Landmark size={20} />, titulo: 'Pagar a plazos', texto: 'Financiación sujeta a aprobación (decorativo en el simulador)' })}
          <div className="rounded-xl border-2 border-slate-300 bg-white p-4">
            <p className="flex items-center gap-2 font-bold">
              <Gift size={20} /> Tarjetas regalo, cupones y códigos promocionales
            </p>
            <div className="mt-2 flex gap-2">
              <input value={codigo} onChange={(e) => setCodigo(e.target.value)} placeholder="Introduce el código" aria-label="Código promocional" className={campo} />
              <button onClick={() => avisar('Ese código no es válido. En el simulador no hay códigos promocionales.')} className="min-h-12 shrink-0 rounded-full border border-slate-400 px-4">
                Aplicar
              </button>
            </div>
          </div>
        </div>
        <button onClick={continuar} className="te-btn-amarillo mt-4 min-h-12 w-full rounded-full text-[1.05rem]">
          Usar este método de pago
        </button>
      </Marco>
    </Guardia>
  )
}

// ================= 4. REVISAR =================
export function RevisarTE() {
  const compra = useCompra()
  const { t, det, subtotal, envioVendedores } = compra
  const crearPedido = useSim((s) => s.crearPedido)
  const navigate = useNavigate()
  const avisar = useAvisoSimulador()
  useUrl(`${DOMINIO}/gp/buy/spc/handlers/display.html`)
  useNota('revisar-pedido')
  const comprado = useRef(false)

  // Tras comprar, la cesta se vacía: evitamos que la protección nos devuelva a la cesta
  if (comprado.current) return null
  if (!compra.lineas.length || !t.usuario || !t.direccion || !t.entrega || !t.pago) return <Guardia compra={compra} necesita={['direccion', 'entrega', 'pago']} />

  const envio = Math.round(((t.entrega?.coste || 0) + envioVendedores) * 100) / 100
  const total = Math.round((subtotal + envio) * 100) / 100
  const d = t.direccion

  const comprar = () => {
    const pedido = {
      id: numeroPedidoTodoenvio(),
      tienda: 'todoenvio',
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
      direccion: d,
      entrega: t.entrega,
      pago: t.pago,
      subtotal,
      envio,
      total,
      email: t.usuario.email,
      nombre: t.usuario.nombre,
      esCompraYa: compra.compraYa,
    }
    comprado.current = true
    navigate(`${BASE}/pedido-realizado/${pedido.id}`)
    crearPedido(T, pedido)
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
    <Marco paso={4} unidades={compra.unidades}>
      <Recordatorio />
      <h2 className="mt-4 text-2xl font-bold">Revisar el pedido</h2>
      <div className="mt-3 rounded-xl bg-white px-4 ring-1 ring-slate-300">
        <Fila etiqueta="Enviar a" cambiar="direccion">
          <p className="font-bold">{d.nombre}</p>
          <p>
            {d.calle} {d.piso}, {d.codigoPostal} {d.localidad} ({d.provincia})
          </p>
        </Fila>
        <Fila etiqueta="Entrega" cambiar="entrega">
          <p className="font-bold text-te-verde first-letter:uppercase">{t.entrega.titulo}</p>
          <p>
            {t.entrega.coste ? euros(t.entrega.coste) : 'GRATIS'} – {t.entrega.detalle}
          </p>
        </Fila>
        <Fila etiqueta="Pago" cambiar="pago">
          <p className="flex items-center gap-2">
            <CreditCard size={18} /> Tarjeta que termina en <b>{t.pago.ultimos4}</b>
          </p>
        </Fila>
      </div>

      <section className="mt-3 rounded-xl bg-white p-4 ring-1 ring-slate-300">
        <h3 className="font-bold">Productos</h3>
        <ul className="mt-2 space-y-3">
          {det.map((l) => (
            <li key={l.clave} className="flex gap-3">
              <img src={imagenSegunOpciones(l.p, l.opciones)} alt="" className="h-20 w-20 shrink-0 rounded bg-[#f7f7f7] object-contain p-1" />
              <div className="text-[0.98rem]">
                <p className="line-clamp-2 font-semibold">{l.p.titulo}</p>
                {Object.keys(l.opciones || {}).length > 0 && <p>{textoOpciones(l.opciones)}</p>}
                <p>
                  <b className="text-te-rojo">{euros(l.precio)}</b> · Cantidad: {l.cantidad}
                </p>
                <p className="text-te-gris">Vendido por: {l.p.vendedor.externo ? l.p.vendedor.nombre : 'Todoenvío'}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section data-nota="resumen" className="mt-3 rounded-xl bg-white p-4 ring-1 ring-slate-300">
        <h3 className="text-lg font-bold">Resumen del pedido</h3>
        <dl className="mt-2 space-y-1 text-[1.02rem]">
          <div className="flex justify-between">
            <dt>Productos:</dt>
            <dd>{euros(subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Envío:</dt>
            <dd>{envio ? euros(envio) : 'GRATIS'}</dd>
          </div>
          {envioVendedores > 0 && <p className="text-sm text-te-gris">Incluye {euros(envioVendedores)} de envío de vendedores externos.</p>}
          <div className="flex justify-between border-t border-slate-200 pt-2 text-xl font-bold text-te-rojo">
            <dt>Total:</dt>
            <dd>{euros(total)}</dd>
          </div>
          <p className="text-sm text-te-gris">(incluye impuestos: {euros(ivaIncluido(total))} de IVA)</p>
        </dl>
        <button onClick={comprar} className="te-btn-naranja mt-4 min-h-14 w-full rounded-full text-lg font-semibold">
          Comprar ahora
        </button>
        <p className="mt-3 flex gap-2 text-sm text-te-gris">
          <Info size={16} className="mt-0.5 shrink-0" />
          <span>
            Al completar tu pedido aceptas nuestras{' '}
            <button onClick={() => avisar()} className="text-te-enlace underline">
              Condiciones de uso y venta
            </button>
            . Consulta nuestro{' '}
            <button onClick={() => avisar()} className="text-te-enlace underline">
              Aviso de privacidad
            </button>
            .
          </span>
        </p>
      </section>
    </Marco>
  )
}
