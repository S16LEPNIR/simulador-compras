import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { GraduationCap, RotateCcw, ShieldCheck, Volume2, VolumeX } from 'lucide-react'
import { LogoGalerias, LogoTodoenvio } from './components/comun/Logos'
import { Modal } from './components/comun/Simulador'
import { useSim } from './store/useSim'
import { desbloquearVoz, vozDisponible } from './lib/voz'

function Tarjeta({ to, logo, titulo, texto, fondo, onElegir }) {
  return (
    <Link
      to={to}
      onClick={onElegir}
      className={`group flex flex-col items-center gap-4 rounded-3xl border-4 border-transparent p-6 text-center shadow-lg transition hover:-translate-y-1 hover:shadow-2xl focus-visible:border-indigo-600 sm:p-8 ${fondo}`}
    >
      <div className="flex h-36 w-36 items-center justify-center rounded-full bg-white shadow-inner sm:h-44 sm:w-44">{logo}</div>
      <div>
        <p className="text-2xl font-extrabold text-slate-900 sm:text-3xl">{titulo}</p>
        <p className="mt-2 text-lg text-slate-800">{texto}</p>
      </div>
      <span className="mt-auto inline-flex min-h-14 items-center rounded-full bg-slate-900 px-8 text-xl font-bold text-white group-hover:bg-indigo-700">
        Entrar
      </span>
    </Link>
  )
}

export default function Inicio() {
  const voz = useSim((s) => s.voz)
  const alternarVoz = useSim((s) => s.alternarVoz)
  const reiniciar = useSim((s) => s.reiniciar)
  const [confirmar, setConfirmar] = useState(false)
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white font-sans text-slate-900">
      <header className="bg-indigo-950 px-4 py-4 text-white">
        <div className="mx-auto flex max-w-5xl items-center gap-3">
          <GraduationCap size={34} aria-hidden />
          <div>
            <p className="text-sm uppercase tracking-widest text-indigo-200">Ciberaula · Competencias digitales</p>
            <h1 className="text-2xl font-extrabold sm:text-3xl">Simulador de compras online</h1>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 sm:py-10">
        <p className="text-xl leading-relaxed sm:text-2xl">
          Practica cómo se compra por internet <b>sin ningún riesgo</b>. Elige una tienda para empezar:
        </p>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <Tarjeta
            to="/todoenvio"
            onElegir={desbloquearVoz}
            fondo="bg-gradient-to-b from-[#f8d9b0] to-[#efbd84]"
            logo={<LogoTodoenvio alto={36} />}
            titulo="Todoenvío"
            texto="Una gran tienda online con de todo: se parece a las grandes plataformas de venta por internet."
          />
          <Tarjeta
            to="/galerias"
            onElegir={desbloquearVoz}
            fondo="bg-gradient-to-b from-emerald-50 to-emerald-200"
            logo={<LogoGalerias alto={44} />}
            titulo="Galerías Olmo"
            texto="La web de unos grandes almacenes: compra con envío a casa o recogida en tienda."
          />
        </div>

        <section className="mt-8 rounded-2xl bg-white p-5 shadow ring-1 ring-slate-200">
          <h2 className="flex items-center gap-2 text-xl font-bold">
            <ShieldCheck className="text-green-700" aria-hidden /> Antes de empezar
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-6 text-lg">
            <li>
              Estas tiendas <b>no son reales</b>: no se cobra nada ni se envía ningún paquete.
            </li>
            <li>
              <b>No escribas tus datos reales.</b> Invéntatelos o usa el botón «Rellenar con datos de ejemplo».
            </li>
            <li>
              Durante la práctica aparecerán <b>consejos</b> que se leen en voz alta. Puedes repetirlos o silenciar la voz.
            </li>
          </ul>
          <div className="mt-5 flex flex-wrap gap-3">
            {vozDisponible() && (
              <button
                onClick={alternarVoz}
                aria-pressed={voz}
                className="flex min-h-12 items-center gap-2 rounded-xl border-2 border-indigo-700 px-4 text-lg font-semibold text-indigo-800 hover:bg-indigo-50"
              >
                {voz ? <Volume2 /> : <VolumeX />} Voz de los consejos: {voz ? 'activada' : 'desactivada'}
              </button>
            )}
            <button
              onClick={() => setConfirmar(true)}
              className="flex min-h-12 items-center gap-2 rounded-xl border-2 border-slate-500 px-4 text-lg font-semibold hover:bg-slate-50"
            >
              <RotateCcw /> Reiniciar simulador
            </button>
          </div>
        </section>

        <p className="mt-8 text-center text-slate-600">
          Todoenvío y Galerías Olmo son tiendas y marcas inventadas con fines educativos.{' '}
          <Link to="/creditos" className="font-semibold text-indigo-700 underline">
            Créditos de las imágenes
          </Link>
        </p>
      </main>

      {confirmar && (
        <Modal onCerrar={() => setConfirmar(false)} titulo="¿Reiniciar el simulador?">
          <p className="text-lg">Se borrarán la cesta, las cuentas y los pedidos de las dos tiendas.</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={() => {
                reiniciar()
                setConfirmar(false)
                navigate('/')
              }}
              className="min-h-12 rounded-xl bg-red-700 px-5 text-lg font-bold text-white"
            >
              Sí, reiniciar
            </button>
            <button onClick={() => setConfirmar(false)} className="min-h-12 rounded-xl border-2 border-slate-400 px-5 text-lg font-semibold">
              Cancelar
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
