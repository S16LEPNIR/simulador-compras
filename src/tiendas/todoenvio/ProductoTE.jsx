import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Heart, MapPin, Share, ShieldCheck, ThumbsUp, UserRound } from 'lucide-react'
import { Carrusel, Estrellas, Modal, useAvisoSimulador, useUrl } from '../../components/comun/Simulador'
import { useNota, useNotaAlVer, useNotas } from '../../components/comun/Notas'
import { useSim } from '../../store/useSim'
import { descuento, euros, fechaLarga, fechaResena, imagenSegunOpciones, opcionesPorDefecto, precioConOpciones, producto, totales } from '../../lib/formato'
import { nombreCortoMetodo, redondear } from '../../lib/todoenvio'
import { BASE, DOMINIO, MiniProducto, Precio, Rapido, T, textoEntrega, useTienda } from './comun'
import { ModalSinSaldo, Procesando, opcionesEntregaTE, useRealizarPedido } from './CheckoutTE'

// Hoja inferior de «Comprar ya»: con dirección y pago guardados, se compra sin pasar por la tramitación completa
function HojaComprarYa({ p, opciones, cantidad, vendedor, onCerrar }) {
  const t = useTienda()
  const actualizar = useSim((s) => s.actualizar)
  const avisar = useAvisoSimulador()
  const navigate = useNavigate()
  const linea = { clave: 'compra-ya', id: p.id, opciones, cantidad }
  const { det, subtotal, envioVendedores } = totales([linea])
  const [ops] = useState(() => opcionesEntregaTE(det))
  const [sel, setSel] = useState('estandar')
  const { realizar, procesando, sinSaldo, cerrarSinSaldo } = useRealizarPedido()
  const entrega = ops.find((o) => o.id === sel)
  const envio = redondear(entrega.coste + envioVendedores)
  const total = redondear(subtotal + envio)
  const cambiarEn = (paso) => {
    actualizar(T, { compraYa: linea })
    navigate(`${BASE}/tramitar/${paso}?modo=compraya`)
  }
  return (
    <>
      <Modal onCerrar={onCerrar}>
        <div className="flex gap-3 pr-8">
          <img src={imagenSegunOpciones(p, opciones)} alt="" className="h-20 w-20 shrink-0 object-contain" />
          <div>
            <p className="text-lg font-bold first-letter:uppercase">{entrega.titulo}</p>
            <button onClick={() => cambiarEn('revisar')} className="text-left text-te-enlace hover:underline">Ver todas las opciones de entrega</button>
            <p className="text-sm text-te-gris">Enviado y vendido por {vendedor}</p>
          </div>
        </div>
        <div className="ocultar-scroll mt-3 flex gap-2 overflow-x-auto" data-nota="opciones-entrega">
          {ops.slice(0, 3).map((o) => (
            <button key={o.id} onClick={() => setSel(o.id)} aria-pressed={sel === o.id} className={`w-44 shrink-0 rounded-lg border p-2 text-left text-[0.95rem] ${sel === o.id ? 'border-2 border-te-enlace font-bold' : 'border-slate-400'}`}>
              <span className="block first-letter:uppercase">{o.titulo}</span>
              <span className="block font-normal">{o.coste ? euros(o.coste) : 'GRATIS'} {o.detalle}</span>
            </button>
          ))}
        </div>
        <dl className="mt-3 divide-y divide-slate-200">
          <div className="flex min-h-12 items-center gap-3">
            <dt className="w-20 shrink-0 text-te-enlace">Enviar a</dt>
            <dd className="min-w-0 flex-1 truncate">{t.direccion.nombre}, {t.direccion.calle}</dd>
            <button onClick={() => cambiarEn('direccion')} className="shrink-0 text-te-enlace">Cambiar</button>
          </div>
          <div className="flex min-h-12 items-center gap-3">
            <dt className="w-20 shrink-0 text-te-enlace">Pago</dt>
            <dd className="min-w-0 flex-1 truncate">{nombreCortoMetodo(t.pago)}</dd>
            <button onClick={() => cambiarEn('pago')} className="shrink-0 text-te-enlace">Cambiar</button>
          </div>
          <div className="flex min-h-12 items-center gap-3">
            <dt className="w-20 shrink-0 text-te-enlace">Total</dt>
            <dd><b className="text-lg">{euros(total)}</b> <span className="text-te-gris">(incluye impuestos)</span></dd>
          </div>
        </dl>
        <p className="mt-1 rounded-lg bg-indigo-50 p-2 font-sans text-indigo-950 ring-1 ring-indigo-300">Saldo de prácticas: <b>{euros(t.saldo ?? 0)}</b></p>
        <button onClick={() => realizar({ t, det, subtotal, envio, total, entrega, esCompraYa: true })} className="te-btn-naranja mt-3 min-h-14 w-full rounded-full text-lg font-semibold">
          Comprar ahora
        </button>
        <p className="mt-2 text-sm text-te-gris">
          Al completar tu pedido aceptas nuestras <button onClick={() => avisar()} className="text-te-enlace underline">Condiciones de uso y venta</button>.
        </p>
      </Modal>
      {procesando && <Procesando />}
      {sinSaldo && <ModalSinSaldo datos={sinSaldo} onCerrar={cerrarSinSaldo} />}
    </>
  )
}

function Galeria({ p, indice, setIndice }) {
  const avisar = useAvisoSimulador()
  const carril = useRef(null)
  useEffect(() => {
    const c = carril.current
    if (c) c.scrollTo({ left: c.clientWidth * indice, behavior: 'smooth' })
  }, [indice])
  return (
    <div>
      <div
        ref={carril}
        onScroll={(e) => {
          const c = e.currentTarget
          const i = Math.round(c.scrollLeft / c.clientWidth)
          if (i !== indice) setIndice(i)
        }}
        className="ocultar-scroll flex snap-x snap-mandatory overflow-x-auto"
      >
        {p.imagenes.map((src, i) => (
          <div key={src} className="flex aspect-square w-full shrink-0 snap-center items-center justify-center bg-white p-4">
            <img src={src} alt={`${p.tituloCorto}, imagen ${i + 1} de ${p.imagenes.length}`} className="max-h-full object-contain" />
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between px-3 py-2">
        <span className="w-20" />
        <div className="flex gap-2">
          {p.imagenes.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndice(i)}
              aria-label={`Ver imagen ${i + 1}`}
              aria-current={i === indice}
              className={`h-3 w-3 rounded-full ${i === indice ? 'bg-te-tinta' : 'bg-slate-300'}`}
            />
          ))}
        </div>
        <div className="flex w-20 justify-end gap-1">
          <button onClick={() => avisar('Las listas de deseos no están disponibles en el simulador.')} className="rounded-full p-2 hover:bg-slate-100" aria-label="Añadir a la lista">
            <Heart />
          </button>
          <button onClick={() => avisar()} className="rounded-full p-2 hover:bg-slate-100" aria-label="Compartir">
            <Share />
          </button>
        </div>
      </div>
      <div className="hidden gap-2 px-3 md:flex">
        {p.imagenes.map((src, i) => (
          <button key={src} onClick={() => setIndice(i)} className={`h-16 w-16 rounded border-2 p-1 ${i === indice ? 'border-[#e77600]' : 'border-slate-200'}`}>
            <img src={src} alt="" className="h-full w-full object-contain" />
          </button>
        ))}
      </div>
    </div>
  )
}

function Variantes({ p, opciones, setOpciones, setIndice, errorTalla }) {
  const [guia, setGuia] = useState(false)
  if (!p.variantes?.length) return null
  return (
    <div data-nota="variantes" className="space-y-4">
      {p.variantes.map((v) => (
        <div key={v.nombre} id={`variante-${v.nombre}`}>
          <div className="flex items-center justify-between">
            <p className="text-[1.05rem]">
              {v.nombre}: <b>{opciones[v.nombre] || (v.nombre === 'Talla' ? 'elige una' : '')}</b>
            </p>
            {v.guia && (
              <button onClick={() => setGuia(true)} className="min-h-10 text-te-enlace hover:underline">
                Guía de tallas
              </button>
            )}
          </div>
          {v.nombre === 'Talla' && errorTalla && (
            <p role="alert" className="mt-1 rounded-lg bg-sky-50 p-2 font-semibold text-sky-900 ring-1 ring-sky-600">
              Selecciona una talla para poder añadir el producto a la cesta.
            </p>
          )}
          <div className={`mt-2 flex gap-2 ${v.opciones[0].imagen !== undefined ? 'ocultar-scroll overflow-x-auto' : 'flex-wrap'}`}>
            {v.opciones.map((o) => {
              const sel = opciones[v.nombre] === o.valor
              const conImagen = o.imagen !== undefined
              return (
                <button
                  key={o.valor}
                  disabled={o.agotado}
                  aria-pressed={sel}
                  aria-label={`${v.nombre} ${o.valor}${o.agotado ? ', no disponible' : ''}`}
                  onClick={() => {
                    setOpciones({ ...opciones, [v.nombre]: o.valor })
                    if (conImagen) setIndice(o.imagen)
                  }}
                  className={`relative shrink-0 rounded-lg border-2 text-left ${sel ? 'border-[#007185] bg-[#edfdff]' : 'border-slate-300'} ${
                    conImagen ? 'w-32 p-1.5' : 'min-h-12 min-w-14 px-3'
                  } ${o.agotado ? 'border-dashed text-slate-400 line-through' : ''}`}
                >
                  {conImagen && <img src={p.imagenes[o.imagen]} alt="" className="mb-1 h-20 w-full rounded object-contain" />}
                  <span className={conImagen ? 'block text-sm font-semibold' : 'font-semibold'}>{o.valor}</span>
                  {conImagen && <span className="block text-sm">{euros(precioConOpciones(p, { ...opciones, [v.nombre]: o.valor }))}</span>}
                  {!conImagen && o.extra !== undefined && <span className="block text-sm">{euros(p.precio + o.extra)}</span>}
                </button>
              )
            })}
          </div>
        </div>
      ))}
      {guia && (
        <Modal titulo="Guía de tallas" onCerrar={() => setGuia(false)}>
          {p.id === 'p07' ? (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b">
                  <th className="py-2">Talla</th>
                  <th>Largo del pie</th>
                </tr>
              </thead>
              <tbody>
                {[37, 38, 39, 40, 41, 42, 43, 44, 45].map((t) => (
                  <tr key={t} className="border-b border-slate-100">
                    <td className="py-1.5">{t}</td>
                    <td>{(23.3 + (t - 37) * 0.67).toFixed(1).replace('.', ',')} cm</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b">
                  <th className="py-2">Talla</th>
                  <th>Pecho</th>
                  <th>Equivale a</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['S', '88-96 cm', '46'],
                  ['M', '96-104 cm', '48'],
                  ['L', '104-112 cm', '50'],
                  ['XL', '112-120 cm', '52'],
                  ['XXL', '120-128 cm', '54'],
                ].map(([a, b, c]) => (
                  <tr key={a} className="border-b border-slate-100">
                    <td className="py-1.5">{a}</td>
                    <td>{b}</td>
                    <td>{c}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <p className="mt-3 text-sm text-te-gris">Mide con una cinta métrica y compara con la tabla. Si dudas entre dos tallas, elige la mayor.</p>
        </Modal>
      )}
    </div>
  )
}

function Opiniones({ p }) {
  const ref = useRef(null)
  useNotaAlVer(ref, 'resenas')
  const [filtro, setFiltro] = useState(null)
  const [utiles, setUtiles] = useState({})
  const avisar = useAvisoSimulador()
  const lista = filtro ? p.resenas.filter((r) => r.estrellas === filtro) : p.resenas
  return (
    <section ref={ref} data-nota="resenas" className="border-t-8 border-te-fondo px-4 py-5" id="opiniones">
      <h2 className="text-2xl font-extrabold">Opiniones de clientes</h2>
      <div className="mt-2 flex items-center gap-2">
        <Estrellas valor={p.valoracion} tam={22} />
        <span className="text-lg">{p.valoracion.toFixed(1).replace('.', ',')} de 5</span>
      </div>
      <p className="text-te-gris">{p.numValoraciones.toLocaleString('es-ES')} valoraciones globales</p>
      <div className="mt-3 max-w-md space-y-1.5">
        {[5, 4, 3, 2, 1].map((e, i) => (
          <button
            key={e}
            onClick={() => setFiltro(filtro === e ? null : e)}
            aria-pressed={filtro === e}
            className={`flex min-h-9 w-full items-center gap-3 rounded text-te-enlace hover:bg-slate-50 ${filtro === e ? 'font-bold' : ''}`}
          >
            <span className="w-24 text-left">{e} estrellas</span>
            <span className="h-5 flex-1 overflow-hidden rounded border border-slate-400 bg-slate-100">
              <span className="block h-full bg-[#de7921]" style={{ width: `${p.distribucion[i]}%` }} />
            </span>
            <span className="w-10 text-right">{p.distribucion[i]} %</span>
          </button>
        ))}
      </div>
      {filtro && (
        <button onClick={() => setFiltro(null)} className="mt-2 min-h-10 text-te-enlace underline">
          Quitar filtro: ver todas las opiniones
        </button>
      )}

      <h3 className="mt-6 text-xl font-bold">Principales opiniones de España</h3>
      {lista.length === 0 && <p className="mt-2">No hay opiniones con {filtro} estrellas.</p>}
      <ul className="mt-2 divide-y divide-slate-200">
        {lista.map((r) => (
          <li key={r.autor + r.fecha} className="py-4">
            <p className="flex items-center gap-2">
              <UserRound className="rounded-full bg-slate-200 p-1 text-slate-500" size={30} aria-hidden />
              <span>{r.autor}</span>
            </p>
            <p className="mt-1 flex flex-wrap items-center gap-2">
              <Estrellas valor={r.estrellas} tam={17} />
              <b>{r.titulo}</b>
            </p>
            <p className="text-sm text-te-gris">Revisado en España el {fechaResena(r.fecha)}</p>
            <p className="text-sm">
              {r.variante && <span className="text-te-gris">{r.variante} | </span>}
              <span className="font-bold text-[#c45500]">Compra verificada</span>
            </p>
            <p className="mt-1 leading-relaxed">{r.texto}</p>
            <p className="mt-1 text-sm text-te-gris">
              A {r.utiles + (utiles[r.autor] ? 1 : 0)} personas les ha parecido esto útil
            </p>
            <div className="mt-2 flex gap-3">
              <button
                onClick={() => setUtiles({ ...utiles, [r.autor]: !utiles[r.autor] })}
                aria-pressed={!!utiles[r.autor]}
                className={`flex min-h-10 items-center gap-2 rounded-full border px-5 ${utiles[r.autor] ? 'border-te-verde bg-green-50 text-te-verde' : 'border-slate-400'}`}
              >
                <ThumbsUp size={17} /> {utiles[r.autor] ? '¡Gracias!' : 'Útil'}
              </button>
              <button onClick={() => avisar('Gracias. En una tienda real, esta opción sirve para denunciar opiniones falsas u ofensivas.')} className="min-h-10 text-te-gris hover:underline">
                Informar
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

function Preguntas({ p }) {
  const ref = useRef(null)
  useNotaAlVer(ref, 'preguntas-clientes')
  const avisar = useAvisoSimulador()
  return (
    <section ref={ref} data-nota="preguntas" className="border-t-8 border-te-fondo px-4 py-5">
      <h2 className="text-2xl font-extrabold">Preguntas y respuestas de clientes</h2>
      <ul className="mt-3 space-y-4">
        {p.preguntas.map((q) => (
          <li key={q.pregunta}>
            <p>
              <b>Pregunta:</b> <span className="text-te-enlace">{q.pregunta}</span>
            </p>
            <p className="mt-1">
              <b>Respuesta:</b> {q.respuesta}
            </p>
            <p className="text-sm text-te-gris">{q.autor}</p>
          </li>
        ))}
      </ul>
      <button onClick={() => avisar('En una tienda real, aquí podrías escribir tu propia pregunta.')} className="mt-4 min-h-11 rounded-full border border-slate-400 px-5">
        ¿No encuentras lo que buscas? Haz una pregunta
      </button>
    </section>
  )
}

export default function ProductoTE() {
  const { id } = useParams()
  return <FichaProducto key={id} id={id} />
}

function FichaProducto({ id }) {
  const p = producto(id) || producto('p01')
  const navigate = useNavigate()
  const t = useTienda()
  const anadir = useSim((s) => s.anadirACesta)
  const actualizar = useSim((s) => s.actualizar)
  const avisar = useAvisoSimulador()
  const { mostrar } = useNotas()
  const [opciones, setOpciones] = useState(() => opcionesPorDefecto(p))
  const [indice, setIndice] = useState(0)
  const [cantidad, setCantidad] = useState(1)
  const [errorTalla, setErrorTalla] = useState(false)
  const [devol, setDevol] = useState(false)
  const [hoja, setHoja] = useState(false)

  useUrl(`${DOMINIO}/dp/${p.ref}`)
  useNota('precio-final')
  useNota('vendedor', p.vendedor.externo, 1500)
  useNota('variantes', (p.variantes?.length || 0) > 0, 2000)

  const precio = precioConOpciones(p, opciones)
  const dto = descuento(p)
  const e = textoEntrega(p)
  const falta = p.variantes?.find((v) => !opciones[v.nombre])
  const vendedor = p.vendedor.externo ? p.vendedor.nombre : 'Todoenvío'
  const horas = 23 - new Date().getHours()
  const mins = 59 - new Date().getMinutes()

  const comprobar = () => {
    if (falta) {
      setErrorTalla(true)
      document.getElementById(`variante-${falta.nombre}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return false
    }
    return true
  }

  return (
    <div className="bg-white pb-6">
      <div className="flex items-start justify-between gap-3 px-4 pt-3">
        <button onClick={() => avisar()} className="text-left text-te-enlace hover:underline">
          Visita la tienda de {p.marca}
        </button>
        <a href="#opiniones" className="shrink-0">
          <span className="flex items-center gap-1 text-sm">
            {p.valoracion.toFixed(1).replace('.', ',')} <Estrellas valor={p.valoracion} tam={14} />{' '}
            <span className="text-te-enlace">({p.numValoraciones.toLocaleString('es-ES')})</span>
          </span>
        </a>
      </div>
      <h1 className="px-4 pt-1 text-[1.02rem] leading-snug text-te-gris md:text-2xl md:text-te-tinta">{p.titulo}</h1>

      <div className="md:grid md:grid-cols-[1.1fr_1fr] md:gap-6 md:px-4 md:pt-4">
        <div className="md:sticky md:top-16 md:self-start">
          <Galeria p={p} indice={indice} setIndice={setIndice} />
        </div>

        <div className="space-y-4 px-4 pt-2">
          <Variantes p={p} opciones={opciones} setOpciones={(o) => { setOpciones(o); setErrorTalla(false) }} setIndice={setIndice} errorTalla={errorTalla} />

          <div data-nota="precio" className="border-t border-slate-200 pt-3">
            <div className="flex items-end gap-3">
              {dto > 0 && <span className="text-3xl font-light text-te-oferta">-{dto} %</span>}
              <Precio valor={precio} grande />
            </div>
            {p.unidad && <p className="text-sm text-te-gris">({p.unidad})</p>}
            {p.precioAnterior && (
              <p className="text-te-gris">
                Precio anterior: <s>{euros(p.precioAnterior)}</s>
              </p>
            )}
            <p className="mt-1">
              <Rapido /> <b className="inline-block first-letter:uppercase">{e.cuando}</b>
            </p>
            <button onClick={() => { setDevol(true); mostrar('desistimiento') }} className="min-h-10 text-te-enlace hover:underline">
              Devoluciones GRATIS
            </button>
            <p>Los precios incluyen cualquier IVA aplicable.</p>
            <p className="mt-3 text-[1.05rem] leading-snug">
              {e.gratis ? (
                <>
                  Entrega GRATIS <b>{e.cuando}, {fechaLarga(e.fecha).split(', ')[1]}</b>. Haz el pedido en{' '}
                  <span className="text-te-verde">
                    {horas} h {mins} min
                  </span>
                  .
                </>
              ) : (
                <>
                  <b>Envío: {euros(p.costeEnvio)}</b> (lo cobra el vendedor). Entrega el <b>{fechaLarga(e.fecha)}</b>.
                </>
              )}
            </p>
          </div>

          <p className="flex items-center gap-1 text-te-enlace">
            <MapPin size={18} />
            {t.direccion ? `Enviar a ${t.direccion.nombre.split(' ')[0]} - ${t.direccion.localidad} ${t.direccion.codigoPostal}` : 'Selecciona la dirección de entrega'}
          </p>

          <p className={`text-xl ${p.stock < 10 ? 'text-te-rojo' : 'text-te-verde'}`}>{p.stock < 10 ? `Solo quedan ${p.stock} en stock.` : 'En stock'}</p>

          <label className="flex min-h-12 items-center gap-2 rounded-lg border border-slate-400 bg-[#f0f2f2] px-3 shadow-sm">
            <span>Cantidad:</span>
            <select value={cantidad} onChange={(ev) => setCantidad(+ev.target.value)} className="min-h-11 flex-1 bg-transparent text-lg">
              {Array.from({ length: Math.min(10, p.stock) }, (_, i) => (
                <option key={i + 1}>{i + 1}</option>
              ))}
            </select>
          </label>

          <div className="space-y-3">
            <button
              className="te-btn-amarillo min-h-12 w-full rounded-full text-[1.05rem]"
              onClick={() => {
                if (!comprobar()) return
                anadir(T, p.id, opciones, cantidad)
                navigate(`${BASE}/cesta?anadido=${p.id}`)
              }}
            >
              Añadir a la cesta
            </button>
            <button
              className="te-btn-naranja min-h-12 w-full rounded-full text-[1.05rem]"
              onClick={() => {
                if (!comprobar()) return
                if (t.usuario && t.direccion && t.pago) return setHoja(true)
                actualizar(T, { compraYa: { clave: 'compra-ya', id: p.id, opciones, cantidad } })
                navigate(t.usuario ? `${BASE}/tramitar/direccion?modo=compraya` : `${BASE}/identificacion?siguiente=direccion&modo=compraya`)
              }}
            >
              Comprar ya
            </button>
          </div>

          <table data-nota="vendedor" className="w-full text-[0.98rem]">
            <tbody>
              <tr>
                <td className="w-36 py-1 pr-3 text-te-gris">Remitente</td>
                <td>{vendedor}</td>
              </tr>
              <tr>
                <td className="py-1 pr-3 text-te-gris">Vendedor</td>
                <td>
                  <span className={p.vendedor.externo ? 'font-bold text-te-enlace' : 'text-te-enlace'}>{vendedor}</span>
                  {p.vendedor.externo && <span className="block text-sm text-te-gris">Vendedor externo · gestiona el envío y la garantía</span>}
                </td>
              </tr>
              <tr>
                <td className="py-1 pr-3 text-te-gris">Devoluciones</td>
                <td>
                  <button onClick={() => { setDevol(true); mostrar('desistimiento') }} className="text-left text-te-enlace hover:underline">
                    Se puede devolver en un plazo de 30 días a partir de la recepción
                  </button>
                </td>
              </tr>
              <tr>
                <td className="py-1 pr-3 text-te-gris">Pago</td>
                <td className="flex items-center gap-1 text-te-enlace">
                  <ShieldCheck size={16} /> Transacción segura
                </td>
              </tr>
            </tbody>
          </table>
          <button onClick={() => avisar('Las listas no están disponibles en el simulador.')} className="min-h-11 w-full rounded-lg border border-slate-400">
            Añadir a la lista
          </button>
        </div>
      </div>

      <section className="mt-6 border-t-8 border-te-fondo px-4 py-5">
        <h2 className="text-2xl font-extrabold">Acerca de este producto</h2>
        <ul className="mt-3 list-disc space-y-2 pl-6 leading-relaxed">
          {p.puntos.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
        <h3 className="mt-5 text-xl font-bold">Descripción del producto</h3>
        <p className="mt-2 leading-relaxed">{p.descripcion}</p>
      </section>

      <section className="border-t-8 border-te-fondo px-4 py-5">
        <h2 className="text-2xl font-extrabold">Información del producto</h2>
        <table className="mt-3 w-full max-w-2xl text-left">
          <tbody>
            {p.caracteristicas.map(([k, v]) => (
              <tr key={k} className="border-b border-slate-200">
                <th className="w-2/5 bg-[#f3f3f3] px-3 py-2 align-top font-semibold">{k}</th>
                <td className="px-3 py-2">{v}</td>
              </tr>
            ))}
            <tr className="border-b border-slate-200">
              <th className="bg-[#f3f3f3] px-3 py-2 font-semibold">Referencia</th>
              <td className="px-3 py-2">{p.ref}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="border-t-8 border-te-fondo px-4 py-5">
        <h2 className="text-2xl font-extrabold">Los clientes que compraron este producto también compraron</h2>
        <Carrusel className="mt-3">
          {p.relacionados.map((r) => (
            <MiniProducto key={r} p={producto(r)} />
          ))}
        </Carrusel>
      </section>

      <Preguntas p={p} />
      <Opiniones p={p} />

      {hoja && <HojaComprarYa p={p} opciones={opciones} cantidad={cantidad} vendedor={vendedor} onCerrar={() => setHoja(false)} />}
      {devol && (
        <Modal titulo="Devoluciones" onCerrar={() => setDevol(false)}>
          <div data-nota="devolucion" className="space-y-3 text-[1.05rem] leading-relaxed">
            <p>
              Puedes devolver este producto en un plazo de <b>30 días</b> desde que lo recibas. La devolución es gratuita.
            </p>
            <p>
              Además, la ley de la Unión Europea te da <b>14 días naturales</b> para desistir de cualquier compra online sin dar explicaciones
              (derecho de desistimiento).
            </p>
            <p className="text-te-gris">Guarda siempre el justificante del pedido: te lo pedirán para tramitar la devolución.</p>
          </div>
          <button onClick={() => setDevol(false)} className="te-btn-amarillo mt-4 min-h-12 w-full rounded-full">
            Entendido
          </button>
        </Modal>
      )}
    </div>
  )
}
