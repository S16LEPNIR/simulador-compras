import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Battery, Camera, ChevronDown, ChevronRight, FastForward, PackageCheck, PackageX, Search, Signal, Wifi } from 'lucide-react'
import { Modal, useUrl } from '../../components/comun/Simulador'
import { useNota } from '../../components/comun/Notas'
import { useSim } from '../../store/useSim'
import { fechaLarga, hora } from '../../lib/formato'
import { ETAPAS, PARADAS, estadoEnvio, instanteEtapa, numeroSeguimiento } from '../../lib/todoenvio'
import { BASE, DOMINIO, useTienda } from './comun'

// ---------- Marco de teléfono: en ordenador la pantalla se ve dentro de un móvil, como en la aplicación ----------
export function MarcoMovil({ children, abajo }) {
  const [reloj, setReloj] = useState(() => hora(new Date()))
  useEffect(() => {
    const i = setInterval(() => setReloj(hora(new Date())), 15000)
    return () => clearInterval(i)
  }, [])
  return (
    <div className="min-h-screen bg-white font-sans text-te-tinta md:bg-[#dfe3e6] md:py-6">
      <div className="relative mx-auto flex w-full flex-col bg-white md:h-[840px] md:w-[410px] md:overflow-hidden md:rounded-[48px] md:border-[12px] md:border-[#17181c] md:shadow-2xl">
        <div className="hidden items-center justify-between bg-[#f4cf9f] px-7 pb-1 pt-2.5 text-[0.9rem] font-semibold md:flex" aria-hidden>
          <span>{reloj}</span>
          <span className="flex items-center gap-1.5">
            <Signal size={15} /> <Wifi size={15} /> <Battery size={18} />
          </span>
        </div>
        <div className="flex-1 pb-20 md:overflow-y-auto md:pb-0">{children}</div>
        {abajo}
      </div>
    </div>
  )
}

function CabeceraApp() {
  const navigate = useNavigate()
  const [texto, setTexto] = useState('')
  return (
    <form
      role="search"
      className="te-cabecera flex items-center gap-2 px-2 py-2.5"
      onSubmit={(e) => {
        e.preventDefault()
        navigate(`${BASE}/buscar?k=${encodeURIComponent(texto.trim() || 'Todo')}`)
      }}
    >
      <button type="button" onClick={() => navigate(-1)} className="rounded-full p-2 hover:bg-black/5" aria-label="Volver atrás">
        <ArrowLeft size={24} />
      </button>
      <div className="flex flex-1 items-center rounded-full bg-white shadow ring-1 ring-black/15">
        <Search size={20} className="ml-3 shrink-0" aria-hidden />
        <input value={texto} onChange={(e) => setTexto(e.target.value)} placeholder="Buscar o hacer una pregunta" aria-label="Buscar en Todoenvío" className="min-h-11 w-full rounded-full bg-transparent px-2 outline-none placeholder:text-te-gris" />
        <Camera size={20} className="mr-3 shrink-0" aria-hidden />
      </div>
    </form>
  )
}

// ---------- Mapa del reparto (dibujo propio, funciona sin internet) ----------
const RUTA = [[60, 412], [60, 340], [140, 340], [140, 270], [220, 270], [220, 200], [300, 200], [300, 66]]
const longitudes = RUTA.slice(1).map(([x, y], i) => Math.hypot(x - RUTA[i][0], y - RUTA[i][1]))
const LONGITUD_TOTAL = longitudes.reduce((a, b) => a + b, 0)

function puntoEnRuta(fraccion) {
  let resta = Math.max(0, Math.min(1, fraccion)) * LONGITUD_TOTAL
  for (let i = 0; i < longitudes.length; i++) {
    if (resta <= longitudes[i]) {
      const k = longitudes[i] ? resta / longitudes[i] : 0
      return [RUTA[i][0] + (RUTA[i + 1][0] - RUTA[i][0]) * k, RUTA[i][1] + (RUTA[i + 1][1] - RUTA[i][1]) * k]
    }
    resta -= longitudes[i]
  }
  return RUTA[RUTA.length - 1]
}

// Ruta que queda por delante (o la ya recorrida) como lista de puntos SVG
function tramoRuta(desde, hasta) {
  const puntos = [puntoEnRuta(desde)]
  let acumulado = 0
  for (let i = 0; i < longitudes.length; i++) {
    acumulado += longitudes[i]
    const f = acumulado / LONGITUD_TOTAL
    if (f > desde && f < hasta) puntos.push(RUTA[i + 1])
  }
  puntos.push(puntoEnRuta(hasta))
  return puntos.map((p) => p.join(',')).join(' ')
}

const CALLES_V = [60, 140, 220, 300, 372]
const CALLES_H = [66, 132, 200, 270, 340, 412]
const MANZANAS = CALLES_V.slice(0, -1).flatMap((x, i) => CALLES_H.slice(0, -1).map((y, j) => ({ x: x + 12, y: y + 12, w: CALLES_V[i + 1] - x - 24, h: CALLES_H[j + 1] - y - 24 })))

function Etiqueta({ x, y, children, color }) {
  const ancho = String(children).length * 8.4 + 18
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-ancho / 2} y="-13" width={ancho} height="26" rx="13" fill="#fff" stroke={color} strokeWidth="1.6" />
      <text textAnchor="middle" y="5" fontSize="14.5" fontWeight="700" fill="#0f1111">{children}</text>
    </g>
  )
}

function Mapa({ estado, cancelado }) {
  const { etapa, recorrido, paradasHechas } = estado
  const [vx, vy] = puntoEnRuta(recorrido)
  const [cx, cy] = RUTA[RUTA.length - 1]
  const enReparto = etapa === 3
  const entregado = etapa === 4
  const paradas = Array.from({ length: PARADAS - 1 }, (_, i) => ({ n: i + 1, p: puntoEnRuta((i + 1) / PARADAS) }))
  const textoFurgoneta = entregado ? null : enReparto ? 'Repartidor' : 'Centro de reparto'
  // La etiqueta no debe salirse del mapa
  const etiquetaX = Math.max(84, Math.min(320, vx))
  return (
    <svg viewBox="0 0 400 440" className="block w-full" role="img" aria-label={enReparto ? `Mapa: la furgoneta va de camino a tu casa, quedan ${PARADAS - paradasHechas} paradas` : 'Mapa del reparto con tu casa y la furgoneta'}>
      <rect width="400" height="440" fill="#f1eee8" />
      {MANZANAS.map((m, i) => (
        <rect key={i} x={m.x} y={m.y} width={m.w} height={m.h} rx="4" fill={(i * 7) % 5 === 0 ? '#e7e3da' : '#ebe8e0'} />
      ))}
      <rect x="152" y="78" width="136" height="110" rx="10" fill="#c9e8bd" />
      <path d="M0 150 C 14 190 30 226 16 300 C 8 350 22 400 12 440 L 0 440 Z" fill="#a9d8ef" />
      <circle cx="186" cy="118" r="11" fill="#b2dba4" />
      <circle cx="248" cy="150" r="14" fill="#b2dba4" />
      <circle cx="222" cy="102" r="8" fill="#b2dba4" />
      {CALLES_H.map((y) => <line key={`h${y}`} x1="0" x2="400" y1={y} y2={y} stroke="#d6d3cb" strokeWidth={y === 200 ? 18 : 13} />)}
      {CALLES_V.map((x) => <line key={`v${x}`} y1="0" y2="440" x1={x} x2={x} stroke="#d6d3cb" strokeWidth="13" />)}
      {CALLES_H.map((y) => <line key={`hc${y}`} x1="0" x2="400" y1={y} y2={y} stroke={y === 200 ? '#fbe6a2' : '#fff'} strokeWidth={y === 200 ? 15 : 10} />)}
      {CALLES_V.map((x) => <line key={`vc${x}`} y1="0" y2="440" x1={x} x2={x} stroke="#fff" strokeWidth="10" />)}
      <g fill="#7b7f83" fontSize="11.5">
        <text x="312" y="196">Av. del Puerto</text>
        <text x="72" y="336">C/ de los Olmos</text>
        <text x="172" y="128" fill="#4f8a42">Parque de la Alameda</text>
      </g>

      {!cancelado && !entregado && (
        <>
          {enReparto && <polyline points={tramoRuta(0, recorrido)} fill="none" stroke="#9aa5ad" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />}
          <polyline points={tramoRuta(enReparto ? recorrido : 0, 1)} fill="none" stroke="#1a8fd1" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={enReparto ? undefined : '2 12'} />
          {paradas.filter((s) => !enReparto || s.n > paradasHechas).map((s) => (
            <circle key={s.n} cx={s.p[0]} cy={s.p[1]} r="6" fill="#fff" stroke="#1a8fd1" strokeWidth="3" />
          ))}
        </>
      )}

      {/* Punto del comprador: su casa */}
      <circle className="te-pulso" cx={cx} cy={cy} r="24" fill="#1a8fd1" opacity="0.3" />
      <circle cx={cx} cy={cy} r="20" fill={entregado ? '#067d62' : '#1a8fd1'} stroke="#fff" strokeWidth="3" />
      <path d={`M${cx - 10} ${cy + 1} L${cx} ${cy - 9} L${cx + 10} ${cy + 1} M${cx - 7} ${cy - 1} V${cy + 9} H${cx + 7} V${cy - 1}`} fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <Etiqueta x={cx - 42} y={cy - 36} color="#1a8fd1">Tu casa</Etiqueta>

      {/* Punto de la furgoneta */}
      {!cancelado && !entregado && (
        <>
          <g className="te-furgoneta" style={{ transform: `translate(${vx}px, ${vy}px)` }}>
            <circle r="22" fill="#232f3e" stroke="#fff" strokeWidth="3" />
            <path d="M-13 -7 H4 V7 H-13 Z M4 -3 H10 L14 2 V7 H4 Z" fill="#ffd814" />
            <circle cx="-7" cy="9" r="3.4" fill="#fff" />
            <circle cx="8" cy="9" r="3.4" fill="#fff" />
          </g>
          <g className="te-furgoneta" style={{ transform: `translate(${etiquetaX}px, ${Math.max(40, vy - 36)}px)` }}>
            <Etiqueta x={0} y={0} color="#232f3e">{textoFurgoneta}</Etiqueta>
          </g>
        </>
      )}
    </svg>
  )
}

// Barra horizontal con las cuatro fases que enseña la aplicación
const FASES = ['Pedido realizado', 'Enviado', 'En reparto', 'Entregado']
const FASE_DE_ETAPA = [0, 0, 1, 2, 3]

function BarraFases({ etapa }) {
  const fase = FASE_DE_ETAPA[etapa]
  return (
    <ol className="relative mt-4 grid grid-cols-4" aria-label="Progreso del envío">
      <span className="absolute left-[12.5%] right-[12.5%] top-[9px] h-1.5 rounded bg-[#d5d9d9]" aria-hidden />
      <span className="absolute left-[12.5%] top-[9px] h-1.5 rounded bg-[#067d62] transition-[width] duration-700" style={{ width: `${(fase / 3) * 75}%` }} aria-hidden />
      {FASES.map((f, i) => (
        <li key={f} className="relative flex flex-col items-center text-center text-sm leading-tight" aria-current={i === fase ? 'step' : undefined}>
          <span className={`h-6 w-6 rounded-full border-4 border-white ${i <= fase ? 'bg-[#067d62]' : 'bg-[#d5d9d9]'}`} aria-hidden />
          <span className={`mt-1 ${i === fase ? 'font-bold' : 'text-te-gris'}`}>{f}</span>
        </li>
      ))}
    </ol>
  )
}

const LUGARES = (p) => ['', `Centro logístico de ${p.direccion.provincia}`, `Salida del centro logístico de ${p.direccion.provincia}`, `Oficina de reparto de ${p.direccion.localidad}`, p.direccion.localidad]

const INSTRUCCIONES = ['En la puerta de casa', 'Entregar en mano', 'Con el conserje', 'Con un vecino']

function Actualizaciones({ p, estado, ahora }) {
  const lugares = LUGARES(p)
  const pasos = ETAPAS.slice(0, estado.etapa + 1)
    .map((nombre, i) => ({ nombre, lugar: lugares[i], cuando: instanteEtapa(p, i, ahora) }))
    .reverse()
  return (
    <ol className="mt-2 border-l-2 border-[#d5d9d9] pl-4">
      {pasos.map((x, i) => (
        <li key={x.nombre} className="relative pb-3 last:pb-0">
          <span className={`absolute -left-[23px] top-1.5 h-3 w-3 rounded-full ${i === 0 ? 'bg-[#067d62]' : 'bg-[#a6adb3]'}`} aria-hidden />
          <p className={i === 0 ? 'font-bold' : ''}>{x.nombre}</p>
          <p className="text-sm text-te-gris">{x.lugar ? `${x.lugar} · ` : ''}{fechaLarga(x.cuando)}, {hora(x.cuando)}</p>
        </li>
      ))}
    </ol>
  )
}

export default function SeguimientoTE({ barraInferior }) {
  const { id } = useParams()
  const t = useTienda()
  const avanzar = useSim((s) => s.avanzarEnvio)
  const actualizarPedido = useSim((s) => s.actualizarPedido)
  const [ahora, setAhora] = useState(() => Date.now())
  const [verTodo, setVerTodo] = useState(false)
  const [modalInstr, setModalInstr] = useState(false)
  const p = t.pedidos.find((x) => x.id === id)

  useEffect(() => {
    const i = setInterval(() => setAhora(Date.now()), 1000)
    return () => clearInterval(i)
  }, [])
  useUrl(`${DOMINIO}/progress-tracker/package?orderId=${id}`)
  useNota('seguimiento-mapa', !!p && !p.cancelado)
  useNota('sms-reparto', !!p && !p.cancelado, 16000)

  if (!p)
    return (
      <MarcoMovil abajo={barraInferior}>
        <CabeceraApp />
        <p className="p-6 text-lg">No se ha encontrado el pedido.</p>
      </MarcoMovil>
    )

  // Date.now() para que un avance manual se vea al momento, sin esperar al siguiente segundo
  const instante = Math.max(ahora, Date.now())
  const estado = estadoEnvio(p, instante)
  const { etapa, cancelado } = estado
  const lineasActivas = p.lineas.filter((l) => !l.cancelada)
  const instruccion = p.instruccion || INSTRUCCIONES[0]

  const titulo = cancelado ? 'Pedido cancelado' : etapa === 4 ? 'Entregado' : etapa === 3 ? 'Llega hoy' : `Llega el ${fechaLarga(new Date(p.entrega.fecha))}`
  const subtitulo = cancelado
    ? 'Este paquete no se enviará. El importe ha vuelto a tu saldo.'
    : etapa === 4
      ? `Se ha dejado: ${instruccion.toLowerCase()}`
      : etapa === 3
        ? estado.paradasRestantes > 1
          ? `Tu repartidor está a ${estado.paradasRestantes} paradas`
          : 'Tu entrega es la siguiente'
        : etapa === 2
          ? 'Tu paquete va de camino a tu zona'
          : etapa === 1
            ? 'Estamos preparando tu paquete'
            : 'Hemos recibido tu pedido'

  return (
    <MarcoMovil abajo={barraInferior}>
      <CabeceraApp />
      <main data-nota="seguimiento">
        <div className="px-4 pt-4">
          <h1 className="text-[1.7rem] font-extrabold leading-tight text-te-verde first-letter:uppercase" style={cancelado || etapa === 4 ? { color: '#0f1111' } : undefined}>
            {titulo}
          </h1>
          <p className="mt-0.5 text-lg" aria-live="polite">{subtitulo}</p>
          {etapa === 3 && !cancelado && <p className="text-te-gris">Faltan unos {estado.minutosRestantes} min (tiempo acelerado del simulador)</p>}
          {!cancelado && <BarraFases etapa={etapa} />}
        </div>

        <div data-nota="mapa" className="relative mt-4 overflow-hidden border-y border-slate-200">
          <Mapa estado={estado} cancelado={cancelado} />
          {etapa < 3 && !cancelado && (
            <p className="absolute inset-x-3 bottom-3 rounded-lg bg-white/95 p-2.5 text-center shadow ring-1 ring-black/10">
              Cuando salga a reparto, verás moverse aquí la furgoneta.
            </p>
          )}
          {cancelado && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/80 text-center text-lg font-semibold">
              <PackageX size={48} aria-hidden /> Envío cancelado
            </div>
          )}
          {etapa === 4 && !cancelado && (
            <div className="absolute inset-x-3 bottom-3 flex items-center gap-3 rounded-lg bg-white/95 p-3 shadow ring-1 ring-black/10">
              <PackageCheck size={32} className="shrink-0 text-[#067d62]" aria-hidden />
              <p>Tu paquete ha llegado. Puedes devolverlo si no te convence.</p>
            </div>
          )}
        </div>

        <div className="space-y-3 p-4">
          {etapa < 4 && !cancelado && (
            <button onClick={() => avanzar(p.id)} className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-indigo-500 bg-indigo-50 font-bold text-indigo-800 hover:bg-indigo-100">
              <FastForward size={20} aria-hidden /> {etapa === 3 ? 'Simular siguiente parada' : 'Simular avance del pedido'}
            </button>
          )}

          <button onClick={() => setVerTodo(!verTodo)} aria-expanded={verTodo} className="flex min-h-12 w-full items-center justify-between text-left text-te-enlace">
            Ver todas las actualizaciones <ChevronDown className={verTodo ? 'rotate-180' : ''} aria-hidden />
          </button>
          {verTodo && <Actualizaciones p={p} estado={estado} ahora={instante} />}

          <section className="rounded-xl border border-slate-300 p-3">
            <p className="text-sm text-te-gris">Enviado con Todoenvío Logística</p>
            <p className="text-sm text-te-gris">Número de seguimiento: {numeroSeguimiento(p.id)}</p>
            <div className="ocultar-scroll mt-2 flex gap-2 overflow-x-auto">
              {(lineasActivas.length ? lineasActivas : p.lineas).map((l, i) => (
                <Link key={i} to={`${BASE}/producto/${l.id}`} className="h-20 w-20 shrink-0 rounded bg-[#f7f7f7] p-1">
                  <img src={l.imagen} alt={l.titulo} className="h-full w-full object-contain mix-blend-multiply" />
                </Link>
              ))}
            </div>
          </section>

          <div className="overflow-hidden rounded-xl bg-[#f0f2f2]">
            <Link to={`${BASE}/pedidos/${p.id}`} className="flex min-h-14 items-center justify-between border-b border-white px-4">
              Ver los detalles del pedido <ChevronRight aria-hidden />
            </Link>
            {estado.puedeCancelar && (
              <Link to={`${BASE}/pedidos/${p.id}/cancelar`} className="flex min-h-14 items-center justify-between border-b border-white px-4">
                Cancelar los productos <ChevronRight aria-hidden />
              </Link>
            )}
            {!cancelado && etapa < 4 && (
              <button onClick={() => setModalInstr(true)} className="flex min-h-14 w-full items-center justify-between px-4 text-left">
                <span>
                  Instrucciones de entrega
                  <span className="block text-sm text-te-gris">{instruccion}</span>
                </span>
                <ChevronRight aria-hidden />
              </button>
            )}
          </div>
          {!cancelado && etapa < 2 && <p className="text-sm text-te-gris">Puedes cancelar el pedido hasta que el paquete salga del almacén.</p>}
          <p className="pb-3 text-sm text-te-gris">Enviar a: {p.direccion.nombre}, {p.direccion.calle}, {p.direccion.localidad}</p>
        </div>
      </main>

      {modalInstr && (
        <Modal titulo="Instrucciones de entrega" onCerrar={() => setModalInstr(false)}>
          <fieldset className="space-y-2">
            <legend className="mb-2">¿Dónde dejamos el paquete si no estás?</legend>
            {INSTRUCCIONES.map((x) => (
              <label key={x} className="flex min-h-12 items-center gap-3">
                <input type="radio" name="instruccion" checked={instruccion === x} onChange={() => actualizarPedido(p.id, { instruccion: x })} className="h-6 w-6 accent-[#e77600]" /> {x}
              </label>
            ))}
          </fieldset>
          <button onClick={() => setModalInstr(false)} className="te-btn-amarillo mt-4 min-h-12 w-full rounded-full">Guardar</button>
        </Modal>
      )}
    </MarcoMovil>
  )
}
