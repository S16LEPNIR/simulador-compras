// Mete las fotos dentro del HTML para que todo el simulador sea UN SOLO ARCHIVO
// que se abre con doble clic (sin servidor ni instalación).
import { readFileSync, writeFileSync, existsSync } from 'node:fs'

const entrada = 'dist-archivo/index.html'
const salida = 'SIMULADOR DE COMPRAS (abrir con doble clic).html'
let html = readFileSync(entrada, 'utf8')

const rutas = [...new Set(html.match(/img\/productos\/p\d{2}\/\d\.jpg/g) || [])]
for (const ruta of rutas) {
  const archivo = `public/${ruta}`
  if (!existsSync(archivo)) throw new Error(`Falta la imagen ${archivo}`)
  const datos = `data:image/jpeg;base64,${readFileSync(archivo).toString('base64')}`
  html = html.split(ruta).join(datos)
}
const favicon = `data:image/svg+xml;base64,${readFileSync('public/favicon.svg').toString('base64')}`
html = html.replace('./favicon.svg', favicon)

writeFileSync(salida, html)
console.log(`Creado «${salida}» con ${rutas.length} imágenes (${(html.length / 1024 / 1024).toFixed(1)} MB)`)
