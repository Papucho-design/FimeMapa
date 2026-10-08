import type { RouteNode, RouteEdge } from '../types';

/**
 * Route nodes represent walkable points on the FIME campus.
 * Positions match the real campus layout (SVG 1000x750, North = top).
 *
 * Node naming:
 *   entrance-main       = peatonal main gate (south)
 *   jct-*               = path junctions/intersections
 *   building-*          = entrance node for each building
 *   landmark-*          = notable reference point
 */
export const ROUTE_NODES: Record<string, RouteNode> = {

  // ─── ENTRANCE (SOUTH) ───────────────────────────────────────────────────────
  'entrance-main': {
    id: 'entrance-main',
    name: 'Entrada Principal FIME',
    type: 'entrance',
    coordinates: { x: 497, y: 718 }
  },

  // ─── SOUTH JUNCTIONS ────────────────────────────────────────────────────────
  'jct-south-center': {
    id: 'jct-south-center',
    name: 'Pasillo Sur Central',
    type: 'junction',
    coordinates: { x: 497, y: 660 }
  },
  'jct-south-left': {
    id: 'jct-south-left',
    name: 'Pasillo Sur-Oeste',
    type: 'junction',
    coordinates: { x: 360, y: 648 }
  },
  'jct-south-right': {
    id: 'jct-south-right',
    name: 'Pasillo Sur-Este',
    type: 'junction',
    coordinates: { x: 637, y: 648 }
  },

  // ─── BUILDING: Ed.1 ─────────────────────────────────────────────────────────
  'building-1': {
    id: 'building-1',
    name: 'Edificio 1',
    type: 'building',
    buildingId: '1',
    coordinates: { x: 711, y: 596 }
  },

  // ─── BUILDING: Ed.11 ────────────────────────────────────────────────────────
  'building-11': {
    id: 'building-11',
    name: 'Edificio 11',
    type: 'building',
    buildingId: '11',
    coordinates: { x: 845, y: 532 }
  },

  // ─── AUDITORIO landmark ─────────────────────────────────────────────────────
  'landmark-auditorio': {
    id: 'landmark-auditorio',
    name: 'Auditorio Jorge Urencio',
    type: 'landmark',
    coordinates: { x: 600, y: 510 }
  },

  // ─── CAFETERIA ──────────────────────────────────────────────────────────────
  'cafeteria-node': {
    id: 'cafeteria-node',
    name: 'Cafetería & Snack FIME',
    type: 'landmark',
    coordinates: { x: 502, y: 388 }
  },

  // ─── CENTER JUNCTIONS (near Ed.2) ───────────────────────────────────────────
  'jct-center-main': {
    id: 'jct-center-main',
    name: 'Pasillo Central (zona Ed.2)',
    type: 'junction',
    coordinates: { x: 497, y: 492 }
  },
  'jct-center-east': {
    id: 'jct-center-east',
    name: 'Pasillo Central-Este',
    type: 'junction',
    coordinates: { x: 720, y: 492 }
  },

  // ─── BUILDING: Ed.2 ─────────────────────────────────────────────────────────
  'building-2': {
    id: 'building-2',
    name: 'Edificio 2',
    type: 'building',
    buildingId: '2',
    coordinates: { x: 677, y: 445 }
  },

  // ─── BUILDING: Ed.9 ─────────────────────────────────────────────────────────
  'building-9': {
    id: 'building-9',
    name: 'Edificio 9',
    type: 'building',
    buildingId: '9',
    coordinates: { x: 877, y: 364 }
  },

  // ─── WEST JUNCTIONS (near Ed.5 / Ed.7) ─────────────────────────────────────
  'jct-west-main': {
    id: 'jct-west-main',
    name: 'Pasillo Oeste (Ed.5/Ed.7)',
    type: 'junction',
    coordinates: { x: 240, y: 492 }
  },

  // ─── BUILDING: Ed.5 ─────────────────────────────────────────────────────────
  'building-5': {
    id: 'building-5',
    name: 'Edificio 5',
    type: 'building',
    buildingId: '5',
    coordinates: { x: 388, y: 462 }
  },

  // ─── BUILDING: Ed.7 ─────────────────────────────────────────────────────────
  'building-7': {
    id: 'building-7',
    name: 'Edificio 7',
    type: 'building',
    buildingId: '7',
    coordinates: { x: 233, y: 522 }
  },

  // ─── BUILDING: CIDET ────────────────────────────────────────────────────────
  'building-cidet': {
    id: 'building-cidet',
    name: 'CIDET',
    type: 'building',
    buildingId: 'cidet',
    coordinates: { x: 370, y: 657 }
  },

  // ─── NORTH JUNCTIONS ────────────────────────────────────────────────────────
  'jct-north-west': {
    id: 'jct-north-west',
    name: 'Pasillo Norte-Oeste (Ed.6/Ed.8)',
    type: 'junction',
    coordinates: { x: 385, y: 340 }
  },
  'jct-north-center': {
    id: 'jct-north-center',
    name: 'Pasillo Norte Central (Ed.3/Ed.6)',
    type: 'junction',
    coordinates: { x: 572, y: 340 }
  },
  'jct-north-east': {
    id: 'jct-north-east',
    name: 'Pasillo Norte-Este (Ed.4/Ed.3)',
    type: 'junction',
    coordinates: { x: 760, y: 265 }
  },

  // ─── BUILDING: Ed.3 ─────────────────────────────────────────────────────────
  'building-3': {
    id: 'building-3',
    name: 'Edificio 3',
    type: 'building',
    buildingId: '3',
    coordinates: { x: 714, y: 301 }
  },

  // ─── BUILDING: Ed.6 ─────────────────────────────────────────────────────────
  'building-6': {
    id: 'building-6',
    name: 'Edificio 6',
    type: 'building',
    buildingId: '6',
    coordinates: { x: 387, y: 260 }
  },

  // ─── BUILDING: Ed.8 ─────────────────────────────────────────────────────────
  'building-8': {
    id: 'building-8',
    name: 'Edificio 8',
    type: 'building',
    buildingId: '8',
    coordinates: { x: 163, y: 170 }
  },

  // ─── BUILDING: Ed.12/Biblioteca ─────────────────────────────────────────────
  'building-12': {
    id: 'building-12',
    name: 'Edificio 12 / Biblioteca',
    type: 'building',
    buildingId: '12',
    coordinates: { x: 390, y: 104 }
  },

  // ─── FAR NORTH JUNCTIONS ────────────────────────────────────────────────────
  'jct-far-north': {
    id: 'jct-far-north',
    name: 'Pasillo Norte (Ed.12/Ed.8)',
    type: 'junction',
    coordinates: { x: 250, y: 200 }
  },

  // ─── BUILDING: Ed.4 ─────────────────────────────────────────────────────────
  'building-4': {
    id: 'building-4',
    name: 'Edificio 4',
    type: 'building',
    buildingId: '4',
    coordinates: { x: 792, y: 170 }
  },

  // ─── JARDÍN DEL OSO ─────────────────────────────────────────────────────────
  'jardin-oso-node': {
    id: 'jardin-oso-node',
    name: 'Jardín del Oso de FIME',
    type: 'landmark',
    coordinates: { x: 705, y: 695 }
  },

  // ─── BUILDING: Ed.10 / CIIIA (tentative) ────────────────────────────────────
  'building-10': {
    id: 'building-10',
    name: 'Edificio 10 / CCIT',
    type: 'building',
    buildingId: '10',
    coordinates: { x: 893, y: 635 }
  }
};

// ─── ROUTE EDGES (CAMPUS WALKWAYS) ────────────────────────────────────────────
// Distances are approximate walking weights (higher = longer).
export const ROUTE_EDGES: RouteEdge[] = [

  // ── ENTRANCE → SOUTH JUNCTIONS ─────────────────────────────────────────────
  { from: 'entrance-main',    to: 'jct-south-center',  distance: 58,  description: 'Entrada al campus — pasillo principal' },
  { from: 'jct-south-center', to: 'jct-south-left',    distance: 137, description: 'Desvío oeste hacia Edificio 7 / CIDET' },
  { from: 'jct-south-center', to: 'jct-south-right',   distance: 140, description: 'Desvío este hacia Edificio 1 / 11' },

  // ── SOUTH → ED.1 / ED.11 ────────────────────────────────────────────────────
  { from: 'jct-south-right',  to: 'building-1',        distance: 70,  description: 'Acceso al Edificio 1' },
  { from: 'building-1',       to: 'building-11',        distance: 90,  description: 'Pasillo entre Edificio 1 y Edificio 11' },
  { from: 'building-11',      to: 'building-9',         distance: 105, description: 'Pasillo norte hacia Edificio 9' },
  { from: 'building-11',      to: 'building-10',        distance: 110, description: 'Pasillo hacia CCIT' },

  // ── SOUTH → CENTER (Auditorio / Ed.2) ───────────────────────────────────────
  { from: 'jct-south-right',  to: 'landmark-auditorio', distance: 100, description: 'Pasillo al Auditorio Jorge Urencio' },
  { from: 'landmark-auditorio', to: 'jct-center-east',  distance: 80,  description: 'Pasillo hacia la zona central-este' },
  { from: 'jct-center-east',  to: 'building-2',         distance: 45,  description: 'Acceso este al Edificio 2' },
  { from: 'jct-center-east',  to: 'building-9',         distance: 120, description: 'Pasillo norte al Edificio 9' },
  { from: 'jct-center-east',  to: 'jct-north-east',     distance: 230, description: 'Pasillo norte-este (Ed.3, Ed.4)' },

  // ── CENTER (CAFETERÍA / PASILLO CENTRAL) ────────────────────────────────────
  { from: 'jct-south-center', to: 'jct-center-main',   distance: 168, description: 'Pasillo central hacia la cafetería' },
  { from: 'jct-center-main',  to: 'cafeteria-node',     distance: 104, description: 'Llegas a la Cafetería y Snack FIME' },
  { from: 'jct-center-main',  to: 'jct-center-east',   distance: 223, description: 'Pasillo central-este hacia Ed.2' },
  { from: 'jct-center-main',  to: 'jct-west-main',     distance: 257, description: 'Pasillo central-oeste hacia Ed.5/Ed.7' },
  { from: 'cafeteria-node',   to: 'building-2',         distance: 100, description: 'Ed.2 está justo al norte de la cafetería' },
  { from: 'cafeteria-node',   to: 'building-5',         distance: 115, description: 'Ed.5 está al oeste de la cafetería' },

  // ── WEST (Ed.5 / Ed.7 / CIDET) ──────────────────────────────────────────────
  { from: 'jct-west-main',    to: 'building-7',         distance: 70,  description: 'Acceso al Edificio 7 (sur)' },
  { from: 'jct-west-main',    to: 'building-5',         distance: 148, description: 'Acceso al Edificio 5' },
  { from: 'jct-south-left',   to: 'building-cidet',     distance: 60,  description: 'Acceso al CIDET' },
  { from: 'jct-south-left',   to: 'building-7',         distance: 145, description: 'Pasillo norte hacia Edificio 7' },
  { from: 'building-cidet',   to: 'building-5',         distance: 120, description: 'Pasillo norte de CIDET hacia Ed.5' },

  // ── NORTH-WEST (Ed.6 / Ed.8 / Ed.12) ───────────────────────────────────────
  { from: 'building-5',       to: 'jct-north-west',     distance: 95,  description: 'Pasillo norte del Edificio 5' },
  { from: 'jct-north-west',   to: 'building-6',         distance: 80,  description: 'Acceso al Edificio 6' },
  { from: 'jct-north-west',   to: 'jct-north-center',   distance: 187, description: 'Pasillo hacia la zona norte central' },
  { from: 'building-6',       to: 'jct-far-north',      distance: 130, description: 'Pasillo norte desde Ed.6' },
  { from: 'jct-far-north',    to: 'building-8',         distance: 85,  description: 'Acceso al Edificio 8' },
  { from: 'jct-far-north',    to: 'building-12',        distance: 140, description: 'Acceso a la Biblioteca (Ed.12)' },

  // ── NORTH-CENTER (Ed.3) ─────────────────────────────────────────────────────
  { from: 'jct-north-center', to: 'building-3',         distance: 90,  description: 'Acceso al Edificio 3' },
  { from: 'jct-north-center', to: 'jct-north-east',     distance: 190, description: 'Pasillo norte-este hacia Ed.4' },
  { from: 'building-3',       to: 'building-9',         distance: 120, description: 'Pasillo sur desde Ed.3 hacia Ed.9' },

  // ── NORTH-EAST (Ed.4) ───────────────────────────────────────────────────────
  { from: 'jct-north-east',   to: 'building-4',         distance: 65,  description: 'Acceso al Edificio 4' },
  { from: 'building-4',       to: 'building-3',         distance: 120, description: 'Pasillo sur hacia Ed.3' },

  // ── JARDÍN DEL OSO ──────────────────────────────────────────────────────────
  { from: 'jct-south-right',  to: 'jardin-oso-node',    distance: 90,  description: 'Jardín del Oso — al sureste del campus' },
  { from: 'building-1',       to: 'jardin-oso-node',    distance: 90,  description: 'Frente al Edificio 1, sureste' },
];
