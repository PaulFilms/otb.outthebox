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
4. El workflow **Publicar web en GitHub Pages** se ejecuta tras un push a `main` y cada día a las **05:15, hora de Madrid**. Los cambios en Notion se publican en la siguiente ejecución correcta, sin necesidad de un commit. GitHub puede retrasar la ejecución programada.
5. Si necesitas publicar un cambio antes, ve a **Actions → Publicar web en GitHub Pages → Run workflow** y selecciona `main`. Usa una ejecución nueva, no **Re-run jobs** de un despliegue antiguo: eso volvería a usar el commit anterior.

La función de Supabase solo se consulta durante la compilación: Pages sirve una copia estática de las fichas y no recibe la clave. Si falla la consulta, el despliegue se detiene y se conserva la web publicada. Las imágenes de Notion admitidas se copian al compilar para no depender de URLs firmadas que caducan durante la visita. Si no hay imagen de portada disponible se muestra una portada tipográfica de OTB. La Agenda es pública: publica en el origen solo eventos que puedan aparecer en la web.
