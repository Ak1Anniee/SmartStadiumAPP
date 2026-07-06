import { useState } from 'react';

const StadiumMap = () => {
  const [selectedBox, setSelectedBox] = useState(null);

  const locations = [
    { id: 'gate-a', name: 'Gate A', type: 'gate', className: 'col-span-2 bg-blue-600/80 border-blue-400 text-blue-50' },
    { id: 'gate-b', name: 'Gate B', type: 'gate', className: 'col-span-2 bg-blue-600/80 border-blue-400 text-blue-50' },
    { id: 'gate-c', name: 'Gate C', type: 'gate', className: 'col-span-2 bg-blue-600/80 border-blue-400 text-blue-50' },
    { id: 'gate-d', name: 'Gate D', type: 'gate', className: 'col-span-2 bg-blue-600/80 border-blue-400 text-blue-50' },
    { id: 'sec-100', name: 'Section 100', type: 'section', className: 'col-span-4 row-span-2 bg-emerald-600/80 border-emerald-400 text-emerald-50 h-32' },
    { id: 'sec-200', name: 'Section 200', type: 'section', className: 'col-span-4 row-span-2 bg-emerald-600/80 border-emerald-400 text-emerald-50 h-32' },
    { id: 'sec-300', name: 'Section 300', type: 'section', className: 'col-span-4 row-span-2 bg-emerald-600/80 border-emerald-400 text-emerald-50 h-32' },
    { id: 'sec-400', name: 'Section 400', type: 'section', className: 'col-span-4 row-span-2 bg-emerald-600/80 border-emerald-400 text-emerald-50 h-32' },
    { id: 'rr-1', name: 'Restroom 1', type: 'restroom', className: 'col-span-2 bg-amber-500/80 border-amber-300 text-amber-50' },
    { id: 'rr-2', name: 'Restroom 2', type: 'restroom', className: 'col-span-2 bg-amber-500/80 border-amber-300 text-amber-50' },
    { id: 'med-1', name: 'Medical Station', type: 'medical', className: 'col-span-4 bg-red-600/80 border-red-400 text-red-50' },
    { id: 'fc-1', name: 'Food Court 1', type: 'food', className: 'col-span-4 bg-orange-500/80 border-orange-300 text-orange-50' },
    { id: 'fc-2', name: 'Food Court 2', type: 'food', className: 'col-span-4 bg-orange-500/80 border-orange-300 text-orange-50' },
    { id: 'acc-1', name: 'Accessible Entrance 1', type: 'accessible', className: 'col-span-4 bg-indigo-600/80 border-indigo-400 text-indigo-50' },
    { id: 'acc-2', name: 'Accessible Entrance 2', type: 'accessible', className: 'col-span-4 bg-indigo-600/80 border-indigo-400 text-indigo-50' },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center py-12 px-4 font-sans">
      <div className="w-full max-w-5xl mb-8 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600">
          Smart Stadium Map
        </h1>
        <p className="text-slate-400 text-lg">
          Select any section to view details
        </p>
      </div>
      
      <div className="w-full max-w-5xl bg-slate-800/50 backdrop-blur-md p-6 rounded-3xl shadow-2xl border border-slate-700/50 mb-8">
        <div className="grid grid-cols-8 gap-4 auto-rows-fr">
          {locations.map((loc) => (
            <button
              key={loc.id}
              onClick={() => setSelectedBox(loc.name)}
              className={`
                ${loc.className} 
                flex items-center justify-center p-4 rounded-xl border border-opacity-50
                font-bold text-sm md:text-base shadow-lg
                transition-all duration-300 ease-out transform
                hover:-translate-y-1 hover:scale-[1.02] hover:shadow-xl hover:brightness-125
                focus:outline-none focus:ring-4 focus:ring-white/20 active:scale-95
              `}
            >
              {loc.name}
            </button>
          ))}
        </div>
      </div>

      <div className={`
        transition-all duration-500 ease-in-out transform
        ${selectedBox ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95 pointer-events-none'}
      `}>
        {selectedBox && (
          <div className="px-8 py-5 bg-slate-800 rounded-2xl shadow-xl border border-slate-600 flex items-center space-x-4">
            <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></div>
            <p className="text-xl md:text-2xl font-semibold">
              <span className="text-slate-400 mr-2">Selected:</span> 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                {selectedBox}
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StadiumMap;
