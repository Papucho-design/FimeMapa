/** Convierte el campo `photo` de un salón en una URL usable por <img>. */
export function roomPhotoUrl(photo?: string): string | undefined {
  if (!photo) return undefined;
  if (/^(https?:|data:|blob:|\/)/i.test(photo)) return photo;
  return `/${photo}`;
}

/** Retorna la URL de fallback en GitHub raw para fotos recién subidas que aún no están en la compilación estática. */
export function roomPhotoFallbackUrl(photo?: string): string | undefined {
  if (!photo) return undefined;
  if (/^(https?:|data:|blob:)/i.test(photo)) return undefined;
  const path = photo.startsWith('/') ? photo.slice(1) : photo;
  return `https://raw.githubusercontent.com/Papucho-design/FimeMapa/main/public/${path}`;
}


const MAX_SIDE = 800;
const WEBP_QUALITY = 0.8;

/** Redimensiona (lado mayor 800 px) y comprime una imagen a WebP. */
export async function compressToWebp(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, w, h);
  bitmap.close?.();

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', WEBP_QUALITY));
  if (!blob || blob.type !== 'image/webp') {
    throw new Error('Este navegador no puede generar imágenes WebP.');
  }
  return blob;
}

export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = String(reader.result);
      resolve(result.includes(',') ? result.split(',')[1] : result);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}
