import type { Room } from '../types';
import salones from './salones.json';

/**
 * Catálogo inicial de salones. La fuente de verdad es `salones.json`:
 * el panel de edición lo modifica con commits al repositorio (ver functions/api/guardar.js).
 */
export const SEED_ROOMS = salones as Room[];
