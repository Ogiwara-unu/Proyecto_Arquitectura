<script setup>
const props = defineProps({
  records: { type: Array, required: true }
})

const router = useRouter()

const sortKey = ref(null)
const sortDir = ref('desc')

const columns = [
  { key: 'year', label: 'Año' },
  { key: 'vei', label: 'VEI' },
  { key: 'deaths', label: 'Víctimas' }
]

function toggleSort(key) {
  if (sortKey.value === key) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    sortDir.value = 'desc'
  }
}

const sorted = computed(() => {
  if (!sortKey.value) return props.records
  const dir = sortDir.value === 'asc' ? 1 : -1
  return [...props.records].sort((a, b) => {
    const av = a[sortKey.value]
    const bv = b[sortKey.value]
    if (av === null || av === undefined) return 1
    if (bv === null || bv === undefined) return -1
    return (av - bv) * dir
  })
})

function openRecord(id) {
  router.push(`/item/${id}`)
}

function caretFor(key) {
  if (sortKey.value !== key) return '↕'
  return sortDir.value === 'asc' ? '↑' : '↓'
}
</script>

<template>
  <div class="table-wrap">
    <table class="eruption-table">
      <thead>
        <tr>
          <th class="col-name">Volcán</th>
          <th
            v-for="c in columns"
            :key="c.key"
            class="sortable num"
            :class="{ active: sortKey === c.key }"
            @click="toggleSort(c.key)"
          >
            {{ c.label }} <span class="caret">{{ caretFor(c.key) }}</span>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="!sorted.length">
          <td colspan="4" class="empty">No se encontraron erupciones que coincidan con los filtros.</td>
        </tr>
        <tr
          v-for="r in sorted"
          :key="r.id"
          class="row-link"
          tabindex="0"
          role="link"
          @click="openRecord(r.id)"
          @keydown.enter="openRecord(r.id)"
        >
          <td class="col-name">
            <span class="volcano-name">{{ r.name }}</span>
            <span class="volcano-loc">{{ r.location || r.country }}</span>
          </td>
          <td class="num">{{ r.fecha }}</td>
          <td class="num">
            <span class="vei-badge" :class="`vei-${veiBucket(r.vei)}`">{{ r.vei ?? '?' }}</span>
          </td>
          <td class="num" :class="{ muted: !r.deaths }">
            {{ r.deaths ? r.deaths.toLocaleString('es-ES') : '—' }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.table-wrap {
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
  overflow-x: auto;
}
.eruption-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}
thead {
  background: var(--surface-2);
}
th {
  text-align: left;
  padding: 0.75rem 1rem;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-muted);
  white-space: nowrap;
}
th.sortable {
  cursor: pointer;
  user-select: none;
}
th.sortable.active {
  color: var(--accent);
}
.caret {
  font-size: 0.7rem;
  opacity: 0.7;
}
td {
  padding: 0.85rem 1rem;
  border-top: 1px solid var(--border);
  vertical-align: middle;
}
tbody tr.row-link {
  cursor: pointer;
  background: var(--surface);
  transition: background 0.12s ease;
}
tbody tr.row-link:hover,
tbody tr.row-link:focus-visible {
  background: var(--surface-2);
  outline: none;
}
.col-name {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 180px;
}
.volcano-name {
  font-weight: 600;
  color: var(--text);
}
.volcano-loc {
  font-size: 0.78rem;
  color: var(--text-muted);
}
.num {
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
td.num.muted {
  color: var(--text-muted);
}
.empty {
  text-align: center;
  padding: 2.4rem 1rem;
  color: var(--text-muted);
}
</style>
