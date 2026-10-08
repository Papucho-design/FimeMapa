import { useCallback, useState } from 'react';

/** localStorage que nunca lanza (modo privado, cuota llena, etc.). */
export function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeJSON(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* sin almacenamiento disponible: se ignora */
  }
}

/** Lista corta de strings persistida (recientes, favoritos). */
export function usePersistentList(key: string, max: number) {
  const [items, setItems] = useState<string[]>(() => {
    const v = readJSON<unknown>(key, []);
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string').slice(0, max) : [];
  });

  const update = useCallback(
    (fn: (prev: string[]) => string[]) => {
      setItems((prev) => {
        const next = fn(prev).slice(0, max);
        writeJSON(key, next);
        return next;
      });
    },
    [key, max],
  );

  /** Agrega al inicio sin duplicar. */
  const push = useCallback((value: string) => update((p) => [value, ...p.filter((x) => x !== value)]), [update]);
  const remove = useCallback((value: string) => update((p) => p.filter((x) => x !== value)), [update]);
  const toggle = useCallback(
    (value: string) => update((p) => (p.includes(value) ? p.filter((x) => x !== value) : [value, ...p])),
    [update],
  );

  return { items, push, remove, toggle };
}
