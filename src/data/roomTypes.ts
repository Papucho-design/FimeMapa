import type { RoomType } from '../types';

export const ROOM_TYPE_LABEL: Record<RoomType, string> = {
  classroom: 'Salón',
  laboratory: 'Laboratorio',
  'physics-laboratory': 'Laboratorio de Física',
  'computer-lab': 'Laboratorio de cómputo',
  auditorium: 'Auditorio',
  office: 'Oficina',
  other: 'Otro',
};

export const ROOM_TYPES = Object.keys(ROOM_TYPE_LABEL) as RoomType[];
