import { useRef, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Calendar, ChevronLeft, ChevronRight, ChevronUp, CreditCard, Gift, Info, Landmark, Lock, Phone, ShieldCheck, Smartphone, Wallet } from 'lucide-react'
import { AvisoCampos, BotonEjemplo, Modal, Recordatorio, revisarCampos, useAvisoSimulador, useUrl } from '../../components/comun/Simulador'
import { useNota } from '../../components/comun/Notas'
import { LogoGalerias } from '../../components/comun/Logos'
import { useSim } from '../../store/useSim'
import ej from '../../data/ejemplo.json'
import { euros, fechaNumerica, hora, imagenSegunOpciones, numeroPedidoGalerias, textoOpciones } from '../../lib/formato'
import { BASE, G, PASARELA, TPV } from './comun'
import { Totales, guardiaGO, useCompraGO } from './CompraGO'

const METODOS = [
  { id: 'tarjeta-olmo', texto: 'Tarjeta de Galerías Olmo', icono: CreditCard },
  { id: 'credito', texto: 'Línea de Crédito', icono: Landmark },
  { id: 'financiado', texto: 'Pago Financiado con Tarjeta Galerías Olmo', icono: Landmark },
  { id: 'regalo', texto: 'Tarjeta regalo o abono', icono: Gift },
  { id: 'aplazado', texto: 'Pago Aplazado Galerías Olmo', icono: Wallet },
  { id: 'movil', texto: 'Pago con el móvil (monedero digital)', icono: Smartphone },
  { id: 'tarjeta', texto: 'Tarjeta de crédito, débito o wallet', icono: CreditCard, real: true },
  { id: 'paypal', texto: 'PayPal', icono: Wallet },
  { id: 'bizum', texto: 'Bizum', icono: Smartphone },
]

function guardiaPago(c) {
  return guardiaGO(c) || (!c.t.entrega ? `${BASE}/compra/entrega` : !c.t.comprador ? `${BASE}/compra/resumen` : null)
}

// ======================= 3/3 PASARELA DE PAGO =======================
export function PasarelaGO() {
  const c = useCompraGO()
  const actualizar = useSim((s) => s.actualizar)
  const navigate = useNavigate()
  const avisar = useAvisoSimulador()
  const [metodo, setMetodo] = useState(null)
  const [faltan, setFaltan] = useState([])
  const [resumen, setResumen] = useState(false)
  useUrl(`${PASARELA}/pago/elegir-medio`)
  useNota('cambio-dominio')
  useNota('pago-seguro', true, 1200)
  const destino = guardiaPago(c)
  if (destino) return <Navigate to={destino} replace />

  const pagar = () => {
    if (!metodo) return setFaltan(['Elige un medio de pago'])
    if (metodo !== 'tarjeta') return setFaltan(['Este medio de pago es solo decorativo en el simulador. Elige «Tarjeta de crédito, débito o wallet».'])
    actualizar(G, { pago: { metodo: 'tarjeta', pedidoId: c.t.pago?.pedidoId || numeroPedidoGalerias() } })
    navigate(`${BASE}/compra/tpv`)
  }

  return (
    <div className="min-h-screen bg-white pb-28 font-montse text-go-texto">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
        <LogoGalerias alto={30} />
        <div className="flex items-center gap-2">
          <button onClick={() => avisar()} className="min-h-10 px-2">
            Cambiar idioma
          </button>
          <button onClick={() => avisar('Teléfono de atención al cliente ficticio.')} className="rounded-full p-2" aria-label="Llamar a atención al cliente">
            <Phone size={20} />
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4">
        <Recordatorio />
        <h1 className="mt-5 font-semibold tracking-wide">ELIGE MEDIO DE PAGO</h1>
        <ul data-nota="metodos-pago" className="mt-3 divide-y divide-slate-200 border border-slate-200">
          {METODOS.map((m) => (
            <li key={m.id} className={metodo === m.id ? 'bg-slate-50' : ''}>
              <label className="flex min-h-16 cursor-pointer items-center gap-4 px-4">
                <input
                  type="radio"
                  name="metodo"
                  checked={metodo === m.id}
                  onChange={() => {
                    setMetodo(m.id)
                    setFaltan([])
                  }}
                  className="h-6 w-6 shrink-0 accent-black"
                />
                <span className="flex-1">{m.texto}</span>
                <m.icono size={26} strokeWidth={1.5} className={m.real ? 'text-black' : 'text-go-verde'} />
              </label>
              {metodo === m.id && m.real && (
                <p className="px-6 pb-5 leading-relaxed text-go-suave">
                  Al pulsar en el botón «PAGAR COMPRA», serás redirigido a la página segura de pago de tu banco. Tras completar tus datos en sus páginas
                  volverás a la página de confirmación. Según la normativa europea que regula los pagos electrónicos (PSD2), tu banco te podrá solicitar una
                  validación adicional.
                </p>
              )}
              {metodo === m.id && !m.real && <p className="px-6 pb-4 text-sm text-go-suave">(Opción decorativa en el simulador)</p>}
            </li>
          ))}
        </ul>
        <AvisoCampos faltan={faltan} className="mt-4" />
        <button onClick={() => setResumen(true)} className="mt-5 flex min-h-14 w-full items-center justify-between bg-go-gris px-4 font-semibold tracking-wide">
          RESUMEN DE COMPRA <ChevronRight />
        </button>
        <div className="mt-3">
          <Totales c={c} desglose />
        </div>
      </main>
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl gap-3 p-3">
          <button onClick={() => navigate(`${BASE}/compra/resumen`)} className="min-h-14 flex-1 uppercase tracking-wider">
            Volver
          </button>
          <button onClick={pagar} className={`min-h-14 flex-[2] uppercase tracking-wider text-white ${metodo ? 'bg-black hover:bg-[#333]' : 'bg-slate-300'}`}>
            Pagar compra
          </button>
        </div>
      </div>
      {resumen && (
        <Modal titulo="Resumen de compra" onCerrar={() => setResumen(false)} className="font-montse">
          <ul className="divide-y divide-slate-200">
            {c.det.map((l) => (
              <li key={l.clave} className="flex gap-3 py-3">
                <img src={imagenSegunOpciones(l.p, l.opciones)} alt="" className="h-16 w-14 bg-go-gris object-contain p-1" />
                <div>
                  <p>{l.p.tituloCorto}</p>
                  {Object.keys(l.opciones || {}).length > 0 && <p className="text-sm">{textoOpciones(l.opciones)}</p>}
                  <p className="text-sm">
                    {l.cantidad} x {euros(l.precio)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-lg font-semibold">Total: {euros(c.total)}</p>
        </Modal>
      )}
    </div>
  )
}

// ======================= PÁGINA DE PAGO DEL BANCO (TPV) =======================
const formatear = (s) =>
  s
    .replace(/\D/g, '')
    .slice(0, 19)
    .replace(/(.{4})/g, '$1 ')
    .trim()

function CampoTpv({ icono: Icono, ayuda, ...rest }) {
  return (
    <div>
      <label className="flex min-h-14 items-center gap-3 rounded border border-slate-300 px-3 focus-within:border-2 focus-within:border-[#1f8a4c]">
        <Icono size={22} className="shrink-0 text-slate-500" aria-hidden />
        <input {...rest} autoComplete="off" className="w-full bg-transparent text-[1.05rem] outline-none" />
      </label>
      {ayuda && (
        <p className="mt-1 flex items-center gap-1 text-sm text-slate-600">
          <Info size={15} className="text-blue-600" /> {ayuda}
        </p>
      )}
    </div>
  )
}

export function TpvGO() {
  const c = useCompraGO()
  const actualizar = useSim((s) => s.actualizar)
  const navigate = useNavigate()
  const [v, setV] = useState({ numero: '', caducidad: '', cvv: '' })
  const [faltan, setFaltan] = useState([])
  const [abierto, setAbierto] = useState(true)
  const ahora = useRef(new Date()).current
  useUrl(`${TPV}/tpv/realizarPago`)
  useNota('cambio-dominio')
  const destino = guardiaPago(c) || (!c.t.pago?.pedidoId ? `${BASE}/compra/pago` : null)
  if (destino) return <Navigate to={destino} replace />

  const pagar = () => {
    const f = revisarCampos(v, [
      ['numero', 'Número de tarjeta'],
      ['caducidad', 'Caducidad (MM/AA)'],
      ['cvv', 'CVV'],
    ])
    if (v.numero && v.numero.replace(/\D/g, '').length < 12) f.push('El número de tarjeta suele tener 16 cifras (puedes inventarlo)')
    if (v.caducidad && !/^\s*\d{1,2}\s*\/\s*\d{2,4}\s*$/.test(v.caducidad)) f.push('Escribe la caducidad como MM/AA, por ejemplo 12/30')
    if (v.cvv && !/^\d{3,4}$/.test(v.cvv.trim())) f.push('El CVV son las 3 cifras del reverso de la tarjeta')
    setFaltan(f)
    if (f.length) return
    // Solo guardamos las 4 últimas cifras
    actualizar(G, { pago: { ...c.t.pago, ultimos4: v.numero.replace(/\D/g, '').slice(-4) } })
    navigate(`${BASE}/compra/verificacion`)
  }

  const listo = v.numero && v.caducidad && v.cvv
  return (
    <div className="min-h-screen bg-[#f3f4f6] font-sans text-slate-900">
      <header className="flex items-center gap-3 bg-[#1f8a4c] px-3 py-3">
        <button onClick={() => navigate(`${BASE}/compra/pago`)} className="rounded-full p-2 text-white hover:bg-white/10" aria-label="Volver a la tienda">
          <ChevronLeft size={28} />
        </button>
        <div className="mx-auto pr-10">
          <LogoGalerias alto={34} claro />
        </div>
      </header>
      <main className="mx-auto max-w-lg space-y-4 p-4">
        <Recordatorio />
        <section className="rounded border border-slate-300 bg-white">
          <button onClick={() => setAbierto(!abierto)} aria-expanded={abierto} className="flex min-h-14 w-full items-center justify-between border-b border-slate-200 px-4 text-lg">
            Pagar con Tarjeta&nbsp;&nbsp;{euros(c.total)} <ChevronUp className={abierto ? '' : 'rotate-180'} />
          </button>
          {abierto && (
            <div data-nota="formulario" className="space-y-4 p-4">
              <BotonEjemplo
                onClick={() => {
                  setV({ numero: ej.tarjetaNumero, caducidad: ej.tarjetaCaducidad, cvv: ej.tarjetaCvv })
                  setFaltan([])
                }}
              />
              <CampoTpv icono={CreditCard} ayuda="Introduce tu número de tarjeta" placeholder="Número de tarjeta" aria-label="Número de tarjeta" inputMode="numeric" value={v.numero} onChange={(e) => setV({ ...v, numero: formatear(e.target.value) })} />
              <CampoTpv icono={Calendar} placeholder="Caducidad (MM/AA)" aria-label="Caducidad" inputMode="numeric" value={v.caducidad} onChange={(e) => setV({ ...v, caducidad: e.target.value })} />
              <CampoTpv icono={Lock} placeholder="CVV" aria-label="CVV" inputMode="numeric" maxLength={4} value={v.cvv} onChange={(e) => setV({ ...v, cvv: e.target.value })} />
              <AvisoCampos faltan={faltan} />
              <button onClick={pagar} className={`min-h-14 w-full rounded text-lg ${listo ? 'bg-[#1f8a4c] text-white hover:bg-[#18703d]' : 'bg-slate-200 text-slate-600'}`}>
                Pagar
              </button>
            </div>
          )}
        </section>

        <section className="rounded border border-slate-300 bg-white">
          <h2 className="border-b border-slate-200 py-4 text-center text-lg">Datos de la operación</h2>
          <dl className="divide-y divide-slate-200 px-4">
            <div className="flex justify-between py-3">
              <dt className="font-semibold text-[#1f8a4c]">IMPORTE</dt>
              <dd className="text-xl">{euros(c.total)}</dd>
            </div>
            <div className="flex justify-between gap-3 py-3">
              <dt>Comercio:</dt>
              <dd className="text-right italic">Galerías Olmo (ESPAÑA)</dd>
            </div>
            <div className="flex justify-between py-3">
              <dt>Terminal:</dt>
              <dd className="italic">00012345-001</dd>
            </div>
            <div className="flex justify-between py-3">
              <dt>Pedido:</dt>
              <dd className="italic">{c.t.pago.pedidoId}</dd>
            </div>
            <div className="flex justify-between py-3">
              <dt>Fecha:</dt>
              <dd className="italic">
                {fechaNumerica(ahora)} {hora(ahora)}
              </dd>
            </div>
          </dl>
        </section>
        <p className="flex items-center justify-center gap-2 text-center text-sm text-slate-600">
          <ShieldCheck size={18} /> Pago seguro con verificación de tu banco · PagoSeguro Bancario (plataforma ficticia)
        </p>
      </main>
    </div>
  )
}

// ======================= VERIFICACIÓN DEL BANCO (PSD2) =======================
export function VerificacionGO() {
  const c = useCompraGO()
  const crearPedido = useSim((s) => s.crearPedido)
  const navigate = useNavigate()
  const [codigo, setCodigo] = useState('')
  const [faltan, setFaltan] = useState([])
  const hecho = useRef(false)
  useUrl(`${TPV}/tpv/verificacion-banco`)
  useNota('verificacion-banco')
  if (hecho.current) return null
  const destino = guardiaPago(c) || (!c.t.pago?.ultimos4 ? `${BASE}/compra/tpv` : null)
  if (destino) return <Navigate to={destino} replace />

  const confirmar = () => {
    if (!/^\d{4,8}$/.test(codigo.trim())) return setFaltan(['Escribe el código de 6 cifras (en el simulador vale cualquier número, por ejemplo 123456)'])
    const t = c.t
    const nombre = `${t.comprador.nombre} ${t.comprador.apellido1} ${t.comprador.apellido2 || ''}`.trim()
    const pedido = {
      id: t.pago.pedidoId,
      tienda: 'galerias',
      creado: Date.now(),
      lineas: c.det.map((l) => ({
        id: l.id,
        opciones: l.opciones,
        cantidad: l.cantidad,
        precio: l.precio,
        titulo: l.p.tituloCorto,
        imagen: imagenSegunOpciones(l.p, l.opciones),
        vendedor: l.p.vendedor.externo ? l.p.vendedor.nombre : 'Galerías Olmo',
      })),
      direccion: t.modoEntrega === 'envio' ? { ...t.direccion, nombre } : null,
      recogida: t.modoEntrega === 'recogida' ? t.recogida : null,
      entrega: t.entrega,
      pago: { ultimos4: t.pago.ultimos4 },
      subtotal: c.subtotal,
      envio: c.envio,
      total: c.total,
      email: t.usuario?.email || t.invitado?.email,
      nombre,
      invitado: !t.usuario,
    }
    hecho.current = true
    navigate(`${BASE}/compra/confirmacion/${pedido.id}`)
    crearPedido(G, pedido)
    // El número de pedido ya se ha usado. El invitado tendrá que volver a identificarse en la próxima compra.
    useSim.getState().actualizar(G, { pago: null, invitado: null })
  }

  return (
    <div className="min-h-screen bg-[#eef2f7] font-sans text-slate-900">
      <header className="bg-[#123a6b] px-4 py-4 text-white">
        <p className="mx-auto flex max-w-lg items-center gap-2 text-xl font-bold">
          <Landmark /> Banco Ficticio
        </p>
      </header>
      <main className="mx-auto max-w-lg space-y-4 p-4">
        <Recordatorio />
        <section data-nota="verificacion" className="rounded-xl bg-white p-5 shadow">
          <h1 className="text-2xl font-bold">Confirma tu compra</h1>
          <p className="mt-3 text-[1.05rem] leading-relaxed">
            Para completar el pago de <b>{euros(c.total)}</b> en <b>GALERIAS OLMO</b> con tu tarjeta terminada en <b>{c.t.pago.ultimos4}</b>, introduce el código
            que te hemos enviado por SMS al móvil terminado en <b>***000</b>.
          </p>
          <p className="mt-2 rounded-lg bg-amber-50 p-3 text-amber-950">Nunca compartas este código con nadie, ni aunque te llamen diciendo que son del banco.</p>
          <label className="mt-4 block font-semibold" htmlFor="codigo-banco">
            Código de verificación
          </label>
          <input
            id="codigo-banco"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value.replace(/\D/g, '').slice(0, 8))}
            inputMode="numeric"
            autoComplete="off"
            className="mt-1 min-h-14 w-full rounded-lg border-2 border-slate-400 px-4 text-center text-2xl tracking-[0.4em] focus:border-[#123a6b] focus:outline-none"
          />
          <AvisoCampos faltan={faltan} className="mt-3" />
          <button onClick={confirmar} className="mt-4 min-h-14 w-full rounded-lg bg-[#123a6b] text-lg font-bold text-white hover:bg-[#0c2a4f]">
            Confirmar pago
          </button>
          <BotonEjemplo className="mt-3" onClick={() => { setCodigo(ej.codigoBanco); setFaltan([]) }} />
          <p className="mt-3 text-sm text-slate-600">En el simulador vale cualquier código de 6 cifras.</p>
        </section>
      </main>
    </div>
  )
}
