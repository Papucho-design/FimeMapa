import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import salones from '../src/data/salones.json';
import { BUILDINGS } from '../src/data/buildings';
import { ROUTE_NODES } from '../src/data/routes';
import { VALID_BUILDINGS, validarSalon } from '../shared/validarSalon.js';

describe('datos de salones', () => {
  it('todos los salones pasan la validación del servidor', () => {
    const malos = salones
      .map((s) => ({ id: s.id, r: validarSalon(s) }))
      .filter((x) => !x.r.ok)
      .map((x) => `${x.id}: ${(x.r as { error: string }).error}`);
    expect(malos).toEqual([]);
  });

  it('los IDs son únicos', () => {
    const ids = salones.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('la lista de edificios válidos coincide con buildings.ts', () => {
    expect([...VALID_BUILDINGS].sort()).toEqual(Object.keys(BUILDINGS).sort());
  });

  it('cada edificio tiene un nodo en el grafo de rutas', () => {
    for (const id of Object.keys(BUILDINGS)) {
      expect(ROUTE_NODES[`building-${id}`], `building-${id}`).toBeDefined();
    }
  });

  it('las fotos referenciadas existen en public/', () => {
    for (const s of salones as { id: string; photo?: string }[]) {
      if (s.photo) expect(existsSync(`public/${s.photo}`), s.photo).toBe(true);
    }
  });

  it('los pisos no superan los del edificio', () => {
    for (const s of salones) {
      expect(s.floor, s.id).toBeLessThanOrEqual(BUILDINGS[s.building].floorCount);
    }
  });

  it('salones.json termina en formato estable (JSON válido)', () => {
    expect(() => JSON.parse(readFileSync('src/data/salones.json', 'utf8'))).not.toThrow();
  });
});

describe('validarSalon', () => {
  const base = { id: '7215', displayName: '7-215', building: '7', floor: 2, type: 'classroom', verified: false };

  it('normaliza el código y limpia etiquetas', () => {
    const r = validarSalon({ ...base, id: ' 6f11 ', tags: ['Lab Redes', 'lab redes', ' '] });
    expect(r.ok && r.room.id).toBe('6F11');
    expect(r.ok && r.room.tags).toEqual(['lab redes']);
  });

  it.each([
    [{ ...base, id: '../etc' }, 'código'],
    [{ ...base, building: '99' }, 'Edificio'],
    [{ ...base, floor: 9 }, 'piso'],
    [{ ...base, floor: 1.5 }, 'piso'],
    [{ ...base, type: 'banana' }, 'Tipo'],
    [{ ...base, displayName: '' }, 'obligatorio'],
    [{ ...base, notes: 'x'.repeat(501) }, 'larga'],
    [{ ...base, tags: Array(11).fill('a') }, 'etiquetas'],
    [null, 'inválidos'],
  ])('rechaza datos inválidos %#', (input, fragmento) => {
    const r = validarSalon(input);
    expect(r.ok).toBe(false);
    expect(!r.ok && r.error).toContain(fragmento);
  });

  it('verified solo es true si viene exactamente true', () => {
    expect(validarSalon({ ...base, verified: 'true' }).ok && (validarSalon({ ...base, verified: 'true' }) as { room: { verified: boolean } }).room.verified).toBe(false);
  });

  it('descarta campos desconocidos (p. ej. photo enviada por el cliente)', () => {
    const r = validarSalon({ ...base, photo: 'img/hack.webp', admin: true });
    expect(r.ok && 'photo' in r.room).toBe(false);
    expect(r.ok && 'admin' in r.room).toBe(false);
  });
});
