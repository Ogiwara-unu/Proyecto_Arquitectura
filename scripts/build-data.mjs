// Convierte volcano-events.csv -> data/dataset.json
// Uso: node scripts/build-data.mjs
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

function parseCSV(text) {
  const rows = []
  let row = []
  let field = ''
  let inQuotes = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++ }
        else inQuotes = false
      } else field += c
    } else {
      if (c === '"') inQuotes = true
      else if (c === ',') { row.push(field); field = '' }
      else if (c === '\r') { /* ignore */ }
      else if (c === '\n') { row.push(field); rows.push(row); row = []; field = '' }
      else field += c
    }
  }
  if (field.length || row.length) { row.push(field); rows.push(row) }
  return rows
}

const csvText = readFileSync(join(root, 'volcano-events.csv'), 'utf-8')
const rows = parseCSV(csvText).filter(r => r.length > 1)
const header = rows[0]
const dataRows = rows.slice(1)

const num = v => (v === '' || v === undefined) ? null : Number(v)
const str = v => (v === '' || v === undefined) ? null : v.trim()

const records = []
let id = 1
for (const r of dataRows) {
  const o = {}
  header.forEach((h, idx) => { o[h] = r[idx] })

  if (!str(o.Name)) continue // descarta la fila en blanco del csv

  const year = num(o.Year)
  const month = num(o.Month)
  const day = num(o.Day)

  let fecha = 'Fecha desconocida'
  if (year !== null) {
    const yearLabel = year < 0 ? `${Math.abs(year)} a.C.` : `${year} d.C.`
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
    if (day && month) fecha = `${day} ${meses[month - 1]} ${yearLabel}`
    else if (month) fecha = `${meses[month - 1]} ${yearLabel}`
    else fecha = yearLabel
  }

  records.push({
    id: id++,
    year,
    month,
    day,
    fecha,
    name: str(o.Name),
    location: str(o.Location),
    country: str(o.Country) || 'Desconocido',
    latitude: num(o.Latitude),
    longitude: num(o.Longitude),
    elevation: num(o['Elevation (m)']),
    type: str(o.Type) || 'Sin clasificar',
    vei: num(o.VEI),
    agent: str(o.Agent),
    deaths: num(o['Total Deaths']),
    missing: num(o['Total Missing']),
    injuries: num(o['Total Injuries']),
    damageMil: num(o['Total Damage ($Mil)']),
    housesDestroyed: num(o['Total Houses Destroyed'])
  })
}

// ordena cronológicamente para que la navegación tenga sentido
records.sort((a, b) => (a.year ?? -100000) - (b.year ?? -100000))
records.forEach((r, i) => { r.id = i + 1 })

writeFileSync(join(root, 'data', 'dataset.json'), JSON.stringify(records))
console.log(`OK: ${records.length} registros escritos en data/dataset.json`)

const countries = [...new Set(records.map(r => r.country))].sort()
const types = [...new Set(records.map(r => r.type))].sort()
console.log(`Países: ${countries.length}, Tipos: ${types.length}`)
