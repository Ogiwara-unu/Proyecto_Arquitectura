<script setup>
const route = useRoute()
const router = useRouter()
const { countries, types, getTypeBySlug, filterRecords, paginate } = useDataset()

const slug = computed(() => String(route.params.tipo))
const type = computed(() => getTypeBySlug(slug.value))

const query = ref(route.query.q ? String(route.query.q) : '')
watch(() => route.query.q, v => { query.value = v ? String(v) : '' })

function setQuery(v) {
  query.value = v
  router.replace({ query: { ...route.query, q: v || undefined, page: undefined } })
}

const filtered = computed(() => filterRecords({ type: slug.value, query: query.value }))
const currentPage = computed(() => Number(route.query.page) || 1)
const result = computed(() => paginate(filtered.value, currentPage.value))

function goToPage(p) {
  router.push({ query: { ...route.query, page: p === 1 ? undefined : p } })
}

if (import.meta.server && !type.value) {
  throw createError({ statusCode: 404, statusMessage: 'Tipo no encontrado' })
}
</script>

<template>
  <div v-if="type">
    <div class="breadcrumbs">
      <NuxtLink to="/">Inicio</NuxtLink> <span>/</span>
      <NuxtLink to="/categoria">Categorías</NuxtLink> <span>/</span>
      <span>{{ type.name }}</span>
    </div>

    <div class="page-header">
      <h1>{{ type.name }}</h1>
      <p>{{ type.count }} erupciones registradas de este tipo de volcán.</p>
      <SearchBar :model-value="query" @update:model-value="setQuery" :placeholder="`Buscar dentro de ${type.name}...`" />
    </div>

    <div class="layout">
      <aside class="sidebar">
        <NavTree :countries="countries" :types="types" active-scheme="tipo" :active-slug="slug" />
      </aside>

      <section>
        <EruptionTable :records="result.items" />
        <Pagination :page="result.page" :total-pages="result.totalPages" @change="goToPage" />
      </section>
    </div>
  </div>
</template>
