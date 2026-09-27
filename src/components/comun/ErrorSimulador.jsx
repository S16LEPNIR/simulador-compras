import { Component } from 'react'

// Si algo falla, en lugar de una pantalla en blanco mostramos un mensaje amable
export default class ErrorSimulador extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error) {
    console.error('Error en el simulador:', error)
  }

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div className="flex min-h-screen items-center justify-center bg-indigo-50 p-6 font-sans text-slate-900">
        <div className="max-w-md rounded-2xl bg-white p-6 text-center shadow-lg">
          <p className="text-2xl font-bold">Vaya, algo no ha ido bien</p>
          <p className="mt-3 text-lg">No te preocupes: no has hecho nada mal. Vuelve al inicio para seguir practicando.</p>
          <button
            onClick={() => {
              window.location.hash = '#/'
              window.location.reload()
            }}
            className="mt-5 min-h-12 w-full rounded-xl bg-indigo-700 text-lg font-bold text-white"
          >
            Volver al inicio del simulador
          </button>
          <button
            onClick={() => {
              try {
                localStorage.removeItem('simulador-compras-ciberaula-v1')
              } catch {
                /* sin almacenamiento disponible */
              }
              window.location.hash = '#/'
              window.location.reload()
            }}
            className="mt-3 min-h-12 w-full rounded-xl border-2 border-slate-400 text-lg font-semibold"
          >
            Reiniciar el simulador desde cero
          </button>
        </div>
      </div>
    )
  }
}
