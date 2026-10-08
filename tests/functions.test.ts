import { readFileSync } from 'node:fs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
// @ts-expect-error — funciones JS de Cloudflare, sin tipos
import { onRequestPost as guardar } from '../functions/api/guardar.js';
// @ts-expect-error
import { onRequestPost as login } from '../functions/api/login.js';
// @ts-expect-error
import { onRequestPost as reportar } from '../functions/api/reportar.js';

const env = { GITHUB_TOKEN: 't', ADMIN_PASSWORD: 'secreta', REPO_OWNER: 'o', REPO_NAME: 'r' };
const b64 = (s: string) => Buffer.from(s, 'utf8').toString('base64');

// GitHub falso en memoria: contents (GET/PUT/DELETE) e issues
let files: Map<string, { content: string; sha: string }>;
let issues: unknown[];
let sha = 0;

beforeEach(() => {
  sha = 0;
  issues = [];
  files = new Map([
    ['src/data/salones.json', { content: b64(readFileSync('src/data/salones.json', 'utf8')), sha: `s${sha++}` }],
  ]);
  vi.stubGlobal('fetch', async (url: string, init: RequestInit = {}) => {
    const u = new URL(url);
    const m = u.pathname.match(/^\/repos\/o\/r\/(contents\/(.+)|issues)$/);
    if (!m) return new Response('{}', { status: 404 });
    const method = init.method ?? 'GET';
    if (m[1] === 'issues') {
      issues.push(JSON.parse(init.body as string));
      return new Response('{}', { status: 201 });
    }
    const path = decodeURIComponent(m[2]);
    const f = files.get(path);
    if (method === 'GET') return f ? Response.json({ content: f.content, sha: f.sha }) : new Response('{}', { status: 404 });
    const body = JSON.parse(init.body as string);
    if (method === 'PUT') {
      if (f && body.sha !== f.sha) return new Response('{}', { status: 409 });
      files.set(path, { content: body.content, sha: `s${sha++}` });
      return Response.json({});
    }
    if (method === 'DELETE') {
      if (!f || body.sha !== f.sha) return new Response('{}', { status: 409 });
      files.delete(path);
      return Response.json({});
    }
    return new Response('{}', { status: 405 });
  });
});
afterEach(() => vi.unstubAllGlobals());

// El servidor espera 1,5 s tras una contraseña incorrecta; en pruebas se omite la espera.
const sinEspera = () => vi.stubGlobal('setTimeout', ((fn: () => void) => { fn(); return 0; }) as unknown as typeof setTimeout);

const req = (body: unknown, headers: Record<string, string> = {}) =>
  new Request('https://x.test/api', { method: 'POST', body: JSON.stringify(body), headers });
const lista = () => JSON.parse(Buffer.from(files.get('src/data/salones.json')!.content, 'base64').toString('utf8')) as { id: string; photo?: string }[];

// Mínimo WebP válido para las pruebas (cabecera RIFF....WEBP)
const webp = Buffer.concat([Buffer.from('RIFF'), Buffer.alloc(4), Buffer.from('WEBP'), Buffer.alloc(16)]).toString('base64');
const room = { id: '7299', displayName: '7-299', building: '7', floor: 2, type: 'classroom', verified: false, notes: 'Prueba' };

describe('POST /api/login', () => {
  it('acepta la contraseña correcta', async () => {
    expect((await login({ request: req({ password: 'secreta' }), env })).status).toBe(200);
  });
  it('rechaza una incorrecta', async () => {
    sinEspera();
    expect((await login({ request: req({ password: 'nope' }), env })).status).toBe(401);
  });
  it('rechaza peticiones de otro sitio', async () => {
    const r = await login({ request: req({ password: 'secreta' }, { 'Sec-Fetch-Site': 'cross-site' }), env });
    expect(r.status).toBe(403);
  });
});

describe('POST /api/guardar', () => {
  it('crea un salón nuevo con foto y deja la lista ordenada', async () => {
    const res = await guardar({ request: req({ password: 'secreta', action: 'upsert', room, photoBase64: webp }), env });
    expect(res.status).toBe(200);
    const { room: guardado } = await res.json();
    expect(guardado.photo).toMatch(/^img\/salones\/7\/7299-[a-z0-9]+\.webp$/);
    expect(guardado.updatedAt).toBeTruthy();
    expect(files.has(`public/${guardado.photo}`)).toBe(true);
    const l = lista();
    expect(l.find((s) => s.id === '7299')).toBeTruthy();
    const ids7 = l.filter((s: any) => s.building === '7').map((s) => s.id);
    expect(ids7).toEqual([...ids7].sort((a, b) => a.localeCompare(b, 'es', { numeric: true })));
  });

  it('no se puede escribir sin contraseña', async () => {
    sinEspera();
    expect((await guardar({ request: req({ password: 'x', action: 'upsert', room }), env })).status).toBe(401);
    expect(lista().find((s) => s.id === '7299')).toBeUndefined();
  });

  it('ignora la ruta de foto enviada por el cliente', async () => {
    const res = await guardar({ request: req({ password: 'secreta', action: 'upsert', room: { ...room, photo: '../../.github/x' } }), env });
    expect((await res.json()).room.photo).toBeUndefined();
  });

  it('conserva la foto al editar y la reemplaza (borrando la anterior) al subir otra', async () => {
    const a = await (await guardar({ request: req({ password: 'secreta', action: 'upsert', room, photoBase64: webp }), env })).json();
    const b = await (await guardar({ request: req({ password: 'secreta', action: 'upsert', room: { ...room, notes: 'Editado' } }), env })).json();
    expect(b.room.photo).toBe(a.room.photo);
    await new Promise((r) => setTimeout(r, 2));
    const c = await (await guardar({ request: req({ password: 'secreta', action: 'upsert', room, photoBase64: webp }), env })).json();
    expect(c.room.photo).not.toBe(a.room.photo);
    expect(files.has(`public/${a.room.photo}`)).toBe(false);
    expect(files.has(`public/${c.room.photo}`)).toBe(true);
  });

  it('quitar la foto la borra del repositorio', async () => {
    const a = await (await guardar({ request: req({ password: 'secreta', action: 'upsert', room, photoBase64: webp }), env })).json();
    const b = await (await guardar({ request: req({ password: 'secreta', action: 'upsert', room, removePhoto: true }), env })).json();
    expect(b.room.photo).toBeUndefined();
    expect(files.has(`public/${a.room.photo}`)).toBe(false);
  });

  it('rechaza fotos que no son WebP y datos inválidos', async () => {
    const png = Buffer.from('\x89PNG\r\n\x1a\n' + 'x'.repeat(30)).toString('base64');
    expect((await guardar({ request: req({ password: 'secreta', action: 'upsert', room, photoBase64: png }), env })).status).toBe(400);
    expect((await guardar({ request: req({ password: 'secreta', action: 'upsert', room: { ...room, building: '99' } }), env })).status).toBe(400);
    expect((await guardar({ request: req({ password: 'secreta', action: 'borrar-todo' }), env })).status).toBe(400);
  });

  it('elimina un salón (y su foto) y responde 404 si no existe', async () => {
    const a = await (await guardar({ request: req({ password: 'secreta', action: 'upsert', room, photoBase64: webp }), env })).json();
    expect((await guardar({ request: req({ password: 'secreta', action: 'delete', id: '7299' }), env })).status).toBe(200);
    expect(lista().find((s) => s.id === '7299')).toBeUndefined();
    expect(files.has(`public/${a.room.photo}`)).toBe(false);
    expect((await guardar({ request: req({ password: 'secreta', action: 'delete', id: '7299' }), env })).status).toBe(404);
  });

  it('falla con un mensaje claro si falta configuración', async () => {
    const res = await guardar({ request: req({ password: 'secreta', action: 'upsert', room }), env: { ...env, REPO_OWNER: '' } });
    expect(res.status).toBe(500);
    expect((await res.json()).error).toContain('REPO_OWNER');
  });
});

describe('POST /api/reportar', () => {
  const rep = { roomId: '7215', roomLabel: '7-215', message: 'Está en el 3.er piso' };

  it('crea un issue con etiqueta y neutraliza menciones', async () => {
    const res = await reportar({ request: req({ ...rep, message: 'Avisen a @admin <script> #12' }), env });
    expect(res.status).toBe(200);
    const issue = issues[0] as { labels: string[]; body: string };
    expect(issue.labels).toContain('reporte-ubicacion');
    expect(issue.body).not.toMatch(/@admin/);
    expect(issue.body).not.toContain('<script>');
  });

  it('el honeypot responde ok pero no crea nada', async () => {
    expect((await reportar({ request: req({ ...rep, website: 'http://spam' }), env })).status).toBe(200);
    expect(issues).toHaveLength(0);
  });

  it('valida el mensaje', async () => {
    expect((await reportar({ request: req({ ...rep, message: 'no' }), env })).status).toBe(400);
    expect((await reportar({ request: req({ ...rep, message: 'x'.repeat(501) }), env })).status).toBe(400);
  });
});
