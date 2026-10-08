// POST /api/guardar
//   { password, action: 'upsert', room, photoBase64?, removePhoto? }
//   { password, action: 'delete', id }
// Hace commit en GitHub (salones.json y, si aplica, la foto WebP). El token nunca sale del servidor.
import { validarSalon } from '../../shared/validarSalon.js';
import {
  JSON_PATH, b64ToUtf8, checkPassword, github, json, missingGithubConfig, readJson, utf8ToB64,
} from '../_lib/common.js';

const MAX_FOTO_BYTES = 1_500_000; // la app comprime a ~800 px WebP (decenas de KB)
const MAX_BODY = Math.ceil(MAX_FOTO_BYTES * 1.4) + 20_000;

const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '');
const fotoPath = (room) => `public/${room.photo}`;
const orden = (a, b) => {
  const na = Number.parseInt(a.building, 10);
  const nb = Number.parseInt(b.building, 10);
  return (Number.isNaN(na) ? 99 : na) - (Number.isNaN(nb) ? 99 : nb) || a.id.localeCompare(b.id, 'es', { numeric: true });
};

function checkWebp(b64) {
  if (typeof b64 !== 'string' || b64.length > MAX_FOTO_BYTES * 1.4) return 'Foto demasiado grande.';
  let bytes;
  try {
    bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  } catch {
    return 'Foto inválida.';
  }
  const riff = String.fromCharCode(...bytes.slice(0, 4));
  const webp = String.fromCharCode(...bytes.slice(8, 12));
  if (bytes.length > MAX_FOTO_BYTES || riff !== 'RIFF' || webp !== 'WEBP') {
    return 'La foto debe ser WebP de máx. 1.5 MB.';
  }
  return null;
}

export async function onRequestPost({ request, env }) {
  const { body, error } = await readJson(request, MAX_BODY);
  if (error) return error;

  const denied = await checkPassword(body, env);
  if (denied) return denied;
  const sinConfig = missingGithubConfig(env);
  if (sinConfig) return sinConfig;

  const gh = github(env);

  /** Lee salones.json, aplica `mutate` y lo guarda. Reintenta si alguien más guardó antes. */
  async function updateList(mutate, message) {
    for (let intento = 0; intento < 3; intento++) {
      const actual = await gh.getFile(JSON_PATH);
      if (!actual) throw new Error('No se encontró salones.json en el repositorio.');
      const lista = JSON.parse(b64ToUtf8(actual.content));
      const resultado = mutate(lista);
      if (resultado.abort) return resultado;
      lista.sort(orden);
      const r = await gh.putFile(JSON_PATH, utf8ToB64(JSON.stringify(lista, null, 2) + '\n'), message, actual.sha);
      if (r.ok) return resultado;
      if (r.status !== 409 && r.status !== 422) throw new Error(`GitHub ${r.status} al guardar datos`);
    }
    throw new Error('Conflicto al guardar, intenta de nuevo.');
  }

  /** Borra un archivo del repo sin hacer fallar la operación principal. */
  async function borrarFotoSilencioso(path, mensaje) {
    try {
      const f = await gh.getFile(path);
      if (f) await gh.deleteFile(path, mensaje, f.sha);
    } catch {
      /* una foto huérfana es inofensiva */
    }
  }

  try {
    /* ───────── Eliminar ───────── */
    if (body.action === 'delete') {
      const id = String(body.id ?? '').trim().toUpperCase();
      if (!/^[A-Z0-9][A-Z0-9-]{0,29}$/.test(id)) return json({ error: 'Código inválido.' }, 400);

      let eliminado = null;
      const res = await updateList((lista) => {
        const i = lista.findIndex((s) => s.id === id);
        if (i < 0) return { abort: true };
        [eliminado] = lista.splice(i, 1);
        return {};
      }, `feat(salones): eliminar ${slug(id)} [web]`);

      if (res.abort) return json({ error: 'Ese salón no existe.' }, 404);
      if (eliminado?.photo) await borrarFotoSilencioso(fotoPath(eliminado), `chore(salones): foto de ${slug(id)} [web]`);
      return json({ ok: true });
    }

    /* ───────── Crear / actualizar ───────── */
    if (body.action !== 'upsert') return json({ error: 'Acción no válida.' }, 400);

    const v = validarSalon(body.room);
    if (!v.ok) return json({ error: v.error }, 400);
    const salon = v.room;

    let fotoNueva = null;
    if (body.photoBase64) {
      const problema = checkWebp(body.photoBase64);
      if (problema) return json({ error: problema }, 400);
      // Nombre único por subida: evita que la caché de la PWA sirva una foto vieja.
      fotoNueva = `img/salones/${slug(salon.building)}/${slug(salon.id)}-${Date.now().toString(36)}.webp`;
      const r = await gh.putFile(`public/${fotoNueva}`, body.photoBase64, `feat(salones): foto de ${slug(salon.id)} [web]`);
      if (!r.ok) throw new Error(`GitHub ${r.status} al subir la foto`);
    }

    let fotoAnterior = null;
    let guardado = null;
    await updateList((lista) => {
      const i = lista.findIndex((s) => s.id === salon.id);
      const previo = i >= 0 ? lista[i] : null;
      fotoAnterior = previo?.photo ?? null;

      const final = { ...salon, updatedAt: new Date().toISOString() };
      // La ruta de la foto la decide el servidor, nunca el cliente.
      if (fotoNueva) final.photo = fotoNueva;
      else if (previo?.photo && body.removePhoto !== true) final.photo = previo.photo;

      if (i >= 0) lista[i] = final;
      else lista.push(final);
      guardado = final;
      return {};
    }, `feat(salones): actualizar ${slug(salon.id)} [web]`);

    const cambioFoto = fotoAnterior && fotoAnterior !== guardado.photo;
    if (cambioFoto) await borrarFotoSilencioso(`public/${fotoAnterior}`, `chore(salones): foto anterior de ${slug(salon.id)} [web]`);

    return json({ ok: true, room: guardado });
  } catch (e) {
    return json({ error: e.message || 'Error al guardar.' }, 502);
  }
}

export async function onRequest() {
  return json({ error: 'Método no permitido.' }, 405);
}
