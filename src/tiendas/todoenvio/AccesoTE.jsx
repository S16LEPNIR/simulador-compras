import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Info } from 'lucide-react'
import { AvisoCampos, BotonEjemplo, Recordatorio, revisarCampos, useAvisoSimulador, useUrl } from '../../components/comun/Simulador'
import { useNota } from '../../components/comun/Notas'
import { LogoTodoenvio } from '../../components/comun/Logos'
import { useSim } from '../../store/useSim'
import ej from '../../data/ejemplo.json'
import { BASE, DOMINIO, T, useTienda } from './comun'

export function fuerzaContrasena(c) {
  let p = 0
  if (c.length >= 8) p++
  if (c.length >= 12) p++
  if (/[A-Z]/.test(c) && /[a-z]/.test(c)) p++
  if (/\d/.test(c)) p++
  if (/[^A-Za-z0-9]/.test(c)) p++
  if (!c) return null
  if (p <= 2) return { texto: 'Débil', color: 'bg-red-600', ancho: '33%' }
  if (p <= 3) return { texto: 'Media', color: 'bg-amber-500', ancho: '66%' }
  return { texto: 'Segura', color: 'bg-green-600', ancho: '100%' }
}

const campo = 'min-h-12 w-full rounded-md border border-[#888c8c] px-3 text-[1.05rem] shadow-inner focus:border-[#e77600] focus:outline-none focus:ring-2 focus:ring-[#e77600]/40'

export default function AccesoTE() {
  const t = useTienda()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const registrar = useSim((s) => s.registrar)
  const iniciarSesion = useSim((s) => s.iniciarSesion)
  const avisar = useAvisoSimulador()
  const [paso, setPaso] = useState('email')
  const [v, setV] = useState({ email: '', nombre: '', contrasena: '', contrasena2: '' })
  const [faltan, setFaltan] = useState([])
  const [ver, setVer] = useState(false)

  useUrl(`${DOMINIO}/ap/${paso === 'crear' ? 'register' : 'signin'}`)
  useNota('https-candado')
  useNota('contrasena', paso !== 'email', 600)

  const siguiente = params.get('siguiente')
  const modo = params.get('modo')
  const destino = siguiente ? `${BASE}/tramitar/${siguiente}${modo ? `?modo=${modo}` : ''}` : `${BASE}/tu`
  const cambia = (k) => (e) => setV({ ...v, [k]: e.target.value })
  const existe = t.cuentas.find((c) => c.email.toLowerCase() === v.email.trim().toLowerCase())

  const continuar = (e) => {
    e.preventDefault()
    const email = v.email.trim()
    if (!email) return setFaltan(['Correo electrónico o número de móvil'])
    if (!email.includes('@') && email.replace(/\D/g, '').length < 9)
      return setFaltan(['Un correo electrónico lleva una arroba (@), por ejemplo: nombre@correo.es. También puedes escribir un número de móvil.'])
    setFaltan([])
    setPaso(existe ? 'contrasena' : 'crear')
  }

  const entrar = (e) => {
    e.preventDefault()
    if (!v.contrasena) return setFaltan(['Contraseña'])
    iniciarSesion(T, v.email.trim())
    navigate(destino)
  }

  const crear = (e) => {
    e.preventDefault()
    const f = revisarCampos(v, [
      ['nombre', 'Tu nombre y apellidos'],
      ['email', 'Correo electrónico o número de móvil'],
      ['contrasena', 'Contraseña'],
      ['contrasena2', 'Repetir la contraseña'],
    ])
    if (v.contrasena && v.contrasena2 && v.contrasena !== v.contrasena2) f.push('Las dos contraseñas deben ser iguales')
    setFaltan(f)
    if (f.length) return
    registrar(T, v.nombre.trim(), v.email.trim())
    navigate(destino)
  }

  const rellenar = () => {
    setV({ email: v.email || ej.email, nombre: ej.nombreCompleto, contrasena: ej.contrasena, contrasena2: ej.contrasena })
    setFaltan([])
  }

  const fuerza = fuerzaContrasena(v.contrasena)

  return (
    <div className="min-h-screen bg-white font-sans text-te-tinta">
      <div className="flex justify-center py-5">
        <Link to={BASE} aria-label="Todoenvío, ir al inicio">
          <LogoTodoenvio alto={36} />
        </Link>
      </div>
      <main className="mx-auto max-w-md px-4 pb-10">
        {paso !== 'email' && <Recordatorio className="mb-4" />}

        <div className="rounded-xl border border-slate-300 p-5">
          {paso === 'email' && (
            <form onSubmit={continuar} noValidate>
              <h1 className="text-2xl font-bold">Iniciar sesión o crear cuenta</h1>
              <label htmlFor="te-email" className="mt-4 block font-bold">
                Introduce tu número de teléfono móvil o dirección de correo electrónico
              </label>
              <input id="te-email" type="email" autoComplete="off" value={v.email} onChange={cambia('email')} className={`${campo} mt-1`} />
              <AvisoCampos faltan={faltan} className="mt-3" />
              <button type="submit" className="te-btn-amarillo mt-4 min-h-12 w-full rounded-full text-[1.05rem]">
                Continuar
              </button>
              <BotonEjemplo className="mt-3" onClick={() => { setV({ ...v, email: ej.email }); setFaltan([]) }} />
              <p className="mt-4 text-sm">
                Al continuar, aceptas las <button type="button" onClick={() => avisar()} className="text-te-enlace underline">Condiciones de uso</button> y el{' '}
                <button type="button" onClick={() => avisar()} className="text-te-enlace underline">Aviso de privacidad</button> de Todoenvío.
              </p>
            </form>
          )}

          {paso === 'contrasena' && (
            <form onSubmit={entrar} noValidate>
              <h1 className="text-2xl font-bold">Iniciar sesión</h1>
              <p className="mt-2">
                {v.email}{' '}
                <button type="button" onClick={() => setPaso('email')} className="text-te-enlace hover:underline">
                  Cambiar
                </button>
              </p>
              <label htmlFor="te-pass" className="mt-4 block font-bold">
                Contraseña de Todoenvío
              </label>
              <input id="te-pass" data-nota="contrasena" type={ver ? 'text' : 'password'} value={v.contrasena} onChange={cambia('contrasena')} className={`${campo} mt-1`} />
              <div className="mt-2 flex items-center justify-between gap-2">
                <label className="flex min-h-11 items-center gap-2">
                  <input type="checkbox" checked={ver} onChange={() => setVer(!ver)} className="h-5 w-5" /> Mostrar contraseña
                </label>
                <button type="button" onClick={() => avisar('En el simulador puedes escribir cualquier contraseña.')} className="text-te-enlace hover:underline">
                  ¿Has olvidado la contraseña?
                </button>
              </div>
              <AvisoCampos faltan={faltan} className="mt-3" />
              <button type="submit" className="te-btn-amarillo mt-4 min-h-12 w-full rounded-full text-[1.05rem]">
                Iniciar sesión
              </button>
              <BotonEjemplo className="mt-3" onClick={rellenar} />
            </form>
          )}

          {paso === 'crear' && (
            <form onSubmit={crear} noValidate>
              <h1 className="text-2xl font-bold">Crear cuenta</h1>
              <p className="mt-2 flex gap-2 rounded-lg bg-sky-50 p-3 text-sky-950">
                <Info className="mt-0.5 shrink-0" size={20} /> Parece que eres nuevo en Todoenvío. Crea una cuenta para continuar.
              </p>
              <label htmlFor="te-nombre" className="mt-4 block font-bold">
                Tu nombre
              </label>
              <input id="te-nombre" placeholder="Nombre y apellidos" value={v.nombre} onChange={cambia('nombre')} className={`${campo} mt-1`} />
              <label htmlFor="te-email2" className="mt-3 block font-bold">
                Número de móvil o correo electrónico
              </label>
              <input id="te-email2" value={v.email} onChange={cambia('email')} className={`${campo} mt-1`} />
              <label htmlFor="te-pass1" className="mt-3 block font-bold">
                Contraseña
              </label>
              <input
                id="te-pass1"
                data-nota="contrasena"
                type={ver ? 'text' : 'password'}
                placeholder="Al menos 6 caracteres"
                value={v.contrasena}
                onChange={cambia('contrasena')}
                className={`${campo} mt-1`}
              />
              {fuerza && (
                <div className="mt-2" aria-live="polite">
                  <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                    <div className={`h-full ${fuerza.color}`} style={{ width: fuerza.ancho }} />
                  </div>
                  <p className="text-sm">
                    Seguridad de la contraseña: <b>{fuerza.texto}</b>
                  </p>
                </div>
              )}
              <p className="mt-1 flex gap-1 text-sm text-te-gris">
                <Info size={16} className="mt-0.5 shrink-0" /> Las contraseñas deben tener al menos 6 caracteres.
              </p>
              <label htmlFor="te-pass2" className="mt-3 block font-bold">
                Vuelve a escribir la contraseña
              </label>
              <input id="te-pass2" type={ver ? 'text' : 'password'} value={v.contrasena2} onChange={cambia('contrasena2')} className={`${campo} mt-1`} />
              <label className="mt-2 flex min-h-11 items-center gap-2">
                <input type="checkbox" checked={ver} onChange={() => setVer(!ver)} className="h-5 w-5" /> Mostrar contraseña
              </label>
              <AvisoCampos faltan={faltan} className="mt-3" />
              <button type="submit" className="te-btn-amarillo mt-4 min-h-12 w-full rounded-full text-[1.05rem]">
                Crear tu cuenta de Todoenvío
              </button>
              <BotonEjemplo className="mt-3" onClick={rellenar} />
              <p className="mt-4 text-sm">
                ¿Ya tienes una cuenta?{' '}
                <button type="button" onClick={() => setPaso('email')} className="text-te-enlace hover:underline">
                  Iniciar sesión
                </button>
              </p>
            </form>
          )}
        </div>
      </main>
      <footer className="border-t border-slate-200 bg-gradient-to-b from-slate-50 to-white py-6 text-center text-sm">
        <div className="flex flex-wrap justify-center gap-4">
          {['Condiciones de uso', 'Aviso de privacidad', 'Ayuda', 'Cookies'].map((x) => (
            <button key={x} onClick={() => avisar()} className="min-h-10 text-te-enlace hover:underline">
              {x}
            </button>
          ))}
        </div>
        <p className="mt-2 text-te-gris">© 2026 Todoenvío · Tienda ficticia para prácticas</p>
      </footer>
    </div>
  )
}
