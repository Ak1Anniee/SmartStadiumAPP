import React, { useState } from 'react';

export const locations = [
  // Ring 1: Inner Sections (140 to 220)
  { id: 'sec-100', name: 'Section 100', type: 'section', innerR: 140, outerR: 220, startA: -45, endA: 45 },
  { id: 'sec-200', name: 'Section 200', type: 'section', innerR: 140, outerR: 220, startA: 45, endA: 135 },
  { id: 'sec-300', name: 'Section 300', type: 'section', innerR: 140, outerR: 220, startA: 135, endA: 225 },
  { id: 'sec-400', name: 'Section 400', type: 'section', innerR: 140, outerR: 220, startA: 225, endA: 315 },
  
  // Ring 2: Concourse Facilities (225 to 295)
  // North
  { id: 'fc-1', name: 'Food Court 1', type: 'food', innerR: 225, outerR: 295, startA: -45, endA: 0 },
  { id: 'rr-1', name: 'Restroom 1', type: 'restroom', innerR: 225, outerR: 295, startA: 0, endA: 45 },
  // East
  { id: 'med-1', name: 'Medical', type: 'medical', innerR: 225, outerR: 295, startA: 45, endA: 90 },
  { id: 'acc-1', name: 'Acc. Ent. 1', type: 'accessible', innerR: 225, outerR: 295, startA: 90, endA: 135 },
  // South
  { id: 'fc-2', name: 'Food Court 2', type: 'food', innerR: 225, outerR: 295, startA: 135, endA: 180 },
  { id: 'rr-2', name: 'Restroom 2', type: 'restroom', innerR: 225, outerR: 295, startA: 180, endA: 225 },
  // West
  { id: 'acc-2', name: 'Acc. Ent. 2', type: 'accessible', innerR: 225, outerR: 295, startA: 225, endA: 315 },

  // Ring 3: Outer Gates (300 to 360)
  { id: 'gate-a', name: 'Gate North', type: 'gate', innerR: 300, outerR: 360, startA: -45, endA: 45 },
  { id: 'gate-b', name: 'Gate East', type: 'gate', innerR: 300, outerR: 360, startA: 45, endA: 135 },
  { id: 'gate-c', name: 'Gate South', type: 'gate', innerR: 300, outerR: 360, startA: 135, endA: 225 },
  { id: 'gate-d', name: 'Gate West', type: 'gate', innerR: 300, outerR: 360, startA: 225, endA: 315 },
];

const createWedge = (x, y, innerRadius, outerRadius, startAngle, endAngle) => {
  // Pure circular math. Squashing is handled by SVG transform.
  const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  };

  const startOut = polarToCartesian(x, y, outerRadius, endAngle);
  const endOut = polarToCartesian(x, y, outerRadius, startAngle);
  const startIn = polarToCartesian(x, y, innerRadius, endAngle);
  const endIn = polarToCartesian(x, y, innerRadius, startAngle);

  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

  return [
    "M", startOut.x, startOut.y,
    "A", outerRadius, outerRadius, 0, largeArcFlag, 0, endOut.x, endOut.y,
    "L", endIn.x, endIn.y,
    "A", innerRadius, innerRadius, 0, largeArcFlag, 1, startIn.x, startIn.y,
    "Z"
  ].join(" ");
};

const MapGrid = ({ stadiumData, selectedBox, onSelectBox, large = false }) => {
  const [hoveredId, setHoveredId] = useState(null);

  const getDensityStyles = (id) => {
    if (!stadiumData || !stadiumData.densities || stadiumData.densities[id] == null) {
      return { fill: 'rgba(233, 236, 239, 0.4)', stroke: '#e9ecef', textFill: '#444651', pulse: false };
    }
    const density = stadiumData.densities[id];
    if (density < 40) return { fill: 'rgba(0, 166, 81, 0.85)', stroke: '#00a651', textFill: '#ffffff', pulse: false };
    if (density <= 70) return { fill: 'rgba(245, 158, 11, 0.85)', stroke: '#f59e0b', textFill: '#ffffff', pulse: false };
    return { fill: 'rgba(188, 0, 12, 0.85)', stroke: '#bc000c', textFill: '#ffffff', pulse: true };
  };

  return (
    <div className={`w-full ${large ? 'max-w-6xl' : 'max-w-5xl'} bg-white border border-[#e9ecef] shadow-sm rounded-3xl p-6 flex justify-center items-center overflow-hidden`}>
      <svg viewBox="0 0 1000 700" className="w-full h-auto" style={{ maxHeight: large ? '650px' : '500px' }}>
        <defs>
          <radialGradient id="pitchGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(0, 166, 81, 0.3)" />
            <stop offset="100%" stopColor="rgba(0, 166, 81, 0.1)" />
          </radialGradient>
        </defs>

        {/* Global Transform to create the Stadium Perspective */}
        {/* We use scale(1, 0.75) to squash the perfect circles into elegant stadium ellipses, while keeping math clean */}
        <g transform="translate(500, 350) scale(1, 0.75)">
          
          {/* Center Field (Pitch) */}
          <g>
            {/* Pitch grass */}
            <ellipse cx="0" cy="0" rx="125" ry="125" fill="url(#pitchGlow)" stroke="#00a651" strokeWidth="2" vectorEffect="nonScalingStroke" />
            <rect x="-70" y="-100" width="140" height="200" fill="rgba(0, 166, 81, 0.15)" stroke="#00a651" strokeWidth="2" rx="8" vectorEffect="nonScalingStroke" />
            
            {/* Pitch Markings */}
            <line x1="-70" y1="0" x2="70" y2="0" stroke="rgba(0, 166, 81, 0.6)" strokeWidth="2" vectorEffect="nonScalingStroke" />
            <circle cx="0" cy="0" r="25" fill="none" stroke="rgba(0, 166, 81, 0.6)" strokeWidth="2" vectorEffect="nonScalingStroke" />
            
            {/* Goal Boxes */}
            <rect x="-30" y="-100" width="60" height="25" fill="none" stroke="rgba(0, 166, 81, 0.6)" strokeWidth="2" vectorEffect="nonScalingStroke" />
            <rect x="-30" y="75" width="60" height="25" fill="none" stroke="rgba(0, 166, 81, 0.6)" strokeWidth="2" vectorEffect="nonScalingStroke" />
          </g>

          {/* Zones */}
          <g>
            {locations.map((loc) => {
              const styles = getDensityStyles(loc.id);
              const isHovered = hoveredId === loc.id;
              const isSelected = selectedBox === loc.name;
              const wedgePath = createWedge(0, 0, loc.innerR, loc.outerR, loc.startA, loc.endA);
              
              // Calculate text position in un-squashed polar space
              const midAngle = (loc.startA + loc.endA) / 2;
              const midRadius = loc.innerR + (loc.outerR - loc.innerR) / 2;
              const textX = midRadius * Math.cos((midAngle - 90) * Math.PI / 180.0);
              const textY = midRadius * Math.sin((midAngle - 90) * Math.PI / 180.0);

              return (
                <g 
                  key={loc.id}
                  onClick={() => onSelectBox && onSelectBox(loc.name)}
                  onMouseEnter={() => setHoveredId(loc.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className={`${onSelectBox ? 'cursor-pointer' : 'cursor-default'}`}
                  style={{
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    transformOrigin: `${textX}px ${textY}px`,
                    transform: (isHovered && onSelectBox) || isSelected ? 'scale(1.03)' : 'scale(1)'
                  }}
                >
                  <path 
                    d={wedgePath} 
                    fill={styles.fill} 
                    stroke={isSelected ? '#002d72' : styles.stroke} 
                    strokeWidth={isSelected ? '4' : '1.5'}
                    vectorEffect="nonScalingStroke"
                    className={styles.pulse ? 'animate-pulse-glow' : ''}
                    style={{
                      filter: isHovered && onSelectBox ? 'drop-shadow(0px 8px 12px rgba(0,0,0,0.15))' : 'none',
                      transition: 'fill 0.5s ease, stroke 0.3s ease, filter 0.3s ease'
                    }}
                  />
                  
                  {/* To prevent text from being squashed by the parent scale(1, 0.75), we inverse scale it here */}
                  <g transform={`translate(${textX}, ${textY}) scale(1, 1.333)`}>
                    <text 
                      x="0" 
                      y="0" 
                      textAnchor="middle" 
                      dominantBaseline="middle"
                      fill={styles.textFill}
                      className={`font-[Montserrat] font-bold ${large ? 'text-[12px]' : 'text-[10px]'} uppercase tracking-widest pointer-events-none`}
                      style={{ 
                        textShadow: styles.textFill === '#ffffff' ? '0px 1px 3px rgba(0,0,0,0.6)' : 'none',
                        transition: 'fill 0.3s ease'
                      }}
                    >
                      {loc.name}
                    </text>
                    
                    {large && stadiumData && stadiumData.densities[loc.id] != null && (
                      <text
                        x="0"
                        y="16"
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill={styles.textFill === '#ffffff' ? 'rgba(255,255,255,0.9)' : '#444651'}
                        className="text-[10px] font-bold pointer-events-none uppercase tracking-widest"
                        style={{ textShadow: styles.textFill === '#ffffff' ? '0px 1px 3px rgba(0,0,0,0.6)' : 'none' }}
                      >
                        {stadiumData.densities[loc.id]}%
                      </text>
                    )}
                  </g>
                </g>
              );
            })}
          </g>
        </g>
      </svg>
    </div>
  );
};

const MemoizedMapGrid = React.memo(MapGrid);
export default MemoizedMapGrid;
