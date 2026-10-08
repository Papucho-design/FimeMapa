import type { Landmark } from '../types';

/**
 * Landmark positions match the real FIME campus layout.
 * SVG viewBox: "0 0 1000 750". North = top.
 */
export const LANDMARKS: Record<string, Landmark> = {
  'entrance-main': {
    id: 'entrance-main',
    name: 'Entrada Principal FIME',
    category: 'entrance',
    description: 'Acceso peatonal principal a la Facultad de Ingeniería Mecánica y Eléctrica.',
    coordinates: { x: 497, y: 718 },
    photoUrl: '/assets/fime/landmarks/entrada_principal.svg',
    iconName: 'DoorOpen'
  },
  'cafeteria': {
    id: 'cafeteria',
    name: 'Cafetería & Snack FIME',
    category: 'service',
    description: 'Zona de comida y descanso central. Referencia visible desde varios edificios.',
    coordinates: { x: 502, y: 388 },
    photoUrl: '/assets/fime/landmarks/cafeteria.svg',
    iconName: 'Coffee'
  },
  'jardin-oso': {
    id: 'jardin-oso',
    name: 'Jardín del Oso de FIME',
    category: 'landmark',
    description: 'Área verde con escultura emblemática del Oso, al sureste del campus.',
    coordinates: { x: 705, y: 695 },
    photoUrl: '/assets/fime/landmarks/jardin_oso.svg',
    iconName: 'Trees'
  },
  'auditorio': {
    id: 'auditorio',
    name: 'Auditorio Jorge Urencio',
    category: 'landmark',
    description: 'Auditorio principal, ubicado entre Ed.2 y Ed.1.',
    coordinates: { x: 600, y: 510 },
    photoUrl: '/assets/fime/landmarks/cafeteria.svg',
    iconName: 'Music'
  },
  'estacionamiento': {
    id: 'estacionamiento',
    name: 'Estacionamiento',
    category: 'landmark',
    description: 'Zona de estacionamiento al oeste (lado de Ed.8).',
    coordinates: { x: 120, y: 295 },
    photoUrl: '/assets/fime/landmarks/entrada_principal.svg',
    iconName: 'Car'
  },
  'campo-sintetico': {
    id: 'campo-sintetico',
    name: 'Campo Sintético',
    category: 'recreation',
    description: 'Campo sintético y área deportiva al noreste del campus.',
    coordinates: { x: 900, y: 75 },
    photoUrl: '/assets/fime/landmarks/polideportivo.svg',
    iconName: 'Trophy'
  }
};
