import dataset from '~~/data/dataset.json'

const PER_PAGE = 12

export function slugify(text) {
  return String(text)
    .toLowerCase()
    .normalize('NFD')
    .replace(new RegExp('[̀-ͯ]', 'g'), '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function buildFacet(records, field) {
  const map = new Map()
  for (const r of records) {
    const key = r[field]
    map.set(key, (map.get(key) || 0) + 1)
  }
  return [...map.entries()]
    .map(([name, count]) => ({ name, slug: slugify(name), count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
}

export function useDataset() {
  const records = dataset

  const countries = buildFacet(records, 'country')
  const types = buildFacet(records, 'type')

  function getById(id) {
    return records.find(r => r.id === Number(id)) || null
  }

  function getCountryBySlug(slug) {
    return countries.find(c => c.slug === slug) || null
  }

  function getTypeBySlug(slug) {
    return types.find(t => t.slug === slug) || null
  }

  function filterRecords({ country, type, query, vei, onlyVictims } = {}) {
    let list = records

    if (country) list = list.filter(r => slugify(r.country) === country)
    if (type) list = list.filter(r => slugify(r.type) === type)
    if (vei !== undefined && vei !== null && vei !== '') {
      list = list.filter(r => String(r.vei) === String(vei))
    }
    if (onlyVictims) {
      list = list.filter(r => r.deaths || r.missing || r.injuries)
    }

    if (query && query.trim()) {
      const q = query.trim().toLowerCase()
      list = list.filter(r =>
        r.name.toLowerCase().includes(q) ||
        (r.location && r.location.toLowerCase().includes(q)) ||
        r.country.toLowerCase().includes(q) ||
        r.type.toLowerCase().includes(q)
      )
    }

    return list
  }

  function paginate(list, page = 1, perPage = PER_PAGE) {
    const total = list.length
    const totalPages = Math.max(1, Math.ceil(total / perPage))
    const current = Math.min(Math.max(1, Number(page) || 1), totalPages)
    const start = (current - 1) * perPage
    return {
      items: list.slice(start, start + perPage),
      page: current,
      totalPages,
      total,
      perPage
    }
  }

  function neighbors(id) {
    const idx = records.findIndex(r => r.id === Number(id))
    if (idx === -1) return { prev: null, next: null }
    return {
      prev: idx > 0 ? records[idx - 1] : null,
      next: idx < records.length - 1 ? records[idx + 1] : null
    }
  }

  return {
    records,
    countries,
    types,
    getById,
    getCountryBySlug,
    getTypeBySlug,
    filterRecords,
    paginate,
    neighbors
  }
}
