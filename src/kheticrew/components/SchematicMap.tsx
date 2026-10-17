import React from 'react';
import { useStore, useTranslation } from '../store/useStore';
import { Village, Crew, Job, Farm } from '../lib/types';
import { MapPin, Navigation } from 'lucide-react';

interface Props {
  selectedCrew?: Crew | null;
  crewRouteVillageIds?: string[];
  highlightVillageId?: string | null;
  onSelectVillage?: (villageId: string) => void;
  className?: string;
}

export const SchematicMap: React.FC<Props> = ({
  selectedCrew,
  crewRouteVillageIds = [],
  highlightVillageId,
  onSelectVillage,
  className = '',
}) => {
  const villages = useStore((state) => state.villages);
  const farms = useStore((state) => state.farms);
  const t = useTranslation();

  // Grid bounds: 0 to 28 km
  const width = 600;
  const height = 540;
  const padding = 45;
  const maxKm = 26;

  const toSvgX = (km: number) => padding + (km / maxKm) * (width - 2 * padding);
  const toSvgY = (km: number) => padding + (km / maxKm) * (height - 2 * padding);

  // Village lookup
  const villageMap = new Map<string, Village>(villages.map((v) => [v.id, v]));

  // Standard inter-village schematic roads
  const roadConnections = [
    ['v-1', 'v-2'], // Rampur - Kishanpur
    ['v-2', 'v-5'], // Kishanpur - Devgaon
    ['v-2', 'v-3'], // Kishanpur - Mohanpur
    ['v-1', 'v-4'], // Rampur - Shivpur
    ['v-4', 'v-6'], // Shivpur - Harinagar
    ['v-6', 'v-3'], // Harinagar - Mohanpur
    ['v-5', 'v-3'], // Devgaon - Mohanpur
  ];

  // Route points for selected crew
  const routePoints = crewRouteVillageIds
    .map((vid) => villageMap.get(vid))
    .filter((v): v is Village => Boolean(v))
    .map((v) => `${toSvgX(v.xKm)},${toSvgY(v.yKm)}`)
    .join(' ');

  return (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-sm p-4 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-brand-50 text-brand-700 rounded-lg">
            <Navigation className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm md:text-base">
              {t.dashboard.schematicTitle}
            </h3>
            <p className="text-xs text-slate-500">
              {t.dashboard.villageCount} • 25x25 km Schematic Distance Grid
            </p>
          </div>
        </div>
        {selectedCrew && (
          <span className="text-xs bg-brand-100 text-brand-800 font-medium px-2.5 py-1 rounded-full border border-brand-200">
            Route: {selectedCrew.name}
          </span>
        )}
      </div>

      <div className="relative w-full overflow-hidden bg-slate-50/70 rounded-lg border border-slate-200">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto select-none"
          role="img"
          aria-label="Schematic 25x25 km map showing village locations, road network, and crew travel routes"
        >
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e2e8f0" strokeWidth="1" />
            </pattern>
            <marker
              id="arrow"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 8 5 L 0 9 z" fill="#0e86d4" />
            </marker>
          </defs>

          {/* Background grid */}
          <rect width={width} height={height} fill="url(#grid)" />

          {/* Axis Labels (km) */}
          <text x={padding} y={height - 12} fontSize="11" fill="#64748b" fontWeight="500">
            0 km
          </text>
          <text x={width - padding - 20} y={height - 12} fontSize="11" fill="#64748b" fontWeight="500">
            25 km
          </text>
          <text x={12} y={padding + 5} fontSize="11" fill="#64748b" fontWeight="500">
            0 km
          </text>
          <text x={12} y={height - padding} fontSize="11" fill="#64748b" fontWeight="500">
            25 km
          </text>

          {/* Roads */}
          {roadConnections.map(([v1Id, v2Id], i) => {
            const v1 = villageMap.get(v1Id);
            const v2 = villageMap.get(v2Id);
            if (!v1 || !v2) return null;
            return (
              <line
                key={`road-${i}`}
                x1={toSvgX(v1.xKm)}
                y1={toSvgY(v1.yKm)}
                x2={toSvgX(v2.xKm)}
                y2={toSvgY(v2.yKm)}
                stroke="#cbd5e1"
                strokeWidth="3"
                strokeDasharray="4 3"
              />
            );
          })}

          {/* Selected Crew Relay Route Polyline */}
          {routePoints && (
            <polyline
              points={routePoints}
              fill="none"
              stroke="#0284c7"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              markerEnd="url(#arrow)"
            />
          )}

          {/* Village Nodes */}
          {villages.map((v) => {
            const x = toSvgX(v.xKm);
            const y = toSvgY(v.yKm);
            const isHighlighted = highlightVillageId === v.id;
            const farmCount = farms.filter((f) => f.villageId === v.id).length;

            return (
              <g
                key={v.id}
                className="cursor-pointer transition-transform duration-150 hover:scale-105"
                onClick={() => onSelectVillage?.(v.id)}
                role="button"
                tabIndex={0}
                aria-label={`Village ${v.name}, at coordinates ${v.xKm} km east, ${v.yKm} km south, ${farmCount} registered farms.`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') onSelectVillage?.(v.id);
                }}
              >
                {/* Highlight outer pulse */}
                {isHighlighted && (
                  <circle
                    cx={x}
                    cy={y}
                    r="24"
                    fill="none"
                    stroke="#ea580c"
                    strokeWidth="3"
                    strokeDasharray="4 2"
                    className="animate-spin"
                  />
                )}

                {/* Village node background */}
                <circle
                  cx={x}
                  cy={y}
                  r="16"
                  fill={isHighlighted ? '#ea580c' : '#0284c7'}
                  stroke="#ffffff"
                  strokeWidth="3"
                  className="shadow"
                />

                <circle cx={x} cy={y} r="6" fill="#ffffff" />

                {/* Village label pill */}
                <g transform={`translate(${x}, ${y + 24})`}>
                  <rect
                    x="-42"
                    y="-10"
                    width="84"
                    height="20"
                    rx="10"
                    fill="#1e293b"
                    opacity="0.9"
                  />
                  <text
                    x="0"
                    y="4"
                    fill="#ffffff"
                    fontSize="11"
                    fontWeight="600"
                    textAnchor="middle"
                  >
                    {v.name}
                  </text>
                </g>

                {/* Coordinates & Farm Badge */}
                <text
                  x={x}
                  y={y - 20}
                  fill="#475569"
                  fontSize="10"
                  fontWeight="500"
                  textAnchor="middle"
                >
                  ({v.xKm},{v.yKm}) • {farmCount} farms
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 mt-2 px-1">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-brand-600 inline-block" />
            Gram Panchayat
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-4 h-0.5 bg-slate-300 inline-block border-b border-dashed border-slate-400" />
            Inter-Village Link
          </span>
          {routePoints && (
            <span className="flex items-center gap-1.5 font-medium text-brand-700">
              <span className="w-4 h-1 bg-brand-500 inline-block rounded" />
              Chained Relay Route
            </span>
          )}
        </div>
        <span className="text-slate-400">Scale: 1 grid square = ~5 km</span>
      </div>
    </div>
  );
};
