<script setup>
const props = defineProps({
  modelValue: { type: String, default: '' },
  placeholder: { type: String, default: 'Buscar por volcán, país o región...' }
})
const emit = defineEmits(['update:modelValue'])

function onInput(e) {
  emit('update:modelValue', e.target.value)
}
</script>

<template>
  <div class="search-bar">
    <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
    </svg>
    <input
      type="search"
      class="search-input"
      :value="modelValue"
      :placeholder="placeholder"
      @input="onInput"
      aria-label="Buscar registros"
    />
  </div>
</template>

<style scoped>
.search-bar {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 0.65rem 0.9rem;
  transition: border-color 0.15s ease;
}
.search-bar:focus-within {
  border-color: var(--accent);
}
.search-icon {
  color: var(--text-muted);
  flex-shrink: 0;
}
.search-input {
  border: none;
  outline: none;
  background: transparent;
  color: var(--text);
  font-size: 0.95rem;
  width: 100%;
}
.search-input::placeholder {
  color: var(--text-muted);
}
</style>
