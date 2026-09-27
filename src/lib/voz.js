import notasData from '../data/notas.json'

const { velocidadVoz = 0.9, idiomaVoz = 'es-ES' } = notasData.ajustes || {}
const disponible = typeof window !== 'undefined' && 'speechSynthesis' in window
let vozElegida = null

function elegirVoz() {
  if (!disponible) return
  const voces = window.speechSynthesis.getVoices()
  const es = voces.filter((v) => v.lang?.replace('_', '-').toLowerCase() === idiomaVoz.toLowerCase())
  // Preferimos voces de calidad (Google / Microsoft «natural») si existen
  vozElegida =
    es.find((v) => /natural|online/i.test(v.name)) ||
    es.find((v) => /google/i.test(v.name)) ||
    es[0] ||
    voces.find((v) => v.lang?.toLowerCase().startsWith('es')) ||
    null
}

if (disponible) {
  elegirVoz()
  window.speechSynthesis.onvoiceschanged = elegirVoz
}

export const vozDisponible = () => disponible

export function hablar(texto) {
  if (!disponible || !texto) return
  const s = window.speechSynthesis
  s.cancel()
  const u = new SpeechSynthesisUtterance(texto)
  u.lang = idiomaVoz
  u.rate = velocidadVoz
  if (vozElegida) u.voice = vozElegida
  s.speak(u)
}

export function callar() {
  if (disponible) window.speechSynthesis.cancel()
}

// En móviles (sobre todo iPhone) la voz solo funciona si antes el usuario ha tocado la pantalla.
// Llamamos a esto desde el primer botón que pulsa el alumno.
export function desbloquearVoz() {
  if (!disponible) return
  const u = new SpeechSynthesisUtterance(' ')
  u.volume = 0
  window.speechSynthesis.speak(u)
}
