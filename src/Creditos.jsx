import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import creditos from './data/creditos.json'

export default function Creditos() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      <main className="mx-auto max-w-4xl px-4 py-6">
        <Link to="/" className="inline-flex min-h-11 items-center gap-2 font-semibold text-indigo-700 underline">
          <ArrowLeft size={20} /> Volver al inicio
        </Link>
        <h1 className="mt-4 text-3xl font-extrabold">Créditos de las imágenes</h1>
        <p className="mt-2 text-lg">
          Todas las fotografías tienen licencia libre (Creative Commons o dominio público) y proceden de Wikimedia Commons u Openverse. Los logotipos
          son creaciones propias. Las marcas que puedan verse en algunas fotos pertenecen a sus dueños; los productos del simulador son ficticios.
        </p>
        <ul className="mt-6 divide-y divide-slate-200">
          {creditos.map((c) => (
            <li key={c.file} className="flex gap-4 py-3">
              <img src={c.img} alt="" className="h-20 w-20 shrink-0 rounded object-contain ring-1 ring-slate-200" loading="lazy" />
              <div className="text-[0.98rem]">
                <p className="font-semibold">{c.title}</p>
                <p>
                  Autor: {c.author} · Licencia:{' '}
                  {c.license_url ? (
                    <a href={c.license_url} target="_blank" rel="noreferrer" className="text-indigo-700 underline">
                      {c.license}
                    </a>
                  ) : (
                    c.license
                  )}
                </p>
                {c.source && (
                  <a href={c.source} target="_blank" rel="noreferrer" className="break-all text-sm text-indigo-700 underline">
                    {c.source}
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
      </main>
    </div>
  )
}
