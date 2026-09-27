import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

// base './' permite publicar en GitHub Pages en cualquier nombre de repositorio.
// Con «npm run archivo» se genera además un único archivo HTML que se abre con doble clic.
export default defineConfig(({ mode }) => ({
  base: './',
  plugins: [react(), tailwindcss(), ...(mode === 'archivo' ? [viteSingleFile()] : [])],
  build: mode === 'archivo' ? { outDir: 'dist-archivo', emptyOutDir: true } : {},
}))
