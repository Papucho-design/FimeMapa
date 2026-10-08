// POST /api/reportar  { roomId, roomLabel, message, contact?, website? }
// Reporte público de ubicación incorrecta → se crea un Issue en el repositorio
// (etiqueta "reporte-ubicacion") para que los editores lo revisen.
import { github, json, missingGithubConfig, readJson } from '../_lib/common.js';

const limpio = (v, max) => {
  // eslint-disable-next-line no-control-regex
  const s = String(v ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim();
  return s.length > max ? null : s;
};

// Evita menciones (@usuario), referencias (#123) y HTML dentro del Issue.
const neutral = (s) => s.replace(/@/g, '@\u200b').replace(/#(\d)/g, '#\u200b$1').replace(/</g, '&lt;');

export async function onRequestPost({ request, env }) {
  const { body, error } = await readJson(request, 4_000);
  if (error) return error;

  // Honeypot: los bots llenan este campo; se responde "ok" sin hacer nada.
  if (typeof body.website === 'string' && body.website.trim() !== '') return json({ ok: true });

  const message = limpio(body.message, 500);
  const roomId = limpio(body.roomId, 40);
  const roomLabel = limpio(body.roomLabel, 60);
  const contact = limpio(body.contact ?? '', 80);

  if (!message || message.length < 5) return json({ error: 'Cuéntanos un poco más (mínimo 5 caracteres).' }, 400);
  if (!roomId || !roomLabel || contact === null) return json({ error: 'Datos inválidos.' }, 400);

  const sinConfig = missingGithubConfig(env);
  if (sinConfig) return json({ error: 'El envío de reportes no está disponible por ahora.' }, 503);

  const cuerpo = [
    `**Salón:** ${neutral(roomLabel)} (\`${roomId.replace(/`/g, '')}\`)`,
    '',
    '**Qué está mal:**',
    '',
    ...neutral(message).split('\n').map((l) => `> ${l}`),
    '',
    contact ? `**Contacto:** ${neutral(contact)}` : '_Sin contacto._',
    '',
    '_Enviado desde la app. Para corregirlo, entra al panel `?admin`._',
  ].join('\n');

  try {
    const r = await github(env).createIssue({
      title: `Reporte de ubicación: ${neutral(roomLabel)}`,
      body: cuerpo,
      labels: ['reporte-ubicacion'],
    });
    if (!r.ok) return json({ error: 'No se pudo enviar el reporte. Intenta más tarde.' }, 502);
    return json({ ok: true });
  } catch {
    return json({ error: 'No se pudo enviar el reporte. Intenta más tarde.' }, 502);
  }
}

export async function onRequest() {
  return json({ error: 'Método no permitido.' }, 405);
}
