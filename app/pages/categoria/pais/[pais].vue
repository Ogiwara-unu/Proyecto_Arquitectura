<script setup>
const route = useRoute()
const router = useRouter()
const { countries, types, getCountryBySlug, filterRecords, paginate } = useDataset()

const slug = computed(() => String(route.params.pais))
const country = computed(() => getCountryBySlug(slug.value))

const query = ref(route.query.q ? String(route.query.q) : '')
watch(() => route.query.q, v => { query.value = v ? String(v) : '' })

function setQuery(v) {
  query.value = v
  router.replace({ query: { ...route.query, q: v || undefined, page: undefined } })
}

const filtered = computed(() => filterRecords({ country: slug.value, query: query.value }))
const currentPage = computed(() => Number(route.query.page) || 1)
const result = computed(() => paginate(filtered.value, currentPage.value))

function goToPage(p) {
  router.push({ query: { ...route.query, page: p === 1 ? undefined : p } })
}

if (import.meta.server && !country.value) {
  throw createError({ statusCode: 404, statusMessage: 'País no encontrado' })
}
</script>

<template>
  <div v-if="country">
    <div class="breadcrumbs">
      <NuxtLink to="/">Inicio</NuxtLink> <span>/</span>
      <NuxtLink to="/categoria">Categorías</NuxtLink> <span>/</span>
      <span>{{ country.name }}</span>
    </div>

    <div class="page-header">
      <h1>{{ country.name }}</h1>
      <p>{{ country.count }} erupciones registradas en este país.</p>
      <SearchBar :model-value="query" @update:model-value="setQuery" :placeholder="`Buscar dentro de ${country.name}...`" />
    </div>

    <div class="layout">
      <aside class="sidebar">
        <NavTree :countries="countries" :types="types" active-scheme="pais" :active-slug="slug" />
      </aside>

      <section>
        <EruptionTable :records="result.items" />
        <Pagination :page="result.page" :total-pages="result.totalPages" @change="goToPage" />
      </section>
    </div>
  </div>
</template>
