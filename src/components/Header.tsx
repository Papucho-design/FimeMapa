import React from 'react';
import { Compass, MapPin } from 'lucide-react';

interface HeaderProps {
  onGoHome: () => void;
  selectedOriginName?: string;
  onOpenOriginModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onGoHome,
  selectedOriginName = 'Entrada principal',
  onOpenOriginModal
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 shadow-sm">
      <div className="max-w-md mx-auto flex items-center justify-between">
        <button
          onClick={onGoHome}
          className="flex items-center gap-2.5 group text-left focus:outline-none"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-700 flex items-center justify-center text-white shadow-md shadow-emerald-700/20 group-hover:scale-105 transition-transform">
            <Compass className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight text-slate-900 leading-none">
                Ubic<span className="text-emerald-700">FIME</span>
              </span>
              <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase">
                UANL
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">Facultad de Ing. Mecánica y Eléctrica</p>
          </div>
        </button>

        {onOpenOriginModal && (
          <button
            onClick={onOpenOriginModal}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 transition-colors"
            title="Cambiar punto de origen"
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            <span className="max-w-[100px] truncate">{selectedOriginName}</span>
          </button>
        )}
      </div>
    </header>
  );
};
