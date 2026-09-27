# Simulador de compras online · Ciberaula

Simulador educativo para practicar compras por internet **sin riesgo**. Tiene dos tiendas ficticias:

- **Todoenvío**: reproduce la experiencia de una gran tienda online (buscador, «Añadir a la cesta», «Comprar ya», «Tramitar pedido», «Mis pedidos»…).
- **Galerías Olmo**: reproduce la web de unos grandes almacenes (menú de categorías, compra como invitado, 1/3 Entrega con recogida en tienda, 2/3 Resumen, pasarela de pago, página del banco y verificación, «Mis compras»).

Nada es real: no se cobra, no se envía nada y no se conecta a ningún servidor. Todo se guarda en el propio navegador.

## ⭐ La forma más fácil: doble clic

Abre el archivo **`SIMULADOR DE COMPRAS (abrir con doble clic).html`** que está en esta carpeta. Se abre en el navegador (Chrome, Edge…) y funciona sin internet y sin instalar nada. Lleva todo dentro (también las fotos), así que puedes copiarlo a un USB o a otro ordenador.

Si cambias textos o productos, vuelve a generarlo con `npm run archivo`.

## Qué incluye

- 10 productos compartidos por las dos tiendas, con galería, variantes (color, talla, capacidad), ficha técnica, 8-12 opiniones y preguntas de clientes.
- Flujo completo de compra, con avisos amables si falta un dato y el botón **«Rellenar con datos de ejemplo»** en cada formulario.
- Barra de navegador simulada con candado y dirección web que cambia en cada pantalla (en Galerías Olmo cambia de dominio al pagar, como en la realidad).
- **Consejos didácticos** con voz (español de España, velocidad 0,9) que resaltan la parte de la pantalla de la que hablan. Se pueden repetir o silenciar.
- Recordatorios de «esto es un simulador» al crear la cuenta, en la dirección, en el pago y en la confirmación.
- Ventana de pedido realizado, **correo simulado** con el justificante (y un correo fraudulento de ejemplo para aprender a detectarlo) y seguimiento del pedido (Pedido realizado → Preparando → Enviado → En reparto → Entregado). El pedido avanza solo un paso cada 2 minutos o con el botón «Simular avance del pedido».
- Botón **«Reiniciar»** (arriba a la derecha) para dejarlo limpio entre alumnos.

## Editar los textos

| Qué | Archivo |
|---|---|
| Consejos con voz, recordatorio y ajustes de la voz (velocidad, segundos visibles, frecuencia de consejos al azar) | `src/data/notas.json` |
| Productos, precios, opiniones y preguntas | `src/data/productos.json` |
| Datos del botón «Rellenar con datos de ejemplo» (siempre ficticios) | `src/data/ejemplo.json` |

En `notas.json` no cambies el campo `id` de cada consejo: el programa lo usa para saber cuándo mostrarlo. Sí puedes cambiar `texto` libremente.

## Ejecutarlo en tu ordenador

Necesitas [Node.js](https://nodejs.org) 20 o superior.

```bash
npm install      # solo la primera vez
npm run dev      # abre http://localhost:5173
```

Para generar la versión final: `npm run build` (se crea la carpeta `dist/`). Puedes probarla con `npm run preview`.

## Publicarlo en GitHub Pages

> ⚠️ **Importante:** la carpeta `Imagenes recurso/` contiene capturas con datos personales. Está excluida en `.gitignore` para que **nunca** se suba. Compruébalo antes de publicar con `git status`.

1. Crea un repositorio vacío en GitHub (por ejemplo `simulador-compras`).
2. En esta carpeta:
   ```bash
   git init
   git add .
   git status            # comprueba que NO aparece «Imagenes recurso/»
   git commit -m "Simulador de compras online"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/simulador-compras.git
   git push -u origin main
   ```
3. Publica la web:
   ```bash
   npm run deploy
   ```
   Esto genera la versión final y la sube a la rama `gh-pages`.
4. En GitHub, ve a **Settings → Pages** y en «Branch» elige `gh-pages` y la carpeta `/ (root)`. Guarda.
5. En uno o dos minutos la web estará en `https://TU_USUARIO.github.io/simulador-compras/`.

No hace falta configurar nada más: la web usa rutas con `#` y rutas relativas, así que funciona con cualquier nombre de repositorio.

## Notas técnicas

- React 19 + Vite + Tailwind CSS 4, iconos Lucide, estado con Zustand guardado en `localStorage`.
- La voz usa la Web Speech API del navegador. En iPhone/iPad la voz solo empieza tras tocar la pantalla (por eso se activa al pulsar «Entrar» en una tienda). Si el dispositivo no tiene una voz en español instalada, usará la que tenga disponible.
- Diseño pensado primero para móvil; en ordenador se adapta a varias columnas.

## Marcas y derechos

«Todoenvío» y «Galerías Olmo» son tiendas inventadas con logotipos propios. Se reproduce la **experiencia de uso** (rutas, botones, disposición) de las tiendas reales, no su identidad de marca. Los productos, marcas, opiniones, personas y datos son ficticios. Créditos de las imágenes en [`CREDITOS.md`](CREDITOS.md).
