import { useState } from 'react';

const StadiumMap = () => {
  const [selectedBox, setSelectedBox] = useState(null);
  
  // Navigation State
  const [fromZone, setFromZone] = useState('');
  const [toZone, setToZone] = useState('');
  const [accessibilityNeed, setAccessibilityNeed] = useState('None');
  const [directions, setDirections] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [helpStatus, setHelpStatus] = useState('');
  const [isRequestingHelp, setIsRequestingHelp] = useState(false);

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

  const accessibilityOptions = ['None', 'Wheelchair', 'Elderly', 'Visual', 'Hearing'];

  const handleGetDirections = async () => {
    if (!fromZone || !toZone) return;
    setIsLoading(true);
    setDirections('');
    setHelpStatus('');

    try {
      const response = await fetch('http://localhost:3000/api/navigation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: fromZone, to: toZone, accessibilityNeed })
      });
      const data = await response.json();
      if (data.directions) {
        setDirections(data.directions);
      } else {
        setDirections('Error: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      setDirections('Failed to connect to the backend server. Is it running?');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestHelp = async () => {
    if (!fromZone) {
      setHelpStatus('Please select where you are ("I am at") first.');
      return;
    }

    setIsRequestingHelp(true);
    setHelpStatus('');

    try {
      const response = await fetch('http://localhost:3000/api/request-help', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: fromZone, to: toZone, need: accessibilityNeed })
      });
      const data = await response.json();
      if (data.message) {
        setHelpStatus(data.message);
      } else {
        setHelpStatus('Error saving request.');
      }
    } catch (err) {
      setHelpStatus('Failed to connect to the server.');
    } finally {
      setIsRequestingHelp(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col items-center py-12 px-4 font-sans">
      <div className="w-full max-w-5xl mb-8 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600">
          Smart Stadium Map
        </h1>
        <p className="text-slate-400 text-lg">
          Select any section to view details, or get navigation directions below.
        </p>
      </div>
      
      {/* Fan Navigation Panel */}
      <div className="w-full max-w-5xl bg-slate-800/80 p-6 rounded-2xl shadow-xl border border-slate-700 mb-8 z-10 relative">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h2 className="text-2xl font-bold text-cyan-400">Fan Navigation</h2>
          
          {/* Accessibility Toggle */}
          <div className="mt-4 md:mt-0 flex items-center space-x-3 bg-slate-900/50 p-2 rounded-xl border border-slate-700">
            <span className="text-sm text-slate-400 font-medium ml-2">Assistance:</span>
            <div className="flex space-x-1">
              {accessibilityOptions.map(opt => (
                <button
                  key={opt}
                  onClick={() => setAccessibilityNeed(opt)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
                    accessibilityNeed === opt 
                      ? 'bg-indigo-500 text-white shadow-md' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-slate-400 mb-2">I am at</label>
            <select 
              className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg p-3 outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
              value={fromZone}
              onChange={(e) => setFromZone(e.target.value)}
            >
              <option value="">Select starting point...</option>
              {locations.map(loc => <option key={`from-${loc.id}`} value={loc.name}>{loc.name}</option>)}
            </select>
          </div>
          
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-slate-400 mb-2">I want to go to</label>
            <select 
              className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg p-3 outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
              value={toZone}
              onChange={(e) => setToZone(e.target.value)}
            >
              <option value="">Select destination...</option>
              {locations.map(loc => <option key={`to-${loc.id}`} value={loc.name}>{loc.name}</option>)}
            </select>
          </div>
          
          <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
            <button 
              onClick={handleGetDirections}
              disabled={!fromZone || !toZone || isLoading}
              className={`px-8 py-3 rounded-lg font-bold text-white transition-all shadow-lg w-full md:w-auto
                ${(!fromZone || !toZone || isLoading) 
                  ? 'bg-slate-600 cursor-not-allowed opacity-70' 
                  : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 hover:shadow-cyan-500/25 hover:-translate-y-0.5'
                }
              `}
            >
              {isLoading ? 'Calculating...' : 'Get Directions'}
            </button>
            
            {/* Request Staff Help Button (Visible only if Accessibility need is selected) */}
            {accessibilityNeed !== 'None' && (
              <button
                onClick={handleRequestHelp}
                disabled={isRequestingHelp || !fromZone}
                className={`px-6 py-3 rounded-lg font-bold text-white transition-all shadow-lg w-full md:w-auto
                  ${(!fromZone || isRequestingHelp)
                    ? 'bg-slate-700 text-slate-400 cursor-not-allowed border border-slate-600'
                    : 'bg-rose-600 hover:bg-rose-500 hover:shadow-rose-500/25 border border-rose-500 hover:-translate-y-0.5'
                  }
                `}
              >
                {isRequestingHelp ? 'Requesting...' : 'Request Staff Help'}
              </button>
            )}
          </div>
        </div>
        
        {/* Help Status Message */}
        {helpStatus && (
          <div className={`mt-4 p-4 rounded-xl border text-sm font-medium ${
            helpStatus.includes('ETA') 
              ? 'bg-emerald-900/40 border-emerald-500/50 text-emerald-400' 
              : 'bg-amber-900/40 border-amber-500/50 text-amber-400'
          }`}>
            {helpStatus}
          </div>
        )}

        {/* Directions Display Card */}
        {directions && (
          <div className="mt-6 p-6 bg-slate-900 rounded-xl border border-slate-700 shadow-inner animate-fade-in text-slate-300 leading-relaxed whitespace-pre-wrap">
            <h3 className="text-lg font-semibold text-emerald-400 mb-3">Your Route:</h3>
            {directions}
          </div>
        )}
      </div>

      {/* Map Section */}
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
              <span className="text-slate-400 mr-2">Selected Zone:</span> 
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
