// Uso: node supa_test.js [nombre_funcion]
// Lee SUPABASE_URL y SUPABASE_ANON_KEY del .env (admite formato KEY = "valor")
import { readFileSync } from 'node:fs'

const env = Object.fromEntries(
  readFileSync(new URL('.env', import.meta.url), 'utf8')
    .split('\n')
    .map(line => line.match(/^\s*([A-Z_]+)\s*=\s*"?([^"]*)"?\s*$/))
    .filter(Boolean)
    .map(m => [m[1], m[2]])
)

const fn = process.argv[2] ?? 'notion_entradas'

const res = await fetch(`${env.SUPABASE_URL}/functions/v1/${fn}`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${env.SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ name: 'Functions' }),
})

console.log('Status:', res.status, res.statusText)
const data = await res.json()
console.dir(data, { depth: null })
