/** Etiqueta legible de un nivel. 0 = planta baja / nivel 0. */
export function floorLabel(floor: number): string {
  if (floor === 0) return 'Planta baja (nivel 0)';
  if (floor === 1) return '1.er piso';
  if (floor === 2) return '2.º piso';
  if (floor === 3) return '3.er piso';
  return `${floor}.º piso`;
}

/** Forma corta para frases: "segundo piso". */
export function floorWords(floor: number): string {
  const words = ['planta baja', 'primer', 'segundo', 'tercer', 'cuarto', 'quinto', 'sexto'];
  const w = words[floor];
  if (floor === 0) return 'planta baja';
  return w ? `${w} piso` : `piso ${floor}`;
}
