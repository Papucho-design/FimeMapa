import React, { useMemo, useState } from 'react';
import { ArrowLeft, Plus, Pencil, Trash2, Download, LogOut, Lock, Loader2, CheckCircle2, AlertCircle, Search, Camera } from 'lucide-react';
import type { Room } from '../types';
import { BUILDINGS } from '../data/buildings';
import { ROOM_TYPE_LABEL } from '../data/roomTypes';
import { useRooms } from '../state/rooms-context';
import { ApiError, deleteRoom, login, saveRoom } from '../utils/api';
import { floorLabel } from '../utils/floors';
import { RoomForm, type RoomFormResult } from './RoomForm';

const SESSION_KEY = 'ubicfime:admin';

const readSession = () => {
  try {
    return sessionStorage.getItem(SESSION_KEY) ?? '';
  } catch {
    return '';
  }
};
const writeSession = (v: string) => {
  try {
    if (v) sessionStorage.setItem(SESSION_KEY, v);
    else sessionStorage.removeItem(SESSION_KEY);
  } catch {
    /* sin sessionStorage: la contraseña solo vive en memoria */
  }
};

interface AdminPanelProps {
  onExit: () => void;
}

export default function AdminPanel({ onExit }: AdminPanelProps) {
  const { rooms, upsertRoom, removeRoom } = useRooms();

  const [password, setPassword] = useState(readSession);
  const [authed, setAuthed] = useState(false);
  const [loginBusy, setLoginBusy] = useState(false);
  const [loginError, setLoginError] = useState('');

  const [editing, setEditing] = useState<Room | 'new' | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'ok' | 'error'; text: string } | null>(null);

  const [q, setQ] = useState('');
  const [buildingFilter, setBuildingFilter] = useState('');
  const [onlyPending, setOnlyPending] = useState(false);

  const existingIds = useMemo(() => new Set(rooms.map((r) => r.id)), [rooms]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return rooms.filter((r) => {
      if (buildingFilter && r.building !== buildingFilter) return false;
      if (onlyPending && r.verified) return false;
      if (!term) return true;
      return [r.id, r.displayName, r.name ?? '', ...(r.tags ?? [])].some((s) => s.toLowerCase().includes(term));
    });
  }, [rooms, q, buildingFilter, onlyPending]);

  const pendingCount = useMemo(() => rooms.filter((r) => !r.verified).length, [rooms]);

  const doLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginBusy(true);
    setLoginError('');
    try {
      await login(password);
      writeSession(password);
      setAuthed(true);
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : 'No se pudo iniciar sesión.');
    } finally {
      setLoginBusy(false);
    }
  };

  const logout = () => {
    writeSession('');
    setPassword('');
    setAuthed(false);
  };

  const handleError = (err: unknown) => {
    if (err instanceof ApiError && err.status === 401) {
      logout();
      setLoginError('La contraseña ya no es válida. Vuelve a ingresarla.');
      return;
    }
    setToast({ type: 'error', text: err instanceof Error ? err.message : 'Error al guardar.' });
  };

  const handleSubmit = async ({ room, photoBase64, removePhoto }: RoomFormResult) => {
    setSaving(true);
    setToast(null);
    try {
      const res = await saveRoom(password, room, { photoBase64, removePhoto });
      upsertRoom(res.room);
      setEditing(null);
      setToast({ type: 'ok', text: `Guardado ${res.room.displayName}. La web pública se actualiza en ~1 minuto.` });
    } catch (err) {
      handleError(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (room: Room) => {
    if (!window.confirm(`¿Eliminar el salón ${room.displayName}? Esta acción queda registrada en el historial de GitHub.`)) return;
    setToast(null);
    try {
      await deleteRoom(password, room.id);
      removeRoom(room.id);
      setToast({ type: 'ok', text: `Eliminado ${room.displayName}.` });
    } catch (err) {
      handleError(err);
    }
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(rooms, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `salones-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  /* ───────────── Pantalla de acceso ───────────── */
  if (!authed) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <form onSubmit={doLogin} className="w-full max-w-sm bg-white rounded-3xl border border-slate-200 shadow-lg p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-700 text-white flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-slate-900 leading-tight">Panel de editores</h1>
              <p className="text-xs text-slate-500">UbicFIME</p>
            </div>
          </div>

          <label className="block text-xs font-bold text-slate-700">
            Contraseña
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              autoFocus
              className="mt-1 w-full border-2 border-slate-200 focus:border-emerald-600 rounded-xl px-3 py-2.5 text-sm outline-none"
            />
          </label>

          {loginError && (
            <p className="text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-xl p-3" role="alert">
              {loginError}
            </p>
          )}

          <button
            type="submit"
            disabled={!password || loginBusy}
            className="w-full bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white font-extrabold text-sm py-3 rounded-xl flex items-center justify-center gap-2"
          >
            {loginBusy && <Loader2 className="w-4 h-4 animate-spin" />}
            Entrar
          </button>
          <button type="button" onClick={onExit} className="w-full text-xs font-semibold text-slate-500 hover:text-slate-800">
            Volver a la app
          </button>
        </form>
      </div>
    );
  }

  /* ───────────── Formulario ───────────── */
  if (editing) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-md mx-auto p-4 pb-12">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5">
            <RoomForm
              initial={editing === 'new' ? null : editing}
              existingIds={existingIds}
              saving={saving}
              onSubmit={handleSubmit}
              onCancel={() => setEditing(null)}
            />
          </div>
          {toast?.type === 'error' && (
            <p className="mt-3 text-xs font-semibold text-red-600 bg-red-50 border border-red-200 rounded-xl p-3" role="alert">
              {toast.text}
            </p>
          )}
        </div>
      </div>
    );
  }

  /* ───────────── Lista ───────────── */
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-2">
          <button onClick={onExit} className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900">
            <ArrowLeft className="w-4 h-4" /> App
          </button>
          <h1 className="text-sm font-extrabold text-slate-900">Editar salones</h1>
          <div className="flex items-center gap-1">
            <button onClick={exportJson} className="p-2 rounded-lg hover:bg-slate-100 text-slate-600" title="Descargar respaldo JSON" aria-label="Descargar respaldo JSON">
              <Download className="w-4 h-4" />
            </button>
            <button onClick={logout} className="p-2 rounded-lg hover:bg-slate-100 text-slate-600" title="Cerrar sesión" aria-label="Cerrar sesión">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {toast && (
          <div
            role="status"
            className={`flex items-start gap-2 text-xs font-semibold rounded-xl p-3 border ${
              toast.type === 'ok' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-700'
            }`}
          >
            {toast.type === 'ok' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            {toast.text}
          </div>
        )}

        <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar por código o nombre"
                className="w-full border-2 border-slate-200 focus:border-emerald-600 rounded-xl pl-9 pr-3 py-2 text-sm outline-none"
              />
            </div>
            <button
              onClick={() => setEditing('new')}
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm px-3.5 py-2 rounded-xl inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Nuevo
            </button>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <select
              value={buildingFilter}
              onChange={(e) => setBuildingFilter(e.target.value)}
              className="border-2 border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold bg-white"
              aria-label="Filtrar por edificio"
            >
              <option value="">Todos los edificios</option>
              {Object.values(BUILDINGS).map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
            <label className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 cursor-pointer">
              <input type="checkbox" checked={onlyPending} onChange={(e) => setOnlyPending(e.target.checked)} className="w-4 h-4 accent-emerald-700" />
              Solo por verificar ({pendingCount})
            </label>
            <span className="text-xs text-slate-400 ml-auto">
              {filtered.length} de {rooms.length}
            </span>
          </div>
        </div>

        <ul className="space-y-2">
          {filtered.map((room) => (
            <li key={room.id} className="bg-white rounded-2xl border border-slate-200 px-4 py-3 flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-slate-900">{room.displayName}</span>
                  {room.verified ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" aria-label="Verificado" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" aria-label="Por verificar" />
                  )}
                  {room.photo && <Camera className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-label="Con foto" />}
                </div>
                <p className="text-[11px] text-slate-500 truncate">
                  {room.name ? `${room.name} · ` : ''}
                  {ROOM_TYPE_LABEL[room.type]} · {BUILDINGS[room.building]?.name ?? room.building} · {floorLabel(room.floor)}
                </p>
              </div>
              <button onClick={() => setEditing(room)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-600" aria-label={`Editar ${room.displayName}`}>
                <Pencil className="w-4 h-4" />
              </button>
              <button onClick={() => handleDelete(room)} className="p-2 rounded-lg hover:bg-red-50 text-red-500" aria-label={`Eliminar ${room.displayName}`}>
                <Trash2 className="w-4 h-4" />
              </button>
            </li>
          ))}
          {filtered.length === 0 && <li className="text-center text-sm text-slate-500 py-10">No hay salones con esos filtros.</li>}
        </ul>
      </main>
    </div>
  );
}
