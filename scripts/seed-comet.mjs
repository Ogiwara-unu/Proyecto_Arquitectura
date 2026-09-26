// Crea los tipos de contenido en Comet CMS e importa data/dataset.json.
// Uso:
//   COMET_URL=http://127.0.0.1:8000 COMET_WORKSPACE=volcanes \
//   COMET_USER=admin COMET_PASS=... node scripts/seed-comet.mjs
//
// Modelo (las relaciones funcionan como llaves foráneas):
//   paises        <- volcanes.pais
//   tipos-volcan  <- volcanes.tipo
//   volcanes      <- erupciones.volcan
// Es idempotente: los tipos existentes se actualizan y las entradas ya
// creadas (mismo slug) se reutilizan.
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

const BASE = (process.env.COMET_URL || 'http://127.0.0.1:8000').replace(/\/$/, '')
const WORKSPACE = process.env.COMET_WORKSPACE || 'volcanes'
const USER = process.env.COMET_USER || 'admin'
const PASS = process.env.COMET_PASS
if (!PASS) {
  console.error('Falta COMET_PASS')
  process.exit(1)
}

function slugify(text) {
  return String(text)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

// --- cliente mínimo del Admin API (sesión por cookie + CSRF) ---
let cookie = ''
let csrf = ''

async function api(method, path, body) {
  const res = await fetch(`${BASE}/admin/api${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-Comet-Workspace': WORKSPACE,
      ...(cookie && { Cookie: cookie }),
      ...(csrf && { 'X-CSRF-Token': csrf })
    },
    body: body === undefined ? undefined : JSON.stringify(body)
  })
  const setCookie = res.headers.getSetCookie?.() || []
  for (const c of setCookie) {
    const pair = c.split(';')[0]
    const name = pair.split('=')[0]
    cookie = [...cookie.split('; ').filter(p => p && !p.startsWith(name + '=')), pair].join('; ')
  }
  const token = res.headers.get('x-csrf-token')
  if (token) csrf = token
  const json = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(`${method} ${path} -> ${res.status} ${JSON.stringify(json.error || json)}`)
  return json
}

// --- esquemas ---
const schemas = [
  {
    name: 'paises',
    label: 'Países',
    icon: 'mdi:flag-outline',
    fields: {
      title: { type: 'text', label: 'Nombre', required: true },
      slug: { type: 'slug', label: 'Slug', required: true, unique: true, source: 'title' }
    }
  },
  {
    name: 'tipos-volcan',
    label: 'Tipos de volcán',
    icon: 'mdi:shape-outline',
    fields: {
      title: { type: 'text', label: 'Nombre', required: true },
      slug: { type: 'slug', label: 'Slug', required: true, unique: true, source: 'title' },
      descripcion: { type: 'textarea', label: 'Descripción' }
    }
  },
  {
    name: 'volcanes',
    label: 'Volcanes',
    icon: 'mdi:image-filter-hdr',
    fields: {
      title: { type: 'text', label: 'Nombre', required: true },
      slug: { type: 'slug', label: 'Slug', required: true, unique: true, source: 'title' },
      ubicacion: { type: 'text', label: 'Ubicación' },
      pais: { type: 'relation', label: 'País', target: 'paises', required: true },
      tipo: { type: 'relation', label: 'Tipo de volcán', target: 'tipos-volcan', required: true },
      latitud: { type: 'number', label: 'Latitud' },
      longitud: { type: 'number', label: 'Longitud' },
      elevacion: { type: 'number', label: 'Elevación (m)' },
      imagen: { type: 'media', label: 'Imagen', multiple: false }
    }
  },
  {
    name: 'erupciones',
    label: 'Erupciones',
    icon: 'mdi:fire',
    fields: {
      title: { type: 'text', label: 'Título', required: true },
      slug: { type: 'slug', label: 'Slug', required: true, unique: true, source: 'title' },
      numero: { type: 'number', label: 'Número de registro', required: true },
      volcan: { type: 'relation', label: 'Volcán', target: 'volcanes', required: true },
      anio: { type: 'number', label: 'Año (negativo = a.C.)' },
      mes: { type: 'number', label: 'Mes' },
      dia: { type: 'number', label: 'Día' },
      fecha: { type: 'text', label: 'Fecha legible' },
      vei: { type: 'number', label: 'Índice VEI' },
      agente: { type: 'text', label: 'Agente causante' },
      muertes: { type: 'number', label: 'Muertes' },
      desaparecidos: { type: 'number', label: 'Desaparecidos' },
      heridos: { type: 'number', label: 'Heridos' },
      danos_millones: { type: 'number', label: 'Daños (millones USD)' },
      casas_destruidas: { type: 'number', label: 'Viviendas destruidas' }
    }
  }
]

async function ensureSchema(schema) {
  const existing = await api('GET', '/content-types')
  const names = (existing.data || []).map(t => t.name)
  if (names.includes(schema.name)) {
    await api('PUT', `/content-types/${schema.name}`, schema)
    console.log(`tipo actualizado: ${schema.name}`)
  } else {
    await api('POST', '/content-types', schema)
    console.log(`tipo creado: ${schema.name}`)
  }
}

async function existingBySlug(collection) {
  const res = await api('GET', `/content/${collection}`)
  return new Map((res.data || []).map(e => [e.slug, e.id]))
}

async function upsertAll(collection, items) {
  const known = await existingBySlug(collection)
  const ids = new Map()
  let created = 0
  for (const item of items) {
    let id = known.get(item.slug)
    if (!id) {
      const res = await api('POST', `/content/${collection}`, { status: 'published', ...item })
      id = res.data.id
      created++
    }
    ids.set(item.slug, id)
  }
  console.log(`${collection}: ${created} creadas, ${items.length - created} ya existían`)
  return ids
}

// --- ejecución ---
const records = JSON.parse(readFileSync(join(root, 'data', 'dataset.json'), 'utf-8'))

await api('POST', '/login', { username: USER, password: PASS })

for (const s of schemas) await ensureSchema(s)

const countries = [...new Set(records.map(r => r.country))].sort()
const types = [...new Set(records.map(r => r.type))].sort()
const countryIds = await upsertAll('paises', countries.map(c => ({ title: c, slug: slugify(c) })))
const typeIds = await upsertAll('tipos-volcan', types.map(t => ({ title: t, slug: slugify(t) })))

const volcanoSlug = r => slugify(`${r.name}-${r.country}`)
const volcanoes = new Map()
for (const r of records) {
  if (volcanoes.has(volcanoSlug(r))) continue
  volcanoes.set(volcanoSlug(r), {
    title: r.name,
    slug: volcanoSlug(r),
    ubicacion: r.location,
    pais: countryIds.get(slugify(r.country)),
    tipo: typeIds.get(slugify(r.type)),
    latitud: r.latitude,
    longitud: r.longitude,
    elevacion: r.elevation
  })
}
const volcanoIds = await upsertAll('volcanes', [...volcanoes.values()])

await upsertAll('erupciones', records.map(r => ({
  title: `${r.name} (${r.fecha})`,
  slug: `erupcion-${r.id}`,
  numero: r.id,
  volcan: volcanoIds.get(volcanoSlug(r)),
  anio: r.year,
  mes: r.month,
  dia: r.day,
  fecha: r.fecha,
  vei: r.vei,
  agente: r.agent,
  muertes: r.deaths,
  desaparecidos: r.missing,
  heridos: r.injuries,
  danos_millones: r.damageMil,
  casas_destruidas: r.housesDestroyed
})))

console.log('Listo.')
