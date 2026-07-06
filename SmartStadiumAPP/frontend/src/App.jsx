import { useState, useEffect } from 'react';
import FanView from './components/FanView';
import OrganizerDashboard from './components/OrganizerDashboard';

function App() {
  const [view, setView] = useState('fan');
  const [stadiumData, setStadiumData] = useState({ time: '6:00 PM', densities: {} });

  useEffect(() => {
    const fetchStadiumData = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/stadium-data');
        const data = await response.json();
        setStadiumData(data);
      } catch (err) {
        console.error('Failed to fetch stadium data');
      }
    };
    fetchStadiumData(); // Initial fetch
    const interval = setInterval(fetchStadiumData, 2000); // Poll every 2s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full min-h-screen bg-slate-950 flex flex-col font-sans text-slate-100 overflow-hidden">
      {/* Global Navigation Bar */}
      <nav className="bg-slate-900 border-b border-slate-800 p-4 shadow-md flex justify-between items-center z-50 relative shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg">
            S
          </div>
          <span className="text-xl font-bold tracking-wider text-slate-100">Smart Stadium</span>
        </div>
        
        {/* View Toggle */}
        <div className="flex bg-slate-800 rounded-lg p-1 border border-slate-700 shadow-inner">
          <button 
            onClick={() => setView('fan')}
            className={`px-5 py-2 rounded-md font-semibold transition-all ${
              view === 'fan' 
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/50' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'
            }`}
          >
            Fan App
          </button>
          <button 
            onClick={() => setView('organizer')}
            className={`px-5 py-2 rounded-md font-semibold transition-all ${
              view === 'organizer' 
                ? 'bg-rose-600 text-white shadow-md shadow-rose-900/50' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'
            }`}
          >
            Organizer Dashboard
          </button>
        </div>
      </nav>
      
      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        {view === 'fan' ? (
          <FanView stadiumData={stadiumData} />
        ) : (
          <OrganizerDashboard stadiumData={stadiumData} />
        )}
      </main>
    </div>
  );
}

export default App;
