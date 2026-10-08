import { useCallback, useMemo, useState, type ReactNode } from 'react';
import type { Room } from '../types';
import { SEED_ROOMS } from '../data/rooms';
import { createRoomIndex } from '../utils/search';
import { RoomsContext } from './rooms-context';

const byId = (a: Room, b: Room) => a.id.localeCompare(b.id, 'es', { numeric: true });

export function RoomsProvider({ children }: { children: ReactNode }) {
  const [rooms, setRooms] = useState<Room[]>(SEED_ROOMS);
  const index = useMemo(() => createRoomIndex(rooms), [rooms]);

  const upsertRoom = useCallback((room: Room) => {
    setRooms((prev) => [...prev.filter((r) => r.id !== room.id), room].sort(byId));
  }, []);

  const removeRoom = useCallback((id: string) => {
    setRooms((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const value = useMemo(() => ({ rooms, index, upsertRoom, removeRoom }), [rooms, index, upsertRoom, removeRoom]);
  return <RoomsContext.Provider value={value}>{children}</RoomsContext.Provider>;
}
