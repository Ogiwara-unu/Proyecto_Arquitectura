// https://nuxt.com/docs/api/configuration/nuxt-config
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const dataUrl = new URL('./data/dataset.json', import.meta.url)
const records = JSON.parse(readFileSync(fileURLToPath(dataUrl), 'utf-8'))

function slugify(text: string) {
  return String(text)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

const countrySlugs = [...new Set(records.map((r: any) => slugify(r.country)))]
const typeSlugs = [...new Set(records.map((r: any) => slugify(r.type)))]

const itemRoutes = records.map((r: any) => `/item/${r.id}`)
const countryRoutes = countrySlugs.map(s => `/categoria/pais/${s}`)
const typeRoutes = typeSlugs.map(s => `/categoria/tipo/${s}`)

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
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
      routes: ['/', '/categoria', ...countryRoutes, ...typeRoutes, ...itemRoutes]
    }
  }
})
