import type { Room } from '../src/types';

export const VALID_BUILDINGS: string[];
export const ROOM_TYPES: string[];
export const MAX_FLOOR: number;

export type ValidationResult =
  | { ok: true; room: Omit<Room, 'photo' | 'updatedAt'> }
  | { ok: false; error: string };

export function validarSalon(input: unknown): ValidationResult;
