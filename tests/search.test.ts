import { describe, expect, it } from 'vitest';
import salones from '../src/data/salones.json';
import type { Room } from '../src/types';
import { createRoomIndex, resolveQuery, roomsByBuilding, suggestRooms } from '../src/utils/search';
import { solveRoute } from '../src/utils/routeSolver';

const rooms = salones as Room[];
const index = createRoomIndex(rooms);

describe('resolveQuery', () => {
  it('encuentra un salón registrado por código en varios formatos', () => {
    for (const q of ['7214', '7-214', 'Edificio 7 salón 214']) {
      const r = resolveQuery(q, rooms, index);
      expect(r.kind).toBe('room');
      expect(r.kind === 'room' && r.room.id).toBe('7214');
    }
  });

  it('un código válido pero sin registro se guía por edificio y piso', () => {
    const r = resolveQuery('7-299', rooms, index);
    expect(r.kind).toBe('pattern');
  });

  it('un piso imposible no se acepta como código', () => {
    // Edificio 9 tiene 3 pisos: 9-900 sería piso 9
    expect(resolveQuery('9900', rooms, index).kind).not.toBe('pattern');
  });

  it('texto libre tolera errores y acentos', () => {
    for (const q of ['lab redes', 'laboratorio de redes y computacion', 'auditorio']) {
      const r = resolveQuery(q, rooms, index);
      expect(r.kind, q).toBe('suggestions');
    }
    const redes = resolveQuery('laboratorio redes', rooms, index);
    expect(redes.kind === 'suggestions' && redes.rooms[0].id).toBe('8300');
  });

  it('basura no devuelve resultados', () => {
    expect(resolveQuery('zzzzqqqq', rooms, index).kind).toBe('none');
  });
});

describe('suggestRooms / roomsByBuilding', () => {
  it('no sugiere con menos de 2 caracteres', () => {
    expect(suggestRooms('a', index)).toEqual([]);
  });

  it('ordena los salones de un edificio por piso y código', () => {
    const lista = roomsByBuilding(rooms, '7');
    const pisos = lista.map((r) => r.floor);
    expect(pisos).toEqual([...pisos].sort((a, b) => a - b));
  });
});

describe('solveRoute', () => {
  it('llega desde la entrada a cualquier edificio con salones', () => {
    const edificios = new Set(rooms.map((r) => r.building));
    for (const b of edificios) {
      const r = solveRoute('entrance-main', b);
      expect(r.pathNodeIds[0], b).toBe('entrance-main');
      expect(r.pathNodeIds.at(-1), b).toBe(`building-${b}`);
      expect(r.estimatedMinutes).toBeGreaterThanOrEqual(2);
    }
  });

  it('incluye paso de piso, nota del salón y marca el destino', () => {
    const room = { notes: 'Junto a las escaleras', photo: undefined, verified: false };
    const { steps } = solveRoute('entrance-main', '7', '7-215', 2, room);
    expect(steps.some((s) => /segundo piso/i.test(s.title))).toBe(true);
    const ultimo = steps.at(-1)!;
    expect(ultimo.isDestination).toBe(true);
    expect(ultimo.instruction).toContain('Junto a las escaleras');
    expect(ultimo.instruction).toContain('no está verificada');
    expect(steps.every((s) => s.totalSteps === steps.length)).toBe(true);
  });

  it('el nivel 0 tiene su propio paso y el piso 1 no lleva paso extra', () => {
    expect(solveRoute('entrance-main', '5', '5-000', 0).steps.some((s) => /planta baja/i.test(s.title))).toBe(true);
    expect(solveRoute('entrance-main', '2', '2-101', 1).steps.some((s) => /Sube|planta baja/i.test(s.title))).toBe(false);
  });
});
