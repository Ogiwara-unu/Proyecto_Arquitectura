<script setup>
useHead({
  title: 'Erupciones Volcánicas Globales',
  meta: [
    { name: 'description', content: 'Catálogo navegable de erupciones volcánicas históricas: búsqueda, categorías por país y tipo, y paginación.' }
  ]
})
</script>

<template>
  <div class="app-shell">
    <NuxtRouteAnnouncer />
    <header class="site-header">
      <div class="container header-inner">
        <NuxtLink to="/" class="brand">
          <span class="brand-icon">🌋</span>
          <span>Erupciones Volcánicas</span>
        </NuxtLink>
        <nav class="top-nav">
          <NuxtLink to="/">Inicio</NuxtLink>
          <NuxtLink to="/categoria">Categorías</NuxtLink>
        </nav>
      </div>
    </header>

    <main class="container main-content">
      <NuxtPage />
    </main>

    <footer class="site-footer">
      <div class="container">
        Proyecto 1 · Arquitectura de Información · Universidad Nacional — Dataset: Global Volcanic Eruptions
      </div>
    </footer>
  </div>
</template>

<style>
.app-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
.site-header {
  border-bottom: 1px solid var(--border);
  background: var(--surface);
}
.header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
}
.brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  color: var(--text);
  font-weight: 700;
  font-size: 1.05rem;
}
.brand-icon {
  font-size: 1.3rem;
}
.top-nav {
  display: flex;
  gap: 1.4rem;
}
.top-nav a {
  text-decoration: none;
  color: var(--text-muted);
  font-size: 0.92rem;
  font-weight: 500;
}
.top-nav a.router-link-exact-active {
  color: var(--accent);
}
.main-content {
  flex: 1;
  padding-bottom: 3rem;
}
.site-footer {
  border-top: 1px solid var(--border);
  padding: 1.2rem 0;
  font-size: 0.8rem;
  color: var(--text-muted);
  text-align: center;
}
</style>
