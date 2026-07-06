import React from 'react';

const locations = [
  { id: 'gate-a', name: 'Gate A', type: 'gate', layoutClass: 'col-span-2' },
  { id: 'gate-b', name: 'Gate B', type: 'gate', layoutClass: 'col-span-2' },
  { id: 'gate-c', name: 'Gate C', type: 'gate', layoutClass: 'col-span-2' },
  { id: 'gate-d', name: 'Gate D', type: 'gate', layoutClass: 'col-span-2' },
  { id: 'sec-100', name: 'Section 100', type: 'section', layoutClass: 'col-span-4 row-span-2 h-32' },
  { id: 'sec-200', name: 'Section 200', type: 'section', layoutClass: 'col-span-4 row-span-2 h-32' },
  { id: 'sec-300', name: 'Section 300', type: 'section', layoutClass: 'col-span-4 row-span-2 h-32' },
  { id: 'sec-400', name: 'Section 400', type: 'section', layoutClass: 'col-span-4 row-span-2 h-32' },
  { id: 'rr-1', name: 'Restroom 1', type: 'restroom', layoutClass: 'col-span-2' },
  { id: 'rr-2', name: 'Restroom 2', type: 'restroom', layoutClass: 'col-span-2' },
  { id: 'med-1', name: 'Medical Station', type: 'medical', layoutClass: 'col-span-4' },
  { id: 'fc-1', name: 'Food Court 1', type: 'food', layoutClass: 'col-span-4' },
  { id: 'fc-2', name: 'Food Court 2', type: 'food', layoutClass: 'col-span-4' },
  { id: 'acc-1', name: 'Accessible Entrance 1', type: 'accessible', layoutClass: 'col-span-4' },
  { id: 'acc-2', name: 'Accessible Entrance 2', type: 'accessible', layoutClass: 'col-span-4' },
];

const MapGrid = ({ stadiumData, selectedBox, onSelectBox, large = false }) => {
  const getDensityColor = (id) => {
    if (!stadiumData || !stadiumData.densities) return 'bg-slate-700 border-slate-500 text-slate-300';
    const density = stadiumData.densities[id];
    if (density == null) return 'bg-slate-700 border-slate-500 text-slate-300';
    if (density < 40) return 'bg-emerald-500/80 border-emerald-400 text-emerald-50';
    if (density <= 70) return 'bg-amber-500/80 border-amber-400 text-amber-50';
    return 'bg-red-600/90 border-red-400 text-red-50 shadow-red-500/50 animate-pulse';
  };

  return (
    <div className={`w-full ${large ? 'max-w-6xl' : 'max-w-5xl'} bg-slate-800/50 backdrop-blur-md p-6 rounded-3xl shadow-2xl border border-slate-700/50`}>
      <div className="grid grid-cols-8 gap-4 auto-rows-fr">
        {locations.map((loc) => (
          <button
            key={loc.id}
            onClick={() => onSelectBox && onSelectBox(loc.name)}
            className={`
              ${loc.layoutClass} 
              ${getDensityColor(loc.id)}
              flex flex-col items-center justify-center ${large ? 'p-6 text-lg' : 'p-4 text-sm md:text-base'} rounded-xl border border-opacity-50
              font-bold shadow-lg
              transition-colors duration-500 ease-out transform
              ${onSelectBox ? 'cursor-pointer hover:-translate-y-1 hover:scale-[1.02] hover:shadow-xl hover:brightness-125 focus:outline-none focus:ring-4 focus:ring-white/20 active:scale-95' : 'cursor-default'}
            `}
          >
            <span>{loc.name}</span>
            {large && stadiumData && stadiumData.densities[loc.id] != null && (
              <span className="text-sm font-normal opacity-90 mt-2 bg-black/30 px-3 py-1 rounded-md">
                Density: {stadiumData.densities[loc.id]}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

export default MapGrid;
export { locations };
