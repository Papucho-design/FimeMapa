import type { NormalizedRoomInfo } from '../utils/roomNormalizer';

export interface Building {
  id: string; // e.g. "1", "7", "12"
  name: string; // e.g. "Edificio 7"
  category: 'Aulas' | 'Laboratorios' | 'Posgrado' | 'Administración' | 'Biblioteca' | 'Servicios' | 'Deportes';
  description: string;
  floorCount: number;
  pattern: string; // e.g. "7XXX"
  examples?: string[];
  coordinates: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  color?: string;
  photoUrl?: string;
  entranceLocation?: string;
  hasElevator?: boolean;
}

export type RoomType =
  | 'classroom'
  | 'laboratory'
  | 'physics-laboratory'
  | 'computer-lab'
  | 'auditorium'
  | 'office'
  | 'other';

export interface Room {
  /** ID normalizado y único, en mayúsculas. Ej. "7215", "6F11". */
  id: string;
  /** Como se muestra al estudiante. Ej. "7-215". */
  displayName: string;
  /** ID del edificio. Ej. "7", "12", "cidet". */
  building: string;
  /** Nivel del edificio. 0 = planta baja / nivel 0. */
  floor: number;
  type: RoomType;
  /** true = ubicación confirmada físicamente. */
  verified: boolean;
  /** Nombre propio (auditorios, laboratorios con nombre). */
  name?: string;
  /** Referencia humana para llegar: "al fondo del pasillo, junto a las escaleras". */
  notes?: string;
  /** Ruta relativa a public/, ej. "img/salones/7/7215.webp". */
  photo?: string;
  /** Alias de búsqueda: "lab de redes", "física uno". */
  tags?: string[];
  /** ISO 8601. Lo pone el servidor al guardar. */
  updatedAt?: string;
}

export interface Landmark {
  id: string;
  name: string;
  category: 'landmark' | 'entrance' | 'service' | 'recreation';
  description: string;
  coordinates: { x: number; y: number };
  photoUrl?: string;
  iconName?: string;
}

export interface RouteNode {
  id: string;
  name: string;
  type: 'entrance' | 'building' | 'landmark' | 'junction';
  coordinates: { x: number; y: number };
  buildingId?: string;
  floor?: number;
}

export interface RouteEdge {
  from: string;
  to: string;
  distance?: number; // approximate walking weight
  description?: string; // e.g. "Camino principal hacia zona central"
}

export interface NavigationStep {
  stepNumber: number;
  totalSteps: number;
  title: string;
  instruction: string;
  nodeId: string;
  photoUrl?: string;
  photoFallbackUrl?: string;
  photoCaption?: string;
  landmarkName?: string;
  floorInfo?: string;
  isDestination?: boolean;
}

export interface SearchResult {
  /** Qué se encontró: un salón registrado, un código válido sin registro, o un edificio. */
  kind: 'room' | 'pattern' | 'building';
  normalizedQuery: string;
  room?: Room;
  building: Building;
  floor: number;
  isExactRoomFound: boolean;
  verified: boolean;
  statusText: string;
  message: string;
}

/** Resultado de interpretar lo que escribió el usuario. */
export type SearchOutcome =
  | { kind: 'room'; room: Room }
  | { kind: 'pattern'; normalized: NormalizedRoomInfo }
  | { kind: 'suggestions'; rooms: Room[] }
  | { kind: 'none' };
