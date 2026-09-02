<script setup>
const route = useRoute()
const { getById, neighbors } = useDataset()

const id = computed(() => route.params.id)
const record = computed(() => getById(id.value))
const links = computed(() => neighbors(id.value))

if (import.meta.server && !record.value) {
  throw createError({ statusCode: 404, statusMessage: 'Registro no encontrado' })
}

const countrySlug = computed(() => record.value ? slugify(record.value.country) : '')
const typeSlug = computed(() => record.value ? slugify(record.value.type) : '')

const mapUrl = computed(() => {
  const r = record.value
  if (!r || r.latitude === null || r.longitude === null) return null
  return `https://www.openstreetmap.org/?mlat=${r.latitude}&mlon=${r.longitude}#map=6/${r.latitude}/${r.longitude}`
})

const impactStats = computed(() => {
  const r = record.value
  if (!r) return []
  const stats = []
  if (r.deaths !== null) stats.push({ label: 'Muertes', value: r.deaths })
  if (r.missing !== null) stats.push({ label: 'Desaparecidos', value: r.missing })
  if (r.injuries !== null) stats.push({ label: 'Heridos', value: r.injuries })
  if (r.housesDestroyed !== null) stats.push({ label: 'Viviendas destruidas', value: r.housesDestroyed })
  if (r.damageMil !== null) stats.push({ label: 'Daños (millones USD)', value: r.damageMil })
  return stats
})
</script>

<template>
  <div v-if="record">
    <div class="breadcrumbs">
      <NuxtLink to="/">Inicio</NuxtLink> <span>/</span>
      <NuxtLink to="/categoria">Categorías</NuxtLink> <span>/</span>
      <NuxtLink :to="`/categoria/pais/${countrySlug}`">{{ record.country }}</NuxtLink> <span>/</span>
      <span>{{ record.name }}</span>
    </div>

    <article class="detail">
      <header class="detail-header">
        <h1>{{ record.name }}</h1>
        <p class="subtitle">{{ record.location || record.country }} · {{ record.country }}</p>
        <div class="badges">
          <span class="badge">{{ record.fecha }}</span>
          <NuxtLink :to="`/categoria/tipo/${typeSlug}`" class="badge link">{{ record.type }}</NuxtLink>
          <span class="vei-badge" :class="`vei-${veiBucket(record.vei)}`">VEI {{ record.vei ?? 'Desconocido' }}</span>
        </div>
      </header>

      <section class="fact-grid">
        <div class="fact">
          <span class="fact-label">País</span>
          <NuxtLink :to="`/categoria/pais/${countrySlug}`" class="fact-value link">{{ record.country }}</NuxtLink>
        </div>
        <div class="fact">
          <span class="fact-label">Región / ubicación</span>
          <span class="fact-value">{{ record.location || '—' }}</span>
        </div>
        <div class="fact">
          <span class="fact-label">Tipo de volcán</span>
          <NuxtLink :to="`/categoria/tipo/${typeSlug}`" class="fact-value link">{{ record.type }}</NuxtLink>
        </div>
        <div class="fact">
          <span class="fact-label">Índice de explosividad (VEI)</span>
          <span class="fact-value">{{ record.vei ?? 'Desconocido' }}</span>
        </div>
        <div class="fact">
          <span class="fact-label">Elevación</span>
          <span class="fact-value">{{ record.elevation !== null ? `${record.elevation} m` : '—' }}</span>
        </div>
        <div class="fact">
          <span class="fact-label">Coordenadas</span>
          <span class="fact-value">
            <a v-if="mapUrl" :href="mapUrl" target="_blank" rel="noopener" class="link">
              {{ record.latitude }}, {{ record.longitude }}
            </a>
            <template v-else>—</template>
          </span>
        </div>
      </section>

      <section v-if="impactStats.length" class="impact">
        <h2>Impacto registrado</h2>
        <div class="impact-grid">
          <div v-for="s in impactStats" :key="s.label" class="impact-item">
            <span class="impact-value">{{ s.value.toLocaleString('es') }}</span>
            <span class="impact-label">{{ s.label }}</span>
          </div>
        </div>
      </section>
      <p v-else class="no-impact">No hay datos de impacto humano/material registrados para esta erupción.</p>

      <nav class="neighbors">
        <NuxtLink v-if="links.prev" :to="`/item/${links.prev.id}`" class="neighbor prev">
          <span class="neighbor-label">← Anterior</span>
          <span class="neighbor-name">{{ links.prev.name }} ({{ links.prev.fecha }})</span>
        </NuxtLink>
        <span v-else></span>
        <NuxtLink v-if="links.next" :to="`/item/${links.next.id}`" class="neighbor next">
          <span class="neighbor-label">Siguiente →</span>
          <span class="neighbor-name">{{ links.next.name }} ({{ links.next.fecha }})</span>
        </NuxtLink>
      </nav>
    </article>
  </div>
</template>

<style scoped>
.detail {
  max-width: 780px;
  margin: 0 auto;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 2rem;
}
.detail-header h1 {
  margin: 0 0 0.3rem;
  font-size: 1.8rem;
}
.subtitle {
  margin: 0 0 1rem;
  color: var(--text-muted);
}
.badges {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 1.6rem;
}
.badge {
  font-size: 0.8rem;
  padding: 0.3rem 0.7rem;
  border-radius: 999px;
  background: var(--surface-2);
  color: var(--text-muted);
  text-decoration: none;
}
.badge.link:hover {
  background: var(--border);
}
.fact-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.2rem;
  padding: 1.4rem 0;
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
}
.fact {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}
.fact-label {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text-muted);
}
.fact-value {
  font-size: 0.98rem;
}
.link {
  color: var(--accent);
  text-decoration: none;
}
.link:hover {
  text-decoration: underline;
}
.impact {
  margin-top: 1.6rem;
}
.impact h2 {
  font-size: 1.05rem;
  margin-bottom: 0.8rem;
}
.impact-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 0.8rem;
}
.impact-item {
  background: var(--surface-2);
  border-radius: var(--radius-sm);
  padding: 0.8rem;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}
.impact-value {
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--accent-2);
}
.impact-label {
  font-size: 0.75rem;
  color: var(--text-muted);
}
.no-impact {
  margin-top: 1.6rem;
  color: var(--text-muted);
  font-size: 0.9rem;
}
.neighbors {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 2.2rem;
  padding-top: 1.4rem;
  border-top: 1px solid var(--border);
}
.neighbor {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  text-decoration: none;
  color: var(--text);
  max-width: 45%;
}
.neighbor.next {
  text-align: right;
  margin-left: auto;
}
.neighbor-label {
  font-size: 0.75rem;
  color: var(--accent);
  font-weight: 600;
}
.neighbor-name {
  font-size: 0.85rem;
  color: var(--text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
