import React from 'react';
import { Search, Map, Navigation } from 'lucide-react';

export type TabType = 'search' | 'map' | 'recorrido' | 'directory';

interface BottomNavProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  hasActiveRoute: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  hasActiveRoute
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 py-1.5 px-4 shadow-lg">
      <div className="max-w-md mx-auto flex items-center justify-around">
        <button
          onClick={() => onChangeTab('search')}
          className={`flex flex-col items-center gap-1 py-1 px-4 rounded-xl transition-all ${
            activeTab === 'search'
              ? 'text-emerald-700 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Search className="w-5 h-5" />
          <span className="text-[11px]">Buscar</span>
        </button>

        <button
          onClick={() => onChangeTab('map')}
          className={`flex flex-col items-center gap-1 py-1 px-4 rounded-xl transition-all ${
            activeTab === 'map'
              ? 'text-emerald-700 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Map className="w-5 h-5" />
          <span className="text-[11px]">Mapa</span>
        </button>

        <button
          onClick={() => onChangeTab('recorrido')}
          disabled={!hasActiveRoute}
          className={`flex flex-col items-center gap-1 py-1 px-4 rounded-xl transition-all relative ${
            activeTab === 'recorrido'
              ? 'text-emerald-700 font-bold'
              : hasActiveRoute
              ? 'text-slate-700 hover:text-emerald-700'
              : 'text-slate-300 cursor-not-allowed'
          }`}
        >
          {hasActiveRoute && (
            <span className="absolute top-1 right-3 w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
          )}
          <Navigation className="w-5 h-5" />
          <span className="text-[11px]">Recorrido</span>
        </button>
      </div>
    </nav>
  );
};
