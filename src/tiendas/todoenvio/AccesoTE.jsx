import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Info, Mail, X } from 'lucide-react'
import { AvisoCampos, BotonEjemplo, Recordatorio, revisarCampos, useAvisoSimulador, useUrl } from '../../components/comun/Simulador'
import { useNota, useNotas } from '../../components/comun/Notas'
import { LogoTodoenvio } from '../../components/comun/Logos'
import { useSim } from '../../store/useSim'
import ej from '../../data/ejemplo.json'
import { euros } from '../../lib/formato'
import { SALDO_INICIAL } from '../../lib/todoenvio'
import { BASE, DOMINIO, T, useTienda } from './comun'
import { AnadirMetodo, ModalSaldo } from './PagosTE'

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
const nuevoCodigo = () => String(Math.floor(100000 + Math.random() * 900000))

// Notificación que imita la llegada de un correo al móvil
function AvisoCodigo({ codigo, email, onCerrar }) {
  return (
    <div role="status" className="nota-entrada fixed left-1/2 top-3 z-[75] w-[min(94vw,440px)] -translate-x-1/2 rounded-2xl bg-white p-3 font-sans shadow-2xl ring-1 ring-slate-300">
      <div className="flex items-start gap-3">
        <span className="rounded-xl bg-sky-700 p-2 text-white"><Mail size={22} aria-hidden /></span>
        <div className="min-w-0 flex-1">
          <p className="text-sm text-slate-600">Correo Ficticio · ahora</p>
          <p className="font-bold">Todoenvío: verifica tu cuenta</p>
          <p className="truncate text-sm text-slate-600">Para: {email}</p>
          <p className="mt-1 text-lg">
            Tu código es <b className="text-2xl tracking-widest">{codigo}</b>
          </p>
        </div>
        <button onClick={onCerrar} className="rounded-full p-2 hover:bg-slate-100" aria-label="Cerrar notificación"><X size={20} /></button>
      </div>
    </div>
  )
}

export default function AccesoTE() {
  const t = useTienda()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const registrar = useSim((s) => s.registrar)
  const iniciarSesion = useSim((s) => s.iniciarSesion)
  const anadirCorreo = useSim((s) => s.anadirCorreoCuenta)
  const avisar = useAvisoSimulador()
  const { cerrar: cerrarNota } = useNotas()
  const [paso, setPaso] = useState('email') // email → contrasena | crear → otp → pago
  const [v, setV] = useState({ email: '', nombre: '', contrasena: '', contrasena2: '' })
  const [faltan, setFaltan] = useState([])
  const [ver, setVer] = useState(true)
  const [codigo, setCodigo] = useState('')
  const [escrito, setEscrito] = useState('')
  const [aviso, setAviso] = useState(false)
  const [saldoNuevo, setSaldoNuevo] = useState(false)

  useUrl(`${DOMINIO}/ap/${paso === 'email' || paso === 'contrasena' ? 'signin' : paso === 'otp' ? 'cvf/verify' : paso === 'pago' ? 'register/payment' : 'register'}`)
  useNota('https-candado')
  useNota('contrasena', paso === 'crear' || paso === 'contrasena', 600)
  useNota('codigo-verificacion', paso === 'otp', 1800)
  useNota('pago-seguro', paso === 'pago', 700)
  // El paso cambia sin cambiar de página: el consejo anterior no debe quedarse tapando el nuevo formulario
  useEffect(() => {
    cerrarNota()
  }, [paso, cerrarNota])

  const siguiente = params.get('siguiente')
  const modo = params.get('modo')
  const destino = siguiente ? `${BASE}/tramitar/${siguiente}${modo ? `?modo=${modo}` : ''}` : `${BASE}/tu`
  const cambia = (k) => (e) => setV({ ...v, [k]: e.target.value })
  const existe = t.cuentas.find((c) => c.email.toLowerCase() === v.email.trim().toLowerCase())
  const inicial = (existe?.nombre || v.email)[0]?.toUpperCase()

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

  const enviarCodigo = () => {
    setCodigo(nuevoCodigo())
    setEscrito('')
    setAviso(true)
  }

  const crear = (e) => {
    e.preventDefault()
    const f = revisarCampos(v, [
      ['nombre', 'Tu nombre y apellidos'],
      ['email', 'Correo electrónico o número de móvil'],
      ['contrasena', 'Contraseña'],
      ['contrasena2', 'Repetir la contraseña'],
    ])
    if (v.contrasena && v.contrasena2 && v.contrasena !== v.contrasena2) f.push('Las dos contraseñas deben ser iguales. Vuelve a escribirlas con calma.')
    setFaltan(f)
    if (f.length) return
    enviarCodigo()
    setPaso('otp')
  }

  const verificar = (e) => {
    e.preventDefault()
    if (!escrito.trim()) return setFaltan(['Código de verificación'])
    if (escrito.trim() !== codigo) return setFaltan([`El código no coincide. Míralo en el aviso de correo: es el ${codigo}.`])
    setFaltan([])
    setAviso(false)
    registrar(T, v.nombre.trim(), v.email.trim())
    anadirCorreo({ asunto: 'Te damos la bienvenida a Todoenvío', resumen: 'Tu cuenta se ha creado correctamente', texto: `Hola, ${v.nombre.trim().split(' ')[0]}: tu cuenta de Todoenvío ya está lista. Tu código de verificación fue ${codigo}. Recuerda que nunca te lo pediremos por teléfono.` })
    setPaso('pago')
  }

  const rellenar = () => {
    setV({ email: v.email || ej.email, nombre: ej.nombreCompleto, contrasena: ej.contrasena, contrasena2: ej.contrasena })
    setFaltan([])
  }

  const fuerza = fuerzaContrasena(v.contrasena)

  return (
    <div className="min-h-screen bg-white font-sans text-te-tinta">
      {aviso && paso === 'otp' && <AvisoCodigo codigo={codigo} email={v.email} onCerrar={() => setAviso(false)} />}
      <div className="flex justify-center py-5">
        <Link to={BASE} aria-label="Todoenvío, ir al inicio">
          <LogoTodoenvio alto={36} />
        </Link>
      </div>
      <main className="mx-auto max-w-md px-4 pb-10">
        {paso !== 'email' && <Recordatorio className="mb-4" />}

        {paso === 'email' && (
          <form onSubmit={continuar} noValidate className="rounded-xl border border-slate-300 p-5">
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
            <p className="mt-1 text-te-gris">¿Ya eres cliente?</p>
            <div className="mt-3 flex items-center gap-3 border-t border-slate-200 pt-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-300 text-xl font-bold text-white" aria-hidden>{inicial}</span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{existe?.nombre.split(' ')[0]}</p>
                <p className="truncate text-te-gris">{v.email}</p>
              </div>
              <button type="button" onClick={() => setPaso('email')} className="min-h-11 text-te-enlace hover:underline">Cambiar</button>
            </div>
            <label htmlFor="te-pass" className="mt-4 block font-bold">Contraseña de Todoenvío</label>
            <input id="te-pass" data-nota="contrasena" type={ver ? 'text' : 'password'} placeholder="Contraseña de Todoenvío" value={v.contrasena} onChange={cambia('contrasena')} className={`${campo} mt-1`} />
            <div className="mt-2 flex items-center justify-between gap-2">
              <label className="flex min-h-11 items-center gap-2">
                <input type="checkbox" checked={ver} onChange={() => setVer(!ver)} className="h-5 w-5" /> Mostrar contraseña
              </label>
              <button type="button" onClick={() => avisar('En el simulador puedes escribir cualquier contraseña.')} className="text-right text-te-enlace hover:underline">
                ¿Has olvidado la contraseña?
              </button>
            </div>
            <label className="flex min-h-11 items-center gap-2">
              <input type="checkbox" className="h-5 w-5" /> Recuérdame.
            </label>
            <AvisoCampos faltan={faltan} className="mt-3" />
            <button type="submit" className="te-btn-amarillo mt-3 min-h-12 w-full rounded-full text-[1.05rem]">Iniciar sesión</button>
            <BotonEjemplo className="mt-3" onClick={rellenar} />
            <p className="my-3 text-center text-te-gris">o</p>
            {['Iniciar sesión con una clave de acceso', 'Iniciar sesión con un código'].map((x) => (
              <button key={x} type="button" onClick={() => avisar()} className="mb-3 min-h-12 w-full rounded-full border border-[#888c8c]">{x}</button>
            ))}
          </form>
        )}

        {paso === 'crear' && (
          <form onSubmit={crear} noValidate className="rounded-xl border border-slate-300 p-5">
            <h1 className="text-2xl font-bold">Crear cuenta</h1>
            <p className="mt-2 flex gap-2 rounded-lg bg-sky-50 p-3 text-sky-950">
              <Info className="mt-0.5 shrink-0" size={20} /> Parece que eres nuevo en Todoenvío. Crea una cuenta para continuar.
            </p>
            <label htmlFor="te-nombre" className="mt-4 block font-bold">Tu nombre</label>
            <input id="te-nombre" placeholder="Nombre y apellidos" value={v.nombre} onChange={cambia('nombre')} className={`${campo} mt-1`} />
            <label htmlFor="te-email2" className="mt-3 block font-bold">Número de móvil o correo electrónico</label>
            <input id="te-email2" value={v.email} onChange={cambia('email')} className={`${campo} mt-1`} />
            <label htmlFor="te-pass1" className="mt-3 block font-bold">Contraseña</label>
            <input id="te-pass1" data-nota="contrasena" type={ver ? 'text' : 'password'} placeholder="Al menos 6 caracteres" value={v.contrasena} onChange={cambia('contrasena')} className={`${campo} mt-1`} />
            {fuerza && (
              <div className="mt-2" aria-live="polite">
                <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                  <div className={`h-full ${fuerza.color}`} style={{ width: fuerza.ancho }} />
                </div>
                <p className="text-sm">Seguridad de la contraseña: <b>{fuerza.texto}</b></p>
              </div>
            )}
            <p className="mt-1 flex gap-1 text-sm text-te-gris">
              <Info size={16} className="mt-0.5 shrink-0" /> Las contraseñas deben tener al menos 6 caracteres.
            </p>
            <label htmlFor="te-pass2" className="mt-3 block font-bold">Vuelve a escribir la contraseña</label>
            <input id="te-pass2" type={ver ? 'text' : 'password'} value={v.contrasena2} onChange={cambia('contrasena2')} className={`${campo} mt-1`} />
            <label className="mt-2 flex min-h-11 items-center gap-2">
              <input type="checkbox" checked={ver} onChange={() => setVer(!ver)} className="h-5 w-5" /> Mostrar contraseña
            </label>
            <AvisoCampos faltan={faltan} className="mt-3" />
            <button type="submit" className="te-btn-amarillo mt-4 min-h-12 w-full rounded-full text-[1.05rem]">Verificar correo electrónico</button>
            <BotonEjemplo className="mt-3" onClick={rellenar} />
            <p className="mt-4 text-sm">
              ¿Ya tienes una cuenta?{' '}
              <button type="button" onClick={() => setPaso('email')} className="text-te-enlace hover:underline">Iniciar sesión</button>
            </p>
          </form>
        )}

        {paso === 'otp' && (
          <form onSubmit={verificar} noValidate className="rounded-xl border border-slate-300 p-5">
            <h1 className="text-2xl font-bold">Verificar la dirección de correo electrónico</h1>
            <p className="mt-2 leading-relaxed">
              Para verificar tu correo electrónico, te hemos enviado un código de un solo uso a <b className="[overflow-wrap:anywhere]">{v.email}</b>{' '}
              <button type="button" onClick={() => setPaso('crear')} className="text-te-enlace hover:underline">(Cambiar)</button>
            </p>
            <label htmlFor="te-otp" className="mt-4 block font-bold">Introducir código</label>
            <input id="te-otp" data-nota="codigo" value={escrito} onChange={(e) => setEscrito(e.target.value)} inputMode="numeric" autoComplete="off" className={`${campo} mt-1 text-center text-xl tracking-[0.3em]`} />
            <AvisoCampos faltan={faltan} className="mt-3" />
            <button type="submit" className="te-btn-amarillo mt-4 min-h-12 w-full rounded-full text-[1.05rem]">Crear tu cuenta de Todoenvío</button>
            <BotonEjemplo className="mt-3" onClick={() => { setEscrito(codigo); setFaltan([]) }} />
            <button type="button" onClick={enviarCodigo} className="mt-3 min-h-11 w-full text-center text-te-enlace hover:underline">Reenviar el código</button>
          </form>
        )}

        {paso === 'pago' && (
          <div>
            <h1 className="text-2xl font-bold">Añade un método de pago</h1>
            <p className="mt-2 text-lg leading-snug">
              Tu cuenta ya está creada. Guarda una tarjeta o un medio de pago para comprar con más comodidad.
            </p>
            <p className="my-3 rounded-xl bg-indigo-50 p-3 font-sans text-indigo-950 ring-1 ring-indigo-300">
              En el simulador puedes inventarte todos los datos. Al guardarlo recibirás <b>{euros(SALDO_INICIAL)}</b> ficticios para practicar.
            </p>
            <AnadirMetodo onAnadido={(primero) => (primero ? setSaldoNuevo(true) : navigate(destino))} />
            <button onClick={() => navigate(destino)} className="mt-4 min-h-12 w-full text-center text-te-enlace hover:underline">Ahora no, añadirlo más tarde</button>
          </div>
        )}
      </main>
      {saldoNuevo && <ModalSaldo textoBoton={siguiente ? 'Continuar con mi compra' : 'Empezar a comprar'} onContinuar={() => navigate(siguiente ? destino : BASE)} />}
      <footer className="border-t border-slate-200 bg-gradient-to-b from-slate-50 to-white py-6 text-center text-sm">
        <div className="flex flex-wrap justify-center gap-4">
          {['Condiciones de uso', 'Aviso de privacidad', 'Ayuda', 'Cookies'].map((x) => (
            <button key={x} onClick={() => avisar()} className="min-h-10 text-te-enlace hover:underline">{x}</button>
          ))}
        </div>
        <p className="mt-2 text-te-gris">© 2026 Todoenvío · Tienda ficticia para prácticas</p>
      </footer>
    </div>
  )
}
