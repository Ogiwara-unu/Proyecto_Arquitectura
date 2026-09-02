# Erupciones Volcánicas Globales

Proyecto 1 — Arquitectura de Información — Universidad Nacional.

Sitio web construido con **Nuxt 4** que permite navegar el dataset
[Global Volcanic Eruptions](https://www.kaggle.com/datasets) (876 registros de
erupciones volcánicas históricas), asignado al carné **504550757**.

**URL del proyecto publicado en Netlify:** https://proyectoarquitecturaev.netlify.app/

## Diseño

Tema oscuro editorial (estilo informe de datos), con tokens en `:root` sobre
CSS plano (sin frameworks de UI): fondo `#14100d`, superficies `#1c1712`/`#241d17`,
acento terracota (`#e0672e`) y tipografía Inter (peso 800/900 para titulares y
cifras, 400–600 para UI/tablas). El índice VEI tiene su propia paleta
(`--vei-low/mid/high/extreme`) reutilizada de forma consistente en badges, mapa
y leyenda.

## Esquema de organización

El sitio usa dos jerarquías de navegación complementarias sobre el mismo
conjunto de datos:

- **Geográfica**: `Inicio → Categorías → País → Erupción` (50 países).
- **Temática**: `Inicio → Categorías → Tipo de volcán → Erupción` (20 tipos).

Además incluye:

- **Hero + estadísticas**: cifras destacadas (erupciones totales, víctimas
  totales, mayor explosividad, países con actividad) calculadas en vivo desde
  el dataset.
- **Mapa interactivo** (Leaflet + tiles oscuros de CARTO): un marcador por
  erupción, coloreado según el VEI y con tamaño proporcional a VEI/víctimas,
  con leyenda propia. Reacciona a los filtros activos.
- **Filtros** por país, tipo de volcán, índice VEI y "solo con víctimas",
  sincronizados con la URL.
- **Búsqueda** global (por nombre de volcán, ubicación, país o tipo), disponible
  en el inicio y dentro de cada categoría.
- **Tabla editorial** ordenable (por año, VEI o víctimas) con badges de VEI y
  cifras en tipografía tabular, más **paginación** (12 registros por página).
- **Vista de detalle** por erupción, con ficha técnica (fecha, VEI, elevación,
  coordenadas con enlace a mapa), impacto humano/material cuando existe, y
  navegación al registro anterior/siguiente.

## Estructura del proyecto

```
nuxt.config.ts        # config de Nuxt + prerender de todas las rutas dinámicas
data/dataset.json      # dataset limpio, generado desde volcano-events.csv
scripts/build-data.mjs # script que convierte el CSV original a data/dataset.json
app/
  app.vue              # layout raíz (header, footer, NuxtPage)
  composables/
    useDataset.js       # acceso a datos: filtrar, paginar, categorías, slugs
  utils/
    vei.js               # bucket de color VEI (low/mid/high/extreme), fuente única
  components/
    NavTree.vue           # árbol de navegación (por país / por tipo)
    SearchBar.vue          # buscador
    Pagination.vue         # paginación
    EruptionTable.vue       # tabla editorial ordenable de erupciones
    VolcanoMap.vue           # mapa Leaflet (ClientOnly) con leyenda VEI propia
  pages/
    index.vue                    # inicio: hero, stats, filtros, mapa y tabla
    categoria/index.vue           # hub de categorías (país / tipo)
    categoria/pais/[pais].vue      # listado por país
    categoria/tipo/[tipo].vue      # listado por tipo de volcán
    item/[id].vue                   # detalle de una erupción
```

## Desarrollo local

```bash
npm install
npm run dev
```

## Generar el sitio estático (usado para Netlify)

```bash
npm run generate
```

Esto pre-renderiza **todas** las rutas (inicio, categorías, y cada uno de los
876 registros) como HTML estático en `.output/public`, sin necesidad de
funciones serverless.

## Publicar en Netlify

Este repo incluye `netlify.toml` con la configuración de build:

```
build command: npm run generate
publish dir:   dist
NODE_VERSION:  24
```

> Nuxt requiere Node `^22.19.0 || ^24.11.0 || >=26.0.0`; sin fijar
> `NODE_VERSION` el build de Netlify falla con exit code 2 antes de generar
> nada.

Opciones para publicar:

1. **Conectando el repositorio de Git a Netlify** (recomendado): Netlify
   detecta automáticamente `netlify.toml` y construye/despliega en cada push.
2. **Arrastrar y soltar**: ejecutar `npm run generate` localmente y arrastrar
   la carpeta `.output/public` a [app.netlify.com/drop](https://app.netlify.com/drop).

## Dataset

Los datos provienen de `volcano-events.csv` y se transforman con
`node scripts/build-data.mjs` hacia `data/dataset.json` (formato consumido por
la aplicación). Para regenerar el JSON tras editar el CSV:

```bash
node scripts/build-data.mjs
```
