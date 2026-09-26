// https://nuxt.com/docs/api/configuration/nuxt-config

// Comet CMS: URL de la instalación y workspace asignado.
const cometUrl = (process.env.COMET_URL || 'http://127.0.0.1:8000').replace(/\/$/, '')
const cometWorkspace = process.env.COMET_WORKSPACE || 'volcanes'

function slugify(text: string) {
  return String(text)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

async function comet(collection: string, query = '') {
  const url = `${cometUrl}/api/v1/workspaces/${cometWorkspace}/content/${collection}${query}`
  const res = await fetch(url).catch((err) => {
    throw new Error(`No se pudo conectar con Comet CMS en ${cometUrl} (${err.message}). ¿Está corriendo?`)
  })
  if (!res.ok) throw new Error(`Comet CMS respondió ${res.status} para ${url}`)
  return (await res.json()).data as any[]
}

// Las rutas dinámicas a prerenderizar salen del contenido publicado en el CMS.
const [countries, types, eruptions] = await Promise.all([
  comet('paises'),
  comet('tipos-volcan'),
  comet('erupciones')
])

const countryRoutes = countries.map(c => `/categoria/pais/${slugify(c.title)}`)
const typeRoutes = types.map(t => `/categoria/tipo/${slugify(t.title)}`)
const itemRoutes = eruptions.map(e => `/item/${e.data.numero}`)

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    cometUrl,
    cometWorkspace
  },
  app: {
    head: {
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap' }
      ]
    }
  },
  nitro: {
    prerender: {
      crawlLinks: false,
      failOnError: false,
      routes: ['/', '/categoria', '/dataset.json', ...countryRoutes, ...typeRoutes, ...itemRoutes]
    }
  }
})
