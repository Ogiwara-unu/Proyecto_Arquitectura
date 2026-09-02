<script setup>
const props = defineProps({
  countries: { type: Array, required: true },
  types: { type: Array, required: true },
  activeScheme: { type: String, default: '' }, // 'pais' | 'tipo'
  activeSlug: { type: String, default: '' }
})

const TOP_N = 12
const showAllCountries = ref(false)
const showAllTypes = ref(false)

const visibleCountries = computed(() =>
  showAllCountries.value ? props.countries : props.countries.slice(0, TOP_N)
)
const visibleTypes = computed(() =>
  showAllTypes.value ? props.types : props.types.slice(0, TOP_N)
)
</script>

<template>
  <nav class="nav-tree" aria-label="Navegación jerárquica del catálogo">
    <NuxtLink to="/" class="nav-home">Inicio</NuxtLink>

    <div class="nav-group">
      <p class="nav-group-title">Por país</p>
      <ul class="nav-list">
        <li v-for="c in visibleCountries" :key="c.slug">
          <NuxtLink
            :to="`/categoria/pais/${c.slug}`"
            class="nav-item"
            :class="{ active: activeScheme === 'pais' && activeSlug === c.slug }"
          >
            <span class="nav-item-name">{{ c.name }}</span>
            <span class="nav-item-count">{{ c.count }}</span>
          </NuxtLink>
        </li>
      </ul>
      <button v-if="countries.length > TOP_N" class="nav-toggle" @click="showAllCountries = !showAllCountries">
        {{ showAllCountries ? 'Ver menos' : `Ver los ${countries.length} países` }}
      </button>
    </div>

    <div class="nav-group">
      <p class="nav-group-title">Por tipo de volcán</p>
      <ul class="nav-list">
        <li v-for="t in visibleTypes" :key="t.slug">
          <NuxtLink
            :to="`/categoria/tipo/${t.slug}`"
            class="nav-item"
            :class="{ active: activeScheme === 'tipo' && activeSlug === t.slug }"
          >
            <span class="nav-item-name">{{ t.name }}</span>
            <span class="nav-item-count">{{ t.count }}</span>
          </NuxtLink>
        </li>
      </ul>
      <button v-if="types.length > TOP_N" class="nav-toggle" @click="showAllTypes = !showAllTypes">
        {{ showAllTypes ? 'Ver menos' : `Ver los ${types.length} tipos` }}
      </button>
    </div>
  </nav>
</template>

<style scoped>
.nav-tree {
  display: flex;
  flex-direction: column;
  gap: 1.4rem;
}
.nav-home {
  font-weight: 600;
  color: var(--text);
  text-decoration: none;
  font-size: 0.95rem;
}
.nav-group-title {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
  margin: 0 0 0.5rem;
}
.nav-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}
.nav-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 0.5rem;
  border-radius: var(--radius-sm);
  text-decoration: none;
  color: var(--text);
  font-size: 0.86rem;
}
.nav-item:hover {
  background: var(--surface-2);
}
.nav-item.active {
  background: var(--accent);
  color: #fff;
}
.nav-item-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.nav-item-count {
  font-size: 0.72rem;
  opacity: 0.75;
  flex-shrink: 0;
}
.nav-toggle {
  margin-top: 0.4rem;
  background: none;
  border: none;
  color: var(--accent);
  font-size: 0.8rem;
  cursor: pointer;
  padding: 0.2rem 0.5rem;
}
</style>
