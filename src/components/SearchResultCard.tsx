import React from 'react';
import type { Room, SearchResult } from '../types';
import { ROUTE_NODES } from '../data/routes';
import { ROOM_TYPE_LABEL } from '../data/roomTypes';
import { BUILDINGS } from '../data/buildings';
import { floorLabel } from '../utils/floors';
import { roomPhotoUrl } from '../utils/photos';
import {
  Clock, MapPin, CheckCircle2, AlertCircle, ArrowLeft, Search, Navigation, Star, Flag, ChevronRight, Info,
} from 'lucide-react';

interface SearchResultCardProps {
  result: SearchResult | null;
  /** Coincidencias aproximadas cuando no hay un resultado exacto. */
  suggestions?: Room[];
  /** Otros salones registrados del mismo edificio. */
  siblings?: Room[];
  startNodeId?: string;
  estimatedMinutes?: number;
  isFavorite?: boolean;
  onToggleFavorite?: (room: Room) => void;
  onOpenRoom: (room: Room) => void;
  onReport?: (room: Room | undefined, label: string) => void;
  onStartNavigation: () => void;
  onResetSearch: () => void;
}

export const SearchResultCard: React.FC<SearchResultCardProps> = ({
  result,
  suggestions = [],
  siblings = [],
  startNodeId = 'entrance-main',
  estimatedMinutes,
  isFavorite = false,
  onToggleFavorite,
  onOpenRoom,
  onReport,
  onStartNavigation,
  onResetSearch,
}) => {
  if (!result) {
    return (
      <div className="w-full max-w-md mx-auto px-4 py-8 space-y-5">
        {suggestions.length > 0 ? (
          <>
            <div className="text-center space-y-1">
              <h2 className="text-lg font-bold text-slate-900">¿Quisiste decir alguno de estos?</h2>
              <p className="text-xs text-slate-500">No hay una coincidencia exacta, pero encontramos algo parecido.</p>
            </div>
            <ul className="space-y-2">
              {suggestions.map((room) => (
                <li key={room.id}>
                  <button
                    onClick={() => onOpenRoom(room)}
                    className="w-full text-left bg-white border border-slate-200 hover:border-emerald-400 rounded-2xl px-4 py-3 flex items-center justify-between gap-3 transition-colors"
                  >
                    <span className="min-w-0">
                      <span className="block font-extrabold text-slate-900 truncate">{room.name ?? room.displayName}</span>
                      <span className="block text-xs text-slate-500">
                        {ROOM_TYPE_LABEL[room.type]} · {BUILDINGS[room.building]?.name ?? `Edificio ${room.building}`} · {floorLabel(room.floor)}
                      </span>
                    </span>
                    <ChevronRight className="w-4 h-4 text-emerald-600 shrink-0" />
                  </button>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">No encontramos ese salón.</h2>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Prueba con un formato como <span className="font-bold text-slate-700">7-215</span>,{' '}
              <span className="font-bold text-slate-700">2301</span> o <span className="font-bold text-slate-700">6F11</span>,
              o con el nombre del laboratorio.
            </p>
          </div>
        )}
        <div className="text-center">
          <button
            onClick={onResetSearch}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all inline-flex items-center gap-2"
          >
            <Search className="w-4 h-4 text-amber-400" />
            Buscar de nuevo
          </button>
        </div>
      </div>
    );
  }

  const { building, floor, room, kind, verified } = result;
  const startNode = ROUTE_NODES[startNodeId] || ROUTE_NODES['entrance-main'];
  const isBuilding = kind === 'building';
  const title = room ? room.displayName : result.normalizedQuery;
  const photo = roomPhotoUrl(room?.photo);

  return (
    <div className="w-full max-w-md mx-auto px-4 py-6 space-y-5">
      <button
        onClick={onResetSearch}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Volver a buscar
      </button>

      <div className="bg-white rounded-3xl shadow-md border border-slate-200/80 overflow-hidden">
        {photo && (
          <img
            src={photo}
            alt={`Foto del salón ${title}`}
            loading="lazy"
            className="w-full h-44 object-cover bg-slate-100"
          />
        )}

        <div className="p-6 space-y-5">
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <span className="text-[11px] font-extrabold text-slate-400">
              {isBuilding ? 'Edificio' : room ? ROOM_TYPE_LABEL[room.type] : 'Código reconocido'}
            </span>

            {isBuilding ? null : verified ? (
              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" /> Ubicación verificada
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-xs font-bold px-2.5 py-1 rounded-full border border-amber-200">
                <AlertCircle className="w-3.5 h-3.5" /> Ubicación preliminar
              </span>
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-start justify-between gap-3">
              <h1 className="text-4xl font-black tracking-tight text-slate-900">{title}</h1>
              {room && onToggleFavorite && (
                <button
                  onClick={() => onToggleFavorite(room)}
                  aria-pressed={isFavorite}
                  aria-label={isFavorite ? 'Quitar de favoritos' : 'Guardar en favoritos'}
                  className="mt-1 p-2 rounded-xl hover:bg-amber-50 transition-colors"
                >
                  <Star className={`w-6 h-6 ${isFavorite ? 'text-amber-500 fill-amber-400' : 'text-slate-300'}`} />
                </button>
              )}
            </div>
            {room?.name && <p className="text-sm font-semibold text-slate-600">{room.name}</p>}
            <div className="flex flex-wrap items-center gap-x-2 text-base font-bold text-emerald-700">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>{building.name}</span>
              {!isBuilding && (
                <>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-600 font-semibold">{floorLabel(floor)}</span>
                </>
              )}
            </div>
          </div>

          {room?.notes && (
            <p className="flex gap-2 text-sm text-slate-700 bg-slate-50 border border-slate-100 rounded-2xl p-3.5 leading-relaxed">
              <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              {room.notes}
            </p>
          )}

          <div className="bg-slate-50 rounded-2xl p-3.5 flex items-center justify-between border border-slate-100 text-xs">
            <div className="flex items-center gap-2 text-slate-600 font-medium">
              <span className="text-slate-400">Origen:</span>
              <span className="font-bold text-slate-800">{startNode.name}</span>
            </div>
            {estimatedMinutes !== undefined && (
              <div className="flex items-center gap-1.5 font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-200/60">
                <Clock className="w-3.5 h-3.5" />
                <span>≈ {estimatedMinutes} min</span>
              </div>
            )}
          </div>

          {!isBuilding && !verified && (
            <div className="bg-amber-50/70 border border-amber-200 text-amber-900 rounded-2xl p-3.5 text-xs space-y-1">
              <p className="font-bold flex items-center gap-1.5 text-amber-800">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                Ubicación del edificio confirmada
              </p>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                Tenemos identificado el edificio y el piso ({building.name} · {floorLabel(floor)}), pero la posición
                exacta dentro del pasillo está pendiente de verificar físicamente. Te llevaremos hasta el edificio.
              </p>
            </div>
          )}

          <button
            onClick={onStartNavigation}
            className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-base py-4 rounded-2xl shadow-lg shadow-emerald-700/25 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            <Navigation className="w-5 h-5 text-amber-300 fill-amber-300" />
            Cómo llegar
          </button>
        </div>
      </div>

      {!isBuilding && onReport && (
        <button
          onClick={() => onReport(room, title)}
          className="w-full text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center justify-center gap-1.5 py-2"
        >
          <Flag className="w-3.5 h-3.5" />
          ¿Ubicación incorrecta? Repórtala
        </button>
      )}

      {siblings.length > 0 && (
        <details className="bg-white rounded-2xl border border-slate-200/80 px-4 py-3 group">
          <summary className="text-xs font-bold text-slate-700 cursor-pointer list-none flex items-center justify-between">
            Salones registrados en {building.name} ({siblings.length})
            <ChevronRight className="w-4 h-4 text-slate-400 transition-transform group-open:rotate-90" />
          </summary>
          <div className="mt-3 space-y-3">
            {Array.from(new Set(siblings.map((s) => s.floor))).map((f) => (
              <div key={f}>
                <p className="text-[11px] font-bold text-slate-400 mb-1.5">{floorLabel(f)}</p>
                <div className="flex flex-wrap gap-1.5">
                  {siblings
                    .filter((s) => s.floor === f)
                    .map((s) => (
                      <button
                        key={s.id}
                        onClick={() => onOpenRoom(s)}
                        className="bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 text-xs font-bold px-2.5 py-1.5 rounded-lg border border-slate-200 transition-colors"
                      >
                        {s.displayName}
                      </button>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
};
