import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { ArrowLeft, ChevronDown, Info, Pencil, Search, ShoppingBag, Truck } from 'lucide-react'
import { AvisoCampos, BotonEjemplo, Modal, Recordatorio, revisarCampos, useAvisoSimulador, useUrl } from '../../components/comun/Simulador'
import { useNota, useNotas } from '../../components/comun/Notas'
import { LogoGalerias } from '../../components/comun/Logos'
import { useSim } from '../../store/useSim'
import ej from '../../data/ejemplo.json'
import { euros, fechaCorta, imagenSegunOpciones, ivaIncluido, sumarDias, textoOpciones, totales } from '../../lib/formato'
import { PROVINCIAS } from '../todoenvio/CheckoutTE'
import { BASE, BotonNegro, DOMINIO, G, costeEnvioEstandar, envioGratisDesde, useTienda } from './comun'

const campo = 'min-h-14 w-full border border-slate-400 bg-white px-4 text-[1.05rem] focus:border-black focus:outline-none focus:ring-2 focus:ring-black/20'

export function useCompraGO() {
  const t = useTienda()
  const tot = totales(t.carrito)
  const externos = tot.det.some((l) => l.p.vendedor.externo)
  let envio = tot.envioVendedores
  if (t.modoEntrega === 'envio' && t.entrega) envio += t.entrega.coste
  envio = Math.round(envio * 100) / 100
  const total = Math.round((tot.subtotal + envio) * 100) / 100
  return { t, ...tot, externos, envio, total }
}

export function guardiaGO(c) {
  if (!c.det.length) return `${BASE}/cesta`
  if (!c.t.usuario && !c.t.invitado) return `${BASE}/acceso?siguiente=entrega`
  return null
}

export function CabeceraCompra({ paso, texto }) {
  const navigate = useNavigate()
  return (
    <header className="bg-white">
      <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
        <button onClick={() => navigate(-1)} className="rounded-full p-2 hover:bg-slate-100" aria-label="Volver">
          <ArrowLeft size={24} />
        </button>
        <Link to={BASE} aria-label="Galerías Olmo, ir al inicio">
          <LogoGalerias alto={34} />
        </Link>
      </div>
      {paso && (
        <div className="mx-auto max-w-xs py-4 text-center">
          <p className="text-2xl tracking-wide">
            {paso}/3 {texto}
          </p>
          <div className="mt-2 h-0.5 bg-slate-200">
            <div className="h-full bg-black" style={{ width: `${(paso / 3) * 100}%` }} />
          </div>
        </div>
      )}
    </header>
  )
}

export function Totales({ c, desglose = false }) {
  const [abierto, setAbierto] = useState(false)
  const iva = ivaIncluido(c.total)
  return (
    <div data-nota="resumen" className="bg-go-gris p-4">
      <dl className="space-y-1.5 text-[1.05rem]">
        <div className="flex justify-between">
          <dt>Subtotal</dt>
          <dd>{euros(c.subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt>Gastos de envío</dt>
          <dd className={c.envio ? '' : 'text-go-verde'}>{c.envio ? euros(c.envio) : 'Gratis'}</dd>
        </div>
        <div className="flex justify-between text-xl font-semibold">
          <dt>Total</dt>
          <dd>{euros(c.total)}</dd>
        </div>
      </dl>
      {desglose && (
        <>
          <button onClick={() => setAbierto(!abierto)} aria-expanded={abierto} className="mt-2 flex min-h-10 items-center gap-2">
            Desglose por tipo de impuesto <ChevronDown className={abierto ? 'rotate-180' : ''} size={20} />
          </button>
          {abierto && (
            <p className="text-sm">
              IVA 21 %: base imponible {euros(c.total - iva)} · cuota {euros(iva)}
            </p>
          )}
        </>
      )}
    </div>
  )
}

function ListaProductos({ det }) {
  const [abierto, setAbierto] = useState(false)
  const n = det.reduce((s, l) => s + l.cantidad, 0)
  return (
    <div>
      <button onClick={() => setAbierto(!abierto)} aria-expanded={abierto} className="flex min-h-14 w-full items-center justify-between bg-slate-100 px-4 font-semibold tracking-wide text-[#1a56a6]">
        {n} {n === 1 ? 'PRODUCTO' : 'PRODUCTOS'} <ChevronDown className={abierto ? 'rotate-180' : ''} />
      </button>
      {abierto && (
        <ul className="divide-y divide-slate-200 border border-slate-200 px-4">
          {det.map((l) => (
            <li key={l.clave} className="flex gap-3 py-3">
              <img src={imagenSegunOpciones(l.p, l.opciones)} alt="" className="h-20 w-16 shrink-0 bg-go-gris object-contain p-1" />
              <div className="text-[0.98rem]">
                <p className="text-sm font-bold uppercase">{l.p.marca}</p>
                <p>{l.p.tituloCorto}</p>
                {Object.keys(l.opciones || {}).length > 0 && <p className="font-semibold">{textoOpciones(l.opciones)}</p>}
                <p>
                  {l.cantidad} x {euros(l.precio)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// Tiendas ficticias de recogida (se generan para cualquier provincia)
export function tiendasDe(provincia) {
  return [
    { id: 'centro', nombre: `Galerías Olmo ${provincia} Centro`, direccion: `Plaza de los Olmos, 1 · ${provincia}` },
    { id: 'avenida', nombre: `Galerías Olmo ${provincia} Avenida`, direccion: `Avenida del Arce, 25 · ${provincia}` },
    { id: 'alamos', nombre: `Galerías Olmo ${provincia} C.C. Los Álamos`, direccion: `Calle del Fresno, 8 · ${provincia}` },
  ]
}
const LUGARES = ['Recogida pedidos online · Planta baja', 'Electrónica · Planta primera']

function ModalRecogida({ onCerrar, onAceptar, inicial }) {
  const avisar = useAvisoSimulador()
  const [provincia, setProvincia] = useState(inicial?.provincia || '')
  const [tienda, setTienda] = useState(inicial?.id || null)
  const [lugar, setLugar] = useState(inicial?.lugar || LUGARES[0])
  const [vista, setVista] = useState('listado')
  const [horario, setHorario] = useState(null)
  const ini = fechaCorta(sumarDias(4))
  const fin = fechaCorta(sumarDias(6))
  return (
    <Modal titulo="Recogida en tienda" onCerrar={onCerrar} className="font-montse" ancho="max-w-xl">
      <label className="block">
        <span className="sr-only">Provincia</span>
        <select
          value={provincia}
          onChange={(e) => {
            setProvincia(e.target.value)
            setTienda(null)
          }}
          className={campo}
        >
          <option value="">Escoge una provincia</option>
          {PROVINCIAS.map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>
      </label>
      {provincia && (
        <>
          <div className="mt-3 flex items-center border border-slate-300 px-3">
            <input placeholder="Dirección o tienda" aria-label="Buscar dirección o tienda" className="min-h-12 w-full outline-none" />
            <Search size={20} />
          </div>
          <div className="mt-4 grid grid-cols-2 border-b border-slate-300 text-center text-sm font-semibold tracking-wider" role="tablist">
            {['listado', 'mapa'].map((x) => (
              <button key={x} role="tab" aria-selected={vista === x} onClick={() => setVista(x)} className={`min-h-12 uppercase ${vista === x ? 'border-b-2 border-black' : 'text-go-suave'}`}>
                {x}
              </button>
            ))}
          </div>
          {vista === 'mapa' ? (
            <p className="mt-4 bg-go-gris p-6 text-center">El mapa no está disponible en el simulador. Usa el listado.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {tiendasDe(provincia).map((s) => (
                <li key={s.id} className={`border p-4 ${tienda === s.id ? 'border-2 border-black' : 'border-slate-300'}`}>
                  <label className="flex cursor-pointer gap-3">
                    <input type="radio" name="tienda" checked={tienda === s.id} onChange={() => setTienda(s.id)} className="mt-1 h-6 w-6 shrink-0 accent-[#0b7a3e]" />
                    <span>
                      <b className="block font-semibold">{s.nombre}</b>
                      <span className="block text-sm text-go-suave">{s.direccion}</span>
                      <span className="mt-2 block">
                        Recogida entre el {ini} y {fin}
                      </span>
                    </span>
                  </label>
                  {tienda === s.id && (
                    <fieldset className="mt-3 space-y-2 pl-9">
                      <legend className="mb-1">Lugar de recogida</legend>
                      {LUGARES.map((l) => (
                        <label key={l} className="flex min-h-10 items-center gap-3">
                          <input type="radio" name="lugar" checked={lugar === l} onChange={() => setLugar(l)} className="h-5 w-5 accent-[#0b7a3e]" /> {l}
                        </label>
                      ))}
                    </fieldset>
                  )}
                  <button onClick={() => setHorario(horario === s.id ? null : s.id)} className="mt-2 flex min-h-10 items-center gap-1 pl-9 text-sm">
                    Horarios y cómo llegar <ChevronDown size={16} />
                  </button>
                  {horario === s.id && <p className="pl-9 text-sm">Lunes a sábado de 10:00 a 22:00. Domingos y festivos de apertura: de 11:00 a 21:00.</p>}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
      <div className="sticky bottom-0 mt-4 bg-white pt-2">
        <button
          disabled={!tienda}
          onClick={() => {
            const s = tiendasDe(provincia).find((x) => x.id === tienda)
            onAceptar({ ...s, provincia, lugar, texto: `Recogida entre el ${ini} y ${fin}` })
          }}
          className={`min-h-14 w-full uppercase tracking-wider ${tienda ? 'bg-black text-white' : 'bg-slate-300 text-white'}`}
          onMouseDown={() => !tienda && avisar('Primero elige una provincia y una tienda.')}
        >
          Aceptar
        </button>
      </div>
    </Modal>
  )
}

// ======================= 1/3 ENTREGA =======================
export function EntregaGO() {
  const c = useCompraGO()
  const { t, det, externos } = c
  const actualizar = useSim((s) => s.actualizar)
  const navigate = useNavigate()
  const { mostrar } = useNotas()
  const [modal, setModal] = useState(false)
  const [modo, setModo] = useState(externos ? 'envio' : t.modoEntrega)
  const [opcion, setOpcion] = useState(['estandar', 'express'].includes(t.entrega?.id) ? t.entrega.id : 'estandar')
  const [dir, setDir] = useState(t.direccion || { calle: '', piso: '', codigoPostal: '', localidad: '', provincia: '' })
  const [faltan, setFaltan] = useState([])
  useUrl(`${DOMINIO}/compra/entrega/`)
  useNota('opciones-entrega')
  useNota('direccion-envio', modo === 'envio', 1500)
  const destino = guardiaGO(c)
  if (destino) return <Navigate to={destino} replace />

  const costeEstandar = c.subtotal >= envioGratisDesde ? 0 : costeEnvioEstandar
  const opciones = [
    { id: 'estandar', titulo: 'Envío estándar', detalle: `Entrega entre el ${fechaCorta(sumarDias(2))} y el ${fechaCorta(sumarDias(4))}`, coste: costeEstandar, fecha: sumarDias(4) },
    { id: 'express', titulo: 'Envío express 24 h', detalle: `Entrega mañana, ${fechaCorta(sumarDias(1))}`, coste: 5.95, fecha: sumarDias(1) },
  ]
  const envioMostrado = Math.round(((modo === 'envio' ? (opciones.find((o) => o.id === opcion) || opciones[0]).coste : 0) + c.envioVendedores) * 100) / 100

  const continuar = () => {
    if (modo === 'recogida') {
      if (!t.recogida) {
        setFaltan(['Elige la tienda donde quieres recoger tu pedido (pulsa «Elige tienda»)'])
        return
      }
      actualizar(G, { modoEntrega: 'recogida', entrega: { id: 'recogida', titulo: 'Recogida en tienda', detalle: t.recogida.texto, coste: 0, fecha: sumarDias(6).toISOString() } })
    } else {
      const f = revisarCampos(dir, [
        ['calle', 'Dirección (calle y número)'],
        ['codigoPostal', 'Código postal'],
        ['localidad', 'Localidad'],
        ['provincia', 'Provincia'],
      ])
      setFaltan(f)
      if (f.length) return
      const o = opciones.find((x) => x.id === opcion)
      actualizar(G, { modoEntrega: 'envio', direccion: dir, entrega: { ...o, detalle: `${o.titulo}: ${o.detalle.toLowerCase()}`, fecha: o.fecha.toISOString() } })
    }
    navigate(`${BASE}/compra/resumen`)
  }

  return (
    <div className="min-h-screen bg-white font-montse text-go-texto">
      <CabeceraCompra paso={1} texto="ENTREGA" />
      <main className="mx-auto max-w-3xl px-4 pb-12">
        <h1 className="text-xl">Tu pedido</h1>
        <p className="text-go-suave">
          {c.unidades} {c.unidades === 1 ? 'Producto' : 'Productos'}
        </p>
        <ul className="mt-3 space-y-3">
          {det.map((l) => (
            <li key={l.clave} className="flex gap-4">
              <img src={imagenSegunOpciones(l.p, l.opciones)} alt="" className="h-24 w-20 shrink-0 bg-go-gris object-contain p-1" />
              <div>
                <p className="text-sm font-bold uppercase">{l.p.marca}</p>
                <p>{l.p.tituloCorto}</p>
                {Object.keys(l.opciones || {}).length > 0 && <p className="font-semibold">{textoOpciones(l.opciones)}</p>}
              </div>
            </li>
          ))}
        </ul>

        <h2 className="mt-6 text-lg">¿Cómo quieres recibirlo?</h2>
        <div data-nota="opciones-entrega" className="mt-3">
          <div className="grid grid-cols-2 bg-go-gris p-1" role="radiogroup" aria-label="Forma de entrega">
            {[
              ['envio', 'Envío', Truck],
              ['recogida', 'Recogida', ShoppingBag],
            ].map(([m, txt, Icono]) => (
              <button
                key={m}
                role="radio"
                aria-checked={modo === m}
                onClick={() => {
                  if (m === 'recogida' && externos) {
                    setFaltan(['Algunos productos de tu cesta los envía un vendedor externo y no se pueden recoger en tienda. Elige «Envío».'])
                    return
                  }
                  setModo(m)
                  setFaltan([])
                  if (m === 'recogida') mostrar('recogida-tienda')
                }}
                className={`flex min-h-14 items-center justify-center gap-2 text-[1.05rem] ${modo === m ? 'bg-go-verde text-white' : ''}`}
              >
                <Icono size={22} /> {txt}
              </button>
            ))}
          </div>

          {modo === 'recogida' ? (
            <div className="mt-3 border border-slate-300 p-4">
              <div className="flex items-start gap-3">
                <span className="mt-1 h-6 w-6 shrink-0 rounded-full border-[7px] border-go-verde" aria-hidden />
                <div className="flex-1">
                  <p className="flex justify-between">
                    <b className="font-semibold">Tiendas Galerías Olmo</b> <span className="text-go-verde">Gratis</span>
                  </p>
                  {t.recogida ? (
                    <div className="mt-2 flex items-start justify-between gap-2">
                      <p>
                        <b className="font-semibold">{t.recogida.nombre}</b>
                        <br />
                        {t.recogida.texto}
                      </p>
                      <button onClick={() => setModal(true)} className="rounded-full p-2 hover:bg-slate-100" aria-label="Cambiar tienda">
                        <Pencil size={20} />
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => setModal(true)} className="mt-2 min-h-10 underline">
                      Elige tienda
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-3 space-y-2">
              {opciones.map((o) => (
                <label key={o.id} className={`flex cursor-pointer items-start gap-3 border p-4 ${opcion === o.id ? 'border-2 border-black' : 'border-slate-300'}`}>
                  <input type="radio" name="envio" checked={opcion === o.id} onChange={() => setOpcion(o.id)} className="mt-1 h-6 w-6 accent-[#0b7a3e]" />
                  <span className="flex-1">
                    <span className="flex justify-between gap-2">
                      <b className="font-semibold">{o.titulo}</b>
                      <span className={o.coste ? '' : 'text-go-verde'}>{o.coste ? euros(o.coste) : 'Gratis'}</span>
                    </span>
                    <span className="text-go-suave">{o.detalle}</span>
                  </span>
                </label>
              ))}
              {c.subtotal < envioGratisDesde && (
                <p className="flex gap-2 text-sm text-go-suave">
                  <Info size={16} className="mt-0.5 shrink-0" /> El envío estándar es gratis en pedidos a partir de {envioGratisDesde} €.
                </p>
              )}
            </div>
          )}
        </div>

        {modo === 'envio' && (
          <section className="mt-6 space-y-3" data-nota="formulario">
            <h2 className="text-lg">Dirección de entrega</h2>
            <Recordatorio />
            <BotonEjemplo
              onClick={() => {
                setDir({ calle: ej.calle, piso: ej.piso, codigoPostal: ej.codigoPostal, localidad: ej.localidad, provincia: ej.provincia })
                setFaltan([])
              }}
            />
            <input value={dir.calle} onChange={(e) => setDir({ ...dir, calle: e.target.value })} placeholder="Dirección (calle y número) *" aria-label="Dirección (calle y número)" autoComplete="off" className={campo} />
            <input value={dir.piso} onChange={(e) => setDir({ ...dir, piso: e.target.value })} placeholder="Piso, puerta, escalera (opcional)" aria-label="Piso, puerta, escalera (opcional)" autoComplete="off" className={campo} />
            <div className="grid grid-cols-2 gap-3">
              <input value={dir.codigoPostal} onChange={(e) => setDir({ ...dir, codigoPostal: e.target.value })} placeholder="Código postal *" aria-label="Código postal" inputMode="numeric" autoComplete="off" className={campo} />
              <input value={dir.localidad} onChange={(e) => setDir({ ...dir, localidad: e.target.value })} placeholder="Localidad *" aria-label="Localidad" autoComplete="off" className={campo} />
            </div>
            <select value={dir.provincia} onChange={(e) => setDir({ ...dir, provincia: e.target.value })} aria-label="Provincia" className={campo}>
              <option value="">Provincia *</option>
              {PROVINCIAS.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </section>
        )}

        <AvisoCampos faltan={faltan} className="mt-4" />

        <div className="mt-6 border-t border-slate-200 pt-4">
          <p className="flex justify-between text-[1.05rem]">
            <span>Gastos de envío:</span>
            <span className={envioMostrado ? '' : 'text-go-verde'}>{envioMostrado ? euros(envioMostrado) : 'Gratis'}</span>
          </p>
          <p className="mt-1 flex justify-between text-xl font-semibold">
            <span>Total:</span>
            <span>{euros(c.subtotal + envioMostrado)}</span>
          </p>
          <BotonNegro className="mt-4" onClick={continuar}>
            Continuar a resumen
          </BotonNegro>
        </div>
      </main>
      {modal && (
        <ModalRecogida
          inicial={t.recogida}
          onCerrar={() => setModal(false)}
          onAceptar={(r) => {
            actualizar(G, { recogida: r })
            setModal(false)
            setFaltan([])
          }}
        />
      )}
    </div>
  )
}

// ======================= 2/3 RESUMEN =======================
export function ResumenGO() {
  const c = useCompraGO()
  const { t, det } = c
  const actualizar = useSim((s) => s.actualizar)
  const navigate = useNavigate()
  const avisar = useAvisoSimulador()
  const inicial = t.comprador || {
    nombre: t.usuario?.nombre.split(' ')[0] || '',
    apellido1: t.usuario?.nombre.split(' ')[1] || '',
    apellido2: t.usuario?.nombre.split(' ')[2] || '',
    telefono: '',
    tipoDocumento: '',
    documento: '',
    mayorEdad: false,
    observaciones: '',
  }
  const [v, setV] = useState(inicial)
  const [faltan, setFaltan] = useState([])
  useUrl(`${DOMINIO}/compra/resumen/`)
  useNota('datos-minimos')
  const destino = guardiaGO(c) || (!t.entrega ? `${BASE}/compra/entrega` : null)
  if (destino) return <Navigate to={destino} replace />
  const cambia = (k) => (e) => setV({ ...v, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })

  const continuar = () => {
    const f = revisarCampos(v, [
      ['nombre', 'Nombre'],
      ['apellido1', 'Primer apellido'],
      ['telefono', 'Teléfono'],
      ['tipoDocumento', 'Tipo de documento'],
      ['documento', 'Número de documento'],
    ])
    if (!v.mayorEdad) f.push('Marca la casilla «Soy mayor de edad»')
    setFaltan(f)
    if (f.length) return
    actualizar(G, { comprador: v })
    navigate(`${BASE}/compra/pago`)
  }

  const recogida = t.modoEntrega === 'recogida'
  return (
    <div className="min-h-screen bg-white font-montse text-go-texto">
      <CabeceraCompra paso={2} texto="RESUMEN" />
      <main className="mx-auto max-w-3xl space-y-6 px-4 pb-12">
        <section>
          <h2 className="text-lg font-semibold tracking-wider">{recogida ? 'RECOGIDA' : 'ENVÍO'}</h2>
          <div className="mt-3 border border-slate-300">
            <div className="flex items-start justify-between gap-3 p-4">
              <div>
                {recogida ? (
                  <>
                    <p>{t.recogida.texto}</p>
                    <p className="mt-2 font-semibold">{t.recogida.nombre}</p>
                    <p>{t.recogida.direccion}</p>
                    <p className="mt-2 font-semibold tracking-wide">{t.recogida.lugar}</p>
                  </>
                ) : (
                  <>
                    <p>{t.entrega.detalle}</p>
                    <p className="mt-2 font-semibold">
                      {t.direccion.calle} {t.direccion.piso}
                    </p>
                    <p>
                      {t.direccion.codigoPostal} {t.direccion.localidad} ({t.direccion.provincia})
                    </p>
                  </>
                )}
              </div>
              <Link to={`${BASE}/compra/entrega`} className="rounded-full p-2 hover:bg-slate-100" aria-label="Cambiar la entrega">
                <Pencil size={20} />
              </Link>
            </div>
            <ListaProductos det={det} />
          </div>
        </section>

        <section data-nota="formulario" className="space-y-3">
          <h2 className="text-lg font-semibold tracking-wider">DATOS DEL COMPRADOR</h2>
          <p>Los campos marcados con * son obligatorios</p>
          <Recordatorio />
          <BotonEjemplo
            onClick={() => {
              setV({ ...v, nombre: ej.nombre, apellido1: ej.apellido1, apellido2: ej.apellido2, telefono: ej.telefono, tipoDocumento: ej.tipoDocumento, documento: ej.documento, mayorEdad: true })
              setFaltan([])
            }}
          />
          <input value={v.nombre} onChange={cambia('nombre')} placeholder="Nombre *" aria-label="Nombre" autoComplete="off" className={campo} />
          <input value={v.apellido1} onChange={cambia('apellido1')} placeholder="Primer Apellido *" aria-label="Primer apellido" autoComplete="off" className={campo} />
          <input value={v.apellido2} onChange={cambia('apellido2')} placeholder="Segundo apellido (opcional)" aria-label="Segundo apellido (opcional)" autoComplete="off" className={campo} />
          <div>
            <input value={v.telefono} onChange={cambia('telefono')} placeholder="Teléfono *" aria-label="Teléfono" inputMode="tel" autoComplete="off" className={campo} />
            <p className="mt-1 text-sm text-go-suave">Solo te contactaremos por temas relacionados con tu pedido</p>
          </div>
          <p className="pt-2 font-semibold">Documento de identificación *</p>
          <select value={v.tipoDocumento} onChange={cambia('tipoDocumento')} aria-label="Tipo de documento" className={`${campo} rounded-full bg-go-gris`}>
            <option value="">Tipo de documento *</option>
            <option>DNI/NIF</option>
            <option>NIE</option>
            <option>Pasaporte</option>
          </select>
          <input value={v.documento} onChange={cambia('documento')} placeholder="Número *" aria-label="Número de documento" autoComplete="off" className={campo} />
          <p className="flex gap-2 text-sm text-go-suave">
            <Info size={16} className="mt-0.5 shrink-0" /> Algunas tiendas lo piden para emitir la factura o entregar productos de valor. En el simulador, invéntatelo.
          </p>
          <label className="flex min-h-12 items-center gap-3">
            <input type="checkbox" checked={v.mayorEdad} onChange={cambia('mayorEdad')} className="h-6 w-6 accent-[#0b7a3e]" /> Soy mayor de edad
          </label>
        </section>

        <section>
          <h2 className="text-lg font-semibold tracking-wider">OBSERVACIONES (Opcional)</h2>
          <textarea
            value={v.observaciones}
            onChange={cambia('observaciones')}
            placeholder="Ej. si no hay nadie en casa dejar al portero"
            aria-label="Observaciones (opcional)"
            rows={4}
            className="mt-3 w-full border border-slate-400 p-4 text-[1.05rem]"
          />
        </section>

        <AvisoCampos faltan={faltan} />
        <Totales c={c} desglose />
        <p>
          Al completar tu pedido aceptas las{' '}
          <button onClick={() => avisar()} className="underline">
            condiciones de seguridad y confidencialidad
          </button>
        </p>
        <BotonNegro onClick={continuar}>Continuar a modos de pago</BotonNegro>
        <button onClick={() => navigate(`${BASE}/compra/entrega`)} className="min-h-12 w-full border border-black uppercase tracking-wider">
          Volver
        </button>
      </main>
    </div>
  )
}

