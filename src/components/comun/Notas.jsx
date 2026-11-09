import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { GraduationCap, RotateCcw, Volume2, VolumeX, X } from 'lucide-react'
import notasData from '../../data/notas.json'
import { useSim } from '../../store/useSim'
import { callar, hablar } from '../../lib/voz'

const AJ = { segundosVisible: 14, segundosEntreNotasAleatorias: 75, segundosMinimoEntreNotas: 6, ...notasData.ajustes }
const NOTAS = Object.fromEntries(notasData.notas.map((n) => [n.id, n]))
const ALEATORIAS = notasData.notas.filter((n) => n.aleatoria)

const Ctx = createContext({ mostrar: () => {}, leer: () => {}, cerrar: () => {} })
export const useNotas = () => useContext(Ctx)

// Muestra una nota la primera vez que se entra en una pantalla (tras un pequeño retraso para que la página se dibuje)
export function useNota(id, activa = true, retraso = 900) {
  const { mostrar } = useNotas()
  useEffect(() => {
    if (!activa) return
    const t = setTimeout(() => mostrar(id), retraso)
    return () => clearTimeout(t)
  }, [id, activa, retraso, mostrar])
}

// Muestra una nota cuando el alumno llega (desplazándose) a una parte concreta de la página
export function useNotaAlVer(ref, id) {
  const { mostrar } = useNotas()
  useEffect(() => {
    const el = ref.current
    if (!el || !('IntersectionObserver' in window)) return
    const obs = new IntersectionObserver(
      (entradas) => {
        if (entradas.some((e) => e.isIntersecting)) {
          mostrar(id)
          obs.disconnect()
        }
      },
      { threshold: 0.25 },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [ref, id, mostrar])
}

function resaltar(objetivo) {
  document.querySelectorAll('.nota-resaltado').forEach((el) => el.classList.remove('nota-resaltado'))
  if (!objetivo) return
  const candidatos = [...document.querySelectorAll(`[data-nota="${objetivo}"]`)]
  const el = candidatos.find((e) => e.offsetParent !== null || e.getClientRects().length) || candidatos[0]
  if (!el) return
  el.classList.add('nota-resaltado')
  const r = el.getBoundingClientRect()
  if (r.bottom < 60 || r.top > window.innerHeight - 200) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

export function NotasProvider({ children }) {
  const voz = useSim((s) => s.voz)
  const alternarVoz = useSim((s) => s.alternarVoz)
  const marcarNotaVista = useSim((s) => s.marcarNotaVista)
  const [actual, setActual] = useState(null)
  const cola = useRef([])
  const ultima = useRef(Date.now())
  const cerrandoHasta = useRef(0)
  const actualRef = useRef(null)
  actualRef.current = actual

  const siguiente = useCallback(() => {
    if (actualRef.current || !cola.current.length) return
    const espera = Math.max(0, cerrandoHasta.current - Date.now())
    setTimeout(() => {
      if (actualRef.current || !cola.current.length) return
      const n = cola.current.shift()
      setActual({ ...n, clave: Date.now() })
      ultima.current = Date.now()
      marcarNotaVista(n.id)
    }, espera)
  }, [marcarNotaVista])

  const mostrar = useCallback(
    (id, { forzar = false } = {}) => {
      const n = NOTAS[id]
      if (!n) return
      const vistas = useSim.getState().notasVistas
      if (!forzar && vistas[id]) return
      if (actualRef.current?.id === id || cola.current.some((x) => x.id === id)) return
      cola.current.push(n)
      siguiente()
    },
    [siguiente],
  )

  const cerrar = useCallback(() => {
    callar()
    resaltar(null)
    setActual(null)
    cerrandoHasta.current = Date.now() + AJ.segundosMinimoEntreNotas * 1000
  }, [])

  // Cuando se cierra una nota, pasa a la siguiente de la cola
  useEffect(() => {
    if (!actual) siguiente()
  }, [actual, siguiente])

  // Al aparecer: resaltar el elemento y leer en voz alta
  useEffect(() => {
    if (!actual) return
    const t0 = setTimeout(() => resaltar(actual.objetivo), 50)
    if (useSim.getState().voz) hablar(actual.texto)
    const t = setTimeout(cerrar, AJ.segundosVisible * 1000)
    return () => {
      clearTimeout(t0)
      clearTimeout(t)
    }
  }, [actual, cerrar])

  // Notas aleatorias de vez en cuando, sin saturar
  useEffect(() => {
    const i = setInterval(() => {
      if (actualRef.current || cola.current.length) return
      if (Date.now() - ultima.current < AJ.segundosEntreNotasAleatorias * 1000) return
      const vistas = useSim.getState().notasVistas
      const pendientes = ALEATORIAS.filter((n) => !vistas[n.id])
      if (!pendientes.length) return
      mostrar(pendientes[Math.floor(Math.random() * pendientes.length)].id)
    }, 10000)
    return () => clearInterval(i)
  }, [mostrar])

  // Al cambiar de página se cierra la nota anterior (las de la nueva página aparecen enseguida)
  const { pathname } = useLocation()
  useEffect(() => {
    cola.current = []
    if (!actualRef.current) return
    callar()
    resaltar(null)
    setActual(null)
    cerrandoHasta.current = 0
  }, [pathname])

  useEffect(() => () => callar(), [])

  const leer = useCallback((texto) => useSim.getState().voz && hablar(texto), [])

  return (
    <Ctx.Provider value={{ mostrar, leer, cerrar }}>
      {children}
      {actual && (
        <div
          key={actual.clave}
          role="status"
          aria-live="polite"
          className="nota-entrada nota-tarjeta fixed z-[70] left-1/2 -translate-x-1/2 bottom-[5.5rem] md:bottom-6 md:left-auto md:right-6 md:translate-x-0 w-[min(94vw,440px)] rounded-2xl bg-white shadow-2xl border-2 border-violet-600 overflow-hidden font-sans"
        >
          <div className="flex items-start gap-3 p-4 pb-3">
            <div className="shrink-0 rounded-full bg-violet-100 p-2 text-violet-700">
              <GraduationCap size={26} aria-hidden />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold uppercase tracking-wide text-violet-700">Consejo del simulador</p>
              <p className="mt-1 text-[1.08rem] leading-snug text-slate-900">{actual.texto}</p>
            </div>
            <button onClick={cerrar} className="-mr-1 -mt-1 rounded-full p-2 text-slate-600 hover:bg-slate-100" aria-label="Cerrar consejo">
              <X size={24} />
            </button>
          </div>
          <div className="flex gap-2 px-4 pb-3">
            <button
              onClick={() => {
                setActual({ ...actual, clave: Date.now() })
              }}
              className="flex min-h-11 items-center gap-2 rounded-full bg-violet-600 px-4 font-semibold text-white hover:bg-violet-700"
            >
              <RotateCcw size={18} /> Repetir
            </button>
            <button
              onClick={() => {
                if (voz) callar()
                alternarVoz()
              }}
              className="flex min-h-11 items-center gap-2 rounded-full border-2 border-violet-600 px-4 font-semibold text-violet-700 hover:bg-violet-50"
            >
              {voz ? <VolumeX size={18} /> : <Volume2 size={18} />} {voz ? 'Silenciar voz' : 'Activar voz'}
            </button>
          </div>
          <div className="h-1.5 bg-violet-100">
            <div className="nota-progreso h-full bg-violet-600" style={{ animationDuration: `${AJ.segundosVisible}s` }} />
          </div>
        </div>
      )}
    </Ctx.Provider>
  )
}
