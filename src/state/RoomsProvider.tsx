import { useCallback, useMemo, useState, type ReactNode } from 'react';
import type { Room } from '../types';
import { SEED_ROOMS } from '../data/rooms';
import { createRoomIndex } from '../utils/search';
import { RoomsContext } from './rooms-context';
import { readJSON, writeJSON } from '../utils/storage';

const STORAGE_KEY = 'ubicfime:custom_rooms';
const byId = (a: Room, b: Room) => a.id.localeCompare(b.id, 'es', { numeric: true });

function getInitialRooms(): Room[] {
  const saved = readJSON<Record<string, Room>>(STORAGE_KEY, {});
  // Fusiona SEED_ROOMS con las ediciones guardadas localmente (si la versión guardada es más reciente)
  const map = new Map<string, Room>();
  SEED_ROOMS.forEach((r) => map.set(r.id, r));

  Object.values(saved).forEach((customRoom) => {
    const existing = map.get(customRoom.id);
    if (!existing) {
      map.set(customRoom.id, customRoom);
    } else {
      const existingTime = existing.updatedAt ? new Date(existing.updatedAt).getTime() : 0;
      const customTime = customRoom.updatedAt ? new Date(customRoom.updatedAt).getTime() : 0;
      if (customTime >= existingTime) {
        map.set(customRoom.id, customRoom);
      }
    }
  });

  return Array.from(map.values()).sort(byId);
}

export function RoomsProvider({ children }: { children: ReactNode }) {
  const [rooms, setRooms] = useState<Room[]>(getInitialRooms);
  const index = useMemo(() => createRoomIndex(rooms), [rooms]);

  const upsertRoom = useCallback((room: Room) => {
    setRooms((prev) => {
      const next = [...prev.filter((r) => r.id !== room.id), room].sort(byId);
      const saved = readJSON<Record<string, Room>>(STORAGE_KEY, {});
      saved[room.id] = room;
      writeJSON(STORAGE_KEY, saved);
      return next;
    });
  }, []);

  const removeRoom = useCallback((id: string) => {
    setRooms((prev) => {
      const next = prev.filter((r) => r.id !== id);
      const saved = readJSON<Record<string, Room>>(STORAGE_KEY, {});
      delete saved[id];
      writeJSON(STORAGE_KEY, saved);
      return next;
    });
  }, []);

  const value = useMemo(() => ({ rooms, index, upsertRoom, removeRoom }), [rooms, index, upsertRoom, removeRoom]);
  return <RoomsContext.Provider value={value}>{children}</RoomsContext.Provider>;
}

