# OUT THE BOX

La web usa el diseño exportado de Figma Make en [OTB Web](./OTB%20Web). La Agenda consulta la función `notion_entradas` de Supabase con la misma petición que [supa_test.js](./supa_test.js), publica solo las entradas `EVENTO` y las ordena de la fecha más reciente a la más antigua. Cada ficha tiene una página `/evento/?id=…` que admite enlaces directos y muestra el contenido Markdown con sus imágenes y enlaces. Espacios, Contacto y Acceder conservan el prototipo; no están conectados a la API.

## Desarrollo local

Usa Node.js 22 (22.12 o posterior) y pnpm 10. Si no tienes el archivo `.env` en la raíz, copia [.env.example](./.env.example) a `.env` y rellena `SUPABASE_URL` y `SUPABASE_ANON_KEY`. Usa una clave publicable o `anon`, nunca una clave `service_role`.

```sh
cd "OTB Web"
pnpm install --frozen-lockfile
pnpm dev
```

`pnpm dev` y `pnpm build` sincronizan los eventos antes de iniciar Vite. Si modificas eventos mientras tienes la web abierta, ejecuta `pnpm sync:agenda` y recarga. Si la consulta falla, la sincronización lo indica y detiene la compilación en lugar de publicar una agenda vacía.

## GitHub Pages

1. Sube el proyecto desde esta raíz, sin el archivo `.env`. No hace falta subir `.figma`: Vite usa sus metadatos cuando están presentes y, si no, usa los de [index.html](./OTB%20Web/index.html).
2. En **Settings → Pages**, elige **GitHub Actions** como origen.
3. En **Settings → Secrets and variables → Actions**, crea dos entradas a nivel de repositorio: en **Variables**, `SUPABASE_URL`; y en **Secrets**, `SUPABASE_ANON_KEY`. Pega solo el valor de cada una, sin `NOMBRE=` ni comillas. No las agrupes en `.env` ni las crees en **Settings → Environments → github-pages**: ese entorno solo se usa para el paso de despliegue, no para la compilación.
4. Publica con un push a `main` o ejecuta **Publicar web en GitHub Pages** manualmente en **Actions**. Vuelve a ejecutar el workflow para incorporar cambios de Supabase sin modificar el código.

La función de Supabase no admite el preflight CORS necesario para esta petición autenticada. Por eso se consulta durante la compilación: Pages sirve una copia estática de las fichas y no recibe la clave. Las imágenes de Notion admitidas se copian al compilar para no depender de URLs firmadas que caducan. Si no hay imagen disponible se muestra una portada tipográfica de OTB. La Agenda es pública: publica en el origen solo eventos que puedan aparecer en la web.
