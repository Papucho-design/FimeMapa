import { createContext, useContext } from 'react';
import type { Room } from '../types';
import type { RoomIndex } from '../utils/search';

export interface RoomsContextValue {
  rooms: Room[];
  index: RoomIndex;
  /** Actualiza la lista en memoria (el panel admin la usa tras guardar). */
  upsertRoom: (room: Room) => void;
  removeRoom: (id: string) => void;
}

export const RoomsContext = createContext<RoomsContextValue | null>(null);

export function useRooms(): RoomsContextValue {
  const ctx = useContext(RoomsContext);
  if (!ctx) throw new Error('useRooms debe usarse dentro de <RoomsProvider>');
  return ctx;
}
