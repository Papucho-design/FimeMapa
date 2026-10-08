import { describe, expect, it } from 'vitest';
import { normalizeRoomQuery } from '../src/utils/roomNormalizer';

describe('normalizeRoomQuery', () => {
  it.each([
    ['7215', '7215', '7', 2],
    ['7-215', '7215', '7', 2],
    ['7 215', '7215', '7', 2],
    ['7/215', '7215', '7', 2],
    ['Edificio 7 salón 215', '7215', '7', 2],
    ['  2301 ', '2301', '2', 3],
    ['12202', '12202', '12', 2],
    ['12-202', '12202', '12', 2],
    ['11301', '11301', '11', 3],
  ])('"%s" → %s (edificio %s, piso %i)', (input, id, building, floor) => {
    const r = normalizeRoomQuery(input);
    expect(r?.normalizedId).toBe(id);
    expect(r?.buildingId).toBe(building);
    expect(r?.floor).toBe(floor);
  });

  it.each(['6F11', '6-F-11', '6 f 11', '6/F/11'])('laboratorio de física "%s"', (input) => {
    const r = normalizeRoomQuery(input);
    expect(r?.normalizedId).toBe('6F11');
    expect(r?.type).toBe('physics-laboratory');
    expect(r?.floor).toBe(1);
  });

  it('el segundo dígito 0 es planta baja (nivel 0), no piso 1', () => {
    expect(normalizeRoomQuery('5000')?.floor).toBe(0);
    expect(normalizeRoomQuery('5-001')?.floor).toBe(0);
  });

  it('un edificio solo se reconoce como edificio', () => {
    expect(normalizeRoomQuery('Edificio 7')?.displayName).toBe('Edificio 7');
    expect(normalizeRoomQuery('12')?.buildingId).toBe('12');
  });

  it.each(['', '   ', 'lab de redes', 'hola'])('texto libre "%s" no es un código', (input) => {
    expect(normalizeRoomQuery(input)).toBeNull();
  });
});
