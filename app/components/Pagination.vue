<script setup>
const props = defineProps({
  page: { type: Number, required: true },
  totalPages: { type: Number, required: true }
})
const emit = defineEmits(['change'])

const pageWindow = computed(() => {
  const { page, totalPages } = props
  const span = 2
  const start = Math.max(1, page - span)
  const end = Math.min(totalPages, page + span)
  const pages = []
  for (let p = start; p <= end; p++) pages.push(p)
  return pages
})

function go(p) {
  if (p < 1 || p > props.totalPages || p === props.page) return
  emit('change', p)
}
</script>

<template>
  <nav class="pagination" v-if="totalPages > 1" aria-label="Paginación">
    <button class="page-btn" :disabled="page === 1" @click="go(page - 1)" aria-label="Página anterior">‹</button>

    <button v-if="pageWindow[0] > 1" class="page-btn" @click="go(1)">1</button>
    <span v-if="pageWindow[0] > 2" class="ellipsis">…</span>

    <button
      v-for="p in pageWindow"
      :key="p"
      class="page-btn"
      :class="{ active: p === page }"
      @click="go(p)"
    >{{ p }}</button>

    <span v-if="pageWindow[pageWindow.length - 1] < totalPages - 1" class="ellipsis">…</span>
    <button v-if="pageWindow[pageWindow.length - 1] < totalPages" class="page-btn" @click="go(totalPages)">{{ totalPages }}</button>

    <button class="page-btn" :disabled="page === totalPages" @click="go(page + 1)" aria-label="Página siguiente">›</button>
  </nav>
</template>

<style scoped>
.pagination {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  flex-wrap: wrap;
  justify-content: center;
  margin: 2rem 0;
}
.page-btn {
  min-width: 2.2rem;
  height: 2.2rem;
  padding: 0 0.5rem;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text);
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.15s ease, border-color 0.15s ease;
}
.page-btn:hover:not(:disabled) {
  border-color: var(--accent);
}
.page-btn.active {
  background: var(--accent);
  border-color: var(--accent);
  color: #fff;
  font-weight: 600;
}
.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.ellipsis {
  color: var(--text-muted);
  padding: 0 0.2rem;
}
</style>
