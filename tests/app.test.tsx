// @vitest-environment jsdom
import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../src/App';
import { RoomsProvider } from '../src/state/RoomsProvider';

const mount = () =>
  render(
    <RoomsProvider>
      <App />
    </RoomsProvider>,
  );

beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  window.history.replaceState(null, '', '/');
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

async function search(user: ReturnType<typeof userEvent.setup>, text: string) {
  const input = screen.getByLabelText('¿Dónde es tu clase?');
  await user.clear(input);
  await user.type(input, text);
  await user.click(screen.getByRole('button', { name: 'Encontrar salón' }));
}

describe('flujo del estudiante', () => {
  it('busca un salón, ve el resultado y arranca el recorrido', async () => {
    const user = userEvent.setup();
    mount();
    expect(screen.getByText('Encuentra tu salón sin perderte.')).toBeTruthy();

    await search(user, '7-214');
    expect(await screen.findByRole('heading', { name: '7-214' })).toBeTruthy();
    expect(screen.getAllByText(/Edificio 7/).length).toBeGreaterThan(0);
    expect(screen.getByText('Ubicación preliminar')).toBeTruthy();
    expect(screen.getByText(/≈ \d+ min/)).toBeTruthy();

    await user.click(screen.getByRole('button', { name: /Cómo llegar/ }));
    expect(await screen.findByText('Navegando hacia')).toBeTruthy();
  });

  it('un salón verificado muestra la insignia verde', async () => {
    const user = userEvent.setup();
    mount();
    await search(user, '12202');
    expect(await screen.findByText('Ubicación verificada')).toBeTruthy();
  });

  it('texto libre ofrece sugerencias y se puede abrir una', async () => {
    const user = userEvent.setup();
    mount();
    await search(user, 'laboratorio de redes');
    expect(await screen.findByText('¿Quisiste decir alguno de estos?')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: /Laboratorio de Redes y Computación/ }));
    expect(await screen.findByRole('heading', { name: '8-300' })).toBeTruthy();
  });

  it('un código sin registro se guía por edificio y piso', async () => {
    const user = userEvent.setup();
    mount();
    await search(user, '7-299');
    expect(await screen.findByRole('heading', { name: '7-299' })).toBeTruthy();
    expect(screen.getByText('Ubicación preliminar')).toBeTruthy();
  });

  it('lo ilegible muestra el estado vacío', async () => {
    const user = userEvent.setup();
    mount();
    await search(user, 'zzzzqqqq');
    expect(await screen.findByText('No encontramos ese salón.')).toBeTruthy();
  });

  it('guarda favoritos y recientes en el navegador', async () => {
    const user = userEvent.setup();
    mount();
    await search(user, '7214');
    await user.click(await screen.findByRole('button', { name: 'Guardar en favoritos' }));
    expect(JSON.parse(localStorage.getItem('ubicfime:favoritos')!)).toEqual(['7214']);

    await user.click(screen.getByRole('button', { name: /Volver a buscar/ }));
    const favoritos = await screen.findByLabelText('Favoritos');
    expect(within(favoritos).getByText('7-214')).toBeTruthy();
    expect(JSON.parse(localStorage.getItem('ubicfime:recientes')!)).toEqual(['7214']);
  });

  it('el reporte público se envía a /api/reportar', async () => {
    const fetchMock = vi.fn(async () => Response.json({ ok: true }));
    vi.stubGlobal('fetch', fetchMock);
    const user = userEvent.setup();
    mount();
    await search(user, '7214');
    await user.click(await screen.findByRole('button', { name: /Ubicación incorrecta/ }));
    await user.type(screen.getByLabelText(/¿Qué está mal\?/), 'Está en el tercer piso');
    await user.click(screen.getByRole('button', { name: 'Enviar reporte' }));
    expect(await screen.findByText(/Gracias/)).toBeTruthy();
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('/api/reportar');
    expect(JSON.parse(init.body as string)).toMatchObject({ roomId: '7214', website: '' });
  });
});

describe('panel de editores (?admin)', () => {
  it('pide contraseña, valida contra el servidor y lista los salones', async () => {
    window.history.replaceState(null, '', '/?admin');
    const fetchMock = vi.fn(async () => Response.json({ ok: true }));
    vi.stubGlobal('fetch', fetchMock);
    const user = userEvent.setup();
    mount();

    expect(await screen.findByText('Panel de editores')).toBeTruthy();
    await user.type(screen.getByLabelText('Contraseña'), 'secreta');
    await user.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(await screen.findByText('Editar salones')).toBeTruthy();
    expect(fetchMock).toHaveBeenCalledWith('/api/login', expect.objectContaining({ method: 'POST' }));
    expect(screen.getByRole('button', { name: 'Editar 7-215' })).toBeTruthy();
  });

  it('una contraseña incorrecta muestra el error y no entra', async () => {
    window.history.replaceState(null, '', '/?admin');
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ error: 'Contraseña incorrecta.' }, { status: 401 })));
    const user = userEvent.setup();
    mount();
    await user.type(await screen.findByLabelText('Contraseña'), 'mala');
    await user.click(screen.getByRole('button', { name: 'Entrar' }));
    expect(await screen.findByRole('alert')).toBeTruthy();
    expect(screen.queryByText('Editar salones')).toBeNull();
  });

  it('edita un salón: marca verificado y manda el cambio al servidor', async () => {
    window.history.replaceState(null, '', '/?admin');
    const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
      if (url === '/api/guardar') {
        const { room } = JSON.parse(init!.body as string);
        return Response.json({ ok: true, room: { ...room, updatedAt: 'ahora' } });
      }
      return Response.json({ ok: true });
    });
    vi.stubGlobal('fetch', fetchMock);
    const user = userEvent.setup();
    mount();
    await user.type(await screen.findByLabelText('Contraseña'), 'secreta');
    await user.click(screen.getByRole('button', { name: 'Entrar' }));
    await user.click(await screen.findByRole('button', { name: 'Editar 7-215' }));

    await user.type(screen.getByLabelText(/Referencia para llegar/), 'Junto a las escaleras');
    await user.click(screen.getByLabelText(/Ubicación verificada/));
    await user.click(screen.getByRole('button', { name: 'Guardar' }));

    await waitFor(() => expect(screen.getByText(/Guardado 7-215/)).toBeTruthy());
    const call = fetchMock.mock.calls.find((c) => c[0] === '/api/guardar')!;
    const sent = JSON.parse(call[1]!.body as string);
    expect(sent).toMatchObject({ password: 'secreta', action: 'upsert' });
    expect(sent.room).toMatchObject({ id: '7215', verified: true, notes: expect.stringContaining('escaleras') });
  });
});
