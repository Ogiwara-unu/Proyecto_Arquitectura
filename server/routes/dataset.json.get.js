// Dataset normalizado desde Comet CMS. En `nuxt generate` se prerenderiza como
// archivo estático (/dataset.json) que el cliente descarga una sola vez.
export default defineEventHandler(() => loadDataset())
