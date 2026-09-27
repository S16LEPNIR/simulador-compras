import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Check, Leaf, X } from 'lucide-react'
import { AvisoCampos, BotonEjemplo, Recordatorio, revisarCampos, useAvisoSimulador, useUrl } from '../../components/comun/Simulador'
import { useNota } from '../../components/comun/Notas'
import { LogoGalerias } from '../../components/comun/Logos'
import { useSim } from '../../store/useSim'
import ej from '../../data/ejemplo.json'
import { fuerzaContrasena } from '../todoenvio/AccesoTE'
import { BASE, BotonNegro, DOMINIO, G, useTienda } from './comun'

const campo = 'min-h-14 w-full border border-slate-500 px-4 text-[1.05rem] focus:border-black focus:outline-none focus:ring-2 focus:ring-black/20'

function Marco({ titulo, onAtras, children }) {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-white font-montse text-go-texto">
      <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-4">
        {onAtras ? (
          <button onClick={onAtras} className="rounded-full p-2 hover:bg-slate-100" aria-label="Volver">
            <ArrowLeft size={26} />
          </button>
        ) : (
          <span className="w-10" />
        )}
        <p className="text-lg">{titulo}</p>
        <button onClick={() => navigate(`${BASE}/cesta`)} className="rounded-full p-2 hover:bg-slate-100" aria-label="Cerrar y volver a la cesta">
          <X size={26} />
        </button>
      </div>
      <main className="mx-auto max-w-lg px-6 pb-12">
        <LogoGalerias alto={44} />
        {children}
      </main>
    </div>
  )
}

export function AccesoGO() {
  const t = useTienda()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const registrar = useSim((s) => s.registrar)
  const iniciarSesion = useSim((s) => s.iniciarSesion)
  const avisar = useAvisoSimulador()
  const [paso, setPaso] = useState('inicio')
  const [v, setV] = useState({ email: '', contrasena: '', nombre: '', apellidos: '', condiciones: false, publicidad: false })
  const [faltan, setFaltan] = useState([])
  const [ver, setVer] = useState(false)
  const siguiente = params.get('siguiente')
  const destino = siguiente ? `${BASE}/compra/${siguiente}` : BASE

  useUrl(`${DOMINIO}/${paso === 'registro' ? 'registro' : 'login'}/`)
  useNota('https-candado')
  useNota('invitado', paso === 'inicio' && !!siguiente, 1200)
  useNota('contrasena', paso === 'clave' || paso === 'registro', 600)
  const cambia = (k) => (e) => setV({ ...v, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })

  const conEmail = (e) => {
    e.preventDefault()
    const email = v.email.trim()
    if (!email) return setFaltan(['Correo electrónico'])
    if (!email.includes('@')) return setFaltan(['Un correo electrónico lleva una arroba (@), por ejemplo: nombre@correo.es'])
    setFaltan([])
    setPaso(t.cuentas.some((c) => c.email.toLowerCase() === email.toLowerCase()) ? 'clave' : 'registro')
  }

  const entrar = (e) => {
    e.preventDefault()
    if (!v.contrasena) return setFaltan(['Contraseña'])
    iniciarSesion(G, v.email.trim())
    navigate(destino)
  }

  const crear = (e) => {
    e.preventDefault()
    const f = revisarCampos(v, [
      ['nombre', 'Nombre'],
      ['apellidos', 'Apellidos'],
      ['email', 'Correo electrónico'],
      ['contrasena', 'Contraseña'],
    ])
    if (!v.condiciones) f.push('Marca la casilla para aceptar las condiciones de uso y la política de privacidad')
    setFaltan(f)
    if (f.length) return
    registrar(G, `${v.nombre.trim()} ${v.apellidos.trim()}`, v.email.trim())
    navigate(destino)
  }

  const fuerza = fuerzaContrasena(v.contrasena)

  if (paso === 'inicio')
    return (
      <Marco titulo="">
        <p className="mt-6 text-lg">Accede con tu cuenta o regístrate en Galerías Olmo</p>
        <ul className="mt-4 space-y-3 text-[1.05rem]">
          {['Compra más rápido', 'Gestiona todas tus compras', 'Disfruta de tus cupones y promociones'].map((x) => (
            <li key={x} className="flex items-center gap-3">
              <Check size={22} /> {x}
            </li>
          ))}
        </ul>
        <button onClick={() => setPaso('email')} className="mt-6 flex min-h-14 w-full items-center justify-center gap-3 bg-black text-[1.05rem] text-white hover:bg-[#333]">
          <Leaf size={20} className="text-green-400" /> Accede o regístrate
        </button>
        {siguiente && (
          <div data-nota="invitado" className="mt-6 border-t border-slate-300 pt-6">
            <p className="text-go-suave">Si lo prefieres, puedes continuar con tu compra como invitado.</p>
            <Link to={`${BASE}/invitado`} className="mt-3 inline-flex min-h-11 items-center underline">
              Continuar como invitado
            </Link>
          </div>
        )}
      </Marco>
    )

  return (
    <Marco titulo={paso === 'registro' ? 'Crear cuenta' : 'Accede o regístrate'} onAtras={() => setPaso(paso === 'email' ? 'inicio' : 'email')}>
      <Recordatorio className="mt-5" />
      {paso === 'email' && (
        <form onSubmit={conEmail} noValidate className="mt-5 space-y-4">
          <p className="text-lg">Introduce tu correo electrónico para acceder o crear tu cuenta.</p>
          <input value={v.email} onChange={cambia('email')} type="email" placeholder="Correo electrónico" aria-label="Correo electrónico" autoComplete="off" className={campo} />
          <AvisoCampos faltan={faltan} />
          <BotonNegro type="submit">Continuar</BotonNegro>
          <BotonEjemplo onClick={() => { setV({ ...v, email: ej.email }); setFaltan([]) }} />
        </form>
      )}
      {paso === 'clave' && (
        <form onSubmit={entrar} noValidate className="mt-5 space-y-4">
          <p className="text-lg">
            Hola de nuevo. Introduce la contraseña de <b>{v.email}</b>
          </p>
          <input value={v.contrasena} onChange={cambia('contrasena')} type={ver ? 'text' : 'password'} placeholder="Contraseña" aria-label="Contraseña" data-nota="contrasena" className={campo} />
          <label className="flex min-h-11 items-center gap-2">
            <input type="checkbox" checked={ver} onChange={() => setVer(!ver)} className="h-5 w-5 accent-black" /> Mostrar contraseña
          </label>
          <button type="button" onClick={() => avisar('En el simulador puedes escribir cualquier contraseña.')} className="underline">
            ¿Has olvidado tu contraseña?
          </button>
          <AvisoCampos faltan={faltan} />
          <BotonNegro type="submit">Iniciar sesión</BotonNegro>
          <BotonEjemplo onClick={() => { setV({ ...v, contrasena: ej.contrasena }); setFaltan([]) }} />
        </form>
      )}
      {paso === 'registro' && (
        <form onSubmit={crear} noValidate className="mt-5 space-y-4">
          <p className="text-lg">Todavía no tienes cuenta. Crea una en un momento:</p>
          <BotonEjemplo
            onClick={() => {
              setV({ ...v, nombre: ej.nombre, apellidos: `${ej.apellido1} ${ej.apellido2}`, email: v.email || ej.email, contrasena: ej.contrasena, condiciones: true })
              setFaltan([])
            }}
          />
          <input value={v.nombre} onChange={cambia('nombre')} placeholder="Nombre *" aria-label="Nombre" autoComplete="off" className={campo} />
          <input value={v.apellidos} onChange={cambia('apellidos')} placeholder="Apellidos *" aria-label="Apellidos" autoComplete="off" className={campo} />
          <input value={v.email} onChange={cambia('email')} placeholder="Correo electrónico *" aria-label="Correo electrónico" autoComplete="off" className={campo} />
          <input value={v.contrasena} onChange={cambia('contrasena')} type={ver ? 'text' : 'password'} placeholder="Contraseña *" aria-label="Contraseña" data-nota="contrasena" className={campo} />
          {fuerza && (
            <div aria-live="polite">
              <div className="h-2 bg-slate-200">
                <div className={`h-full ${fuerza.color}`} style={{ width: fuerza.ancho }} />
              </div>
              <p className="text-sm">
                Seguridad: <b>{fuerza.texto}</b>. Usa al menos 8 caracteres con letras, números y símbolos.
              </p>
            </div>
          )}
          <label className="flex min-h-11 items-center gap-2">
            <input type="checkbox" checked={ver} onChange={() => setVer(!ver)} className="h-5 w-5 accent-black" /> Mostrar contraseña
          </label>
          <label className="flex items-start gap-3">
            <input type="checkbox" checked={v.condiciones} onChange={cambia('condiciones')} className="mt-1 h-6 w-6 shrink-0 accent-black" />
            <span>
              He leído y acepto las <u>condiciones de uso</u> y la <u>política de privacidad</u> *
            </span>
          </label>
          <label className="flex items-start gap-3">
            <input type="checkbox" checked={v.publicidad} onChange={cambia('publicidad')} className="mt-1 h-6 w-6 shrink-0 accent-black" />
            <span>
              Quiero recibir ofertas y publicidad por correo electrónico <span className="text-go-suave">(opcional: no hace falta marcarlo para comprar)</span>
            </span>
          </label>
          <AvisoCampos faltan={faltan} />
          <BotonNegro type="submit">Crear cuenta</BotonNegro>
        </form>
      )}
    </Marco>
  )
}

export function InvitadoGO() {
  const navigate = useNavigate()
  const actualizar = useSim((s) => s.actualizar)
  const t = useTienda()
  const [email, setEmail] = useState(t.invitado?.email || '')
  const [faltan, setFaltan] = useState([])
  useUrl(`${DOMINIO}/login/invitado/`)
  useNota('invitado')

  const continuar = () => {
    const e = email.trim()
    if (!e) return setFaltan(['Correo electrónico'])
    if (!e.includes('@')) return setFaltan(['Un correo electrónico lleva una arroba (@), por ejemplo: nombre@correo.es'])
    actualizar(G, { invitado: { email: e }, usuario: null })
    navigate(`${BASE}/compra/entrega`)
  }

  return (
    <Marco titulo="Continuar como invitado" onAtras={() => navigate(-1)}>
      <Recordatorio className="mt-5" />
      <p className="mt-5 text-go-suave">Introduce tu correo para continuar como usuario invitado</p>
      <div className="mt-4 space-y-4">
        <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Correo electrónico" aria-label="Correo electrónico" autoComplete="off" className={campo} />
        <AvisoCampos faltan={faltan} />
        {email.trim() ? (
          <>
            <p className="pt-2">¿Tienes cuenta? Identifícate para ahorrar tiempo</p>
            <BotonNegro onClick={() => navigate(`${BASE}/acceso?siguiente=entrega`)}>Iniciar sesión</BotonNegro>
            <button onClick={continuar} className="min-h-12 w-full border border-black text-[1.02rem]">
              Continuar como invitado
            </button>
          </>
        ) : (
          <BotonNegro onClick={continuar}>Continuar como invitado</BotonNegro>
        )}
        <BotonEjemplo onClick={() => { setEmail(ej.email); setFaltan([]) }} />
      </div>
    </Marco>
  )
}
