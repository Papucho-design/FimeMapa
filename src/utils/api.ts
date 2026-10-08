import type { Room } from '../types';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function post<T = { ok: true }>(path: string, body: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    throw new ApiError('Sin conexión con el servidor. Revisa tu internet e intenta de nuevo.', 0);
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(data.error || `Error ${res.status} del servidor`, res.status);
  return data as T;
}

/** Verifica la contraseña de editor. */
export const login = (password: string) => post('/api/login', { password });

/** Crea o actualiza un salón (y su foto) con un commit al repositorio. */
export const saveRoom = (
  password: string,
  room: Room,
  opts: { photoBase64?: string; removePhoto?: boolean } = {},
) => post<{ ok: true; room: Room }>('/api/guardar', { password, action: 'upsert', room, ...opts });

export const deleteRoom = (password: string, id: string) =>
  post('/api/guardar', { password, action: 'delete', id });

/** Reporte público de una ubicación incorrecta (no requiere contraseña). */
export const sendReport = (report: {
  roomId: string;
  roomLabel: string;
  message: string;
  contact?: string;
  website?: string; // honeypot: debe ir vacío
}) => post('/api/reportar', report);
