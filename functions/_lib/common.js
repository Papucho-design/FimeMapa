// Utilidades compartidas por las Pages Functions (Cloudflare).
// Variables de entorno (Cloudflare → Settings → Variables and Secrets):
//   GITHUB_TOKEN    (Secret) token fine-grained, solo este repo: Contents RW + Issues RW
//   ADMIN_PASSWORD  (Secret) contraseña compartida de los editores
//   REPO_OWNER      usuario u organización dueña del repositorio
//   REPO_NAME       nombre del repositorio
//   BRANCH          (opcional) rama a la que se hace commit; por defecto "main"

export const JSON_PATH = 'src/data/salones.json';

export const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });

/** Comparación en tiempo constante (vía hash SHA-256). */
export async function safeEqual(a, b) {
  const enc = new TextEncoder();
  const [ha, hb] = await Promise.all([
    crypto.subtle.digest('SHA-256', enc.encode(String(a))),
    crypto.subtle.digest('SHA-256', enc.encode(String(b))),
  ]);
  const x = new Uint8Array(ha);
  const y = new Uint8Array(hb);
  let diff = 0;
  for (let i = 0; i < x.length; i++) diff |= x[i] ^ y[i];
  return diff === 0;
}

/**
 * Lee el cuerpo JSON con tope de tamaño. Devuelve { body } o { error: Response }.
 * También rechaza peticiones que el navegador marca como de otro sitio.
 */
export async function readJson(request, maxBytes) {
  const site = request.headers.get('Sec-Fetch-Site');
  if (site && site !== 'same-origin') return { error: json({ error: 'Origen no permitido.' }, 403) };

  const declared = Number(request.headers.get('Content-Length') || 0);
  if (declared > maxBytes) return { error: json({ error: 'Solicitud demasiado grande.' }, 413) };

  let text;
  try {
    text = await request.text();
  } catch {
    return { error: json({ error: 'Solicitud inválida.' }, 400) };
  }
  if (text.length > maxBytes) return { error: json({ error: 'Solicitud demasiado grande.' }, 413) };

  try {
    const body = JSON.parse(text);
    if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error('forma');
    return { body };
  } catch {
    return { error: json({ error: 'Solicitud inválida.' }, 400) };
  }
}

/** null si la contraseña es correcta; Response de error si no. */
export async function checkPassword(body, env) {
  if (!env.ADMIN_PASSWORD) return json({ error: 'Servidor sin configurar (falta ADMIN_PASSWORD).' }, 500);
  if (await safeEqual(body.password ?? '', env.ADMIN_PASSWORD)) return null;
  await new Promise((r) => setTimeout(r, 1500)); // frena fuerza bruta secuencial
  return json({ error: 'Contraseña incorrecta.' }, 401);
}

export function missingGithubConfig(env) {
  const faltan = ['GITHUB_TOKEN', 'REPO_OWNER', 'REPO_NAME'].filter((k) => !env[k]);
  return faltan.length ? json({ error: `Servidor sin configurar (faltan: ${faltan.join(', ')}).` }, 500) : null;
}

const b64ToBytes = (b64) => Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
export const b64ToUtf8 = (b64) => new TextDecoder().decode(b64ToBytes(b64.replace(/\n/g, '')));
export const utf8ToB64 = (str) => {
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
};

/** Cliente mínimo de la API de GitHub (contents + issues). */
export function github(env) {
  const owner = env.REPO_OWNER;
  const repo = env.REPO_NAME;
  const branch = env.BRANCH || 'main';
  const base = `https://api.github.com/repos/${owner}/${repo}`;
  const headers = {
    Authorization: `Bearer ${env.GITHUB_TOKEN}`,
    Accept: 'application/vnd.github+json',
    'User-Agent': 'ubicfime-functions',
    'Content-Type': 'application/json',
  };

  return {
    async getFile(path) {
      const r = await fetch(`${base}/contents/${path}?ref=${branch}`, { headers });
      if (r.status === 404) return null;
      if (!r.ok) throw new Error(`GitHub ${r.status} al leer ${path}`);
      return r.json();
    },
    putFile(path, contentB64, message, sha) {
      return fetch(`${base}/contents/${path}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ message, content: contentB64, branch, ...(sha ? { sha } : {}) }),
      });
    },
    deleteFile(path, message, sha) {
      return fetch(`${base}/contents/${path}`, {
        method: 'DELETE',
        headers,
        body: JSON.stringify({ message, sha, branch }),
      });
    },
    createIssue(payload) {
      return fetch(`${base}/issues`, { method: 'POST', headers, body: JSON.stringify(payload) });
    },
  };
}
