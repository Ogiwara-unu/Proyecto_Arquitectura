# Erupciones Volcánicas Globales

Proyecto 1 / Tarea 3 (CMS headless) — Arquitectura de Información — Universidad Nacional.

**Estudiante:** Randall Alvarez Chevez — cédula **504550757**

Sitio web construido con **Nuxt 4** que permite navegar el dataset
[Global Volcanic Eruptions](https://www.kaggle.com/datasets) (876 registros de
erupciones volcánicas históricas). Desde la Tarea 3 todo el contenido se
administra y se lee desde **Comet CMS** (headless).

**URL del proyecto publicado en Netlify:** https://proyectoarquitecturaev.netlify.app/

## Tarea 3 — Comet CMS

### Modelo de contenido (workspace `volcanes`)

| Tipo de contenido | Campos (tipo)                                                                                                                                                                                                  | Relaciones (llaves foráneas)                          |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| `paises`          | `title` (texto), `slug`                                                                                                                                                                                        | —                                                     |
| `tipos-volcan`    | `title` (texto), `slug`, `descripcion` (texto largo)                                                                                                                                                           | —                                                     |
| `volcanes`        | `title` (texto), `slug`, `ubicacion` (texto), `latitud`, `longitud`, `elevacion` (numérico), `imagen` (media/imagen)                                                                                           | `pais` → `paises`, `tipo` → `tipos-volcan`            |
| `erupciones`      | `title` (texto), `slug`, `numero`, `anio`, `mes`, `dia`, `vei`, `muertes`, `desaparecidos`, `heridos`, `danos_millones`, `casas_destruidas` (numérico), `fecha`, `agente` (texto)                               | `volcan` → `volcanes`                                 |

Registros cargados: 50 países, 20 tipos de volcán, 274 volcanes y 876
erupciones, todos enlazados mediante campos `relation` del CMS.

### Cómo lee Nuxt el contenido

- `server/utils/comet.js` consulta la API pública de Comet
  (`/api/v1/workspaces/{workspace}/content/{coleccion}`), usando
  `?include=volcan` para expandir la relación y resolviendo país/tipo de cada
  volcán; devuelve los registros ya normalizados.
- `server/routes/dataset.json.get.js` expone ese resultado; al generar el sitio
  se prerenderiza como `/dataset.json` y el navegador lo descarga una sola vez.
- `app/composables/useDataset.js` (`await useDataset()`) carga los datos desde
  ahí; las páginas filtran, paginan y agrupan igual que antes.
- `nuxt.config.ts` consulta el CMS para saber qué rutas (países, tipos,
  erupciones) prerenderizar.

Variables de entorno (ver `.env.example`): `COMET_URL` (por defecto
`http://127.0.0.1:8000`) y `COMET_WORKSPACE` (por defecto `volcanes`).

### Cargar los datos en el CMS

`scripts/seed-comet.mjs` crea los tipos de contenido y sube los registros de
`data/dataset.json` con sus relaciones (es idempotente):

```bash
COMET_URL=http://127.0.0.1:8000 COMET_USER=admin COMET_PASS=... node scripts/seed-comet.mjs
```

### Correr Comet CMS localmente

Comet v1.0.2 se instaló desde el release oficial de
[GetCometCMS/CometCMS](https://github.com/GetCometCMS/CometCMS) y corre con el
servidor embebido de PHP 8.2+:

```bash
cd comet-cms
php -S 127.0.0.1:8000 router.php
# admin: http://127.0.0.1:8000/admin
```

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
nuxt.config.ts        # config de Nuxt + prerender de las rutas publicadas en Comet
server/utils/comet.js  # cliente de la API pública de Comet CMS
server/routes/dataset.json.get.js # dataset normalizado desde Comet
data/dataset.json      # dataset limpio (fuente para cargar Comet)
scripts/seed-comet.mjs # crea tipos de contenido y carga los registros en Comet
scripts/build-data.mjs # script que convierte el CSV original a data/dataset.json
app/
  app.vue              # layout raíz (header, footer, NuxtPage)
  composables/
    useDataset.js       # acceso a datos (desde Comet): filtrar, paginar, categorías
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

Como el contenido se lee desde Comet CMS corriendo localmente (inaccesible
para los servidores de Netlify), el sitio se genera en la máquina local y se
sube ya construido con Netlify CLI. `netlify.toml` incluye `ignore = "exit 0"`
para que un push a GitHub no dispare un build que fallaría.

```bash
# con Comet corriendo en http://127.0.0.1:8000
npm run generate
netlify deploy --prod --dir .output/public --no-build
```

## Dataset

Los datos provienen de `volcano-events.csv` y se transforman con
`node scripts/build-data.mjs` hacia `data/dataset.json` (formato consumido por
la aplicación). Para regenerar el JSON tras editar el CSV:

```bash
node scripts/build-data.mjs
```
