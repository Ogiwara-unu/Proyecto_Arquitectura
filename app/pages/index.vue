<script setup>
const { records, countries, types, filterRecords, paginate } = useDataset()
const route = useRoute()
const router = useRouter()

const query = ref(route.query.q ? String(route.query.q) : '')
const countrySlug = ref(route.query.pais ? String(route.query.pais) : '')
const typeSlug = ref(route.query.tipo ? String(route.query.tipo) : '')
const veiFilter = ref(route.query.vei ? String(route.query.vei) : '')
const onlyVictims = ref(route.query.victimas === '1')

watch(() => route.query.q, (v) => { query.value = v ? String(v) : '' })
watch(() => route.query.pais, (v) => { countrySlug.value = v ? String(v) : '' })
watch(() => route.query.tipo, (v) => { typeSlug.value = v ? String(v) : '' })
watch(() => route.query.vei, (v) => { veiFilter.value = v ? String(v) : '' })
watch(() => route.query.victimas, (v) => { onlyVictims.value = v === '1' })

function updateQuery(patch) {
  router.replace({ query: { ...route.query, ...patch, page: undefined } })
}

function setQuery(v) { query.value = v; updateQuery({ q: v || undefined }) }
function setCountry(v) { countrySlug.value = v; updateQuery({ pais: v || undefined }) }
function setType(v) { typeSlug.value = v; updateQuery({ tipo: v || undefined }) }
function setVei(v) { veiFilter.value = v; updateQuery({ vei: v || undefined }) }
function setOnlyVictims(v) { onlyVictims.value = v; updateQuery({ victimas: v ? '1' : undefined }) }

function resetFilters() {
  query.value = ''
  countrySlug.value = ''
  typeSlug.value = ''
  veiFilter.value = ''
  onlyVictims.value = false
  router.replace({ query: {} })
}

const hasActiveFilters = computed(() =>
  Boolean(query.value || countrySlug.value || typeSlug.value || veiFilter.value || onlyVictims.value)
)

const veiOptions = computed(() =>
  [...new Set(records.map(r => r.vei).filter(v => v !== null))].sort((a, b) => a - b)
)

const filtered = computed(() => filterRecords({
  query: query.value,
  country: countrySlug.value,
  type: typeSlug.value,
  vei: veiFilter.value,
  onlyVictims: onlyVictims.value
}))
const currentPage = computed(() => Number(route.query.page) || 1)
const result = computed(() => paginate(filtered.value, currentPage.value))

function goToPage(p) {
  router.push({ query: { ...route.query, page: p === 1 ? undefined : p } })
}

const years = records.map(r => r.year).filter(y => y !== null)
const minYear = Math.min(...years)
const maxYear = Math.max(...years)

const fmt = n => n.toLocaleString('es-ES')

const totalVictims = computed(() =>
  records.reduce((sum, r) => sum + (r.deaths || 0), 0)
)
const worstVictimsRecord = computed(() =>
  records.reduce((max, r) => ((r.deaths || 0) > (max?.deaths || 0) ? r : max), null)
)
const maxVeiRecord = computed(() =>
  records.reduce((max, r) => (r.vei != null && (!max || r.vei > max.vei) ? r : max), null)
)
</script>

<template>
  <div>
    <section class="hero">
      <span class="hero-tag">Ígneo</span>
      <h1 class="hero-title">
        Atlas de <em>erupciones</em> <em>volcánicas</em> a través de la historia
      </h1>
      <p class="hero-sub">
        Explora {{ records.length }} erupciones registradas entre el {{ Math.abs(minYear) }}
        a.C. y el {{ maxYear }} d.C., en {{ countries.length }} países y {{ types.length }}
        tipos de volcán. Filtra por país, tipo e índice de explosividad (VEI), y descúbrelas
        sobre un mapa interactivo.
      </p>
    </section>

    <div class="stats-row">
      <div class="stat-card">
        <span class="stat-label">Erupciones</span>
        <span class="stat-value">{{ fmt(records.length) }}</span>
        <span class="stat-sub">registradas en total</span>
      </div>
      <div class="stat-card stat-card--featured">
        <span class="stat-label">Víctimas totales</span>
        <span class="stat-value">{{ fmt(totalVictims) }}</span>
        <span class="stat-sub" v-if="worstVictimsRecord">Peor: {{ worstVictimsRecord.name }}</span>
      </div>
      <div class="stat-card">
        <span class="stat-label">Mayor explosividad</span>
        <span class="stat-value">VEI {{ maxVeiRecord?.vei ?? '—' }}</span>
        <span class="stat-sub" v-if="maxVeiRecord">{{ maxVeiRecord.name }}</span>
      </div>
      <div class="stat-card">
        <span class="stat-label">Países</span>
        <span class="stat-value">{{ fmt(countries.length) }}</span>
        <span class="stat-sub">con actividad registrada</span>
      </div>
    </div>

    <section class="filters-panel">
      <div class="filters-grid">
        <div class="field field--search">
          <label class="field-label">Buscar</label>
          <SearchBar :model-value="query" @update:model-value="setQuery" placeholder="Volcán, región o país..." />
        </div>
        <div class="field">
          <label class="field-label">País</label>
          <select class="select" :value="countrySlug" @change="setCountry($event.target.value)">
            <option value="">Todos los países</option>
            <option v-for="c in countries" :key="c.slug" :value="c.slug">{{ c.name }} ({{ c.count }})</option>
          </select>
        </div>
        <div class="field">
          <label class="field-label">Tipo</label>
          <select class="select" :value="typeSlug" @change="setType($event.target.value)">
            <option value="">Todos los tipos</option>
            <option v-for="t in types" :key="t.slug" :value="t.slug">{{ t.name }} ({{ t.count }})</option>
          </select>
        </div>
        <div class="field">
          <label class="field-label">Explosividad</label>
          <select class="select" :value="veiFilter" @change="setVei($event.target.value)">
            <option value="">Cualquier VEI</option>
            <option v-for="v in veiOptions" :key="v" :value="v">VEI {{ v }}</option>
          </select>
        </div>
      </div>

      <div class="filters-foot">
        <label class="toggle">
          <input
            type="checkbox"
            :checked="onlyVictims"
            @change="setOnlyVictims($event.target.checked)"
          />
          <span>Solo con víctimas</span>
        </label>
        <div class="filters-meta">
          <span class="result-count">{{ fmt(filtered.length) }} erupciones</span>
          <button v-if="hasActiveFilters" class="reset-btn" @click="resetFilters">↺ Restablecer</button>
        </div>
      </div>
    </section>

    <section class="map-section">
      <VolcanoMap :records="filtered" />
    </section>

    <section class="table-section">
      <div class="results-head">
        <h2 class="section-title">Registro de erupciones</h2>
        <NuxtLink to="/categoria" class="quick-link">Explorar por categorías →</NuxtLink>
      </div>

      <EruptionTable :records="result.items" />

      <Pagination :page="result.page" :total-pages="result.totalPages" @change="goToPage" />
    </section>
  </div>
</template>

<style scoped>
.hero {
  padding: 3rem 0 2.2rem;
}
.hero-tag {
  display: block;
  color: var(--accent);
  font-weight: 700;
  font-size: 0.8rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  margin-bottom: 1rem;
}
.hero-title {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: clamp(2.2rem, 5vw, 3.6rem);
  line-height: 1.1;
  letter-spacing: -0.02em;
  margin: 0 0 1.2rem;
  max-width: 20ch;
}
.hero-title em {
  font-style: normal;
  color: var(--accent);
}
.hero-title em:nth-of-type(2) {
  color: var(--accent-2);
}
.hero-sub {
  margin: 0;
  color: var(--text-muted);
  max-width: 62ch;
  line-height: 1.6;
  font-size: 1.02rem;
}

.stats-row {
  display: grid;
  grid-template-columns: 1fr 1.35fr 1fr 1fr;
  gap: 1rem;
  margin: 0 0 2.4rem;
}
.stat-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1.3rem 1.4rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.stat-card--featured {
  background: linear-gradient(160deg, var(--surface-2), var(--surface));
  border-color: color-mix(in srgb, var(--accent) 35%, var(--border));
}
.stat-label {
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text-muted);
}
.stat-value {
  font-family: var(--font-display);
  font-weight: 900;
  font-size: clamp(1.8rem, 3vw, 2.6rem);
  line-height: 1;
  font-variant-numeric: tabular-nums;
}
.stat-card--featured .stat-value {
  font-size: clamp(2.1rem, 3.6vw, 3.1rem);
  color: var(--accent);
}
.stat-sub {
  font-size: 0.8rem;
  color: var(--text-muted);
}

@media (max-width: 860px) {
  .stats-row {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 520px) {
  .stats-row {
    grid-template-columns: 1fr;
  }
}

.filters-panel {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1.3rem 1.4rem;
  margin-bottom: 1.6rem;
}
.filters-grid {
  display: grid;
  grid-template-columns: 1.6fr 1fr 1fr 1fr;
  gap: 1rem;
  align-items: end;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}
.field-label {
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-muted);
}
.select {
  appearance: none;
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text);
  padding: 0.6rem 2.2rem 0.6rem 0.8rem;
  font-size: 0.9rem;
  background-image: linear-gradient(45deg, transparent 50%, var(--text-muted) 50%),
    linear-gradient(135deg, var(--text-muted) 50%, transparent 50%);
  background-position: calc(100% - 1.1rem) center, calc(100% - 0.75rem) center;
  background-size: 5px 5px, 5px 5px;
  background-repeat: no-repeat;
}
.select:focus {
  outline: none;
  border-color: var(--accent);
}

.filters-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 1.1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border);
}
.toggle {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  font-size: 0.88rem;
  color: var(--text);
  cursor: pointer;
}
.toggle input {
  accent-color: var(--accent);
  width: 1rem;
  height: 1rem;
}
.filters-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
}
.result-count {
  color: var(--text-muted);
  font-size: 0.85rem;
  font-variant-numeric: tabular-nums;
}
.reset-btn {
  background: none;
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text-muted);
  font-size: 0.82rem;
  padding: 0.35rem 0.7rem;
  cursor: pointer;
}
.reset-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
}

@media (max-width: 860px) {
  .filters-grid {
    grid-template-columns: 1fr 1fr;
  }
  .filters-foot {
    flex-wrap: wrap;
  }
}
@media (max-width: 520px) {
  .filters-grid {
    grid-template-columns: 1fr;
  }
}

.map-section {
  margin-bottom: 2rem;
}

.table-section {
  margin-bottom: 1rem;
}
.results-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}
.section-title {
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 1.25rem;
  margin: 0;
}
.quick-link {
  color: var(--accent);
  text-decoration: none;
  font-weight: 600;
  font-size: 0.9rem;
  white-space: nowrap;
}
</style>
