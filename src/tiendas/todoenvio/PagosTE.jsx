import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Building2, ChevronDown, ChevronLeft, ChevronRight, CircleCheck, CreditCard, Gift, Info, Lock, MapPin, Smartphone, TriangleAlert } from 'lucide-react'
import { AvisoCampos, BotonEjemplo, Modal, Recordatorio, revisarCampos, useAvisoSimulador, useUrl } from '../../components/comun/Simulador'
import { useNota, useNotas } from '../../components/comun/Notas'
import { useSim } from '../../store/useSim'
import ej from '../../data/ejemplo.json'
import { euros, fechaCompleta } from '../../lib/formato'
import { CODIGO_REGALO, IMPORTE_REGALO, SALDO_INICIAL, nombreCortoMetodo, nombreMetodo, pareceTarjetaReal, ultimasCifras } from '../../lib/todoenvio'
import { BASE, DOMINIO, T, useTienda } from './comun'

const campo =
  'min-h-12 w-full rounded-md border border-[#888c8c] bg-white px-3 text-[1.05rem] shadow-inner focus:border-[#e77600] focus:outline-none focus:ring-2 focus:ring-[#e77600]/40'

const formatearTarjeta = (s) =>
  s
    .replace(/\D/g, '')
    .slice(0, 19)
    .replace(/(.{4})/g, '$1 ')
    .trim()

const MESES = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'))
const ANOS = Array.from({ length: 12 }, (_, i) => String(new Date().getFullYear() + i))

// Dibujo de la tarjeta en la cartera. Diseño propio, sin logotipos de bancos ni de redes de pago.
const FONDOS = { credito: 'from-[#f26b21] to-[#f8a13f]', debito: 'from-[#0f8a9d] to-[#39c0c9]', bizum: 'from-[#05a6a0] to-[#0f7c8e]', cuenta: 'from-[#4b5a6b] to-[#79879a]' }
export function DibujoTarjeta({ m, grande = false }) {
  const Icono = m.tipo === 'bizum' ? Smartphone : m.tipo === 'cuenta' ? Building2 : CreditCard
  return (
    <span className={`flex shrink-0 items-end justify-between rounded-md bg-gradient-to-br p-1.5 text-white shadow-sm ${FONDOS[m.tipo] || FONDOS.credito} ${grande ? 'h-32 w-52 p-3' : 'h-10 w-16'}`} aria-hidden>
      <Icono size={grande ? 28 : 15} />
      {grande && <span className="font-mono text-lg tracking-wider">•••• {m.ultimos4}</span>}
    </span>
  )
}

// ---------- Formularios para añadir un método de pago ----------
function FormTarjeta({ onGuardar }) {
  const [v, setV] = useState({ tipo: 'credito', numero: '', titular: '', mes: '01', ano: ANOS[2], cvv: '' })
  const [faltan, setFaltan] = useState([])
  const cambia = (k) => (e) => setV({ ...v, [k]: k === 'numero' ? formatearTarjeta(e.target.value) : e.target.value })
  const enviar = (e) => {
    e.preventDefault()
    // Vale cualquier dato inventado: solo se comprueba que el campo no esté vacío
    const f = revisarCampos(v, [
      ['numero', 'Número de tarjeta'],
      ['titular', 'Nombre en la tarjeta'],
      ['cvv', 'Código de seguridad (CVV)'],
    ])
    setFaltan(f)
    if (f.length) return
    // Buena práctica: nunca se guarda el número completo ni el CVV, solo las 4 últimas cifras
    onGuardar({ tipo: v.tipo, ultimos4: ultimasCifras(v.numero), titular: v.titular.trim().toUpperCase(), caducidad: `${v.mes}/${v.ano.slice(-2)}` })
  }
  return (
    <form onSubmit={enviar} noValidate className="space-y-3" data-nota="formulario">
      <BotonEjemplo
        onClick={() => {
          const [mes, a] = ej.tarjetaCaducidad.split('/')
          setV({ ...v, numero: ej.tarjetaNumero, titular: ej.tarjetaTitular, mes, ano: `20${a}`, cvv: ej.tarjetaCvv })
          setFaltan([])
        }}
      />
      <fieldset className="flex gap-5">
        <legend className="font-bold">Tipo de tarjeta</legend>
        {[
          ['credito', 'Crédito'],
          ['debito', 'Débito'],
        ].map(([k, txt]) => (
          <label key={k} className="flex min-h-11 items-center gap-2">
            <input type="radio" name="tipo-tarjeta" checked={v.tipo === k} onChange={() => setV({ ...v, tipo: k })} className="h-5 w-5 accent-[#e77600]" /> {txt}
          </label>
        ))}
      </fieldset>
      <label className="block">
        <span className="font-bold">Número de tarjeta</span>
        <input value={v.numero} onChange={cambia('numero')} inputMode="numeric" autoComplete="off" placeholder="0000 0000 0000 0000" className={`${campo} mt-1 tracking-wider`} />
      </label>
      {pareceTarjetaReal(v.numero) && (
        <p role="alert" className="flex gap-2 rounded-lg border-2 border-amber-500 bg-amber-50 p-2 font-sans font-semibold text-amber-950">
          <TriangleAlert size={20} className="mt-0.5 shrink-0" aria-hidden /> Este número podría ser el de una tarjeta de verdad. Recuerda: aquí solo debes escribir números inventados.
        </p>
      )}
      <label className="block">
        <span className="font-bold">Nombre en la tarjeta</span>
        <input value={v.titular} onChange={cambia('titular')} autoComplete="off" className={`${campo} mt-1`} />
      </label>
      <div>
        <span className="font-bold">Fecha de vencimiento</span>
        <div className="mt-1 grid grid-cols-2 gap-3">
          <select value={v.mes} onChange={cambia('mes')} aria-label="Mes de vencimiento" className={campo}>
            {MESES.map((m) => <option key={m}>{m}</option>)}
          </select>
          <select value={v.ano} onChange={cambia('ano')} aria-label="Año de vencimiento" className={campo}>
            {ANOS.map((a) => <option key={a}>{a}</option>)}
          </select>
        </div>
      </div>
      <label className="block max-w-40">
        <span className="font-bold">CVV</span>
        <input value={v.cvv} onChange={cambia('cvv')} inputMode="numeric" maxLength={4} autoComplete="off" className={`${campo} mt-1`} />
      </label>
      <p className="flex gap-2 text-sm text-te-gris">
        <Lock size={16} className="mt-0.5 shrink-0" /> El CVV son las 3 cifras del reverso de la tarjeta. Nunca te lo pedirán por teléfono ni por correo.
      </p>
      <AvisoCampos faltan={faltan} />
      <button type="submit" className="te-btn-amarillo min-h-12 w-full rounded-full text-[1.05rem]">
        Añade tu tarjeta
      </button>
    </form>
  )
}

function FormBizum({ onGuardar, titular }) {
  const [tel, setTel] = useState('')
  const [faltan, setFaltan] = useState([])
  const enviar = (e) => {
    e.preventDefault()
    if (!tel.trim()) return setFaltan(['Número de móvil'])
    onGuardar({ tipo: 'bizum', ultimos4: ultimasCifras(tel), titular })
  }
  return (
    <form onSubmit={enviar} noValidate className="space-y-3" data-nota="formulario">
      <BotonEjemplo onClick={() => { setTel(ej.telefono); setFaltan([]) }} />
      <label className="block">
        <span className="font-bold">Número de móvil vinculado a Bizum</span>
        <input value={tel} onChange={(e) => setTel(e.target.value)} inputMode="tel" autoComplete="off" className={`${campo} mt-1`} />
      </label>
      <p className="flex gap-2 text-sm text-te-gris">
        <Info size={16} className="mt-0.5 shrink-0" /> En una compra real, confirmarías cada pago en la aplicación de tu banco.
      </p>
      <AvisoCampos faltan={faltan} />
      <button type="submit" className="te-btn-amarillo min-h-12 w-full rounded-full text-[1.05rem]">
        Añadir Bizum
      </button>
    </form>
  )
}

function FormCuenta({ onGuardar, titular }) {
  const [v, setV] = useState({ titular, iban: '' })
  const [faltan, setFaltan] = useState([])
  const enviar = (e) => {
    e.preventDefault()
    const f = revisarCampos(v, [
      ['titular', 'Titular de la cuenta'],
      ['iban', 'Número de cuenta (IBAN)'],
    ])
    setFaltan(f)
    if (f.length) return
    onGuardar({ tipo: 'cuenta', ultimos4: ultimasCifras(v.iban), titular: v.titular.trim() })
  }
  return (
    <form onSubmit={enviar} noValidate className="space-y-3" data-nota="formulario">
      <BotonEjemplo onClick={() => { setV({ titular: ej.nombreCompleto, iban: 'ES00 0000 0000 0000 0000 0000' }); setFaltan([]) }} />
      <label className="block">
        <span className="font-bold">Titular de la cuenta</span>
        <input value={v.titular} onChange={(e) => setV({ ...v, titular: e.target.value })} autoComplete="off" className={`${campo} mt-1`} />
      </label>
      <label className="block">
        <span className="font-bold">Número de cuenta (IBAN)</span>
        <input value={v.iban} onChange={(e) => setV({ ...v, iban: e.target.value })} autoComplete="off" placeholder="ES00 0000 0000 0000 0000 0000" className={`${campo} mt-1`} />
      </label>
      <AvisoCampos faltan={faltan} />
      <button type="submit" className="te-btn-amarillo min-h-12 w-full rounded-full text-[1.05rem]">
        Añadir cuenta bancaria
      </button>
    </form>
  )
}

const OPCIONES = [
  { id: 'tarjeta', icono: CreditCard, titulo: 'Tarjeta de crédito o débito', texto: 'Se aceptan las principales tarjetas', Form: FormTarjeta },
  { id: 'bizum', icono: Smartphone, titulo: 'Bizum', texto: 'Paga con tu número de móvil', Form: FormBizum },
  { id: 'cuenta', icono: Building2, titulo: 'Cuenta bancaria', texto: 'Cargo directo en tu cuenta', Form: FormCuenta },
]

// Bloque desplegable con las formas de pago. Llama a onAnadido(primero) al guardar.
export function AnadirMetodo({ onAnadido, inicial = 'tarjeta' }) {
  const t = useTienda()
  const anadir = useSim((s) => s.anadirMetodoPago)
  const [abierta, setAbierta] = useState(inicial)
  return (
    <div className="space-y-2" data-nota="metodos-pago">
      {OPCIONES.map(({ id, icono: Icono, titulo, texto, Form }) => (
        <div key={id} className={`rounded-xl border-2 bg-white ${abierta === id ? 'border-[#e77600]' : 'border-slate-300'}`}>
          <button type="button" onClick={() => setAbierta(abierta === id ? null : id)} aria-expanded={abierta === id} className="flex min-h-16 w-full items-center gap-3 p-4 text-left">
            <Icono size={24} aria-hidden />
            <span className="flex-1">
              <b className="block text-[1.05rem]">{titulo}</b>
              <span className="block text-[0.95rem] text-te-gris">{texto}</span>
            </span>
            <ChevronDown className={abierta === id ? 'rotate-180' : ''} aria-hidden />
          </button>
          {abierta === id && (
            <div className="px-4 pb-4">
              <Form titular={t.usuario?.nombre || ''} onGuardar={(datos) => onAnadido(anadir(datos))} />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// Aviso que aparece al guardar el primer método de pago
export function ModalSaldo({ onContinuar, textoBoton = 'Continuar' }) {
  const t = useTienda()
  const { leer } = useNotas()
  useEffect(() => {
    leer(`Método de pago guardado. Ya tienes ${SALDO_INICIAL} euros para practicar. Este dinero no es real.`)
  }, [leer])
  return (
    <Modal onCerrar={onContinuar} ancho="max-w-md">
      <div className="text-center">
        <CircleCheck size={56} className="mx-auto text-te-verde" aria-hidden />
        <h2 className="mt-2 text-2xl font-extrabold">Método de pago añadido</h2>
        {t.pago && (
          <div className="mt-4 flex flex-col items-center gap-2">
            <DibujoTarjeta m={t.pago} grande />
            <p>{nombreMetodo(t.pago)}</p>
          </div>
        )}
        <div className="mt-4 rounded-xl bg-indigo-50 p-4 font-sans text-indigo-950 ring-1 ring-indigo-300">
          <p className="text-lg">Ya tienes disponible</p>
          <p className="text-4xl font-extrabold">{euros(SALDO_INICIAL)}</p>
          <p className="mt-1">para practicar tus compras. Es dinero ficticio: no se cobra nada de verdad.</p>
        </div>
        <button onClick={onContinuar} className="te-btn-amarillo mt-5 min-h-12 w-full rounded-full text-[1.05rem]">
          {textoBoton}
        </button>
      </div>
    </Modal>
  )
}

// ---------- Mi cartera ----------
function FilaMetodo({ m }) {
  const t = useTienda()
  const elegir = useSim((s) => s.elegirMetodoPago)
  const eliminar = useSim((s) => s.eliminarMetodoPago)
  const [abierta, setAbierta] = useState(false)
  const [confirmar, setConfirmar] = useState(false)
  const predeterminado = t.pago?.id === m.id
  return (
    <li className="border-b border-slate-200 last:border-0">
      <button onClick={() => setAbierta(!abierta)} aria-expanded={abierta} className="flex min-h-20 w-full items-center gap-3 py-3 text-left">
        <DibujoTarjeta m={m} />
        <span className="min-w-0 flex-1">
          {predeterminado && <span className="mb-0.5 inline-block rounded bg-[#c6f1e3] px-1.5 text-sm">Predeterminado</span>}
          <span className="block">{nombreCortoMetodo(m)}</span>
          <span className="block truncate text-sm text-te-gris">{m.titular}</span>
        </span>
        <ChevronRight className={abierta ? 'rotate-90' : ''} aria-hidden />
      </button>
      {abierta && (
        <div className="space-y-2 pb-4 pl-[4.75rem]">
          {m.caducidad && <p>Caduca el {m.caducidad}</p>}
          <div className="flex flex-wrap gap-2">
            {!predeterminado && (
              <button onClick={() => elegir(m.id)} className="min-h-11 rounded-full border border-slate-400 px-4">
                Hacer predeterminado
              </button>
            )}
            <button onClick={() => setConfirmar(true)} className="min-h-11 rounded-full border border-slate-400 px-4">
              Eliminar
            </button>
          </div>
        </div>
      )}
      {confirmar && (
        <Modal titulo="¿Eliminar este método de pago?" onCerrar={() => setConfirmar(false)}>
          <p className="text-lg">{nombreMetodo(m)}</p>
          <div className="mt-5 flex gap-3">
            <button onClick={() => setConfirmar(false)} className="min-h-12 flex-1 rounded-full border border-slate-400">
              Cancelar
            </button>
            <button onClick={() => { eliminar(m.id); setConfirmar(false) }} className="te-btn-amarillo min-h-12 flex-1 rounded-full">
              Eliminar
            </button>
          </div>
        </Modal>
      )}
    </li>
  )
}

function Transacciones() {
  const t = useTienda()
  if (!t.movimientos.length) return <p className="py-4 text-lg">Todavía no hay transacciones.</p>
  return (
    <ul className="divide-y divide-slate-200">
      {t.movimientos.map((m) => (
        <li key={m.id} className="flex justify-between gap-3 py-3">
          <div className="min-w-0">
            <p>{fechaCompleta(new Date(m.fecha))}</p>
            <p className="font-semibold">{m.concepto}</p>
            <p className="text-sm text-te-gris">{m.metodo}</p>
            {m.pedidoId && (
              <Link to={`${BASE}/pedidos/${m.pedidoId}`} className="text-sm text-te-enlace hover:underline">
                Pedido n.º {m.pedidoId}
              </Link>
            )}
          </div>
          <div className="shrink-0 text-right">
            <p className={`text-lg font-bold ${m.importe > 0 ? 'text-te-verde' : ''}`}>
              {m.importe > 0 ? '+' : ''}
              {euros(m.importe)}
            </p>
            <p className="text-sm text-te-gris">{m.estado}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}

function Preferencias() {
  const t = useTienda()
  return (
    <div className="rounded-xl border border-slate-300 p-4">
      <h2 className="font-bold">Tu preferencia de compra</h2>
      {t.direccion ? (
        <p className="mt-2">
          {t.direccion.nombre}
          <br />
          {t.direccion.calle} {t.direccion.piso}
          <br />
          {t.direccion.codigoPostal} {t.direccion.localidad}
        </p>
      ) : (
        <p className="mt-2 text-te-gris">Aún no tienes una dirección guardada.</p>
      )}
      <p className="mt-2">{t.pago ? nombreMetodo(t.pago) : 'Aún no tienes un método de pago.'}</p>
      <p className="mt-3 text-sm text-te-gris">Se usa para la compra rápida con el botón «Comprar ya».</p>
    </div>
  )
}

function Pestanas({ activa, onCambiar }) {
  const lista = [
    ['metodos', 'Métodos de pago'],
    ['transacciones', 'Transacciones'],
    ['ajustes', 'Configuración'],
  ]
  return (
    <div role="tablist" className="ocultar-scroll mt-3 flex gap-5 overflow-x-auto border-b border-slate-200">
      {lista.map(([k, txt]) => (
        <button key={k} role="tab" aria-selected={activa === k} onClick={() => onCambiar(k)} className={`min-h-11 shrink-0 border-b-2 px-1 ${activa === k ? 'border-te-enlace font-bold text-te-enlace' : 'border-transparent'}`}>
          {txt}
        </button>
      ))}
    </div>
  )
}

export function CarteraTE() {
  const t = useTienda()
  const [pestana, setPestana] = useState('metodos')
  useUrl(`${DOMINIO}/cpe/yourpayments/wallet`)
  useNota('saldo-practicas', t.saldo !== null)
  if (!t.usuario)
    return (
      <div className="p-4">
        <h1 className="text-2xl font-extrabold">Mi cartera</h1>
        <p className="mt-2 text-lg">Identifícate para ver tus métodos de pago.</p>
        <Link to={`${BASE}/identificacion`} className="te-btn-amarillo mt-4 flex min-h-12 w-full items-center justify-center rounded-full">
          Identifícate
        </Link>
      </div>
    )
  return (
    <div className="p-4">
      <h1 className="text-2xl font-extrabold">Mi cartera</h1>
      <Pestanas activa={pestana} onCambiar={setPestana} />
      <div role="tabpanel" className="mt-4">
        {pestana === 'metodos' && (
          <>
            {t.saldo !== null && (
              <section className="mb-4 rounded-xl bg-indigo-50 p-4 font-sans text-indigo-950 ring-1 ring-indigo-300">
                <p>Saldo de prácticas disponible</p>
                <p className="text-3xl font-extrabold">{euros(t.saldo)}</p>
                <p className="mt-1 text-sm">Todos tus métodos de pago usan este mismo saldo ficticio.</p>
              </section>
            )}
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Tarjetas y cuentas</h2>
              <Link to={`${BASE}/cartera/anadir`} className="flex min-h-11 items-center text-te-enlace hover:underline">
                + Añadir nuevo
              </Link>
            </div>
            {t.metodosPago.length ? (
              <ul>{t.metodosPago.map((m) => <FilaMetodo key={m.id} m={m} />)}</ul>
            ) : (
              <p className="mt-2 text-lg">No tienes ningún método de pago guardado.</p>
            )}
            <Link to={`${BASE}/tarjeta-regalo`} className="mt-4 flex min-h-14 items-center justify-between rounded-xl bg-[#f0f2f2] px-4">
              <span className="flex items-center gap-2"><Gift size={20} aria-hidden /> Tarjetas regalo</span>
              <ChevronRight aria-hidden />
            </Link>
          </>
        )}
        {pestana === 'transacciones' && (
          <>
            <h2 className="text-xl font-extrabold">Transacciones</h2>
            <Transacciones />
          </>
        )}
        {pestana === 'ajustes' && <Preferencias />}
      </div>
    </div>
  )
}

export function AnadirPagoTE() {
  const navigate = useNavigate()
  const [saldoNuevo, setSaldoNuevo] = useState(false)
  useUrl(`${DOMINIO}/cpe/yourpayments/wallet/add`)
  useNota('pago-seguro')
  useNota('datos-guardados', true, 2500)
  return (
    <div className="p-4">
      <Link to={`${BASE}/cartera`} className="flex min-h-11 items-center gap-1 text-te-enlace"><ChevronLeft size={18} /> Mi cartera</Link>
      <h1 className="text-2xl font-extrabold">Añadir un método de pago</h1>
      <Recordatorio className="my-3" />
      <AnadirMetodo onAnadido={(primero) => (primero ? setSaldoNuevo(true) : navigate(`${BASE}/cartera`))} />
      {saldoNuevo && <ModalSaldo textoBoton="Ir a mi cartera" onContinuar={() => navigate(`${BASE}/cartera`)} />}
    </div>
  )
}

export function TarjetaRegaloTE() {
  const t = useTienda()
  const canjear = useSim((s) => s.canjearRegalo)
  const [codigo, setCodigo] = useState('')
  const [mensaje, setMensaje] = useState(null)
  useUrl(`${DOMINIO}/gc/redeem`)
  useNota('tarjeta-regalo')
  const aplicar = (e) => {
    e.preventDefault()
    if (t.saldo === null) return setMensaje({ ok: false, texto: 'Primero tienes que añadir un método de pago a tu cuenta.' })
    const yaUsado = t.codigosRegalo.includes(codigo.trim().toUpperCase())
    if (canjear(codigo)) {
      setCodigo('')
      return setMensaje({ ok: true, texto: `Se han añadido ${euros(IMPORTE_REGALO)} a tu saldo.` })
    }
    setMensaje({ ok: false, texto: yaUsado ? 'Este código ya se ha canjeado.' : 'Este código no es válido. Compruébalo e inténtalo de nuevo.' })
  }
  return (
    <div className="p-4">
      <h1 className="text-xl">Tu saldo disponible:</h1>
      <p className="text-4xl text-te-verde">{euros(t.saldo || 0)}</p>
      <form onSubmit={aplicar} className="mt-5 space-y-3 border-t border-slate-200 pt-4">
        <label className="block">
          <span className="font-bold">Canjear una tarjeta regalo</span>
          <input value={codigo} onChange={(e) => setCodigo(e.target.value)} autoComplete="off" placeholder="Introduce el código" className={`${campo} mt-1`} />
        </label>
        {mensaje && (
          <p role="status" className={`rounded-lg p-3 font-semibold ${mensaje.ok ? 'bg-green-50 text-green-900' : 'bg-red-50 text-red-900'}`}>
            {mensaje.texto}
          </p>
        )}
        <button type="submit" className="te-btn-amarillo min-h-12 w-full rounded-full text-[1.05rem]">
          Aplicar a tu saldo
        </button>
      </form>
      <p className="mt-4 rounded-xl bg-indigo-50 p-3 font-sans text-indigo-950 ring-1 ring-indigo-300">
        Para practicar, usa el código <b>{CODIGO_REGALO}</b>: añade {euros(IMPORTE_REGALO)} una sola vez.
      </p>
    </div>
  )
}

// ---------- Mis direcciones ----------
export function DireccionesTE() {
  const t = useTienda()
  const eliminar = useSim((s) => s.eliminarDireccion)
  const elegir = useSim((s) => s.elegirDireccion)
  const avisar = useAvisoSimulador()
  useUrl(`${DOMINIO}/a/addresses`)
  return (
    <div className="p-4">
      <h1 className="text-2xl font-extrabold">Mis direcciones</h1>
      <Link to={`${BASE}/direcciones/editar`} className="mt-3 flex min-h-14 items-center justify-between border-y border-slate-200">
        Agregar otra dirección <ChevronRight aria-hidden />
      </Link>
      <button onClick={() => avisar('Los puntos de recogida se eligen al tramitar el pedido.')} className="flex min-h-14 w-full items-center justify-between border-b border-slate-200 text-left">
        Añade un nuevo punto de recogida <ChevronRight aria-hidden />
      </button>
      <h2 className="mt-4 font-bold">Direcciones personales</h2>
      {!t.direcciones.length && <p className="mt-2 text-lg">Aún no tienes direcciones guardadas.</p>}
      <ul className="mt-2 space-y-3">
        {t.direcciones.map((d) => (
          <li key={d.id} className="rounded-xl border border-slate-300 p-4">
            {t.direccion?.id === d.id && <p className="mb-1 border-b border-slate-200 pb-1 text-sm text-te-gris">Predeterminada</p>}
            <p className="font-bold">{d.nombre}</p>
            <p>{d.calle} {d.piso}</p>
            <p>{d.codigoPostal} {d.localidad}, {d.provincia}</p>
            <p>{d.pais}</p>
            <p>Número de teléfono: {d.telefono}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Link to={`${BASE}/direcciones/editar?id=${d.id}`} className="flex min-h-11 items-center rounded-full border border-slate-400 px-4">Editar</Link>
              <button onClick={() => eliminar(d.id)} className="min-h-11 rounded-full border border-slate-400 px-4">Descartar</button>
              {t.direccion?.id !== d.id && (
                <button onClick={() => elegir(d.id)} className="min-h-11 rounded-full border border-slate-400 px-4">Hacer predeterminada</button>
              )}
            </div>
          </li>
        ))}
      </ul>
      {t.direccion && (
        <p className="mt-4 flex items-center gap-2 text-te-gris"><MapPin size={18} aria-hidden /> Tu dirección predeterminada es la que verá el repartidor en el mapa.</p>
      )}
    </div>
  )
}
