import { createHash } from "node:crypto"
import { existsSync } from "node:fs"
import { mkdir, readdir, unlink, writeFile } from "node:fs/promises"
import { loadEnvFile } from "node:process"
import { fileURLToPath } from "node:url"

const envFile = new URL("../../.env", import.meta.url)
const output = new URL("../public/agenda/", import.meta.url)
const imageTypes = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/avif", "avif"],
  ["image/gif", "gif"],
])

function httpsUrl(value) {
  const url = typeof value === "string" ? URL.parse(value) : null
  return url?.protocol === "https:" && !url.username && !url.password ? url : null
}

async function copyImage(entry) {
  const images = Array.isArray(entry.imagenes) ? entry.imagenes : []
  for (const candidate of [entry.cover, ...images]) {
    const url = httpsUrl(candidate?.url ?? candidate)
    if (!url) continue
    // Notion file URLs are signed and expire. Publish only a local copy.
    if (
      url.hostname !== "prod-files-secure.s3.us-west-2.amazonaws.com" &&
      !url.hostname.endsWith(".notion-static.com")
    ) {
      console.warn("Agenda: se ha omitido una imagen de un origen no admitido.")
      continue
    }

    try {
      const response = await fetch(url, {
        redirect: "error",
        signal: AbortSignal.timeout(15_000),
      })
      const extension = imageTypes.get(response.headers.get("content-type")?.split(";")[0])
      const size = Number(response.headers.get("content-length"))
      if (!response.ok || !extension || !size || size > 10 * 1024 * 1024) {
        await response.body?.cancel()
        console.warn(`Agenda: imagen no disponible o de formato/tamaño no admitido (HTTP ${response.status}).`)
        continue
      }

      const data = Buffer.from(await response.arrayBuffer())
      const hash = createHash("sha256").update(data).digest("hex").slice(0, 20)
      const filename = `${hash}.${extension}`
      await writeFile(new URL(filename, output), data)
      return { filename, alt: typeof candidate?.caption === "string" ? candidate.caption : "" }
    } catch (error) {
      console.warn(`Agenda: no se pudo copiar una imagen de Notion (${error.name}).`)
    }
  }
  return null
}

async function syncAgenda() {
  if (existsSync(envFile)) loadEnvFile(fileURLToPath(envFile))
  const { SUPABASE_URL, SUPABASE_ANON_KEY } = process.env
  const url = httpsUrl(SUPABASE_URL)
  if (!url || !SUPABASE_ANON_KEY?.trim()) {
    throw new Error("configura SUPABASE_URL (HTTPS) y SUPABASE_ANON_KEY.")
  }

  const response = await fetch(new URL("/functions/v1/notion_entradas", url), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SUPABASE_ANON_KEY.trim()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name: "Functions" }),
    redirect: "error",
    signal: AbortSignal.timeout(30_000),
  })
  if (!response.ok) throw new Error(`Supabase respondió con HTTP ${response.status}.`)

  const data = await response.json()
  if (!Array.isArray(data?.entradas)) {
    throw new Error("respuesta de Supabase sin lista de entradas.")
  }

  await mkdir(output, { recursive: true })
  const events = []
  for (const entry of data.entradas) {
    if (entry?.tipo !== "EVENTO") continue
    if (typeof entry.id !== "string" || typeof entry.nombre !== "string" || !entry.nombre.trim()) {
      throw new Error("Supabase devolvió un evento sin identificador o título.")
    }
    const date = typeof entry.fecha === "string" && Number.isFinite(Date.parse(entry.fecha))
      ? entry.fecha
      : null
    events.push({
      id: entry.id,
      title: entry.nombre.trim(),
      description: typeof entry.info === "string" ? entry.info.trim() : "",
      date,
      image: await copyImage(entry),
      url: httpsUrl(entry.url)?.href ?? null,
    })
  }
  const timestamp = (event) => event.date ? Date.parse(event.date) : Infinity
  events.sort((a, b) => timestamp(a) - timestamp(b))

  const currentImages = new Set(events.map((event) => event.image?.filename))
  for (const file of await readdir(output, { withFileTypes: true })) {
    if (file.isFile() && /^[a-f0-9]{20}\.(jpg|png|webp|avif|gif)$/.test(file.name) && !currentImages.has(file.name)) {
      await unlink(new URL(file.name, output))
    }
  }
  await writeFile(new URL("events.json", output), JSON.stringify(events))
  console.log(`Agenda: ${events.length} eventos sincronizados.`)
}

try {
  await syncAgenda()
} catch (error) {
  console.error(`Agenda: ${error.message}`)
  process.exitCode = 1
}
