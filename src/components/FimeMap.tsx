import React, { useState, useRef, useCallback } from 'react';
import { BUILDINGS } from '../data/buildings';
import { ROUTE_NODES } from '../data/routes';
import type { Building } from '../types';
import { Plus, Minus, LocateFixed, Compass } from 'lucide-react';

// ─── TYPES ────────────────────────────────────────────────────────────────────
interface FimeMapProps {
  selectedBuildingId?: string;
  targetRoomName?: string;
  pathNodeIds?: string[];
  startNodeId?: string;
  onSelectBuilding?: (building: Building) => void;
  interactive?: boolean;
}

// ─── BUILDING CATEGORY COLORS ────────────────────────────────────────────────
const CATEGORY_COLORS: Record<string, { fill: string; text: string }> = {
  'Aulas':          { fill: '#2c4a7c', text: '#ffffff' },
  'Laboratorios':   { fill: '#1a4f3a', text: '#ffffff' },
  'Biblioteca':     { fill: '#4a2c7a', text: '#ffffff' },
  'Administración': { fill: '#5a3a1a', text: '#ffffff' },
  'Servicios':      { fill: '#3a3a5a', text: '#ffffff' },
  'Deportes':       { fill: '#1a4a1a', text: '#ffffff' },
  'Posgrado':       { fill: '#3a1a4a', text: '#ffffff' },
};

const getBuildingColors = (category: string, isSelected: boolean) => {
  if (isSelected) return { fill: '#0d6b3c', text: '#ffffff' };
  return CATEGORY_COLORS[category] ?? { fill: '#334155', text: '#ffffff' };
};

// ─── COMPONENT ────────────────────────────────────────────────────────────────
export const FimeMap: React.FC<FimeMapProps> = ({
  selectedBuildingId,
  targetRoomName,
  pathNodeIds = [],
  startNodeId = 'entrance-main',
  onSelectBuilding,
  interactive = true,
}) => {
  const [scale, setScale] = useState(1);
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredBldId, setHoveredBldId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleZoomIn  = () => setScale(s => Math.min(s + 0.3, 3));
  const handleZoomOut = () => setScale(s => Math.max(s - 0.3, 0.6));
  const handleReset   = () => { setScale(1); setTranslate({ x: 0, y: 0 }); };

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!interactive) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - translate.x, y: e.clientY - translate.y });
  }, [interactive, translate]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !interactive) return;
    setTranslate({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  }, [isDragging, interactive, dragStart]);

  const handleMouseUp = useCallback(() => setIsDragging(false), []);

  // Touch pan support
  const lastTouch = useRef<{ x: number; y: number } | null>(null);
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!interactive || e.touches.length !== 1) return;
    lastTouch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, [interactive]);
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!interactive || e.touches.length !== 1 || !lastTouch.current) return;
    const dx = e.touches[0].clientX - lastTouch.current.x;
    const dy = e.touches[0].clientY - lastTouch.current.y;
    setTranslate(t => ({ x: t.x + dx, y: t.y + dy }));
    lastTouch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  }, [interactive]);
  const handleTouchEnd = useCallback(() => { lastTouch.current = null; }, []);

  // Build route polyline from node IDs
  const routePoints = pathNodeIds
    .map(id => ROUTE_NODES[id])
    .filter(Boolean)
    .map(n => `${n!.coordinates.x},${n!.coordinates.y}`)
    .join(' ');

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-[320px] overflow-hidden rounded-2xl border border-slate-300 shadow-inner select-none touch-none bg-[#e8e3d8]"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >

      {/* ── CONTROLS ─────────────────────────────────────────────────────── */}
      {interactive && (
        <>
          {/* Compass / North indicator */}
          <div className="absolute top-3 left-3 z-20 bg-white/90 border border-slate-200 rounded-xl px-3 py-2 shadow-sm flex items-center gap-1.5 backdrop-blur-md pointer-events-none">
            <Compass className="w-4 h-4 text-emerald-700" />
            <span className="text-[11px] font-extrabold text-slate-700 tracking-widest">N ↑</span>
          </div>

          {/* Zoom buttons */}
          <div className="absolute top-3 right-3 z-20 flex flex-col gap-1 bg-white/90 border border-slate-200 rounded-xl p-1 shadow-sm backdrop-blur-md">
            <button onClick={handleZoomIn}  className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors" title="Acercar"><Plus className="w-4 h-4" /></button>
            <button onClick={handleZoomOut} className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors" title="Alejar"><Minus className="w-4 h-4" /></button>
            <div className="border-t border-slate-200 my-0.5" />
            <button onClick={handleReset}   className="w-8 h-8 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white flex items-center justify-center transition-colors" title="Recentrar"><LocateFixed className="w-4 h-4" /></button>
          </div>
        </>
      )}

      {/* ── SVG MAP ──────────────────────────────────────────────────────── */}
      <svg
        viewBox="0 0 1000 750"
        className="w-full h-full"
        style={{
          transform: `translate(${translate.x}px,${translate.y}px) scale(${scale})`,
          transformOrigin: 'center center',
          cursor: isDragging ? 'grabbing' : interactive ? 'grab' : 'default',
          transition: isDragging ? 'none' : 'transform 0.15s ease',
        }}
      >
        {/* ─── DEFS ─────────────────────────────────────────────────────── */}
        <defs>
          <filter id="bld-shadow" x="-10%" y="-10%" width="130%" height="130%">
            <feDropShadow dx="3" dy="3" stdDeviation="4" floodColor="#00000030" />
          </filter>
          <filter id="route-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 z" fill="#2563eb" />
          </marker>
        </defs>

        {/* ─── LAYER 0: CAMPUS GROUND ───────────────────────────────────── */}
        <rect x="0" y="0" width="1000" height="750" fill="#e8e3d8" />

        {/* Campus boundary outline (rough perimeter) */}
        <path
          d="M 60 10 L 960 10 L 960 740 L 60 740 Z"
          fill="#ede9de"
          stroke="#c8c2b0"
          strokeWidth="2"
          rx="8"
        />

        {/* ─── LAYER 1: GREEN AREAS ─────────────────────────────────────── */}
        <g id="green-areas" opacity="0.7">
          {/* Jardín del Oso — bottom right */}
          <ellipse cx="705" cy="700" rx="95" ry="45" fill="#7db96a" opacity="0.6" />
          <ellipse cx="700" cy="698" rx="60" ry="32" fill="#5ea84e" opacity="0.5" />

          {/* Green strip / lawn north of entrance */}
          <rect x="450" y="680" width="230" height="22" rx="10" fill="#7db96a" opacity="0.5" />

          {/* Green area near Ed.8 / Estacionamiento */}
          <ellipse cx="118" cy="310" rx="52" ry="90" fill="#7db96a" opacity="0.45" />

          {/* Green strip between Ed.6 and Ed.12 */}
          <rect x="290" y="110" width="180" height="65" rx="10" fill="#7db96a" opacity="0.35" />

          {/* Green area east of Ed.9 / Campo Sintético */}
          <ellipse cx="910" cy="90" rx="75" ry="60" fill="#7db96a" opacity="0.45" />

          {/* Small green between Ed.5 and Ed.6 */}
          <rect x="320" y="335" width="110" height="10" rx="5" fill="#7db96a" opacity="0.4" />
        </g>

        {/* ─── LAYER 2: STATIC CAMPUS PATHS (WALKWAYS) ─────────────────── */}
        <g id="static-paths" fill="none" stroke="#c0b89a" strokeLinecap="round" strokeLinejoin="round">
          {/* Main vertical spine from entrance northward */}
          <path d="M 497 720 L 497 660 L 497 492" strokeWidth="20" />
          {/* South horizontal: Ed.1/Ed.11 side + Jardín del Oso */}
          <path d="M 360 648 L 497 660 L 637 648 L 720 645 L 760 680" strokeWidth="18" />
          {/* Center horizontal: Ed.2 level */}
          <path d="M 240 492 L 497 492 L 720 492 L 877 492" strokeWidth="16" />
          {/* West vertical: Ed.7 → Ed.5 → Ed.6 → Ed.8/Ed.12 */}
          <path d="M 233 648 L 240 492 L 385 340 L 387 200 L 250 200" strokeWidth="16" />
          {/* North horizontal: Ed.3/Ed.9 level */}
          <path d="M 385 340 L 572 340 L 760 340 L 877 340" strokeWidth="14" />
          {/* Northeast diagonal: Ed.3 → Ed.4 */}
          <path d="M 760 340 L 760 265 L 792 200" strokeWidth="14" />
          {/* Ed.12 / Biblioteca path */}
          <path d="M 250 200 L 390 170 L 390 108" strokeWidth="14" />
          {/* Access path south to CIDET */}
          <path d="M 360 648 L 370 614" strokeWidth="14" />
          {/* Access narrow path to Ed.3 from center */}
          <path d="M 572 340 L 714 301" strokeWidth="12" />
          {/* Access to Ed.9 */}
          <path d="M 877 364 L 877 492" strokeWidth="12" />
          {/* Cafeteria area crossroads */}
          <path d="M 497 492 L 502 388 L 502 340" strokeWidth="12" />
        </g>

        {/* ─── LAYER 3: ACTIVE NAVIGATION ROUTE ────────────────────────── */}
        {routePoints && (
          <g id="active-route">
            {/* Glow */}
            <polyline
              points={routePoints}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="14"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity="0.35"
              filter="url(#route-glow)"
            />
            {/* Solid line */}
            <polyline
              points={routePoints}
              fill="none"
              stroke="#2563eb"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Dashed animated overlay */}
            <polyline
              points={routePoints}
              fill="none"
              stroke="#fbbf24"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="10 8"
              className="route-dash"
            />
          </g>
        )}

        {/* ─── LAYER 4: BUILDINGS ───────────────────────────────────────── */}
        <g id="buildings">
          {Object.values(BUILDINGS).map(bld => {
            const isSelected = selectedBuildingId === bld.id;
            const isDimmed   = !!selectedBuildingId && !isSelected;
            const isHovered  = hoveredBldId === bld.id;
            const colors     = getBuildingColors(bld.category, isSelected);
            const { x, y, width: w, height: h } = bld.coordinates;
            const cx = x + w / 2;
            const cy = y + h / 2;

            // Font size adapts to building size
            const baseFontSize  = Math.min(Math.max(w * 0.085, 9), 14);
            const labelFontSize = isSelected ? baseFontSize + 1.5 : baseFontSize;
            const subFontSize   = Math.max(labelFontSize - 3.5, 7);

            return (
              <g
                key={bld.id}
                opacity={isDimmed ? 0.38 : 1}
                style={{ transition: 'opacity 0.25s ease, transform 0.15s ease' }}
                onClick={() => onSelectBuilding && onSelectBuilding(bld)}
                onMouseEnter={() => setHoveredBldId(bld.id)}
                onMouseLeave={() => setHoveredBldId(null)}
                className="cursor-pointer"
              >
                {/* Drop shadow */}
                <rect x={x+3} y={y+4} width={w} height={h} rx="6" fill="#0000003a" />

                {/* Building body */}
                <rect
                  x={x} y={y} width={w} height={h}
                  rx="5"
                  fill={colors.fill}
                  stroke={isSelected ? '#f59e0b' : isHovered ? '#94a3b8' : '#1e293b'}
                  strokeWidth={isSelected ? 3.5 : 1.5}
                  filter={isSelected || isHovered ? 'url(#bld-shadow)' : undefined}
                />

                {/* Label – "Edif. X" */}
                <text
                  x={cx} y={cy - (h > 60 ? subFontSize * 0.9 : 0)}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={colors.text}
                  fontSize={labelFontSize}
                  fontWeight="700"
                  fontFamily="Inter, system-ui, sans-serif"
                  style={{ pointerEvents: 'none', userSelect: 'none' }}
                >
                  {bld.id === 'cidet' ? 'CIDET'
                    : bld.id === 'ciiia' ? 'CIIIA'
                    : `Edif. ${bld.id}`}
                </text>

                {/* Sub-label visible only for taller/wider buildings */}
                {(w > 130 || h > 80) && (
                  <text
                    x={cx} y={cy + labelFontSize * 1.1}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fill={isSelected ? '#fef08a' : '#94a3b8'}
                    fontSize={subFontSize}
                    fontFamily="Inter, system-ui, sans-serif"
                    style={{ pointerEvents: 'none', userSelect: 'none' }}
                  >
                    {bld.category}
                  </text>
                )}

                {/* Selected destination pin badge */}
                {isSelected && (
                  <g transform={`translate(${cx}, ${y - 14})`}>
                    <rect x="-38" y="-14" width="76" height="22" rx="6" fill="#f59e0b" />
                    <text
                      x="0" y="0"
                      textAnchor="middle"
                      dominantBaseline="central"
                      fill="#0f172a"
                      fontSize="10"
                      fontWeight="800"
                      fontFamily="Inter, system-ui, sans-serif"
                      style={{ pointerEvents: 'none', userSelect: 'none' }}
                    >
                      📍 {targetRoomName || bld.name}
                    </text>
                    <polygon points="-4,8 4,8 0,15" fill="#f59e0b" />
                  </g>
                )}
              </g>
            );
          })}
        </g>

        {/* ─── LAYER 5: LANDMARKS ───────────────────────────────────────── */}
        <g id="landmarks">
          {/* Cafetería marker */}
          <g transform="translate(502, 388)" opacity="0.85">
            <circle r="10" fill="#ffffff" stroke="#78716c" strokeWidth="1.5" />
            <text x="0" y="1" textAnchor="middle" dominantBaseline="central" fontSize="10">☕</text>
            <rect x="-32" y="12" width="64" height="16" rx="4" fill="#44403c" opacity="0.85" />
            <text x="0" y="21" textAnchor="middle" dominantBaseline="central" fill="#fafaf9" fontSize="8" fontWeight="700">Cafetería</text>
          </g>

          {/* Jardín del Oso marker */}
          <g transform="translate(705, 695)" opacity="0.9">
            <circle r="22" fill="#5ea84e" opacity="0.5" />
            <circle r="14" fill="#4d8c3f" />
            <text x="0" y="1" textAnchor="middle" dominantBaseline="central" fontSize="13">🐻</text>
            <rect x="-42" y="18" width="84" height="16" rx="4" fill="#14532d" opacity="0.9" />
            <text x="0" y="26" textAnchor="middle" dominantBaseline="central" fill="#f0fdf4" fontSize="8" fontWeight="700">Jardín del Oso</text>
          </g>

          {/* Campo Sintético marker */}
          <g transform="translate(910, 80)" opacity="0.7">
            <circle r="12" fill="#3d9c5a" opacity="0.5" />
            <circle r="8" fill="#2e7d32" />
            <text x="0" y="1" textAnchor="middle" dominantBaseline="central" fontSize="9">⚽</text>
            <rect x="-38" y="13" width="76" height="14" rx="3" fill="#14532d" opacity="0.85" />
            <text x="0" y="21" textAnchor="middle" dominantBaseline="central" fill="#f0fdf4" fontSize="7.5" fontWeight="600">Campo Sintético</text>
          </g>

          {/* Estacionamiento marker */}
          <g transform="translate(115, 308)" opacity="0.65">
            <rect x="-20" y="-12" width="40" height="24" rx="4" fill="#64748b" />
            <text x="0" y="1" textAnchor="middle" dominantBaseline="central" fill="#f8fafc" fontSize="10" fontWeight="800">P</text>
            <rect x="-42" y="14" width="84" height="14" rx="3" fill="#334155" opacity="0.85" />
            <text x="0" y="21" textAnchor="middle" dominantBaseline="central" fill="#f8fafc" fontSize="7.5" fontWeight="600">Estacionamiento</text>
          </g>
        </g>

        {/* ─── LAYER 6: ENTRANCE & START PIN ───────────────────────────── */}
        <g id="entrance-pin" transform="translate(497, 718)">
          {/* Pulse rings */}
          {startNodeId === 'entrance-main' && (
            <>
              <circle r="24" fill="#059669" opacity="0.18" className="animate-ping" />
            </>
          )}
          <circle r="16" fill="#059669" stroke="#ffffff" strokeWidth="2.5" />
          <text x="0" y="1" textAnchor="middle" dominantBaseline="central" fill="#ffffff" fontSize="8" fontWeight="800">
            ENTRADA
          </text>
          <rect x="-48" y="22" width="96" height="16" rx="4" fill="#0f172a" opacity="0.85" />
          <text x="0" y="31" textAnchor="middle" dominantBaseline="central" fill="#34d399" fontSize="8.5" fontWeight="700">
            Inicio del recorrido
          </text>
        </g>

        {/* When startNodeId is NOT entrance-main, show a smaller "INICIO" pin */}
        {startNodeId !== 'entrance-main' && ROUTE_NODES[startNodeId] && (
          <g transform={`translate(${ROUTE_NODES[startNodeId]!.coordinates.x}, ${ROUTE_NODES[startNodeId]!.coordinates.y})`}>
            <circle r="12" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" />
            <text x="0" y="1" textAnchor="middle" dominantBaseline="central" fill="#0f172a" fontSize="7" fontWeight="800">INICIO</text>
          </g>
        )}

        {/* ─── LABEL: ZONA CENTRAL ─────────────────────────────────────── */}
        <text
          x="497" y="435"
          textAnchor="middle"
          fill="#9c9072"
          fontSize="10"
          fontWeight="600"
          fontFamily="Inter, system-ui, sans-serif"
          opacity="0.7"
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          — Zona Central —
        </text>

        {/* ─── COMPASS: NORTH LABEL ─────────────────────────────────────── */}
        <g transform="translate(66, 720)" opacity="0.6">
          <text
            textAnchor="middle"
            fill="#6b6250"
            fontSize="8"
            fontWeight="600"
            fontFamily="Inter, system-ui, sans-serif"
            style={{ pointerEvents: 'none', userSelect: 'none' }}
          >
            ← Oeste · Este →
          </text>
        </g>

      </svg>

      {/* ── HIT: interactive hint at bottom ──────────────────────────────── */}
      {interactive && (
        <div className="absolute bottom-2 left-0 right-0 flex justify-center pointer-events-none">
          <span className="bg-white/80 text-slate-500 text-[10px] font-medium px-3 py-1 rounded-full border border-slate-200 backdrop-blur-sm shadow-sm">
            Toca un edificio para seleccionarlo · Arrastra para mover el mapa
          </span>
        </div>
      )}
    </div>
  );
};
