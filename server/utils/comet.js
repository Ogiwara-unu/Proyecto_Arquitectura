// Cliente de la API pública de Comet CMS.
// Las erupciones se piden con ?include=volcan (un nivel de relación); el país y
// el tipo de cada volcán se resuelven con las colecciones paises/tipos-volcan.

let cache = null
const TTL_MS = 60_000

export function cometFetch(collection, query = {}) {
  const { cometUrl, cometWorkspace } = useRuntimeConfig()
  return $fetch(`${cometUrl}/api/v1/workspaces/${cometWorkspace}/content/${collection}`, { query })
    .then(res => res.data)
}

async function fetchDataset() {
  const [eruptions, countries, types] = await Promise.all([
    cometFetch('erupciones', { include: 'volcan', sort: 'numero' }),
    cometFetch('paises'),
    cometFetch('tipos-volcan')
  ])

  const countryById = new Map(countries.map(c => [c.id, c.title]))
  const typeById = new Map(types.map(t => [t.id, t.title]))

  return eruptions
    .filter(e => e.data.volcan)
    .map(e => {
      const d = e.data
      const volcano = d.volcan
      const v = volcano.data
      return {
        id: d.numero,
        year: d.anio ?? null,
        month: d.mes ?? null,
        day: d.dia ?? null,
        fecha: d.fecha || 'Fecha desconocida',
        name: volcano.title,
        location: v.ubicacion || null,
        country: countryById.get(v.pais) || 'Desconocido',
        latitude: v.latitud ?? null,
        longitude: v.longitud ?? null,
        elevation: v.elevacion ?? null,
        type: typeById.get(v.tipo) || 'Sin clasificar',
        vei: d.vei ?? null,
        agent: d.agente || null,
        deaths: d.muertes ?? null,
        missing: d.desaparecidos ?? null,
        injuries: d.heridos ?? null,
        damageMil: d.danos_millones ?? null,
        housesDestroyed: d.casas_destruidas ?? null
      }
    })
}

// Se memoriza para que el prerender de ~950 rutas no consulte el CMS en cada una.
export function loadDataset() {
  if (!cache || Date.now() - cache.at > TTL_MS) {
    cache = { at: Date.now(), promise: fetchDataset().catch(err => { cache = null; throw err }) }
  }
  return cache.promise
}
