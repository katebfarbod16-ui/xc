import React, { useMemo, useState, useRef, useEffect } from 'react';
import worldTopo from 'world-atlas/countries-110m.json';
import { feature } from 'topojson-client';
import { geoNaturalEarth1, geoPath } from 'd3-geo';
import { GameState, MapMode, CountryData, SupportedLanguage, AttackType, ConstructionQueueItem } from '../../types/game';
import { TRANSLATIONS } from '../../data/translations';
import { sound } from '../../simulation/soundEngine';
import { TacticalContextMenu } from './TacticalContextMenu';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Globe2, 
  ShieldAlert, 
  TrendingUp, 
  Swords, 
  Handshake, 
  Users2, 
  Gem,
  Layers,
  Moon,
  Sun,
  Flame,
  Radio,
  Clock
} from 'lucide-react';

interface WorldMapProps {
  gameState: GameState;
  selectedCountryId: string | null;
  jumpCountryId?: string | null;
  onSelectCountry: (countryId: string) => void;
  mapMode: MapMode;
  onSetMapMode: (mode: MapMode) => void;
  language: SupportedLanguage;
  onLaunchAttack?: (targetId: string, attackType: AttackType, troopCommitment?: number, missileCommitment?: number) => void;
  onBuildStructure?: (type: ConstructionQueueItem['type'], name: string, nameFa: string, cost: number, days: number, extraData?: Record<string, any>) => void;
}

export const WorldMap: React.FC<WorldMapProps> = ({
  gameState,
  selectedCountryId,
  jumpCountryId,
  onSelectCountry,
  mapMode,
  onSetMapMode,
  language,
  onLaunchAttack,
  onBuildStructure,
}) => {
  const isPersian = language === 'fa';
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Pan and Zoom transform state
  const [transform, setTransform] = useState({ x: 0, y: 0, k: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  // Hovered country state for tooltips
  const [hoveredCountryId, setHoveredCountryId] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Right-Click Context Menu State
  const [contextMenuTarget, setContextMenuTarget] = useState<{
    country: CountryData;
    pos: { x: number; y: number };
  } | null>(null);

  // Screen Tremor / Camera Shake State (triggers on missile strikes & impacts!)
  const [shakeIntensity, setShakeIntensity] = useState(0);

  useEffect(() => {
    if (gameState.activeStrikes && gameState.activeStrikes.length > 0) {
      setShakeIntensity(1.0);
      sound.playHeavyExplosion();
    }
  }, [gameState.activeStrikes?.length]);

  useEffect(() => {
    if (shakeIntensity <= 0) return;
    const timer = setTimeout(() => {
      setShakeIntensity(prev => Math.max(0, prev - 0.18));
    }, 90);
    return () => clearTimeout(timer);
  }, [shakeIntensity]);

  // Map dimensions
  const width = 1000;
  const height = 520;

  // Projection setup (Natural Earth 1 projection)
  const projection = useMemo(() => {
    return geoNaturalEarth1()
      .scale(165)
      .translate([width / 2, height / 2 + 20]);
  }, [width, height]);

  const pathGenerator = useMemo(() => {
    return geoPath().projection(projection);
  }, [projection]);

  // Convert TopoJSON to GeoJSON features
  const countryFeatures = useMemo(() => {
    try {
      const geoData: any = feature(worldTopo as any, (worldTopo as any).objects.countries);
      return geoData.features || [];
    } catch (e) {
      console.error('Failed to parse world atlas', e);
      return [];
    }
  }, []);

  // Jump to Country Camera Handler (Smooth pan/zoom to coordinates)
  useEffect(() => {
    if (!jumpCountryId) return;
    const target = gameState.countries[jumpCountryId];
    if (target && target.capitalCoordinates) {
      const projected = projection(target.capitalCoordinates);
      if (projected) {
        const [cx, cy] = projected;
        const targetK = 2.8;
        sound.playRadarPing();
        setTransform({
          x: width / 2 - cx * targetK,
          y: height / 2 - cy * targetK,
          k: targetK,
        });
      }
    }
  }, [jumpCountryId]);

  // Zoom handlers
  const handleZoom = (factor: number) => {
    sound.playClick(800, 0.03);
    setTransform(prev => {
      const newK = Math.min(8, Math.max(0.8, prev.k * factor));
      return { ...prev, k: newK };
    });
  };

  const handleReset = () => {
    sound.playClick(600, 0.04);
    setTransform({ x: 0, y: 0, k: 1 });
  };

  // Dragging handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    if (contextMenuTarget) setContextMenuTarget(null);
    setIsDragging(true);
    setDragStart({ x: e.clientX - transform.x, y: e.clientY - transform.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setTransform(prev => ({
        ...prev,
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      }));
    }
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.88;
    setTransform(prev => {
      const newK = Math.min(8, Math.max(0.8, prev.k * zoomFactor));
      return { ...prev, k: newK };
    });
  };

  // Touch handlers for mobile/tablet
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => {
    if (contextMenuTarget) setContextMenuTarget(null);
    if (e.touches.length === 1) {
      touchStartRef.current = {
        x: e.touches[0].clientX - transform.x,
        y: e.touches[0].clientY - transform.y,
      };
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && touchStartRef.current) {
      setTransform(prev => ({
        ...prev,
        x: e.touches[0].clientX - touchStartRef.current!.x,
        y: e.touches[0].clientY - touchStartRef.current!.y,
      }));
    }
  };

  const getCountryData = (id: string | number): CountryData | undefined => {
    const padded = String(id).padStart(3, '0');
    const unpadded = String(Number(id));
    return gameState.countries[padded] || gameState.countries[unpadded] || gameState.countries[String(id)];
  };

  // Color calculation based on active Map Mode & Territorial Annexation
  const getCountryFill = (id: string | number): string => {
    const country = getCountryData(id);
    if (!country) return '#1e293b';

    const playerId = gameState.playerCountryId;
    const playerCountry = gameState.countries[playerId];
    const isPlayer = country.id === playerId;

    // Check Territorial Annexation by Player
    const playerControl = gameState.territorialControl?.[playerId]?.[country.id] || 0;
    const isAnnexedByPlayer = (playerControl >= 50) || (country.occupierId === playerId);

    if (isAnnexedByPlayer) {
      return playerCountry?.color || '#0284c7'; // Conquered territory turns into Player's color!
    }

    if (country.isOccupied && country.occupierId) {
      const occ = gameState.countries[country.occupierId];
      return occ?.color ? `${occ.color}cc` : '#7f1d1d';
    }

    // Partial annexation shading
    if (playerControl > 0 && playerControl < 50) {
      return '#3b82f6';
    }

    switch (mapMode) {
      case 'political': {
        if (isPlayer) return country.color || '#0284c7';
        return country.color || '#334155';
      }
      case 'economic': {
        const gdp = country.gdp;
        if (gdp > 10000) return '#f59e0b';
        if (gdp > 3000) return '#10b981';
        if (gdp > 1000) return '#059669';
        if (gdp > 400) return '#0284c7';
        return '#1e3a8a';
      }
      case 'military': {
        const totalForces = country.military.infantry + (country.military.armor / 10);
        if (totalForces > 2000) return '#dc2626';
        if (totalForces > 1000) return '#e11d48';
        if (totalForces > 500) return '#ea580c';
        if (totalForces > 200) return '#d97706';
        return '#334155';
      }
      case 'diplomatic': {
        if (isPlayer) return '#38bdf8';
        const relation = gameState.diplomacy[playerId]?.[country.id];
        if (!relation) return '#475569';
        if (relation.status === 'at_war') return '#ef4444';
        if (relation.status === 'allied') return '#22c55e';
        if (relation.status === 'non_aggression') return '#06b6d4';
        if (relation.status === 'rival') return '#f97316';
        return '#64748b';
      }
      case 'population': {
        const pop = country.population;
        if (pop > 1000) return '#7c3aed';
        if (pop > 200) return '#2563eb';
        if (pop > 80) return '#06b6d4';
        if (pop > 30) return '#10b981';
        return '#1e293b';
      }
      case 'resources': {
        const resScore = country.resources.energy + country.resources.metals;
        if (resScore > 700) return '#eab308';
        if (resScore > 400) return '#16a34a';
        if (resScore > 200) return '#0891b2';
        return '#334155';
      }
      case 'alliance': {
        if (country.allianceId && gameState.alliances[country.allianceId]) {
          return gameState.alliances[country.allianceId].color;
        }
        return '#1e293b';
      }
      default:
        return country.color || '#334155';
    }
  };

  const hoveredCountryData = hoveredCountryId ? getCountryData(hoveredCountryId) : null;

  // Astronomical Subsolar Point & Day/Night Terminator Calculation
  // At 12:00 UTC, sun is at 0° longitude. At 00:00 UTC, sun is at 180° longitude.
  const sunLongitude = useMemo(() => {
    return (12 - gameState.timeOfDayHours) * 15;
  }, [gameState.timeOfDayHours]);

  const sunX = useMemo(() => {
    // Equirectangular projection mapping of sun center
    return ((sunLongitude + 180) / 360) * width;
  }, [sunLongitude, width]);

  // Is a coordinate currently experiencing night?
  const isNightAt = (coords: [number, number]): boolean => {
    const lng = coords[0];
    let diff = Math.abs(lng - sunLongitude) % 360;
    if (diff > 180) diff = 360 - diff;
    return diff > 85; // Beyond 85 degrees from subsolar longitude = night
  };

  const shakeX = shakeIntensity > 0 ? (Math.random() - 0.5) * shakeIntensity * 12 : 0;
  const shakeY = shakeIntensity > 0 ? (Math.random() - 0.5) * shakeIntensity * 12 : 0;

  return (
    <div 
      className="relative w-full h-full overflow-hidden bg-[#070b14] select-none transition-transform duration-75"
      style={{
        transform: shakeIntensity > 0 ? `translate(${shakeX}px, ${shakeY}px)` : undefined,
      }}
      onClick={() => {
        if (contextMenuTarget) setContextMenuTarget(null);
      }}
    >
      <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />

      {/* SVG Map Canvas */}
      <svg
        ref={svgRef}
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onContextMenu={(e) => e.preventDefault()}
      >
        <defs>
          <filter id="selection-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          <filter id="city-night-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* Dynamic Day/Night Terminator Gradient */}
          <linearGradient id="day-night-shader" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#020617" stopOpacity="0.75" />
            <stop offset="20%" stopColor="#020617" stopOpacity="0.75" />
            <stop offset="25%" stopColor="#f59e0b" stopOpacity="0.12" />
            <stop offset="30%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="70%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="75%" stopColor="#f59e0b" stopOpacity="0.12" />
            <stop offset="80%" stopColor="#020617" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#020617" stopOpacity="0.75" />
          </linearGradient>

          {/* Striped Pattern for Annexation In-Progress */}
          <pattern id="annexation-stripes" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="10" stroke="#0284c7" strokeWidth="2.5" opacity="0.4" />
          </pattern>
        </defs>

        {/* Global Pan & Zoom Group */}
        <g transform={`translate(${transform.x}, ${transform.y}) scale(${transform.k})`}>
          
          {/* Ocean Sphere Background */}
          <rect
            x={-500}
            y={-500}
            width={width + 1000}
            height={height + 1000}
            fill="#090e1a"
          />

          {/* Longitude / Latitude Coordinate Mesh */}
          <g opacity="0.12" stroke="#38bdf8" strokeWidth="0.5" fill="none">
            {[-60, -30, 0, 30, 60].map(lat => {
              const y = ((90 - lat) / 180) * height;
              return <line key={`lat-${lat}`} x1="0" y1={y} x2={width} y2={y} strokeDasharray="3 3" />;
            })}
            {[-120, -60, 0, 60, 120].map(lng => {
              const x = ((lng + 180) / 360) * width;
              return <line key={`lng-${lng}`} x1={x} y1="0" x2={x} y2={height} strokeDasharray="3 3" />;
            })}
          </g>

          {/* Country Polygons */}
          <g>
            {countryFeatures.map((f: any, idx: number) => {
              const countryId = f.id;
              const pathString = pathGenerator(f);
              if (!pathString) return null;

              const cData = getCountryData(countryId);
              const isSelected = cData && cData.id === selectedCountryId;
              const isPlayer = cData && cData.id === gameState.playerCountryId;
              const isHovered = cData && cData.id === hoveredCountryId;
              const fillColor = getCountryFill(countryId);

              // Check if partially annexed
              const playerControl = cData ? (gameState.territorialControl?.[gameState.playerCountryId]?.[cData.id] || 0) : 0;
              const isAnnexed = playerControl >= 50 || (cData && cData.occupierId === gameState.playerCountryId);

              return (
                <g key={`feat-grp-${countryId || idx}`}>
                  <path
                    d={pathString}
                    fill={fillColor}
                    stroke={
                      isSelected
                        ? '#38bdf8'
                        : isPlayer || isAnnexed
                        ? '#38bdf8'
                        : isHovered
                        ? '#e2e8f0'
                        : '#0f172a'
                    }
                    strokeWidth={
                      isSelected
                        ? 2.2 / transform.k
                        : isPlayer || isAnnexed
                        ? 1.6 / transform.k
                        : isHovered
                        ? 1.2 / transform.k
                        : 0.6 / transform.k
                    }
                    strokeLinejoin="round"
                    className="transition-all duration-150 cursor-pointer"
                    style={{
                      filter: isSelected ? 'url(#selection-glow)' : undefined,
                      opacity: isHovered ? 0.95 : 0.85,
                    }}
                    onMouseEnter={() => {
                      if (cData) {
                        setHoveredCountryId(cData.id);
                        sound.playClick(900, 0.015);
                      }
                    }}
                    onMouseLeave={() => setHoveredCountryId(null)}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (cData) {
                        sound.playClick(750, 0.05);
                        onSelectCountry(cData.id);
                      }
                    }}
                    onContextMenu={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (cData) {
                        sound.playClick(850, 0.04);
                        setContextMenuTarget({
                          country: cData,
                          pos: { x: e.clientX, y: e.clientY },
                        });
                      }
                    }}
                  />

                  {/* Partial Annexation Overlay Stripes */}
                  {playerControl > 0 && playerControl < 50 && (
                    <path
                      d={pathString}
                      fill="url(#annexation-stripes)"
                      pointerEvents="none"
                      stroke="none"
                    />
                  )}
                </g>
              );
            })}
          </g>

          {/* Dynamic Day / Night Planetary Lighting Shader */}
          {/* Dual rect seamlessly wraps across international date line */}
          <rect
            x={sunX - width}
            y={0}
            width={width}
            height={height}
            fill="url(#day-night-shader)"
            pointerEvents="none"
            className="transition-all duration-500"
          />
          <rect
            x={sunX}
            y={0}
            width={width}
            height={height}
            fill="url(#day-night-shader)"
            pointerEvents="none"
            className="transition-all duration-500"
          />

          {/* Shimmering Nighttime City Lights Layer */}
          <g className="pointer-events-none">
            {Object.values(gameState.countries).map(c => {
              if (!c.capitalCoordinates) return null;
              const isNight = isNightAt(c.capitalCoordinates);
              const p = projection(c.capitalCoordinates);
              if (!p || !isNight) return null;

              return (
                <circle
                  key={`night-light-cap-${c.id}`}
                  cx={p[0]}
                  cy={p[1]}
                  r={1.8 / transform.k}
                  fill="#fbbf24"
                  opacity={0.8}
                  filter="url(#city-night-glow)"
                />
              );
            })}
          </g>

          {/* Capital & Major Sovereign Cities Layer */}
          {transform.k > 1.5 && (
            <g className="pointer-events-none">
              {Object.values(gameState.countries).map(c => {
                const projectedCap = projection(c.capitalCoordinates);
                const isSelected = c.id === selectedCountryId;
                const isPlayer = c.id === gameState.playerCountryId;

                return (
                  <g key={`cities-group-${c.id}`}>
                    {/* Capital City Marker */}
                    {projectedCap && (
                      <g transform={`translate(${projectedCap[0]}, ${projectedCap[1]})`}>
                        <circle
                          r={isSelected ? 3.8 / transform.k : 2.5 / transform.k}
                          fill={isSelected ? '#38bdf8' : isPlayer ? '#60a5fa' : '#fbbf24'}
                          stroke="#070b14"
                          strokeWidth={1 / transform.k}
                        />
                        {transform.k > 2.2 && (
                          <text
                            y={-4 / transform.k}
                            textAnchor="middle"
                            fill="#f8fafc"
                            fontSize={8 / transform.k}
                            fontWeight="bold"
                            className="font-sans drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]"
                          >
                            ★ {isPersian ? c.nameFa : c.capital}
                          </text>
                        )}
                      </g>
                    )}

                    {/* Secondary Major Cities at Higher Zoom */}
                    {transform.k > 3.0 && c.cities && c.cities.filter(city => !city.isCapital).map(city => {
                      const projCity = projection(city.coordinates);
                      if (!projCity) return null;
                      return (
                        <g key={city.id} transform={`translate(${projCity[0]}, ${projCity[1]})`}>
                          <circle
                            r={1.8 / transform.k}
                            fill="#94a3b8"
                            stroke="#070b14"
                            strokeWidth={0.8 / transform.k}
                          />
                          <text
                            y={-3 / transform.k}
                            textAnchor="middle"
                            fill="#cbd5e1"
                            fontSize={6.5 / transform.k}
                            className="font-sans drop-shadow"
                          >
                            {isPersian ? city.nameFa : city.name}
                          </text>
                        </g>
                      );
                    })}
                  </g>
                );
              })}
            </g>
          )}

          {/* Active Ballistic Missile Trajectories & Impact Explosions */}
          {gameState.activeStrikes && gameState.activeStrikes.map(strike => {
            const p1 = projection(strike.fromCoords);
            const p2 = projection(strike.toCoords);
            if (!p1 || !p2) return null;

            const dx = p2[0] - p1[0];
            const dy = p2[1] - p1[1];
            const dist = Math.sqrt(dx * dx + dy * dy);
            const midX = (p1[0] + p2[0]) / 2;
            const midY = (p1[1] + p2[1]) / 2 - Math.min(80, dist * 0.35); // Elevated sub-orbital arc

            const pathD = `M ${p1[0]} ${p1[1]} Q ${midX} ${midY} ${p2[0]} ${p2[1]}`;
            const isHostile = strike.isHostileToPlayer;

            return (
              <g key={strike.id} className="pointer-events-none">
                {/* Glowing Missile Arc Trail */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={isHostile ? '#ef4444' : '#f59e0b'}
                  strokeWidth={2 / transform.k}
                  strokeDasharray="5 3"
                  opacity="0.9"
                />

                {/* Impact Explosion Ring */}
                <g transform={`translate(${p2[0]}, ${p2[1]})`}>
                  <circle
                    r={7 / transform.k}
                    fill={isHostile ? '#dc2626' : '#f97316'}
                    className="animate-ping"
                    opacity="0.8"
                  />
                  <circle
                    r={3.5 / transform.k}
                    fill={isHostile ? '#ef4444' : '#fbbf24'}
                  />
                </g>
              </g>
            );
          })}

          {/* Spy Network Intelligence & Reconnaissance Overlay (Uncovered foreign assets!) */}
          {gameState.spyNetworks && Object.entries(gameState.spyNetworks).map(([countryId, spyNet]) => {
            if (!spyNet || spyNet.infiltrationLevel < 40) return null;
            const targetCountry = gameState.countries[countryId];
            if (!targetCountry || !targetCountry.capitalCoordinates) return null;
            const p = projection(targetCountry.capitalCoordinates);
            if (!p) return null;

            return (
              <g key={`spy-recon-${countryId}`} transform={`translate(${p[0]}, ${p[1] - 18 / transform.k})`} className="pointer-events-none">
                {/* Recon Radar Ring */}
                <circle
                  r={12 / transform.k}
                  fill="none"
                  stroke="#10b981"
                  strokeWidth={1 / transform.k}
                  strokeDasharray="2 2"
                  className="animate-spin-slow opacity-80"
                />
                <circle
                  r={3 / transform.k}
                  fill="#10b981"
                />

                {/* Tactical Recon Dossier Banner */}
                <g transform={`translate(${14 / transform.k}, ${-6 / transform.k})`}>
                  <rect
                    x={0}
                    y={0}
                    width={95 / transform.k}
                    height={22 / transform.k}
                    rx={3 / transform.k}
                    fill="#022c22"
                    stroke="#10b981"
                    strokeWidth={0.8 / transform.k}
                    opacity="0.92"
                  />
                  <text
                    x={4 / transform.k}
                    y={9 / transform.k}
                    fill="#34d399"
                    fontSize={6.5 / transform.k}
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    RECON: {targetCountry.buildings.missileSilos} SILOS
                  </text>
                  <text
                    x={4 / transform.k}
                    y={17 / transform.k}
                    fill="#6ee7b7"
                    fontSize={6 / transform.k}
                    fontFamily="monospace"
                  >
                    ARMY: {targetCountry.military.infantry}k • {targetCountry.buildings.airDefenseBunkers} RADAR
                  </text>
                </g>
              </g>
            );
          })}

        </g>
      </svg>

      {/* Day / Night Planetary Indicator HUD (Top Left) */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 bg-slate-900/90 border border-sky-500/30 rounded-xl shadow-2xl backdrop-blur-md text-xs font-sans text-slate-200">
        {gameState.timeOfDayHours >= 6 && gameState.timeOfDayHours < 18 ? (
          <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
        ) : (
          <Moon className="w-4 h-4 text-sky-400" />
        )}
        <div className="flex items-center gap-1 font-mono font-bold tabular-nums">
          <span>{Math.floor(gameState.timeOfDayHours).toString().padStart(2, '0')}</span>:
          <span>{Math.floor((gameState.timeOfDayHours % 1) * 60).toString().padStart(2, '0')}</span>
          <span className="text-[10px] text-slate-400 font-sans ml-1">UTC</span>
        </div>
        <div className="w-px h-3.5 bg-slate-700/60 mx-1" />
        <span className="text-[11px] text-slate-300">
          {gameState.timeOfDayHours >= 6 && gameState.timeOfDayHours < 18 
            ? (isPersian ? 'روز خورشیدی' : 'Daylight') 
            : (isPersian ? 'شب مداری' : 'Orbital Night')}
        </span>
      </div>

      {/* Floating Tactical Hover Tooltip */}
      {hoveredCountryData && !contextMenuTarget && (
        <div
          className="fixed z-50 pointer-events-none px-3.5 py-2.5 bg-slate-900/95 border border-sky-500/40 rounded-xl shadow-2xl backdrop-blur-md text-xs font-sans text-slate-100 max-w-xs transition-opacity duration-100"
          style={{
            left: Math.min(window.innerWidth - 230, mousePos.x + 16),
            top: Math.min(window.innerHeight - 180, mousePos.y + 16),
          }}
        >
          <div className="flex items-center gap-2 border-b border-slate-700/60 pb-1.5 mb-1.5">
            <span className="text-xl">{hoveredCountryData.flagEmoji}</span>
            <div>
              <div className="font-bold text-sky-400">
                {isPersian ? hoveredCountryData.nameFa : hoveredCountryData.name}
              </div>
              <div className="text-[10px] text-slate-400">
                Capital: {hoveredCountryData.capital}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
            <div>
              <span className="text-slate-400">GDP: </span>
              <span className="font-semibold text-emerald-400 tabular-nums">${hoveredCountryData.gdp}B</span>
            </div>
            <div>
              <span className="text-slate-400">Pop: </span>
              <span className="font-semibold tabular-nums">{hoveredCountryData.population}M</span>
            </div>
            <div>
              <span className="text-slate-400">Forces: </span>
              <span className="font-semibold text-rose-400 tabular-nums">{hoveredCountryData.military.infantry}k</span>
            </div>
            <div>
              <span className="text-slate-400">Missiles: </span>
              <span className="font-semibold text-amber-400 tabular-nums">{hoveredCountryData.military.missiles || 0}</span>
            </div>
          </div>

          {/* Right-click Hint */}
          <div className="mt-2 pt-1.5 border-t border-slate-800 text-[9px] text-sky-400/90 font-medium flex items-center gap-1">
            <span>🖱️ {isPersian ? 'کلیک راست: منوی تاکتیکی / سازندگی' : 'Right-Click: Tactical / Build Menu'}</span>
          </div>
        </div>
      )}

      {/* Right-Click Tactical Context Menu Modal */}
      {contextMenuTarget && onLaunchAttack && onBuildStructure && (
        <TacticalContextMenu
          country={contextMenuTarget.country}
          gameState={gameState}
          position={contextMenuTarget.pos}
          onClose={() => setContextMenuTarget(null)}
          onLaunchAttack={onLaunchAttack}
          onBuildStructure={onBuildStructure}
          language={language}
        />
      )}

      {/* Map Control Toolbar (Bottom Right) */}
      <div className="absolute bottom-5 right-5 z-20 flex flex-col items-center gap-1.5 bg-slate-900/90 border border-sky-500/30 rounded-xl p-1.5 shadow-2xl backdrop-blur-md">
        <button
          onClick={() => handleZoom(1.3)}
          className="p-2 text-slate-300 hover:text-sky-400 hover:bg-sky-500/10 rounded-lg transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleZoom(0.77)}
          className="p-2 text-slate-300 hover:text-sky-400 hover:bg-sky-500/10 rounded-lg transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <div className="w-6 h-px bg-slate-700/60 my-0.5" />
        <button
          onClick={handleReset}
          className="p-2 text-slate-300 hover:text-sky-400 hover:bg-sky-500/10 rounded-lg transition-colors"
          title="Reset View"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Map Mode Selector (Top Center) */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 bg-slate-900/90 border border-sky-500/30 rounded-2xl p-1 shadow-2xl backdrop-blur-md overflow-x-auto max-w-[95vw]">
        {[
          { id: 'political', label: 'Political', labelFa: 'سیاسی', icon: Globe2 },
          { id: 'economic', label: 'Economy', labelFa: 'اقتصادی', icon: TrendingUp },
          { id: 'military', label: 'Military', labelFa: 'نظامی', icon: Swords },
          { id: 'diplomatic', label: 'Diplomacy', labelFa: 'دیپلماسی', icon: Handshake },
          { id: 'population', label: 'Demographics', labelFa: 'جمعیت', icon: Users2 },
          { id: 'resources', label: 'Resources', labelFa: 'منابع', icon: Gem },
          { id: 'alliance', label: 'Alliances', labelFa: 'ائتلاف‌ها', icon: Layers },
        ].map(mode => {
          const Icon = mode.icon;
          const isActive = mapMode === mode.id;
          return (
            <button
              key={mode.id}
              onClick={() => {
                sound.playClick(650, 0.03);
                onSetMapMode(mode.id as MapMode);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-sky-500 text-slate-950 font-bold shadow-md shadow-sky-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{isPersian ? mode.labelFa : mode.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
