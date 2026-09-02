<script setup>
import 'leaflet/dist/leaflet.css'
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'

const props = defineProps({
  records: { type: Array, required: true }
})

const mapEl = ref(null)
let map = null
let markersLayer = null
let L = null
let veiColors = null

const legendBuckets = [
  { key: 'low', range: 'VEI 0–2', label: 'Explosiva menor' },
  { key: 'mid', range: 'VEI 3–4', label: 'Cataclísmica' },
  { key: 'high', range: 'VEI 5–6', label: 'Colosal' },
  { key: 'extreme', range: 'VEI 7–8', label: 'Súper-colosal' }
]

function radiusFor(r) {
  const veiPart = (r.vei ?? 1) * 1.6
  const deathPart = r.deaths ? Math.log10(r.deaths + 1) * 3.2 : 0
  return Math.min(4 + veiPart + deathPart, 22)
}

function renderMarkers() {
  markersLayer.clearLayers()
  for (const r of props.records) {
    if (r.latitude == null || r.longitude == null) continue
    const color = veiColors[veiBucket(r.vei)]
    L.circleMarker([r.latitude, r.longitude], {
      radius: radiusFor(r),
      color,
      weight: 1,
      opacity: 0.85,
      fillColor: color,
      fillOpacity: 0.5
    })
      .bindTooltip(
        `<strong>${r.name}</strong><br>${r.country} · ${r.fecha}` +
        (r.vei != null ? ` · VEI ${r.vei}` : '') +
        (r.deaths ? ` · ${r.deaths.toLocaleString('es-ES')} víctimas` : ''),
        { direction: 'top', sticky: true, className: 'volcano-tooltip' }
      )
      .addTo(markersLayer)
  }
}

onMounted(async () => {
  const leafletModule = await import('leaflet')
  L = leafletModule.default ?? leafletModule

  const styles = getComputedStyle(document.documentElement)
  veiColors = {
    low: styles.getPropertyValue('--vei-low').trim(),
    mid: styles.getPropertyValue('--vei-mid').trim(),
    high: styles.getPropertyValue('--vei-high').trim(),
    extreme: styles.getPropertyValue('--vei-extreme').trim(),
    unknown: styles.getPropertyValue('--text-muted').trim()
  }

  map = L.map(mapEl.value, {
    center: [15, 10],
    zoom: 2,
    minZoom: 2,
    maxZoom: 8,
    worldCopyJump: true
  })

  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19
  }).addTo(map)

  markersLayer = L.layerGroup().addTo(map)
  renderMarkers()
})

watch(() => props.records, () => {
  if (markersLayer) renderMarkers()
})

onBeforeUnmount(() => {
  map?.remove()
})
</script>

<template>
  <ClientOnly>
    <div class="map-card">
      <div ref="mapEl" class="map-canvas" />
      <div class="map-legend">
        <span class="legend-title">Índice VEI</span>
        <div v-for="b in legendBuckets" :key="b.key" class="legend-row">
          <span class="legend-dot" :class="`dot-${b.key}`" />
          <span class="legend-range">{{ b.range }}</span>
          <span class="legend-label">{{ b.label }}</span>
        </div>
      </div>
    </div>
    <template #fallback>
      <div class="map-fallback">Cargando mapa…</div>
    </template>
  </ClientOnly>
</template>

<style scoped>
.map-card {
  position: relative;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
  background: var(--surface);
}
.map-canvas {
  height: 460px;
  width: 100%;
  background: var(--surface-2);
}
.map-fallback {
  height: 460px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  font-size: 0.9rem;
}

.map-legend {
  position: absolute;
  left: 0.8rem;
  bottom: 0.8rem;
  z-index: 400;
  background: color-mix(in srgb, var(--surface) 92%, transparent);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 0.7rem 0.9rem;
  backdrop-filter: blur(4px);
}
.legend-title {
  display: block;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-bottom: 0.45rem;
}
.legend-row {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.78rem;
  line-height: 1.6;
  color: var(--text);
  white-space: nowrap;
}
.legend-range {
  color: var(--text-muted);
  font-variant-numeric: tabular-nums;
}
.legend-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  flex-shrink: 0;
}
.dot-low { background: var(--vei-low); }
.dot-mid { background: var(--vei-mid); }
.dot-high { background: var(--vei-high); }
.dot-extreme { background: var(--vei-extreme); }

:global(.leaflet-container) {
  background: var(--surface-2);
  font-family: var(--font-sans);
}
:global(.leaflet-control-zoom a) {
  background: var(--surface) !important;
  color: var(--text) !important;
  border-color: var(--border) !important;
}
:global(.leaflet-control-zoom a:hover) {
  background: var(--surface-2) !important;
}
:global(.leaflet-control-attribution) {
  background: color-mix(in srgb, var(--surface) 85%, transparent) !important;
  color: var(--text-muted) !important;
}
:global(.leaflet-control-attribution a) {
  color: var(--text-muted) !important;
}
:global(.volcano-tooltip) {
  background: var(--surface) !important;
  color: var(--text) !important;
  border: 1px solid var(--border) !important;
  border-radius: var(--radius-sm) !important;
  font-size: 0.78rem !important;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.35) !important;
}
:global(.volcano-tooltip::before) {
  display: none;
}
</style>
