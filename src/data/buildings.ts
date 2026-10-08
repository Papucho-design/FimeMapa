import type { Building } from '../types';

/**
 * Building positions are derived from the real FIME campus layout (Google Maps reference).
 * SVG viewBox: "0 0 1000 750"
 * Orientation: North = top, South = bottom (entrance is at the south).
 *
 * Spatial distribution (west→east, north→south):
 *   TOP-LEFT:     Ed.8 (dark navy), Ed.12/Biblioteca (above Ed.6)
 *   TOP-RIGHT:    Ed.4 (pink/large), Ed.3 (gray horizontal), Ed.9 (purple)
 *   CENTER-LEFT:  Ed.6 (orange, above Ed.5), Ed.5 (light blue, large)
 *   CENTER:       Ed.2 (cyan wide horizontal), Cafetería
 *   FAR-LEFT:     Ed.7 (red, tall), CIDET (below Ed.5)
 *   BOTTOM-RIGHT: Ed.1 (orange-red), Ed.11 (brown)
 *   ENTRANCE:     south edge, center-right
 */
export const BUILDINGS: Record<string, Building> = {
  '7': {
    id: '7',
    name: 'Edificio 7',
    category: 'Laboratorios',
    description: 'Laboratorios de Electrónica, Control, Microondas, Señales, Cisco, Video y Máquinas Eléctricas.',
    floorCount: 3,
    pattern: '7XXX',
    examples: ['7101','7213','7214','7215','7222','7223','CTL1','DIG1','LELE'],
    coordinates: { x: 68, y: 400, width: 165, height: 245 },
    entranceLocation: 'Entrada este del edificio, frente al pasillo central',
    photoUrl: '/assets/fime/buildings/edificio7.svg'
  },
  '5': {
    id: '5',
    name: 'Edificio 5',
    category: 'Laboratorios',
    description: 'Laboratorios de Mecatrónica, Mecánica, Automatización, Alumbrado y Posgrado.',
    floorCount: 2,
    pattern: '5XXX',
    examples: ['5000','5001','5101','5106','LALU','LLIN','LMD1','LMD2'],
    coordinates: { x: 255, y: 345, width: 265, height: 235 },
    entranceLocation: 'Frente al pasillo central (lado este)',
    photoUrl: '/assets/fime/buildings/edificio5.svg'
  },
  '6': {
    id: '6',
    name: 'Edificio 6',
    category: 'Laboratorios',
    description: 'Aulas de Física, laboratorios de Biofísica (LBF1–LBF4) y oficinas académicas.',
    floorCount: 4,
    pattern: '6XXX / LBFx',
    examples: ['6201','6202','6301','LBF1','LBF2','LBF3','LBF4'],
    coordinates: { x: 308, y: 186, width: 158, height: 148 },
    entranceLocation: 'Entrada principal frente a pasillo norte-central',
    photoUrl: '/assets/fime/buildings/edificio6.svg'
  },
  '8': {
    id: '8',
    name: 'Edificio 8',
    category: 'Laboratorios',
    description: 'Talleres pesados, manufactura, fundición, Lab. de Refrigeración (LREF) y Transferencia de Calor.',
    floorCount: 3,
    pattern: '8XXX',
    examples: ['8100','8201','8203','8300','LREF','LTER','LTRAN'],
    coordinates: { x: 66, y: 68, width: 195, height: 205 },
    entranceLocation: 'Entrada sur, frente a Ed.12 y estacionamiento',
    photoUrl: '/assets/fime/buildings/edificio8.svg'
  },
  '12': {
    id: '12',
    name: 'Edificio 12 / Biblioteca',
    category: 'Biblioteca',
    description: 'Biblioteca Ing. Guadalupe E. Cedillo. Laboratorios de cómputo (12ROB, 12PLC, 12LIA) y aulas.',
    floorCount: 3,
    pattern: '12XXX',
    examples: ['12201','12203','12204','12ROB','12PLC','12LIA','LBIO','LSUB'],
    coordinates: { x: 278, y: 12, width: 225, height: 92 },
    entranceLocation: 'Entrada principal vidriada (sur) con rampa de acceso',
    photoUrl: '/assets/fime/buildings/edificio12.svg'
  },
  '4': {
    id: '4',
    name: 'Edificio 4',
    category: 'Aulas',
    description: 'Aulas generales, salas de cómputo especializadas y Auditorio 4 (AUD4).',
    floorCount: 3,
    pattern: '4XXX',
    examples: ['4100','4102','4200','4201','4211','AUD4'],
    coordinates: { x: 692, y: 38, width: 200, height: 165 },
    entranceLocation: 'Entrada sur, sobre pasillo norte principal',
    photoUrl: '/assets/fime/buildings/edificio4.svg'
  },
  '3': {
    id: '3',
    name: 'Edificio 3',
    category: 'Aulas',
    description: 'Salones para clases teóricas y talleres de dibujo técnico.',
    floorCount: 3,
    pattern: '3XXX',
    examples: ['3101','3201','3301','3302','3307'],
    coordinates: { x: 572, y: 262, width: 285, height: 78 },
    entranceLocation: 'Entrada oeste, frente a la explanada central',
    photoUrl: '/assets/fime/buildings/edificio3.svg'
  },
  '9': {
    id: '9',
    name: 'Edificio 9',
    category: 'Aulas',
    description: 'Aulas generales, prefectura y servicios estudiantiles.',
    floorCount: 3,
    pattern: '9XXX',
    examples: ['9102','9103','9201','9301','9304'],
    coordinates: { x: 798, y: 300, width: 158, height: 128 },
    entranceLocation: 'Entrada oeste, frente al pasillo sur',
    photoUrl: '/assets/fime/buildings/edificio9.svg'
  },
  '2': {
    id: '2',
    name: 'Edificio 2',
    category: 'Aulas',
    description: 'Edificio central de aulas, de gran capacidad. Próximo al Auditorio Jorge Urencio.',
    floorCount: 3,
    pattern: '2XXX',
    examples: ['2101','2107','2201','2300','2301','2303'],
    coordinates: { x: 518, y: 400, width: 318, height: 90 },
    entranceLocation: 'Múltiples accesos: norte, sur y oeste',
    photoUrl: '/assets/fime/buildings/edificio2.svg'
  },
  '1': {
    id: '1',
    name: 'Edificio 1',
    category: 'Aulas',
    description: 'Aulas de primeros semestres, administración escolar y Facultad.',
    floorCount: 3,
    pattern: '1XXX',
    examples: ['1101','1102','1201','1301','1302'],
    coordinates: { x: 608, y: 547, width: 206, height: 98 },
    entranceLocation: 'Entrada norte sobre el pasillo peatonal principal',
    photoUrl: '/assets/fime/buildings/edificio1.svg'
  },
  '11': {
    id: '11',
    name: 'Edificio 11',
    category: 'Servicios',
    description: 'Coordinación de becas, trámites escolares y Auditorio Jorge Urencio.',
    floorCount: 3,
    pattern: '11XX',
    examples: ['Becas','Auditorio'],
    coordinates: { x: 768, y: 490, width: 155, height: 84 },
    entranceLocation: 'Entrada oeste, frente al pasillo sur-este',
    photoUrl: '/assets/fime/buildings/edificio11.svg'
  },
  '10': {
    id: '10',
    name: 'Edificio 10 / CCIT',
    category: 'Administración',
    description: 'Centro de Competitividad e Innovación Tecnológica (CCIT).',
    floorCount: 2,
    pattern: '10XX',
    examples: ['CCIT'],
    coordinates: { x: 835, y: 600, width: 115, height: 68 },
    entranceLocation: 'Posición preliminar – pendiente de verificar físicamente',
    photoUrl: '/assets/fime/buildings/edificio10.svg'
  },
  'cidet': {
    id: 'cidet',
    name: 'CIDET',
    category: 'Laboratorios',
    description: 'Centro de Investigación y Desarrollo Tecnológico. Incluye LABQ1, LABQ2, VIDEO1-3.',
    floorCount: 2,
    pattern: 'CIDET',
    examples: ['LABQ1','LABQ2','LDOC','VIDEO 1','VIDEO 2','5301','5302'],
    coordinates: { x: 248, y: 614, width: 245, height: 86 },
    entranceLocation: 'Entrada norte, frente al pasillo central sur',
    photoUrl: '/assets/fime/buildings/edificio10.svg'
  }
};
