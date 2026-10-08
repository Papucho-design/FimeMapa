export interface FimePhoto {
  id: string;
  title: string;
  category: 'building' | 'landmark' | 'interior' | 'route';
  url: string;
  caption: string;
  targetId?: string;
}

export const FIME_PHOTOS: Record<string, FimePhoto> = {
  'entrance-main': {
    id: 'entrance-main',
    title: 'Entrada Principal',
    category: 'landmark',
    url: '/assets/fime/landmarks/entrada_principal.svg',
    caption: 'Acceso peatonal principal a la facultad desde Pedro de Alba.'
  },
  'jardin-oso': {
    id: 'jardin-oso',
    title: 'Jardín del Oso',
    category: 'landmark',
    url: '/assets/fime/landmarks/jardin_oso.svg',
    caption: 'Escultura del Oso y plazoleta central.'
  },
  'building-7': {
    id: 'building-7',
    title: 'Edificio 7',
    category: 'building',
    url: '/assets/fime/buildings/edificio7.svg',
    caption: 'Fachada principal del Edificio 7 de laboratorios y aulas.'
  },
  'building-6': {
    id: 'building-6',
    title: 'Edificio 6',
    category: 'building',
    url: '/assets/fime/buildings/edificio6.svg',
    caption: 'Edificio 6 (Aulas de Física y Laboratorios).'
  },
  'building-2': {
    id: 'building-2',
    title: 'Edificio 2',
    category: 'building',
    url: '/assets/fime/buildings/edificio2.svg',
    caption: 'Entrada al Edificio 2 de aulas.'
  },
  'building-12': {
    id: 'building-12',
    title: 'Edificio 12 / Biblioteca',
    category: 'building',
    url: '/assets/fime/buildings/edificio12.svg',
    caption: 'Fachada frontal de la Biblioteca Central.'
  },
  'cafeteria': {
    id: 'cafeteria',
    title: 'Cafetería Central',
    category: 'landmark',
    url: '/assets/fime/landmarks/cafeteria.svg',
    caption: 'Área exterior de la cafetería central.'
  },
  'cidet': {
    id: 'cidet',
    title: 'CIDET',
    category: 'landmark',
    url: '/assets/fime/landmarks/cidet.svg',
    caption: 'Fachada del Centro de Investigación.'
  }
};

export const getPhotoForTarget = (targetId: string): FimePhoto | null => {
  if (FIME_PHOTOS[targetId]) {
    return FIME_PHOTOS[targetId];
  }
  // Try building prefix
  if (targetId.startsWith('building-')) {
    const num = targetId.replace('building-', '');
    if (FIME_PHOTOS[`building-${num}`]) {
      return FIME_PHOTOS[`building-${num}`];
    }
  }
  return null;
};
