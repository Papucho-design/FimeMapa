import React, { useState } from 'react';
import { BUILDINGS } from '../data/buildings';
import type { Building } from '../types';
import { Search, Layers, Navigation, ArrowLeft } from 'lucide-react';

interface BuildingDirectoryProps {
  onSelectBuilding: (bld: Building) => void;
  onBack: () => void;
}

export const BuildingDirectory: React.FC<BuildingDirectoryProps> = ({
  onSelectBuilding,
  onBack
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const buildingList = Object.values(BUILDINGS);

  const filteredBuildings = buildingList.filter(bld => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return true;

    const nameMatch = bld.name.toLowerCase().includes(q);
    const idMatch = bld.id.toLowerCase().includes(q);
    const categoryMatch = bld.category.toLowerCase().includes(q);
    const descMatch = bld.description.toLowerCase().includes(q);
    const patternMatch = bld.pattern.toLowerCase().includes(q);

    // Number word match e.g. "siete" -> "7"
    const numberWords: Record<string, string> = {
      uno: '1', dos: '2', tres: '3', cuatro: '4', cinco: '5', seis: '6',
      siete: '7', ocho: '8', nueve: '9', diez: '10', once: '11', doce: '12'
    };
    const wordNum = numberWords[q];
    const wordMatch = wordNum && bld.id === wordNum;

    return nameMatch || idMatch || categoryMatch || descMatch || patternMatch || wordMatch;
  });

  return (
    <div className="w-full max-w-md mx-auto px-4 py-4 space-y-4 pb-20">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </button>

        <span className="text-sm font-extrabold text-slate-900">
          Directorio de Edificios
        </span>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar edificio o área (ej. 7, biblioteca, CIDET)..."
          className="w-full bg-white border border-slate-200 focus:border-emerald-600 text-slate-900 placeholder-slate-400 text-xs font-semibold rounded-2xl py-3 pl-10 pr-4 shadow-sm outline-none transition-all"
        />
      </div>

      {/* Building Cards List */}
      <div className="space-y-3">
        {filteredBuildings.map(bld => (
          <div
            key={bld.id}
            className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 space-y-3 hover:border-emerald-300 transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl bg-emerald-700 text-white font-black text-sm flex items-center justify-center shadow-sm">
                    {bld.id}
                  </span>
                  <h3 className="font-extrabold text-base text-slate-900">
                    {bld.name}
                  </h3>
                </div>
                <span className="inline-block bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                  {bld.category}
                </span>
              </div>

              <div className="flex items-center gap-1 text-xs font-bold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-100">
                <Layers className="w-3.5 h-3.5 text-emerald-600" />
                <span>{bld.floorCount} {bld.floorCount === 1 ? 'piso' : 'pisos'}</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {bld.description}
            </p>

            {bld.examples && bld.examples.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap pt-1 text-[11px]">
                <span className="text-slate-400 font-medium">Salones de muestra:</span>
                {bld.examples.map(ex => (
                  <span key={ex} className="bg-emerald-50 text-emerald-800 font-bold px-2 py-0.5 rounded border border-emerald-100">
                    {ex}
                  </span>
                ))}
              </div>
            )}

            <button
              onClick={() => onSelectBuilding(bld)}
              className="w-full bg-slate-900 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Navigation className="w-3.5 h-3.5 text-amber-400" />
              Cómo llegar al {bld.name}
            </button>
          </div>
        ))}

        {filteredBuildings.length === 0 && (
          <div className="text-center py-8 bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs">
            No se encontraron edificios que coincidan con "<span className="font-bold text-slate-700">{searchTerm}</span>".
          </div>
        )}
      </div>
    </div>
  );
};
