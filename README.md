# UbicFIME

App web (PWA) para que los estudiantes de **FIME UANL** encuentren cualquier salón, laboratorio o edificio y lleguen paso a paso. Es la fusión de **FIME Navigator** (rutas, mapa 2D, navegación guiada) y **Ubicsalon** (búsqueda tolerante, panel de edición, publicación de fotos), sin el mapa 3D.

## Qué hace

**Para estudiantes**
- Búsqueda de salones en cualquier formato: `7215`, `7-215`, `7 215`, `Edificio 7 salón 215`, `6F11`, `6-F-11`, `12202`…
- Búsqueda por nombre con tolerancia a errores y acentos (`laboratorio de redes`, `auditorio`) y sugerencias mientras escribes.
- Navegación paso a paso (Dijkstra sobre el grafo de andadores) con fotos de referencia, desde la entrada o desde donde estés (“¿Dónde estoy?”).
- Mapa 2D vectorial con zoom y arrastre; la ruta se dibuja sobre el mapa.
- Honestidad con los datos: si un salón no está verificado físicamente se muestra **“Ubicación preliminar”** y se guía hasta el edificio y piso, sin inventar pasillos.
- Foto y referencia de cada salón cuando existen, favoritos, búsquedas recientes y botón **“¿Ubicación incorrecta? Repórtala”**.
- Funciona sin señal (PWA): mapa, datos e ilustraciones quedan en caché; las fotos de salones se guardan al verlas.

**Para editores** (`/?admin`, con contraseña compartida)
- Crear, editar y eliminar salones; marcar “verificado”; escribir la referencia para llegar; etiquetas de búsqueda.
- Subir foto desde el celular (se comprime a WebP de máx. 800 px antes de enviarse).
- Filtros por edificio y “solo por verificar”; respaldo en JSON.
- Cada cambio es un commit en GitHub (queda historial) y Cloudflare publica la nueva versión en ~1 minuto.

## Inicio rápido

```bash
npm install
npm run dev        # http://localhost:5173  (sin funciones /api)
npm test           # 72 pruebas: datos, búsqueda, rutas, interfaz y funciones del servidor
npm run lint
npm run build      # genera dist/
```

Requiere Node 22 (ver `.node-version`).

## Despliegue en Cloudflare Pages

1. Sube este proyecto a un repositorio de GitHub.
2. Cloudflare → **Workers & Pages → Create → Pages → Connect to Git** y elige el repo.
3. Configuración de build:
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Variable de entorno:** `NODE_VERSION` = `22`
4. En **Settings → Variables and Secrets** agrega (producción):

   | Nombre | Tipo | Valor |
   |---|---|---|
   | `GITHUB_TOKEN` | Secret | Token *fine-grained* de GitHub (ver abajo) |
   | `ADMIN_PASSWORD` | Secret | Contraseña larga que compartirás con los editores |
   | `REPO_OWNER` | Texto | Tu usuario u organización de GitHub |
   | `REPO_NAME` | Texto | Nombre del repositorio |
   | `BRANCH` | Texto (opcional) | Rama de producción; por defecto `main` |

5. Crea el token en GitHub → *Settings → Developer settings → Fine-grained tokens*:
   - Repositorio: **solo este repo**.
   - Permisos: **Contents: Read and write** (guardar salones y fotos) e **Issues: Read and write** (reportes de estudiantes).
   - Con fecha de expiración (y anota renovarlo).
6. Vuelve a desplegar para que tome las variables. Entra a `https://tu-sitio.pages.dev/?admin`.

**Recomendado:** en Cloudflare → *Security → WAF → Rate limiting rules* limita `/api/login` y `/api/guardar` (por ejemplo 10 peticiones/minuto por IP) y `/api/reportar` (por ejemplo 5/minuto). La función ya frena 1.5 s cada contraseña incorrecta, pero eso no detiene intentos en paralelo.

### Probar las funciones en tu computadora

```bash
cp .dev.vars.example .dev.vars   # llena los valores
npm run cf:dev                   # build + wrangler pages dev en http://localhost:8788
```

## Flujo de los editores

1. Entrar a `/?admin` e ingresar la contraseña.
2. **Nuevo** o el lápiz de un salón. Al escribir el código de un salón nuevo se sugieren edificio, piso y nombre.
3. Cuando alguien confirme el salón en persona: marcar **Ubicación verificada**, escribir la referencia (“al fondo, junto a las escaleras”) y subir una foto.
4. **Guardar.** La web pública se actualiza en ~1 minuto.
5. Los reportes de estudiantes llegan como **Issues** del repositorio con la etiqueta `reporte-ubicacion`.

## Estructura

```
src/
  data/            salones.json (fuente de verdad), buildings.ts, routes.ts, landmarks.ts, photos.ts
  utils/           roomNormalizer, search (Fuse.js), routeSolver (Dijkstra), photos, api, storage
  components/      pantallas públicas (inicio, resultado, recorrido, mapa, directorio…)
  admin/           panel de editores (se descarga solo en /?admin)
  state/           contexto de salones
functions/api/     login.js · guardar.js · reportar.js   (Cloudflare Pages Functions)
functions/_lib/    utilidades compartidas
shared/            validarSalon.js (mismas reglas en navegador y servidor)
public/img/salones/<edificio>/<codigo>-<sello>.webp     fotos publicadas desde el panel
tests/             vitest
```

## Modelo de datos

Cada salón en `src/data/salones.json`:

```jsonc
{
  "id": "7215",             // único, en mayúsculas
  "displayName": "7-215",   // como lo ve el estudiante
  "building": "7",          // 1–12 o "cidet"
  "floor": 2,               // 0 = planta baja / nivel 0
  "type": "classroom",      // classroom | laboratory | physics-laboratory | computer-lab | auditorium | office | other
  "verified": false,        // true = confirmado físicamente
  "name": "…",              // opcional: nombre propio
  "notes": "…",             // opcional: referencia para llegar
  "tags": ["lab redes"],    // opcional: alias de búsqueda
  "photo": "img/salones/7/7215-k3x9a.webp",  // lo asigna el servidor
  "updatedAt": "2026-10-07T…"                // lo asigna el servidor
}
```

Las reglas de validación (edificios, pisos 0–6, longitudes, tipos) están en `shared/validarSalon.js` y se aplican **siempre en el servidor**. Si agregas un edificio nuevo, súmalo también a `VALID_BUILDINGS` (hay una prueba que avisa si se olvida).

Para agregar edificios, puntos de referencia, fotos de ruta o andadores se siguen editando `buildings.ts`, `landmarks.ts`, `photos.ts` y `routes.ts` (cada nodo de edificio en `routes.ts` debe llamarse `building-<id>`).

## Seguridad

- El token de GitHub vive solo en Cloudflare; el navegador solo conoce la contraseña de editor.
- El servidor valida todo (esquema, tipos, longitudes, WebP real de máx. 1.5 MB) y decide él mismo la ruta de las fotos.
- La contraseña es compartida: no distingue quién hizo cada cambio (aparece como el dueño del token en GitHub). Si el equipo crece, el siguiente paso es Cloudflare Access o cuentas individuales.
- Los reportes públicos usan un campo trampa (*honeypot*), límites de tamaño y neutralizan menciones/HTML; aun así conviene la regla de rate limiting.
- Cabeceras de seguridad y CSP estricta en `public/_headers` (la tipografía Inter va incluida en el proyecto, sin Google Fonts).

## Datos que conviene revisar

Al unir los dos catálogos (166 salones) quedaron estas decisiones:

- **Verificados:** solo `12202` (FIME Navigator lo tenía confirmado). Los demás quedaron como *preliminar*; los editores los irán marcando.
- **5000 y 5001:** Ubicsalon decía nivel 0 y FIME Navigator piso 1. Se dejó **nivel 0 (planta baja)**, coherente con que `5101` sea piso 1. Confirmar en sitio.
- **Laboratorio de Redes (`8-300`):** el original tenía `edificioId: "cidte"` (typo de CIDET) pero la referencia y las etiquetas decían Edificio 8, piso 3. Se dejó en Edificio 8 y con una nota de “pendiente de confirmar”.
- **Auditorio Ing. Remberto Sánchez Díaz:** quedó con id `AUDITORIO-7` (Edificio 7, piso 2). No es el mismo que “Auditorio Jorge Urencio” del mapa.
- **Edificios 8 y 11:** su número de pisos se corrigió a 3 (tenían salones en el 3.er piso).
- Las 2 fotos existentes (`2101`, `5111`) se movieron a `public/img/salones/<edificio>/`.

## Qué cambió respecto a los proyectos originales

- Se eliminó el mapa 3D (Three.js y `campus.glb`).
- Una sola fuente de datos y un solo esquema (antes `edificio-7` vs `7`, `codigo` vs `id`, `tipo` en texto libre…).
- Se corrigió un fallo de Ubicsalon: los cambios guardados en `localStorage` tapaban para siempre los datos nuevos del despliegue. Ahora los datos salen siempre del JSON publicado.
- Eliminar un salón antes solo borraba la copia local; ahora es un commit real.
- El repositorio ya no está escrito en el código (`REPO_OWNER` / `REPO_NAME`).
- Migración a TypeScript, Tailwind 4 y Vite 8 en todo el proyecto.
- La foto de un salón recibe un nombre nuevo en cada subida para que la caché offline no muestre la anterior.
