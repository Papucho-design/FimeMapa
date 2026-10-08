import { lazy, Suspense, useMemo, useState } from 'react';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import type { TabType } from './components/BottomNav';
import { HomeScreen } from './components/HomeScreen';
import { SearchResultCard } from './components/SearchResultCard';
import { FimeMap } from './components/FimeMap';
import { StepNavigation } from './components/StepNavigation';
import { BuildingDirectory } from './components/BuildingDirectory';
import { OriginSelectorModal } from './components/OriginSelectorModal';
import { LandmarkWhereAmIScreen } from './components/LandmarkWhereAmIScreen';
import { ReportModal } from './components/ReportModal';

import { BUILDINGS } from './data/buildings';
import { ROUTE_NODES } from './data/routes';
import { useRooms } from './state/rooms-context';
import { resolveQuery, roomsByBuilding } from './utils/search';
import { solveRoute } from './utils/routeSolver';
import { floorLabel } from './utils/floors';
import { usePersistentList } from './utils/storage';
import type { Building, Room, SearchResult } from './types';

// El panel de edición solo se descarga cuando alguien entra a ?admin
const AdminPanel = lazy(() => import('./admin/AdminPanel'));

type ViewState = 'home' | 'result' | 'recorrido' | 'map' | 'directory' | 'whereAmI';

const wantsAdmin = () => /(^|[?&#])admin(\b|=|&|$)/.test(window.location.search + window.location.hash);

function resultForRoom(room: Room): SearchResult {
  const building = BUILDINGS[room.building];
  return {
    kind: 'room',
    normalizedQuery: room.displayName,
    room,
    building,
    floor: room.floor,
    isExactRoomFound: true,
    verified: room.verified,
    statusText: room.verified ? 'Ubicación verificada' : 'Ubicación preliminar',
    message: room.verified
      ? `Salón ${room.displayName} en ${building.name}.`
      : 'Tenemos identificado el edificio, pero la ubicación exacta del salón está pendiente de verificar.',
  };
}

export function App() {
  const { rooms, index } = useRooms();

  const [isAdmin, setIsAdmin] = useState(wantsAdmin);
  const [activeTab, setActiveTab] = useState<TabType>('search');
  const [viewState, setViewState] = useState<ViewState>('home');

  const [startNodeId, setStartNodeId] = useState('entrance-main');
  const [isOriginModalOpen, setIsOriginModalOpen] = useState(false);

  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [suggestions, setSuggestions] = useState<Room[]>([]);
  const [report, setReport] = useState<{ roomId: string; label: string } | null>(null);

  const recents = usePersistentList('ubicfime:recientes', 6);
  const favorites = usePersistentList('ubicfime:favoritos', 20);

  const selectedBuilding = searchResult?.building ?? null;
  const startNodeName = ROUTE_NODES[startNodeId]?.name || 'Entrada principal';

  // La ruta se deriva del destino y del origen: no hay estado duplicado que sincronizar.
  const activeRoute = useMemo(() => {
    if (!searchResult) return null;
    if (searchResult.kind === 'building') return solveRoute(startNodeId, searchResult.building.id);
    return solveRoute(
      startNodeId,
      searchResult.building.id,
      searchResult.normalizedQuery,
      searchResult.floor,
      searchResult.room,
    );
  }, [searchResult, startNodeId]);

  const favoriteRooms = useMemo(
    () => favorites.items.map((id) => rooms.find((r) => r.id === id)).filter((r): r is Room => !!r),
    [favorites.items, rooms],
  );

  const siblings = useMemo(() => {
    if (!searchResult) return [];
    return roomsByBuilding(rooms, searchResult.building.id).filter((r) => r.id !== searchResult.room?.id);
  }, [rooms, searchResult]);

  const showResult = (result: SearchResult | null, alternatives: Room[] = []) => {
    setSearchResult(result);
    setSuggestions(alternatives);
    setViewState('result');
    setActiveTab('search');
  };

  const handleOpenRoom = (room: Room) => {
    showResult(resultForRoom(room));
  };

  const handleSearch = (rawQuery: string) => {
    const outcome = resolveQuery(rawQuery, rooms, index);

    switch (outcome.kind) {
      case 'room':
        recents.push(rawQuery.trim());
        handleOpenRoom(outcome.room);
        break;

      case 'pattern': {
        const { normalized } = outcome;
        const building = BUILDINGS[normalized.buildingId];
        recents.push(rawQuery.trim());
        // "7" o "Edificio 7": se trata como búsqueda de edificio completo
        if (/^Edificio /.test(normalized.displayName)) {
          handleSelectBuilding(building);
          break;
        }
        showResult({
          kind: 'pattern',
          normalizedQuery: normalized.displayName,
          building,
          floor: normalized.floor,
          isExactRoomFound: false,
          verified: false,
          statusText: 'Ubicación preliminar',
          message: `${building.name} · ${floorLabel(normalized.floor)}. Ubicación exacta del salón pendiente de verificar.`,
        });
        break;
      }

      case 'suggestions':
        showResult(null, outcome.rooms);
        break;

      default:
        showResult(null);
    }
  };

  const handleSelectBuilding = (bld: Building) => {
    showResult({
      kind: 'building',
      normalizedQuery: bld.name,
      building: bld,
      floor: 1,
      isExactRoomFound: false,
      verified: true,
      statusText: 'Edificio seleccionado',
      message: `${bld.name} · ${bld.category}`,
    });
  };

  const handleStartNavigation = () => {
    if (!activeRoute) return;
    setViewState('recorrido');
    setActiveTab('recorrido');
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    if (tab === 'search') setViewState('home');
    else if (tab === 'map') setViewState('map');
    else if (tab === 'recorrido' && activeRoute) setViewState('recorrido');
  };

  const exitAdmin = () => {
    window.history.replaceState(null, '', window.location.pathname);
    setIsAdmin(false);
  };

  if (isAdmin) {
    return (
      <Suspense fallback={<div className="p-8 text-center text-sm text-slate-500">Cargando panel…</div>}>
        <AdminPanel onExit={exitAdmin} />
      </Suspense>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Header
        onGoHome={() => {
          setViewState('home');
          setActiveTab('search');
        }}
        selectedOriginName={startNodeName}
        onOpenOriginModal={() => setIsOriginModalOpen(true)}
      />

      <main className="flex-1 pb-20">
        {viewState === 'home' && (
          <HomeScreen
            onSearch={handleSearch}
            onOpenRoom={handleOpenRoom}
            onOpenMap={() => {
              setViewState('map');
              setActiveTab('map');
            }}
            onOpenDirectory={() => setViewState('directory')}
            onOpenWhereAmI={() => setViewState('whereAmI')}
            recents={recents.items}
            onRemoveRecent={recents.remove}
            favorites={favoriteRooms}
          />
        )}

        {viewState === 'result' && (
          <SearchResultCard
            result={searchResult}
            suggestions={suggestions}
            siblings={siblings}
            startNodeId={startNodeId}
            estimatedMinutes={activeRoute?.estimatedMinutes}
            isFavorite={!!searchResult?.room && favorites.items.includes(searchResult.room.id)}
            onToggleFavorite={(room) => favorites.toggle(room.id)}
            onOpenRoom={handleOpenRoom}
            onReport={(room, label) => setReport({ roomId: room?.id ?? label, label })}
            onStartNavigation={handleStartNavigation}
            onResetSearch={() => {
              setViewState('home');
              setActiveTab('search');
            }}
          />
        )}

        {viewState === 'recorrido' && activeRoute && searchResult && (
          <StepNavigation
            targetRoomTitle={searchResult.normalizedQuery}
            buildingId={searchResult.building.id}
            pathNodeIds={activeRoute.pathNodeIds}
            startNodeId={startNodeId}
            steps={activeRoute.steps}
            onBack={() => setViewState('result')}
            onOpenFullMap={() => {
              setViewState('map');
              setActiveTab('map');
            }}
          />
        )}

        {viewState === 'map' && (
          <div className="w-full max-w-md mx-auto px-4 py-4 space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="text-base font-extrabold text-slate-900">Mapa de FIME</h1>
              {selectedBuilding && (
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                  {selectedBuilding.name}
                </span>
              )}
            </div>

            <div className="h-[70vh] rounded-3xl overflow-hidden shadow-lg">
              <FimeMap
                selectedBuildingId={selectedBuilding?.id}
                targetRoomName={searchResult?.kind === 'building' ? undefined : searchResult?.normalizedQuery}
                pathNodeIds={activeRoute?.pathNodeIds || []}
                startNodeId={startNodeId}
                onSelectBuilding={handleSelectBuilding}
                interactive={true}
              />
            </div>
          </div>
        )}

        {viewState === 'directory' && (
          <BuildingDirectory onSelectBuilding={handleSelectBuilding} onBack={() => setViewState('home')} />
        )}

        {viewState === 'whereAmI' && (
          <LandmarkWhereAmIScreen onSelectOrigin={setStartNodeId} onBack={() => setViewState('home')} />
        )}
      </main>

      <OriginSelectorModal
        isOpen={isOriginModalOpen}
        onClose={() => setIsOriginModalOpen(false)}
        selectedOriginId={startNodeId}
        onSelectOrigin={setStartNodeId}
      />

      {report && <ReportModal roomId={report.roomId} roomLabel={report.label} onClose={() => setReport(null)} />}

      <BottomNav activeTab={activeTab} onChangeTab={handleTabChange} hasActiveRoute={activeRoute !== null} />
    </div>
  );
}

export default App;
