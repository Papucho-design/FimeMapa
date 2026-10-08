import React, { useEffect, useMemo, useState } from 'react';
import { ImagePlus, Trash2, Save, X, Loader2 } from 'lucide-react';
import type { Room, RoomType } from '../types';
import { ROOM_TYPES, ROOM_TYPE_LABEL } from '../data/roomTypes';
import { BUILDINGS } from '../data/buildings';
import { normalizeRoomQuery } from '../utils/roomNormalizer';
import { blobToBase64, compressToWebp, roomPhotoUrl } from '../utils/photos';
import { floorLabel } from '../utils/floors';
import { validarSalon } from '../../shared/validarSalon.js';

export interface RoomFormResult {
  room: Room;
  photoBase64?: string;
  removePhoto?: boolean;
}

interface RoomFormProps {
  initial: Room | null; // null = salón nuevo
  existingIds: Set<string>;
  saving: boolean;
  onSubmit: (result: RoomFormResult) => void;
  onCancel: () => void;
}

const MAX_PHOTO_BYTES = 1_500_000;
const field =
  'mt-1 w-full border-2 border-slate-200 focus:border-emerald-600 rounded-xl px-3 py-2.5 text-sm font-medium bg-white outline-none';

export const RoomForm: React.FC<RoomFormProps> = ({ initial, existingIds, saving, onSubmit, onCancel }) => {
  const isNew = initial === null;
  const [id, setId] = useState(initial?.id ?? '');
  const [displayName, setDisplayName] = useState(initial?.displayName ?? '');
  const [building, setBuilding] = useState(initial?.building ?? '');
  const [floor, setFloor] = useState(initial?.floor ?? 1);
  const [type, setType] = useState<RoomType>(initial?.type ?? 'classroom');
  const [name, setName] = useState(initial?.name ?? '');
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [tags, setTags] = useState((initial?.tags ?? []).join(', '));
  const [verified, setVerified] = useState(initial?.verified ?? false);
  const [autoFill, setAutoFill] = useState(isNew);

  const [photoBlob, setPhotoBlob] = useState<Blob | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | undefined>(roomPhotoUrl(initial?.photo));
  const [removePhoto, setRemovePhoto] = useState(false);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [error, setError] = useState('');

  // Libera la URL temporal de la vista previa
  useEffect(() => {
    return () => {
      if (photoPreview?.startsWith('blob:')) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);

  // Al escribir el código de un salón nuevo se sugieren edificio, piso y nombre mostrado
  const onCodeChange = (value: string) => {
    setId(value);
    if (!autoFill) return;
    const n = normalizeRoomQuery(value);
    if (n && !n.displayName.startsWith('Edificio ')) {
      setBuilding(n.buildingId);
      setFloor(n.floor);
      setDisplayName(n.displayName);
      if (n.type) setType(n.type as RoomType);
    }
  };

  const touch = <T,>(setter: (v: T) => void) => (v: T) => {
    setAutoFill(false);
    setter(v);
  };

  const duplicate = useMemo(
    () => isNew && existingIds.has(id.trim().toUpperCase()),
    [isNew, id, existingIds],
  );

  const handlePhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setError('');
    setPhotoBusy(true);
    try {
      const blob = await compressToWebp(file);
      if (blob.size > MAX_PHOTO_BYTES) throw new Error('La foto sigue siendo muy pesada. Prueba con otra.');
      setPhotoBlob(blob);
      setRemovePhoto(false);
      setPhotoPreview(URL.createObjectURL(blob));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo procesar la foto.');
    } finally {
      setPhotoBusy(false);
    }
  };

  const clearPhoto = () => {
    setPhotoBlob(null);
    setPhotoPreview(undefined);
    setRemovePhoto(!!initial?.photo);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (duplicate) {
      setError('Ya existe un salón con ese código. Edítalo desde la lista.');
      return;
    }
    const result = validarSalon({
      id,
      displayName,
      building,
      floor,
      type,
      name,
      notes,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      verified,
    });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    const room: Room = { ...result.room, photo: removePhoto ? undefined : initial?.photo };
    onSubmit({
      room,
      photoBase64: photoBlob ? await blobToBase64(photoBlob) : undefined,
      removePhoto: removePhoto || undefined,
    });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-extrabold text-slate-900">{isNew ? 'Nuevo salón' : `Editar ${initial.displayName}`}</h2>
        <button type="button" onClick={onCancel} className="p-1.5 rounded-lg hover:bg-slate-100" aria-label="Cancelar">
          <X className="w-5 h-5 text-slate-500" />
        </button>
      </div>

      <label className="block text-xs font-bold text-slate-700">
        Código
        <input
          value={id}
          onChange={(e) => onCodeChange(e.target.value)}
          disabled={!isNew}
          placeholder="7215, 6F11, 12202…"
          className={`${field} disabled:bg-slate-100 disabled:text-slate-500`}
        />
        {duplicate && <span className="text-red-600 font-semibold">Ese código ya existe.</span>}
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="block text-xs font-bold text-slate-700">
          Edificio
          <select value={building} onChange={(e) => touch(setBuilding)(e.target.value)} className={field}>
            <option value="">Elegir…</option>
            {Object.values(BUILDINGS).map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-xs font-bold text-slate-700">
          Piso
          <select value={floor} onChange={(e) => touch(setFloor)(Number(e.target.value))} className={field}>
            {[0, 1, 2, 3, 4, 5, 6].map((f) => (
              <option key={f} value={f}>
                {floorLabel(f)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="block text-xs font-bold text-slate-700">
          Se muestra como
          <input value={displayName} onChange={(e) => touch(setDisplayName)(e.target.value)} placeholder="7-215" className={field} />
        </label>
        <label className="block text-xs font-bold text-slate-700">
          Tipo
          <select value={type} onChange={(e) => setType(e.target.value as RoomType)} className={field}>
            {ROOM_TYPES.map((t) => (
              <option key={t} value={t}>
                {ROOM_TYPE_LABEL[t]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="block text-xs font-bold text-slate-700">
        Nombre propio (opcional)
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Laboratorio de Redes y Computación" className={field} />
      </label>

      <label className="block text-xs font-bold text-slate-700">
        Referencia para llegar (opcional)
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          maxLength={500}
          placeholder="Al fondo del pasillo, junto a las escaleras del lado oriente."
          className={field}
        />
      </label>

      <label className="block text-xs font-bold text-slate-700">
        Etiquetas de búsqueda (separadas por coma)
        <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="lab redes, computación" className={field} />
      </label>

      <label className="flex items-start gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-900 cursor-pointer">
        <input type="checkbox" checked={verified} onChange={(e) => setVerified(e.target.checked)} className="mt-0.5 w-4 h-4 accent-emerald-700" />
        <span>
          <span className="font-bold block">Ubicación verificada</span>
          Márcalo solo si alguien estuvo físicamente en el salón y confirmó edificio, piso y referencia.
        </span>
      </label>

      <div className="space-y-2">
        <span className="block text-xs font-bold text-slate-700">Foto (se comprime a WebP, máx. 800 px)</span>
        {photoPreview ? (
          <div className="relative">
            <img src={photoPreview} alt="Vista previa" className="w-full h-44 object-cover rounded-xl border border-slate-200" />
            <button
              type="button"
              onClick={clearPhoto}
              className="absolute top-2 right-2 bg-white/95 hover:bg-white text-red-600 rounded-lg p-2 shadow"
              aria-label="Quitar foto"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center gap-1.5 border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl py-6 text-xs font-semibold text-slate-500 cursor-pointer">
            {photoBusy ? <Loader2 className="w-6 h-6 animate-spin" /> : <ImagePlus className="w-6 h-6" />}
            {photoBusy ? 'Procesando…' : 'Tomar o elegir una foto'}
            <input type="file" accept="image/*" onChange={handlePhoto} className="sr-only" />
          </label>
        )}
      </div>

      {error && (
        <p className="text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-xl p-3" role="alert">
          {error}
        </p>
      )}

      <div className="flex gap-2 pt-1">
        <button type="button" onClick={onCancel} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm py-3 rounded-xl">
          Cancelar
        </button>
        <button
          type="submit"
          disabled={saving || photoBusy}
          className="flex-1 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white font-extrabold text-sm py-3 rounded-xl flex items-center justify-center gap-2"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Guardando…' : 'Guardar'}
        </button>
      </div>
    </form>
  );
};
