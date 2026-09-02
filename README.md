# Erupciones Volcánicas Globales

Proyecto 1 — Arquitectura de Información — Universidad Nacional.

Sitio web construido con **Nuxt 4** que permite navegar el dataset
[Global Volcanic Eruptions](https://www.kaggle.com/datasets) (876 registros de
erupciones volcánicas históricas), asignado al carné **504550757**.

**URL del proyecto publicado en Netlify:** _(completar con la URL final, por ejemplo `https://nombre-del-sitio.netlify.app`)_

## Esquema de organización

El sitio usa dos jerarquías de navegación complementarias sobre el mismo
conjunto de datos:

- **Geográfica**: `Inicio → Categorías → País → Erupción` (50 países).
- **Temática**: `Inicio → Categorías → Tipo de volcán → Erupción` (20 tipos).

Además incluye:

- **Búsqueda** global (por nombre de volcán, ubicación, país o tipo), disponible
  en el inicio y dentro de cada categoría.
- **Paginación** (12 registros por página) en todas las listas de resultados.
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
  components/
    NavTree.vue          # árbol de navegación (por país / por tipo)
    SearchBar.vue         # buscador
    Pagination.vue        # paginación
    RecordCard.vue         # tarjeta de resultado
  pages/
    index.vue                    # inicio: búsqueda + listado general
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
publish dir:   .output/public
```

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
