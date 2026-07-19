import React, { useState } from 'react';

export const locations = [
  // Inner Sections
  { id: 'sec-100', name: 'Section 100', type: 'section', innerR: 160, outerR: 250, startA: -45, endA: 45 },
  { id: 'sec-200', name: 'Section 200', type: 'section', innerR: 160, outerR: 250, startA: 45, endA: 135 },
  { id: 'sec-300', name: 'Section 300', type: 'section', innerR: 160, outerR: 250, startA: 135, endA: 225 },
  { id: 'sec-400', name: 'Section 400', type: 'section', innerR: 160, outerR: 250, startA: 225, endA: 315 },
  
  // Outer Ring Top
  { id: 'acc-1', name: 'Acc. Ent. 1', type: 'accessible', innerR: 255, outerR: 350, startA: -45, endA: -15 },
  { id: 'gate-a', name: 'Gate A', type: 'gate', innerR: 255, outerR: 350, startA: -15, endA: 15 },
  { id: 'rr-1', name: 'Restroom 1', type: 'restroom', innerR: 255, outerR: 350, startA: 15, endA: 45 },

  // Outer Ring Right
  { id: 'fc-1', name: 'Food Court 1', type: 'food', innerR: 255, outerR: 350, startA: 45, endA: 75 },
  { id: 'gate-b', name: 'Gate B', type: 'gate', innerR: 255, outerR: 350, startA: 75, endA: 105 },
  { id: 'acc-2', name: 'Acc. Ent. 2', type: 'accessible', innerR: 255, outerR: 350, startA: 105, endA: 135 },

  // Outer Ring Bottom
  { id: 'rr-2', name: 'Restroom 2', type: 'restroom', innerR: 255, outerR: 350, startA: 135, endA: 165 },
  { id: 'gate-c', name: 'Gate C', type: 'gate', innerR: 255, outerR: 350, startA: 165, endA: 195 },
  { id: 'med-1', name: 'Medical Station', type: 'medical', innerR: 255, outerR: 350, startA: 195, endA: 225 },

  // Outer Ring Left
  { id: 'fc-2', name: 'Food Court 2', type: 'food', innerR: 255, outerR: 350, startA: 225, endA: 270 },
  { id: 'gate-d', name: 'Gate D', type: 'gate', innerR: 255, outerR: 350, startA: 270, endA: 315 },
];

const Y_SQUASH = 0.75;

const createWedge = (x, y, innerRadius, outerRadius, startAngle, endAngle) => {
  const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians) * Y_SQUASH)
    };
  };

  const startOut = polarToCartesian(x, y, outerRadius, endAngle);
  const endOut = polarToCartesian(x, y, outerRadius, startAngle);
  const startIn = polarToCartesian(x, y, innerRadius, endAngle);
  const endIn = polarToCartesian(x, y, innerRadius, startAngle);

  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  return [
    "M", startOut.x, startOut.y,
    "A", outerRadius, outerRadius * Y_SQUASH, 0, largeArcFlag, 0, endOut.x, endOut.y,
    "L", endIn.x, endIn.y,
    "A", innerRadius, innerRadius * Y_SQUASH, 0, largeArcFlag, 1, startIn.x, startIn.y,
    "Z"
  ].join(" ");
};

const MapGrid = ({ stadiumData, selectedBox, onSelectBox, large = false }) => {
  const [hoveredId, setHoveredId] = useState(null);

  const getDensityStyles = (id) => {
    if (!stadiumData || !stadiumData.densities || stadiumData.densities[id] == null) {
      return { fill: 'rgba(51, 65, 85, 0.7)', stroke: 'rgb(100, 116, 139)', textFill: '#cbd5e1', pulse: false };
    }
    const density = stadiumData.densities[id];
    if (density < 40) return { fill: 'rgba(16, 185, 129, 0.8)', stroke: 'rgb(52, 211, 153)', textFill: '#ecfdf5', pulse: false };
    if (density <= 70) return { fill: 'rgba(245, 158, 11, 0.8)', stroke: 'rgb(251, 191, 36)', textFill: '#fffbeb', pulse: false };
    return { fill: 'rgba(220, 38, 38, 0.9)', stroke: 'rgb(248, 113, 113)', textFill: '#fef2f2', pulse: true };
  };

  return (
    <div className={`w-full ${large ? 'max-w-6xl' : 'max-w-5xl'} bg-slate-800/50 backdrop-blur-md p-6 rounded-3xl shadow-2xl border border-slate-700/50 flex justify-center items-center`}>
      <svg viewBox="0 0 800 600" className="w-full h-auto drop-shadow-xl" style={{ maxHeight: large ? '600px' : '450px' }}>
        <defs>
          <radialGradient id="pitchGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(34, 197, 94, 0.3)" />
            <stop offset="100%" stopColor="rgba(21, 128, 61, 0.1)" />
          </radialGradient>
        </defs>

        {/* Center Field (Pitch) */}
        <g transform="translate(400, 300)">
          {/* Pitch grass */}
          <ellipse cx="0" cy="0" rx="140" ry={140 * Y_SQUASH} fill="url(#pitchGlow)" stroke="rgba(34, 197, 94, 0.5)" strokeWidth="2" />
          <rect x="-90" y={-50 * Y_SQUASH} width="180" height={100 * Y_SQUASH} fill="rgba(21, 128, 61, 0.4)" stroke="rgba(74, 222, 128, 0.6)" strokeWidth="2" rx="4" />
          
          {/* Pitch Markings */}
          <line x1="0" y1={-50 * Y_SQUASH} x2="0" y2={50 * Y_SQUASH} stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
          <ellipse cx="0" cy="0" rx="20" ry={20 * Y_SQUASH} fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
          
          {/* Goal Boxes */}
          <rect x="-90" y={-20 * Y_SQUASH} width="15" height={40 * Y_SQUASH} fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
          <rect x="75" y={-20 * Y_SQUASH} width="15" height={40 * Y_SQUASH} fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
        </g>

        {/* Zones */}
        <g>
          {locations.map((loc) => {
            const styles = getDensityStyles(loc.id);
            const isHovered = hoveredId === loc.id;
            const isSelected = selectedBox === loc.name;
            const wedgePath = createWedge(400, 300, loc.innerR, loc.outerR, loc.startA, loc.endA);
            
            // Calculate text position
            const midAngle = (loc.startA + loc.endA) / 2;
            const midRadius = loc.innerR + (loc.outerR - loc.innerR) / 2;
            const textX = 400 + (midRadius * Math.cos((midAngle - 90) * Math.PI / 180.0));
            const textY = 300 + (midRadius * Math.sin((midAngle - 90) * Math.PI / 180.0) * Y_SQUASH);

            return (
              <g 
                key={loc.id}
                onClick={() => onSelectBox && onSelectBox(loc.name)}
                onMouseEnter={() => setHoveredId(loc.id)}
                onMouseLeave={() => setHoveredId(null)}
                className={`${onSelectBox ? 'cursor-pointer' : 'cursor-default'}`}
                style={{
                  transition: 'all 0.3s ease',
                  transformOrigin: `${textX}px ${textY}px`,
                  transform: (isHovered && onSelectBox) || isSelected ? 'scale(1.02)' : 'scale(1)'
                }}
              >
                <path 
                  d={wedgePath} 
                  fill={styles.fill} 
                  stroke={isSelected ? '#fff' : styles.stroke} 
                  strokeWidth={isSelected ? '4' : '2'}
                  className={styles.pulse ? 'animate-pulse' : ''}
                  style={{
                    filter: isHovered && onSelectBox ? 'brightness(1.2)' : 'none',
                    transition: 'all 0.3s ease'
                  }}
                />
                
                <text 
                  x={textX} 
                  y={textY} 
                  textAnchor="middle" 
                  dominantBaseline="middle"
                  fill={styles.textFill}
                  className={`font-bold ${large ? 'text-sm' : 'text-xs'} pointer-events-none`}
                  style={{ textShadow: '0px 1px 3px rgba(0,0,0,0.8)' }}
                >
                  {loc.name}
                </text>
                
                {large && stadiumData && stadiumData.densities[loc.id] != null && (
                  <text
                    x={textX}
                    y={textY + (large ? 18 : 14)}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="rgba(255,255,255,0.9)"
                    className="text-[10px] font-mono pointer-events-none"
                    style={{ textShadow: '0px 1px 3px rgba(0,0,0,0.8)' }}
                  >
                    Density: {stadiumData.densities[loc.id]}%
                  </text>
                )}
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
};

const MemoizedMapGrid = React.memo(MapGrid);
export default MemoizedMapGrid;
