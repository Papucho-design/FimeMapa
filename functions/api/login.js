// POST /api/login  { password }  →  { ok: true } | 401
import { checkPassword, json, readJson } from '../_lib/common.js';

export async function onRequestPost({ request, env }) {
  const { body, error } = await readJson(request, 1_000);
  if (error) return error;
  const denied = await checkPassword(body, env);
  return denied ?? json({ ok: true });
}

export async function onRequest() {
  return json({ error: 'Método no permitido.' }, 405);
}
