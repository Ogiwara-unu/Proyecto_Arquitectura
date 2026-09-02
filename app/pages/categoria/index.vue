<script setup>
const { countries, types } = useDataset()
</script>

<template>
  <div>
    <div class="breadcrumbs">
      <NuxtLink to="/">Inicio</NuxtLink> <span>/</span> <span>Categorías</span>
    </div>

    <div class="page-header">
      <h1>Explorar por categoría</h1>
      <p>Este catálogo se organiza con dos esquemas complementarios: geográfico (país) y temático (tipo de volcán).</p>
    </div>

    <section class="scheme">
      <h2>Por país <span class="count">({{ countries.length }})</span></h2>
      <div class="grid">
        <NuxtLink v-for="c in countries" :key="c.slug" :to="`/categoria/pais/${c.slug}`" class="cat-card">
          <span class="cat-name">{{ c.name }}</span>
          <span class="cat-count">{{ c.count }}</span>
        </NuxtLink>
      </div>
    </section>

    <section class="scheme">
      <h2>Por tipo de volcán <span class="count">({{ types.length }})</span></h2>
      <div class="grid">
        <NuxtLink v-for="t in types" :key="t.slug" :to="`/categoria/tipo/${t.slug}`" class="cat-card">
          <span class="cat-name">{{ t.name }}</span>
          <span class="cat-count">{{ t.count }}</span>
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<style scoped>
.scheme {
  margin-bottom: 2.4rem;
}
.scheme h2 {
  font-size: 1.15rem;
  margin-bottom: 1rem;
}
.count {
  color: var(--text-muted);
  font-weight: 400;
  font-size: 0.9rem;
}
.cat-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 0.8rem 1rem;
  text-decoration: none;
  color: var(--text);
  transition: border-color 0.15s ease, transform 0.15s ease;
}
.cat-card:hover {
  border-color: var(--accent);
  transform: translateY(-2px);
}
.cat-count {
  font-size: 0.78rem;
  color: #fff;
  background: var(--accent);
  border-radius: 999px;
  padding: 0.1rem 0.55rem;
  flex-shrink: 0;
  margin-left: 0.6rem;
}
</style>
