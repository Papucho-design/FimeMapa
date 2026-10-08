import React, { useMemo, useState } from 'react';
import { Search, Map, Building2, HelpCircle, ArrowRight, Compass, Star, History, X } from 'lucide-react';
import type { Room } from '../types';
import { BUILDINGS } from '../data/buildings';
import { suggestRooms } from '../utils/search';
import { useRooms } from '../state/rooms-context';
import { floorLabel } from '../utils/floors';

interface HomeScreenProps {
  onSearch: (query: string) => void;
  onOpenRoom: (room: Room) => void;
  onOpenMap: () => void;
  onOpenDirectory: () => void;
  onOpenWhereAmI: () => void;
  recents: string[];
  onRemoveRecent: (q: string) => void;
  favorites: Room[];
}

const sampleChips = ['7-215', '2301', '6F11', '12202', 'lab redes'];

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onSearch,
  onOpenRoom,
  onOpenMap,
  onOpenDirectory,
  onOpenWhereAmI,
  recents,
  onRemoveRecent,
  favorites,
}) => {
  const { index } = useRooms();
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);

  const live = useMemo(() => suggestRooms(query, index, 5), [query, index]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) onSearch(query.trim());
  };

  return (
    <div className="w-full max-w-md mx-auto px-4 py-6 space-y-6">
      <div className="bg-gradient-to-br from-emerald-800 via-emerald-700 to-slate-900 rounded-3xl p-6 text-white shadow-xl shadow-emerald-900/20 relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center gap-1 bg-amber-400/20 text-amber-300 text-xs font-bold px-2.5 py-0.5 rounded-full border border-amber-400/30">
            <Compass className="w-3.5 h-3.5" /> FIME UANL
          </span>
        </div>
        <h1 className="text-2xl font-black tracking-tight text-white mb-1">Encuentra tu salón sin perderte.</h1>
        <p className="text-xs text-emerald-100/90 leading-relaxed">
          Escribe tu salón o laboratorio y te guiaremos paso a paso desde la entrada principal o donde estés.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200/80 space-y-4">
        <div className="relative">
          <label htmlFor="room-input" className="block text-sm font-bold text-slate-800 mb-2">
            ¿Dónde es tu clase?
          </label>

          <div className="relative flex items-center">
            <input
              id="room-input"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setTimeout(() => setFocused(false), 120)}
              placeholder="Ej. 7-215 o lab de redes"
              autoComplete="off"
              enterKeyHint="search"
              className="w-full bg-slate-50 border-2 border-slate-200 focus:border-emerald-600 focus:bg-white text-slate-900 placeholder-slate-400 font-bold text-lg rounded-2xl py-3.5 pl-4 pr-14 transition-all outline-none"
            />
            <button
              type="submit"
              disabled={!query.trim()}
              className="absolute right-2 w-10 h-10 bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-200 text-white rounded-xl flex items-center justify-center transition-all shadow-sm disabled:cursor-not-allowed"
              title="Buscar salón"
              aria-label="Buscar salón"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {focused && live.length > 0 && (
            <ul
              className="absolute z-30 left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden"
              role="listbox"
            >
              {live.map((room) => (
                <li key={room.id}>
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => onOpenRoom(room)}
                    className="w-full text-left px-4 py-2.5 hover:bg-emerald-50 flex items-center justify-between gap-3 border-b border-slate-100 last:border-b-0"
                  >
                    <span className="min-w-0">
                      <span className="block font-extrabold text-slate-900 truncate">{room.name ?? room.displayName}</span>
                      <span className="block text-[11px] text-slate-500">
                        {BUILDINGS[room.building]?.name ?? `Edificio ${room.building}`} · {floorLabel(room.floor)}
                      </span>
                    </span>
                    <ArrowRight className="w-4 h-4 text-emerald-600 shrink-0" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <span className="text-[11px] font-semibold text-slate-500 block mb-2">Ejemplos rápidos:</span>
          <div className="flex flex-wrap gap-2">
            {sampleChips.map((chip) => (
              <button
                key={chip}
                type="button"
                onClick={() => {
                  setQuery(chip);
                  onSearch(chip);
                }}
                className="bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 transition-all active:scale-95"
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-sm py-3.5 rounded-2xl shadow-md shadow-emerald-700/20 transition-all flex items-center justify-center gap-2"
        >
          <Search className="w-4 h-4 text-amber-300" />
          Encontrar salón
        </button>
      </form>

      {favorites.length > 0 && (
        <section className="space-y-2" aria-label="Favoritos">
          <h2 className="text-xs font-bold text-slate-500 px-1 flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" /> Tus favoritos
          </h2>
          <div className="flex flex-wrap gap-2">
            {favorites.map((room) => (
              <button
                key={room.id}
                onClick={() => onOpenRoom(room)}
                className="bg-white border border-amber-200 hover:bg-amber-50 text-slate-800 text-xs font-bold px-3 py-2 rounded-xl transition-all active:scale-95"
              >
                {room.displayName}
              </button>
            ))}
          </div>
        </section>
      )}

      {recents.length > 0 && (
        <section className="space-y-2" aria-label="Búsquedas recientes">
          <h2 className="text-xs font-bold text-slate-500 px-1 flex items-center gap-1.5">
            <History className="w-3.5 h-3.5" /> Recientes
          </h2>
          <div className="flex flex-wrap gap-2">
            {recents.map((q) => (
              <span
                key={q}
                className="inline-flex items-center bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 overflow-hidden"
              >
                <button onClick={() => onSearch(q)} className="pl-3 pr-2 py-2 hover:bg-slate-50">
                  {q}
                </button>
                <button
                  onClick={() => onRemoveRecent(q)}
                  className="pr-2 py-2 text-slate-400 hover:text-slate-700"
                  aria-label={`Quitar ${q} de recientes`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </section>
      )}

      <div className="space-y-2">
        <h2 className="text-xs font-bold text-slate-500 px-1">Accesos rápidos</h2>
        <div className="grid grid-cols-3 gap-2.5">
          {[
            { label: 'Mapa de FIME', icon: Map, tone: 'bg-blue-50 text-blue-600', onClick: onOpenMap },
            { label: 'Buscar edificio', icon: Building2, tone: 'bg-emerald-50 text-emerald-700', onClick: onOpenDirectory },
            { label: '¿Dónde estoy?', icon: HelpCircle, tone: 'bg-amber-50 text-amber-600', onClick: onOpenWhereAmI },
          ].map(({ label, icon: Icon, tone, onClick }) => (
            <button
              key={label}
              onClick={onClick}
              className="bg-white hover:bg-slate-50 border border-slate-200 p-3.5 rounded-2xl flex flex-col items-center justify-center gap-2 text-center shadow-sm transition-all active:scale-95 group"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform ${tone}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-slate-800">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
