import Fuse from 'fuse.js';
import type { Room, SearchOutcome } from '../types';
import { BUILDINGS } from '../data/buildings';
import { ROOM_TYPE_LABEL } from '../data/roomTypes';
import { normalizeRoomQuery } from './roomNormalizer';

interface IndexDoc {
  room: Room;
  id: string;
  displayName: string;
  name: string;
  tags: string[];
  context: string;
}

export type RoomIndex = Fuse<IndexDoc>;

/** Índice difuso: tolera errores de escritura, acentos y alias ("lab de redes"). */
export function createRoomIndex(rooms: Room[]): RoomIndex {
  const docs: IndexDoc[] = rooms.map((room) => ({
    room,
    id: room.id,
    displayName: room.displayName,
    name: room.name ?? '',
    tags: room.tags ?? [],
    context: [
      BUILDINGS[room.building]?.name ?? `Edificio ${room.building}`,
      ROOM_TYPE_LABEL[room.type] ?? '',
      room.notes ?? '',
    ].join(' '),
  }));

  return new Fuse(docs, {
    includeScore: true,
    ignoreDiacritics: true,
    ignoreLocation: true,
    threshold: 0.32,
    keys: [
      { name: 'id', weight: 0.3 },
      { name: 'displayName', weight: 0.3 },
      { name: 'name', weight: 0.25 },
      { name: 'tags', weight: 0.1 },
      { name: 'context', weight: 0.05 },
    ],
  });
}

/** Sugerencias para el buscador en vivo. */
export function suggestRooms(query: string, index: RoomIndex, limit = 6): Room[] {
  const q = query.trim();
  if (q.length < 2) return [];
  return index.search(q, { limit }).map((r) => r.item.room);
}

const sameId = (a: string, b: string) => a.toUpperCase() === b.toUpperCase();

/** ¿El nivel existe en ese edificio? (0 = planta baja). */
function isPlausibleFloor(buildingId: string, floor: number): boolean {
  const b = BUILDINGS[buildingId];
  return !!b && floor >= 0 && floor <= b.floorCount;
}

/**
 * Interpreta lo que escribió el usuario:
 *   1. Código reconocible y registrado        → room
 *   2. Código válido pero sin registro         → pattern (se guía al edificio y piso)
 *   3. Texto libre ("lab de redes", "audit")   → suggestions
 */
export function resolveQuery(query: string, rooms: Room[], index: RoomIndex): SearchOutcome {
  const normalized = normalizeRoomQuery(query);

  if (normalized) {
    const room = rooms.find((r) => sameId(r.id, normalized.normalizedId));
    if (room) return { kind: 'room', room };
    if (isPlausibleFloor(normalized.buildingId, normalized.floor)) {
      return { kind: 'pattern', normalized };
    }
  }

  const found = suggestRooms(query, index, 8);
  if (found.length > 0) return { kind: 'suggestions', rooms: found };
  return { kind: 'none' };
}

export function roomsByBuilding(rooms: Room[], buildingId: string): Room[] {
  return rooms
    .filter((r) => r.building === buildingId)
    .sort((a, b) => a.floor - b.floor || a.id.localeCompare(b.id, 'es', { numeric: true }));
}
