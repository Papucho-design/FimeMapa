export interface NormalizedRoomInfo {
  normalizedId: string;
  buildingId: string;
  floor: number;
  displayName: string;
  isRecognizedPattern: boolean;
  type?: string;
}

/**
 * Normalizes user queries for rooms in FIME UANL.
 * Handles inputs like:
 * "7215", "7-215", "7 215", "Edificio 7 salón 215", "6F11", "6-F-11", "12202", "12-202", etc.
 */
export function normalizeRoomQuery(rawQuery: string): NormalizedRoomInfo | null {
  if (!rawQuery || typeof rawQuery !== 'string') return null;

  const cleaned = rawQuery.trim().toUpperCase();
  if (!cleaned) return null;

  // 1. Remove fluff words: EDIFICIO, EDIF, SALON, SALÓN, AULA, LAB, LABORATORIO, PISO
  let processed = cleaned
    .replace(/\b(EDIFICIO|EDIF|SALON|SALÓN|AULA|LABORATORIO|LAB|PISO|NIVEL)\b/g, '')
    .trim();

  // 2. Physics special pattern: 6F11, 6-F-11, 6 F 11, 6/F/11, 6F-11
  const physicsMatch = processed.match(/^6\s*[-/]?\s*F\s*[-/]?\s*(\d{2})$/);
  if (physicsMatch) {
    const numStr = physicsMatch[1];
    const roomNum = parseInt(numStr, 10);
    // Floor is determined by tens digit in 6F11 -> 1, 6F21 -> 2, 6F31 -> 3, 6F41 -> 4
    const floor = Math.floor(roomNum / 10) || 1;
    const normalizedId = `6F${numStr}`;
    return {
      normalizedId,
      buildingId: '6',
      floor: Math.min(Math.max(floor, 1), 4),
      displayName: normalizedId,
      isRecognizedPattern: true,
      type: 'physics-laboratory'
    };
  }

  // 3. Remove hyphens, slashes, spaces between numbers
  // e.g. "7 - 215" -> "7215", "12 - 202" -> "12202", "7 215" -> "7215"
  const digitsOnly = processed.replace(/[\s\-/.]/g, '');

  // 4. Check for Building 12, 10, 11 patterns (5 digits e.g. 12202 or 12-202)
  const multiBuildingMatch = digitsOnly.match(/^(10|11|12)(\d)(\d{2})$/);
  if (multiBuildingMatch) {
    const bld = multiBuildingMatch[1];
    const floorDigit = parseInt(multiBuildingMatch[2], 10);
    const roomSuffix = multiBuildingMatch[3];
    return {
      normalizedId: `${bld}${multiBuildingMatch[2]}${roomSuffix}`,
      buildingId: bld,
      floor: floorDigit,
      displayName: `${bld}-${multiBuildingMatch[2]}${roomSuffix}`,
      isRecognizedPattern: true
    };
  }

  // 5. Standard 4-digit pattern e.g. 7215, 2301, 3301, 4100, 5000, 9001
  const standard4Digit = digitsOnly.match(/^([1-9])(\d)(\d{2})$/);
  if (standard4Digit) {
    const bld = standard4Digit[1];
    const floorDigit = parseInt(standard4Digit[2], 10);
    const roomSuffix = standard4Digit[3];
    return {
      normalizedId: `${bld}${standard4Digit[2]}${roomSuffix}`,
      buildingId: bld,
      floor: floorDigit,
      displayName: `${bld}-${standard4Digit[2]}${roomSuffix}`,
      isRecognizedPattern: true
    };
  }

  // 6. Separated pattern e.g. "7 215" or "7-215" where 215 is 3 digits
  const separatedMatch = processed.match(/^([1-9]|10|11|12)[\s\-/]+(\d{3})$/);
  if (separatedMatch) {
    const bld = separatedMatch[1];
    const room3Digit = separatedMatch[2];
    const floorDigit = parseInt(room3Digit[0], 10);
    const normalizedId = `${bld}${room3Digit}`;
    return {
      normalizedId,
      buildingId: bld,
      floor: floorDigit,
      displayName: `${bld}-${room3Digit}`,
      isRecognizedPattern: true
    };
  }

  // 7. Single building lookup fallback e.g. user just inputs "7" or "EDIFICIO 7"
  const singleBuildingMatch = processed.match(/^(12|11|10|[1-9])$/);
  if (singleBuildingMatch) {
    const bld = singleBuildingMatch[1];
    return {
      normalizedId: bld,
      buildingId: bld,
      floor: 1,
      displayName: `Edificio ${bld}`,
      isRecognizedPattern: true
    };
  }

  return null;
}
