import { useState, useEffect } from 'react';
import FanView from './components/FanView';
import OrganizerDashboard from './components/OrganizerDashboard';
import LandingPage from './components/LandingPage';

function App() {
  const [stadiumData, setStadiumData] = useState({ time: '6:00 PM', densities: {} });
  const isOrganizerRoute = window.location.pathname.startsWith('/organizer');
  const isFanRoute = window.location.pathname.startsWith('/fan');

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

  if (!isOrganizerRoute && !isFanRoute) {
    return <LandingPage />;
  }

  return (
    <div className="w-full min-h-screen bg-slate-950 flex flex-col font-sans text-slate-100 overflow-hidden">
      {/* Global Navigation Bar */}
      <nav className="bg-slate-900 border-b border-slate-800 p-4 shadow-md flex justify-between items-center z-50 relative shrink-0">
        <a href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg">
            S
          </div>
          <span className="text-xl font-bold tracking-wider text-slate-100">Smart Stadium</span>
        </a>
      </nav>
      
      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        {isOrganizerRoute ? (
          <OrganizerDashboard stadiumData={stadiumData} />
        ) : (
          <FanView stadiumData={stadiumData} />
        )}
      </main>
    </div>
  );
}

export default App;
