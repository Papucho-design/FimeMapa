// Validación de un salón. La usan el panel admin (navegador) y las funciones de
// Cloudflare (servidor): así las reglas son idénticas en ambos lados.
// El servidor SIEMPRE vuelve a validar; la del navegador es solo comodidad.

export const VALID_BUILDINGS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', 'cidet'];

export const ROOM_TYPES = [
  'classroom',
  'laboratory',
  'physics-laboratory',
  'computer-lab',
  'auditorium',
  'office',
  'other',
];

export const MAX_FLOOR = 6;

const fail = (error) => ({ ok: false, error });

const text = (v, max) => {
  // eslint-disable-next-line no-control-regex
  const s = String(v ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim();
  return s.length > max ? null : s;
};

/**
 * @param {unknown} input
 * @returns {{ok: true, room: object} | {ok: false, error: string}}
 */
export function validarSalon(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return fail('Datos del salón inválidos.');
  }

  const id = String(input.id ?? '').trim().toUpperCase();
  if (!/^[A-Z0-9][A-Z0-9-]{0,29}$/.test(id)) {
    return fail('El código solo admite letras, números y guiones (máx. 30).');
  }

  const building = String(input.building ?? '').trim().toLowerCase();
  if (!VALID_BUILDINGS.includes(building)) return fail('Edificio inválido.');

  const floor = Number(input.floor);
  if (!Number.isInteger(floor) || floor < 0 || floor > MAX_FLOOR) {
    return fail(`El piso debe estar entre 0 y ${MAX_FLOOR}.`);
  }

  if (!ROOM_TYPES.includes(input.type)) return fail('Tipo de salón inválido.');

  const displayName = text(input.displayName, 40);
  if (!displayName) return fail('El nombre mostrado es obligatorio (máx. 40 caracteres).');

  const name = text(input.name, 100);
  if (name === null) return fail('El nombre propio es demasiado largo (máx. 100).');

  const notes = text(input.notes, 500);
  if (notes === null) return fail('La referencia es demasiado larga (máx. 500).');

  let tags = [];
  if (input.tags !== undefined) {
    if (!Array.isArray(input.tags) || input.tags.length > 10) return fail('Máximo 10 etiquetas.');
    for (const t of input.tags) {
      const s = text(t, 30);
      if (s === null) return fail('Cada etiqueta admite máx. 30 caracteres.');
      if (s) tags.push(s.toLowerCase());
    }
    tags = [...new Set(tags)];
  }

  const room = { id, displayName, building, floor, type: input.type, verified: input.verified === true };
  if (name) room.name = name;
  if (notes) room.notes = notes;
  if (tags.length) room.tags = tags;
  return { ok: true, room };
}
