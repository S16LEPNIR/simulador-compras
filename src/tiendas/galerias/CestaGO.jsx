import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronUp, Gift, IdCard, Minus, Plus, ShieldCheck, Ticket, Trash, Truck } from 'lucide-react'
import { Modal, useAvisoSimulador, useUrl } from '../../components/comun/Simulador'
import { useNota, useNotas } from '../../components/comun/Notas'
import { useSim } from '../../store/useSim'
import { euros, imagenSegunOpciones, textoOpciones, totales } from '../../lib/formato'
import { BASE, BotonNegro, DOMINIO, G, costeEnvioEstandar, envioGratisDesde, useTienda } from './comun'

// Gastos de envío estimados: gratis desde 30 € (más los de vendedores externos)
export function gastosEstimados(subtotal, envioVendedores) {
  const propios = subtotal >= envioGratisDesde ? 0 : costeEnvioEstandar
  return Math.round((propios + envioVendedores) * 100) / 100
}

export default function CestaGO() {
  useUrl(`${DOMINIO}/cesta/`)
  const t = useTienda()
  const cambiar = useSim((s) => s.cambiarCantidad)
  const navigate = useNavigate()
  const avisar = useAvisoSimulador()
  const { mostrar } = useNotas()
  const [cupon, setCupon] = useState(false)
  const [plan, setPlan] = useState('Mensual')
  const { det, subtotal, envioVendedores, unidades } = totales(t.carrito)
  const envio = gastosEstimados(subtotal, envioVendedores)
  const total = Math.round((subtotal + envio) * 100) / 100
  const conElectronica = det.some((l) => l.p.categoria === 'Electrónica')
  useNota('cesta', det.length > 0)
  useNota('extras', det.length > 0, 1500)

  if (!det.length)
    return (
      <div className="px-4 py-10 text-center">
        <h1 className="text-3xl font-light">Cesta</h1>
        <p className="mt-4 text-lg">Tu cesta está vacía.</p>
        <Link to={BASE} className="mx-auto mt-6 flex min-h-12 max-w-xs items-center justify-center bg-black text-white">
          Descubre nuestros productos
        </Link>
      </div>
    )

  return (
    <div className="pb-36 md:grid md:grid-cols-[1fr_360px] md:gap-8 md:px-4 md:pb-10">
      <div className="px-4 md:px-0">
        <h1 className="mt-4 text-3xl font-light">Cesta</h1>
        <ul data-nota="cesta" className="mt-4 divide-y divide-slate-200">
          {det.map((l) => (
            <li key={l.clave} className="flex gap-4 py-5">
              <Link to={`${BASE}/p/${l.id}`} className="flex h-32 w-24 shrink-0 items-center justify-center bg-go-gris p-1">
                <img src={imagenSegunOpciones(l.p, l.opciones)} alt="" className="max-h-full object-contain mix-blend-multiply" />
              </Link>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold uppercase">{l.p.marca}</p>
                <Link to={`${BASE}/p/${l.id}`} className="leading-snug hover:underline">
                  {l.p.tituloCorto}
                </Link>
                {Object.keys(l.opciones || {}).length > 0 && <p className="text-sm font-semibold">{textoOpciones(l.opciones)}</p>}
                {l.p.vendedor.externo && <p className="text-sm text-go-suave">Vendido por {l.p.vendedor.nombre}</p>}
                <div className="mt-3 inline-flex items-center border border-slate-400">
                  <button
                    onClick={() => cambiar(G, l.clave, l.cantidad - 1)}
                    className="flex h-11 w-11 items-center justify-center hover:bg-slate-100"
                    aria-label={l.cantidad === 1 ? 'Eliminar producto' : 'Quitar una unidad'}
                  >
                    {l.cantidad === 1 ? <Trash size={19} /> : <Minus size={19} />}
                  </button>
                  <span className="w-9 text-center text-lg" aria-label={`Cantidad ${l.cantidad}`}>
                    {l.cantidad}
                  </span>
                  <button onClick={() => cambiar(G, l.clave, l.cantidad + 1)} className="flex h-11 w-11 items-center justify-center hover:bg-slate-100" aria-label="Añadir una unidad">
                    <Plus size={19} />
                  </button>
                </div>
                <p className="mt-2 text-lg font-semibold">{euros(l.total)}</p>
                <label className="mt-2 flex min-h-10 items-center gap-2">
                  <input type="checkbox" className="h-5 w-5 accent-black" /> Envolver gratis para regalo
                </label>
              </div>
            </li>
          ))}
        </ul>

        <div data-nota="extras" className="space-y-4">
          {conElectronica && (
            <section className="border border-slate-300">
              <p className="flex items-center gap-3 border-b border-slate-200 p-4 font-semibold">
                <ShieldCheck /> Olmo Protect
              </p>
              <div className="space-y-2 p-4">
                <p>Tu nuevo dispositivo protegido contra daños accidentales y robo por sólo 16,99 € trimestrales, durante 3 años.</p>
                <button onClick={() => avisar('Las condiciones del seguro no están disponibles en el simulador.')} className="font-semibold underline">
                  Ver condiciones
                </button>
                <p className="font-semibold">Por sólo 16,99 €</p>
                <button
                  onClick={() => {
                    mostrar('extras', { forzar: true })
                    avisar('En el simulador no se contratan seguros. En la vida real, lee las condiciones antes de contratarlo.')
                  }}
                  className="min-h-12 w-full border border-black uppercase tracking-wider"
                >
                  Contratar seguro
                </button>
                <p className="text-sm text-go-suave">Vendido por: Seguros Galerías Olmo (agencia ficticia)</p>
              </div>
            </section>
          )}

          <section className="border border-slate-300 border-t-4 border-t-go-verde p-4">
            <p className="flex items-center gap-3">
              <Truck className="text-go-verde" />
              <span>
                <b className="block font-semibold">Galerías Olmo Plus</b>
                <span className="text-sm text-go-suave">Nuestra tarifa plana para gastos de envío</span>
              </span>
            </p>
            <div className="mt-3 flex gap-6 border-b border-slate-200" role="tablist">
              {['Mensual', 'Anual'].map((x) => (
                <button key={x} role="tab" aria-selected={plan === x} onClick={() => setPlan(x)} className={`min-h-11 ${plan === x ? 'border-b-2 border-go-verde text-go-verde' : ''}`}>
                  {x}
                </button>
              ))}
            </div>
            <p className="mt-3 text-go-verde">{plan === 'Mensual' ? 'Envíos gratis por sólo 4,90 € al mes' : 'Envíos gratis por sólo 39,90 € al año'}</p>
            <p className="text-sm">Más barata que un único envío</p>
            <button onClick={() => mostrar('extras', { forzar: true })} className="mt-3 min-h-12 w-full border border-black">
              Añadir Tarifa Plana {plan}
            </button>
          </section>

          <ul className="divide-y divide-slate-200 border-y border-slate-200">
            <li className="flex min-h-16 items-center gap-3">
              <Ticket className="shrink-0" />
              <b className="flex-1 font-semibold">Código de cupón</b>
              <button onClick={() => setCupon(true)} className="min-h-11 rounded-full bg-go-gris px-4">
                Añadir
              </button>
            </li>
            <li className="flex min-h-20 items-center gap-3">
              <IdCard className="shrink-0" />
              <span className="flex-1">
                <b className="block font-semibold">Identifícate con tu Tarjeta Galerías Olmo y aprovecha sus ventajas</b>
                <span className="text-sm">Podrás cambiar el medio de pago más adelante</span>
              </span>
              <button onClick={() => avisar()} className="min-h-11 rounded-full bg-go-gris px-4">
                Añadir
              </button>
            </li>
            <li>
              <label className="flex min-h-16 items-center gap-3">
                <Gift className="shrink-0" />
                <b className="flex-1 font-semibold">Recibir ticket regalo</b>
                <input type="checkbox" className="h-6 w-6 accent-black" />
              </label>
            </li>
          </ul>
        </div>
      </div>

      <aside className="md:mt-16">
        <div className="mx-4 mt-6 bg-go-gris p-4 md:mx-0 md:mt-0" data-nota="resumen">
          <dl className="space-y-2">
            <div className="flex justify-between">
              <dt>Subtotal</dt>
              <dd>{euros(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt>Gastos de envío estimados</dt>
              <dd className={envio ? '' : 'text-go-verde'}>{envio ? euros(envio) : 'Gratis'}</dd>
            </div>
            {envioVendedores > 0 && <p className="text-sm text-go-suave">Incluye {euros(envioVendedores)} de vendedores externos</p>}
            {subtotal < envioGratisDesde && <p className="text-sm text-go-suave">Te faltan {euros(envioGratisDesde - subtotal)} para el envío gratis</p>}
            <div className="flex justify-between text-lg font-semibold">
              <dt>Total</dt>
              <dd>{euros(total)}</dd>
            </div>
          </dl>
          <BotonNegro className="mt-4 hidden md:block" onClick={() => navigate(t.usuario || t.invitado ? `${BASE}/compra/entrega` : `${BASE}/acceso?siguiente=entrega`)}>
            Continuar
          </BotonNegro>
        </div>
      </aside>

      {/* Barra inferior fija en móvil, como en la web real */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-300 bg-white px-4 pb-4 pt-3 shadow-[0_-4px_12px_rgba(0,0,0,0.08)] md:hidden">
        <p className="flex items-center justify-between text-lg">
          <span>
            Total <b>{euros(total)}</b> <span className="text-sm text-go-suave">({unidades} art.)</span>
          </span>
          <ChevronUp aria-hidden />
        </p>
        <BotonNegro className="mt-2" onClick={() => navigate(t.usuario || t.invitado ? `${BASE}/compra/entrega` : `${BASE}/acceso?siguiente=entrega`)}>
          Continuar
        </BotonNegro>
      </div>

      {cupon && (
        <Modal titulo="Código de cupón" onCerrar={() => setCupon(false)} className="font-montse">
          <p>Si tienes un cupón de descuento, escríbelo aquí.</p>
          <input className="mt-3 min-h-12 w-full border border-slate-400 px-3" placeholder="Código" aria-label="Código de cupón" />
          <BotonNegro
            className="mt-3"
            onClick={() => {
              setCupon(false)
              avisar('El cupón no es válido. En el simulador no hay cupones de descuento.')
            }}
          >
            Aplicar
          </BotonNegro>
        </Modal>
      )}
    </div>
  )
}
