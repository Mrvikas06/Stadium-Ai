import { useEffect, useState } from 'react';

// Get color based on density for Light Theme Professional look
function getDensityColor(density) {
  if (density < 0.4) return 'rgba(16, 185, 129, 0.7)'; // Emerald (OK)
  if (density < 0.7) return 'rgba(245, 158, 11, 0.7)'; // Amber (Warn)
  return 'rgba(239, 68, 68, 0.75)'; // Red (Danger)
}

const ZONE_DESCRIPTIONS = {
  N: { name: 'North Stand', status: 'High Occupancy (>90%)', tip: 'Congestion detected on Ramp N2. Directing fans to Gate 4 exit.' },
  S: { name: 'South Stand', status: 'Optimal Flow (65-72%)', tip: 'Restroom Block 2 is clear. Concourse A flowing freely.' },
  E: { name: 'East Stand', status: 'Normal Flow (45-55%)', tip: 'Fast food queue at Food Court B. Escalator 2 operational.' },
  W: { name: 'West Stand', status: 'Smooth Flow (60-68%)', tip: 'Recommended breezeway exit zone. Minimal delay.' },
  NE: { name: 'North-East Concourse', status: 'Moderate Traffic', tip: 'Corridor C2 clear.' },
  NW: { name: 'North-West Concourse', status: 'Moderate Traffic', tip: 'Stairwell NW3 clear.' },
  SE: { name: 'South-East Concourse', status: 'Light Traffic', tip: 'Family zone and accessible restrooms clear.' },
  SW: { name: 'South-West Concourse', status: 'Light Traffic', tip: 'Fastest transit route to perimeter parking.' }
};

const GATE_DESCRIPTIONS = {
  g1: { name: 'Gate 1 (Main Entrance)', status: 'High Wait (~14m)', tip: 'Heavy queue. Re-route arriving spectators to Gate 4.' },
  g2: { name: 'Gate 2 (East Concourse)', status: 'Normal Flow (~4m)', tip: 'Fast-pass ticket scanning active.' },
  g3: { name: 'Gate 3 (South Concourse)', status: 'Clear Flow (~2m)', tip: 'Accessible entrance open with zero delay.' },
  g4: { name: 'Gate 4 (West Concourse)', status: 'Fastest (~1m)', tip: 'Recommended exit for all North and West concourse attendees.' }
};

const FACILITIES = [
  { id: 'fc1', type: 'food', x: 280, y: 130, label: 'FC-A', name: 'Food Court A (East)', status: '18 min wait', tip: 'Burgers, pizza, and beverages. High wait time.' },
  { id: 'fc2', type: 'food', x: 120, y: 170, label: 'FC-B', name: 'Food Court B (West)', status: '4 min wait (FASTEST)', tip: 'Chai, cold beverages, and express meal boxes.' },
  { id: 'med1', type: 'medical', x: 340, y: 110, label: 'AID 1', name: 'First Aid Post 1', status: 'Open / Staffed', tip: 'Full medical staff, triage, and defibrillator (AED) on-site.' },
  { id: 'med2', type: 'medical', x: 140, y: 45, label: 'AID 2', name: 'North Medical Standby', status: 'Open / Staffed', tip: 'Paramedic rapid-response station for North Stand.' },
  { id: 'el1', type: 'access', x: 75, y: 110, label: 'ELEV 1', name: 'West Concourse Elevator', status: 'Operational', tip: 'Priority wheelchair and accessibility lift to Upper West.' },
  { id: 'el2', type: 'access', x: 325, y: 190, label: 'ELEV 2', name: 'East Concourse Elevator', status: 'Operational', tip: 'Direct ramp connection to East Club lounge and restrooms.' }
];

export default function HeatmapCanvas({ activeRoute, densityData, onSelectLocation }) {
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeLayer, setActiveLayer] = useState('all'); // all, heatmap, food, medical, access
  const [data, setData] = useState({
    zones: [
      { id: 'N', x: 200, y: 60, d: 0.95, label: 'N' },
      { id: 'S', x: 200, y: 240, d: 0.66, label: 'S' },
      { id: 'E', x: 320, y: 150, d: 0.44, label: 'E' },
      { id: 'W', x: 80, y: 150, d: 0.62, label: 'W' },
      { id: 'NE', x: 290, y: 80, d: 0.79, label: 'NE' },
      { id: 'NW', x: 110, y: 80, d: 0.82, label: 'NW' },
      { id: 'SE', x: 290, y: 220, d: 0.53, label: 'SE' },
      { id: 'SW', x: 110, y: 220, d: 0.39, label: 'SW' }
    ],
    gates: [
      { id: 'g1', x: 200, y: 20, label: 'Gate 1', color: '#ef4444' }, // Congested
      { id: 'g2', x: 370, y: 150, label: 'Gate 2', color: '#3b82f6' }, // Flowing
      { id: 'g3', x: 200, y: 280, label: 'Gate 3', color: '#3b82f6' }, // Flowing
      { id: 'g4', x: 30, y: 150, label: 'Gate 4', color: '#10b981' }   // Clear
    ]
  });

  // Sync external density if provided, else simulate
  useEffect(() => {
    if (densityData) {
      setData((prev) => ({
        ...prev,
        zones: prev.zones.map((z) => ({
          ...z,
          d: densityData[z.id] !== undefined ? densityData[z.id] : z.d
        }))
      }));
      return;
    }

    const interval = setInterval(() => {
      setData((prev) => ({
        ...prev,
        zones: prev.zones.map(z => ({
          ...z,
          d: Math.max(0.1, Math.min(0.99, z.d + (Math.random() - 0.5) * 0.15))
        }))
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, [densityData]);

  const handleSelectZone = (zone) => {
    const desc = ZONE_DESCRIPTIONS[zone.id] || { name: `${zone.label} Zone`, status: 'Active', tip: 'Monitored live.' };
    const item = {
      type: 'zone',
      id: zone.id,
      name: desc.name,
      density: Math.round(zone.d * 100),
      status: desc.status,
      tip: desc.tip
    };
    setSelectedItem(item);
    onSelectLocation?.(item);
  };

  const handleSelectGate = (gate) => {
    const desc = GATE_DESCRIPTIONS[gate.id] || { name: gate.label, status: 'Active', tip: 'Monitored live.' };
    const item = {
      type: 'gate',
      id: gate.id,
      name: desc.name,
      status: desc.status,
      tip: desc.tip
    };
    setSelectedItem(item);
    onSelectLocation?.(item);
  };

  const handleSelectFacility = (fac) => {
    const item = {
      type: fac.type,
      id: fac.id,
      name: fac.name,
      status: fac.status,
      tip: fac.tip
    };
    setSelectedItem(item);
    onSelectLocation?.(item);
  };

  // Compute SVG coordinates for the active route path
  const getRouteSvgPath = () => {
    if (!activeRoute || !activeRoute.stand) return null;
    switch (activeRoute.stand) {
      case 'North':
        return 'M 200 20 L 200 60';
      case 'South':
        return 'M 200 280 L 200 240';
      case 'East':
        return 'M 370 150 L 320 150';
      case 'West':
        return 'M 30 150 L 80 150';
      default:
        return 'M 200 20 L 200 60';
    }
  };

  const routePathD = getRouteSvgPath();

  const showHeatmap = activeLayer === 'all' || activeLayer === 'heatmap';
  const showFood = activeLayer === 'all' || activeLayer === 'food';
  const showMedical = activeLayer === 'all' || activeLayer === 'medical';
  const showAccess = activeLayer === 'all' || activeLayer === 'access';

  return (
    <div className="heatmap-wrapper">
      {/* LAYER FILTER TOOLBAR */}
      <div className="layer-filter-bar" role="toolbar" aria-label="Map layers filter">
        <button
          className={`layer-chip ${activeLayer === 'all' ? 'active' : ''}`}
          onClick={() => setActiveLayer('all')}
        >
          All Layers
        </button>
        <button
          className={`layer-chip ${activeLayer === 'heatmap' ? 'active' : ''}`}
          onClick={() => setActiveLayer('heatmap')}
        >
          Heatmap Only
        </button>
        <button
          className={`layer-chip ${activeLayer === 'food' ? 'active' : ''}`}
          onClick={() => setActiveLayer('food')}
        >
          Food Courts
        </button>
        <button
          className={`layer-chip ${activeLayer === 'medical' ? 'active' : ''}`}
          onClick={() => setActiveLayer('medical')}
        >
          Medical / AED
        </button>
        <button
          className={`layer-chip ${activeLayer === 'access' ? 'active' : ''}`}
          onClick={() => setActiveLayer('access')}
        >
          Elevators
        </button>
      </div>

      <div className="heatmap-container" style={{ position: 'relative', width: '100%', aspectRatio: '4/3', minHeight: '260px' }}>
        <svg
          viewBox="0 0 400 300"
          role="img"
          aria-label="Interactive stadium occupancy and crowd density map"
          style={{ width: '100%', height: '100%', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.05))' }}
        >
          <defs>
            {/* Soft blur for heatmap zones */}
            <filter id="heat-blur" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="15" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            {/* Subtle grid pattern for the pitch */}
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#e2e8f0" strokeWidth="0.5" />
            </pattern>
          </defs>

          {/* Outer Grounds Layer */}
          <rect x="25" y="15" width="350" height="270" rx="100" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" />

          {/* Inner Concourse boundary */}
          <rect x="60" y="40" width="280" height="220" rx="75" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="4 4" />

          {/* Field Area (Pitch) */}
          <rect x="130" y="80" width="140" height="140" rx="20" fill="url(#grid)" stroke="#94a3b8" strokeWidth="2" />

          {/* Center circle and line */}
          <circle cx="200" cy="150" r="25" fill="none" stroke="#94a3b8" strokeWidth="1.5" />
          <line x1="130" y1="150" x2="270" y2="150" stroke="#94a3b8" strokeWidth="1.5" />

          {/* Goal Boxes */}
          <rect x="175" y="80" width="50" height="20" fill="none" stroke="#94a3b8" strokeWidth="1" />
          <rect x="175" y="200" width="50" height="20" fill="none" stroke="#94a3b8" strokeWidth="1" />

          {/* HEATMAP OVERLAYS */}
          {showHeatmap && (
            <g filter="url(#heat-blur)">
              {data.zones.map(zone => (
                <circle
                  key={zone.id}
                  cx={zone.x}
                  cy={zone.y}
                  r={15 + (zone.d * 20)}
                  fill={getDensityColor(zone.d)}
                  style={{ transition: 'all 1.5s ease', pointerEvents: 'none' }}
                />
              ))}
            </g>
          )}

          {/* ANIMATED WAYFINDING ROUTE PATH */}
          {routePathD && (
            <g>
              <path
                d={routePathD}
                fill="none"
                stroke="#2563eb"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray="6 6"
              >
                <animate
                  attributeName="stroke-dashoffset"
                  from="24"
                  to="0"
                  dur="1s"
                  repeatCount="indefinite"
                />
              </path>
            </g>
          )}

          {/* LABELS AND DATA PILLS (CLICKABLE) */}
          {showHeatmap && data.zones.map(zone => {
            const isSelected = selectedItem?.type === 'zone' && selectedItem?.id === zone.id;
            return (
              <g
                key={`lbl-${zone.id}`}
                transform={`translate(${zone.x}, ${zone.y})`}
                onClick={() => handleSelectZone(zone)}
                style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
              >
                {isSelected && (
                  <circle cx="0" cy="0" r="24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeDasharray="3 3">
                    <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="4s" repeatCount="indefinite" />
                  </circle>
                )}
                <rect
                  x="-16"
                  y="-10"
                  width="32"
                  height="20"
                  rx="4"
                  fill={isSelected ? '#2563eb' : 'rgba(255,255,255,0.92)'}
                  stroke={isSelected ? '#1d4ed8' : '#cbd5e1'}
                  strokeWidth={isSelected ? 1.5 : 1}
                />
                <text
                  x="0"
                  y="3"
                  fontSize="10"
                  fontFamily="Inter, sans-serif"
                  fontWeight="700"
                  fill={isSelected ? '#ffffff' : '#334155'}
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  {Math.round(zone.d * 100)}%
                </text>
                <text
                  x="0"
                  y="-16"
                  fontSize="11"
                  fontFamily="Inter, sans-serif"
                  fontWeight="600"
                  fill={isSelected ? '#1d4ed8' : '#64748b'}
                  textAnchor="middle"
                >
                  {zone.label}
                </text>
              </g>
            );
          })}

          {/* GATES (ENTRY/EXIT POINTS) */}
          {data.gates.map(gate => {
            const isSelected = selectedItem?.type === 'gate' && selectedItem?.id === gate.id;
            return (
              <g
                key={gate.id}
                onClick={() => handleSelectGate(gate)}
                style={{ cursor: 'pointer' }}
              >
                <circle cx={gate.x} cy={gate.y} r={isSelected ? 16 : 12} fill={gate.color} opacity={isSelected ? 0.35 : 0.15}>
                  <animate attributeName="r" values="8;16;8" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.3;0;0.3" dur="2s" repeatCount="indefinite" />
                </circle>
                <circle cx={gate.x} cy={gate.y} r={isSelected ? 6 : 5} fill="#fff" stroke={gate.color} strokeWidth={isSelected ? 3 : 2} />
                <rect
                  x={gate.x - 24}
                  y={gate.y > 150 ? gate.y + 8 : gate.y - 20}
                  width="48"
                  height="14"
                  rx="3"
                  fill={isSelected ? gate.color : '#ffffff'}
                  stroke={gate.color}
                  strokeWidth="1"
                />
                <text
                  x={gate.x}
                  y={gate.y > 150 ? gate.y + 17 : gate.y - 11}
                  fontSize="8"
                  fontFamily="Inter, sans-serif"
                  fontWeight="600"
                  fill={isSelected ? '#ffffff' : gate.color}
                  textAnchor="middle"
                >
                  {gate.label}
                </text>
              </g>
            );
          })}

          {/* FACILITY PINS: CONCESSIONS, MEDICAL, ACCESSIBILITY */}
          {FACILITIES.map(fac => {
            const isVisible = (fac.type === 'food' && showFood) ||
                              (fac.type === 'medical' && showMedical) ||
                              (fac.type === 'access' && showAccess);
            if (!isVisible) return null;

            const isSelected = selectedItem?.id === fac.id;
            const badgeColor = fac.type === 'food' ? '#f59e0b' : fac.type === 'medical' ? '#ef4444' : '#8b5cf6';

            return (
              <g
                key={fac.id}
                transform={`translate(${fac.x}, ${fac.y})`}
                onClick={() => handleSelectFacility(fac)}
                style={{ cursor: 'pointer' }}
              >
                <circle cx="0" cy="0" r={isSelected ? 14 : 10} fill={badgeColor} opacity={0.2}>
                  <animate attributeName="r" values="9;14;9" dur="2s" repeatCount="indefinite" />
                </circle>
                <rect
                  x="-18"
                  y="-9"
                  width="36"
                  height="18"
                  rx="4"
                  fill={isSelected ? badgeColor : '#ffffff'}
                  stroke={badgeColor}
                  strokeWidth="1.5"
                />
                <text
                  x="0"
                  y="2"
                  fontSize="8"
                  fontFamily="Inter, sans-serif"
                  fontWeight="700"
                  fill={isSelected ? '#ffffff' : badgeColor}
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  {fac.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* INTERACTIVE INSPECTOR CARD */}
      {selectedItem ? (
        <div className="zone-inspector-card">
          <div className="inspector-header">
            <div>
              <span className="inspector-tag">
                {selectedItem.type === 'zone' ? 'Stand Zone' :
                 selectedItem.type === 'gate' ? 'Entry / Exit Gate' :
                 selectedItem.type === 'food' ? 'Concession / Food Court' :
                 selectedItem.type === 'medical' ? 'Medical Station' : 'Accessible Elevator'}
              </span>
              <h4 className="inspector-title">{selectedItem.name}</h4>
            </div>
            <button className="inspector-close" onClick={() => setSelectedItem(null)} aria-label="Close inspector">
              ✕
            </button>
          </div>
          <div className="inspector-body">
            <span className="inspector-status">{selectedItem.status}</span>
            <p className="inspector-tip">{selectedItem.tip}</p>
          </div>
        </div>
      ) : (
        <div className="map-hint">
          <span>Tip: Click on any Stand (N, S, E, W), Gate, Concession, or First Aid marker to view live data.</span>
        </div>
      )}
    </div>
  );
}
