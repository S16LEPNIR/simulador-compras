import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { GraduationCap, Info, Lock, RotateCcw, Star, TriangleAlert, Volume2, VolumeX, WandSparkles, X } from 'lucide-react'
import { useSim } from '../../store/useSim'
import { callar, hablar } from '../../lib/voz'
import notasData from '../../data/notas.json'
import { NotasProvider } from './Notas'

// ---------- Dirección web simulada ----------
const UrlCtx = createContext({ url: '', setUrl: () => {} })

// Cada pantalla declara la dirección web que se muestra en la barra simulada
export function useUrl(url) {
  const { setUrl } = useContext(UrlCtx)
  useEffect(() => {
    setUrl(url)
  }, [url, setUrl])
}

function BarraNavegador({ url }) {
  const [info, setInfo] = useState(false)
  const m = url.match(/^(https:\/\/)([^/]+)(.*)$/) || ['', 'https://', url, '']
  return (
    <div className="sticky top-0 z-50 bg-slate-800 px-2 py-1.5 font-sans shadow-md">
      <div
        data-nota="barra-url"
        className="relative mx-auto flex max-w-5xl items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-[15px]"
      >
        <button
          onClick={() => setInfo(!info)}
          className="flex shrink-0 items-center justify-center rounded-full p-1 text-green-700 hover:bg-slate-200"
          aria-label="Información de seguridad de la página"
        >
          <Lock size={17} strokeWidth={2.5} />
        </button>
        <p className="min-w-0 flex-1 truncate" title={url}>
          <span className="text-green-800">{m[1]}</span>
          <span className="font-semibold text-slate-900">{m[2]}</span>
          <span className="text-slate-600">{m[3]}</span>
        </p>
        {info && (
          <div className="absolute left-0 top-full z-50 mt-2 w-72 rounded-xl bg-white p-4 text-slate-800 shadow-xl ring-1 ring-slate-200">
            <p className="flex items-center gap-2 font-bold text-green-800">
              <Lock size={18} /> La conexión es segura
            </p>
            <p className="mt-1 text-sm">
              Los datos que envíes a <b>{m[2]}</b> viajan cifrados (protocolo https). <i>En este simulador la página es ficticia.</i>
            </p>
            <button onClick={() => setInfo(false)} className="mt-2 text-sm font-semibold text-indigo-700 underline">
              Cerrar
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ---------- Aviso breve para opciones decorativas ----------
const AvisoCtx = createContext(() => {})
export const useAvisoSimulador = () => useContext(AvisoCtx)

// ---------- Marco general del simulador ----------
export function Simulador({ children }) {
  const [url, setUrl] = useState('https://')
  const [confirmar, setConfirmar] = useState(false)
  const [aviso, setAviso] = useState(null)
  const avisar = (texto = 'Esta opción es decorativa: no está disponible en el simulador.') => {
    setAviso({ texto, t: Date.now() })
  }
  useEffect(() => {
    if (!aviso) return
    const t = setTimeout(() => setAviso(null), 4000)
    return () => clearTimeout(t)
  }, [aviso])
  const voz = useSim((s) => s.voz)
  const alternarVoz = useSim((s) => s.alternarVoz)
  const reiniciar = useSim((s) => s.reiniciar)
  const navigate = useNavigate()
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return (
    <UrlCtx.Provider value={{ url, setUrl }}>
      <AvisoCtx.Provider value={avisar}>
      <NotasProvider>
        <div className="flex items-center justify-between gap-2 bg-indigo-950 px-3 py-1.5 font-sans text-white">
          <Link to="/" className="flex min-h-10 items-center gap-2 rounded-lg px-2 text-[15px] font-semibold hover:bg-white/10">
            <GraduationCap size={20} aria-hidden /> <span className="hidden sm:inline">Simulador ·</span> Elegir tienda
          </Link>
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                if (voz) callar()
                alternarVoz()
              }}
              className="flex min-h-10 items-center gap-1.5 rounded-lg px-2 text-[15px] hover:bg-white/10"
              aria-pressed={voz}
            >
              {voz ? <Volume2 size={19} /> : <VolumeX size={19} />}
              <span>{voz ? 'Voz sí' : 'Voz no'}</span>
            </button>
            <button onClick={() => setConfirmar(true)} className="flex min-h-10 items-center gap-1.5 rounded-lg px-2 text-[15px] hover:bg-white/10">
              <RotateCcw size={19} /> <span>Reiniciar</span>
            </button>
          </div>
        </div>
        <BarraNavegador url={url} />
        {children}
        {confirmar && (
          <Modal onCerrar={() => setConfirmar(false)} titulo="¿Reiniciar el simulador?">
            <p className="text-lg">
              Se borrarán la cesta, las cuentas y los pedidos de las dos tiendas. Úsalo para que empiece de cero el siguiente alumno.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                onClick={() => {
                  reiniciar()
                  setConfirmar(false)
                  navigate('/')
                }}
                className="min-h-12 rounded-xl bg-red-700 px-5 text-lg font-bold text-white hover:bg-red-800"
              >
                Sí, reiniciar
              </button>
              <button onClick={() => setConfirmar(false)} className="min-h-12 rounded-xl border-2 border-slate-400 px-5 text-lg font-semibold">
                Cancelar
              </button>
            </div>
          </Modal>
        )}
        {aviso && (
          <div
            key={aviso.t}
            role="status"
            className="fixed left-1/2 top-24 z-[80] w-[min(92vw,420px)] -translate-x-1/2 rounded-xl bg-slate-900 px-4 py-3 text-center font-sans text-[1.02rem] text-white shadow-xl"
          >
            {aviso.texto}
          </div>
        )}
      </NotasProvider>
      </AvisoCtx.Provider>
    </UrlCtx.Provider>
  )
}

// ---------- Ventana modal accesible ----------
export function Modal({ titulo, children, onCerrar, ancho = 'max-w-lg', className = 'font-sans' }) {
  useEffect(() => {
    const f = (e) => e.key === 'Escape' && onCerrar?.()
    window.addEventListener('keydown', f)
    return () => window.removeEventListener('keydown', f)
  }, [onCerrar])
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/55 p-0 sm:items-center sm:p-4" onClick={onCerrar}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        onClick={(e) => e.stopPropagation()}
        className={`relative max-h-[92vh] w-full ${ancho} overflow-y-auto rounded-t-2xl bg-white p-5 text-slate-900 shadow-2xl sm:rounded-2xl ${className}`}
      >
        {onCerrar && (
          <button onClick={onCerrar} className="absolute right-3 top-3 rounded-full p-2 hover:bg-slate-100" aria-label="Cerrar">
            <X size={24} />
          </button>
        )}
        {titulo && <h2 className="mb-3 pr-10 text-xl font-bold">{titulo}</h2>}
        {children}
      </div>
    </div>
  )
}

// ---------- Recordatorio de simulador ----------
export function Recordatorio({ className = '' }) {
  const texto = notasData.recordatorio
  return (
    <div
      role="note"
      className={`flex items-start gap-3 rounded-xl border-2 border-amber-500 bg-amber-50 p-3 font-sans text-[1.02rem] leading-snug text-amber-950 ${className}`}
    >
      <TriangleAlert className="mt-0.5 shrink-0 text-amber-600" size={24} aria-hidden />
      <p className="flex-1 font-semibold">{texto}</p>
      <button
        onClick={() => hablar(texto)}
        className="shrink-0 rounded-full p-2 text-amber-800 hover:bg-amber-100"
        aria-label="Escuchar el recordatorio"
        title="Escuchar"
      >
        <Volume2 size={22} />
      </button>
    </div>
  )
}

// ---------- Botón «Rellenar con datos de ejemplo» ----------
export function BotonEjemplo({ onClick, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-indigo-500 bg-indigo-50 px-4 font-sans text-[1.02rem] font-bold text-indigo-800 hover:bg-indigo-100 ${className}`}
    >
      <WandSparkles size={20} aria-hidden /> Rellenar con datos de ejemplo
    </button>
  )
}

// ---------- Aviso amable de campos pendientes ----------
export function AvisoCampos({ faltan, className = '' }) {
  const ref = useRef(null)
  // Lleva la vista hasta el aviso para que el alumno lo vea
  useEffect(() => {
    if (faltan?.length) ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [faltan])
  if (!faltan?.length) return null
  // Los textos cortos son nombres de campos vacíos; los largos son explicaciones completas
  const campos = faltan.filter((f) => f.length <= 40)
  const mensajes = faltan.filter((f) => f.length > 40)
  return (
    <div ref={ref} role="alert" className={`rounded-xl border-2 border-sky-600 bg-sky-50 p-3 font-sans text-sky-950 ${className}`}>
      {campos.length > 0 && (
        <>
          <p className="flex items-center gap-2 font-bold">
            <Info size={20} aria-hidden /> Te falta rellenar {campos.length === 1 ? 'un dato' : 'algunos datos'}:
          </p>
          <ul className="mt-1 list-disc pl-8 text-[1.02rem]">
            {campos.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </>
      )}
      {mensajes.map((m) => (
        <p key={m} className={`flex gap-2 text-[1.02rem] ${campos.length ? 'mt-2' : 'font-semibold'}`}>
          {!campos.length && <Info size={20} className="mt-0.5 shrink-0" aria-hidden />} {m}
        </p>
      ))}
      {campos.length > 0 && <p className="mt-1 text-sm">Puedes inventártelos o pulsar «Rellenar con datos de ejemplo».</p>}
    </div>
  )
}

// Validación permisiva: solo comprueba que no esté vacío y avisa con un texto amable
export function revisarCampos(valores, requeridos) {
  return requeridos.filter(([campo]) => !String(valores[campo] ?? '').trim()).map(([, etiqueta]) => etiqueta)
}

// ---------- Estrellas ----------
export function Estrellas({ valor, tam = 16, color = '#e47911', vacio = '#d5d9d9' }) {
  return (
    <span className="inline-flex items-center" role="img" aria-label={`${String(valor).replace('.', ',')} de 5 estrellas`}>
      {[1, 2, 3, 4, 5].map((i) => {
        const relleno = Math.max(0, Math.min(1, valor - i + 1))
        return (
          <span key={i} className="relative inline-block" style={{ width: tam, height: tam }}>
            <Star size={tam} color={color} fill={vacio} strokeWidth={1.2} className="absolute inset-0" style={{ color }} />
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${relleno * 100}%` }}>
              <Star size={tam} color={color} fill={color} strokeWidth={1.2} />
            </span>
          </span>
        )
      })}
    </span>
  )
}

// Carrusel horizontal que se desliza con el dedo
export function Carrusel({ children, className = '' }) {
  return <div className={`flex snap-x gap-3 overflow-x-auto pb-2 [scrollbar-width:thin] ${className}`}>{children}</div>
}
