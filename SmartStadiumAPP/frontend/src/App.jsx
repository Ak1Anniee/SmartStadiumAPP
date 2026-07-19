import { useState, useEffect } from 'react';
import FanView from './components/FanView';
import OrganizerDashboard from './components/OrganizerDashboard';
import LandingPage from './components/LandingPage';

function App() {
  const [stadiumData, setStadiumData] = useState({ time: '6:00 PM', densities: {} });
  const isOrganizerRoute = window.location.pathname.startsWith('/organizer');
  const isFanRoute = window.location.pathname.startsWith('/fan');

  useEffect(() => {
    if (!isOrganizerRoute && !isFanRoute) return;

    const fetchStadiumData = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/stadium-data`);
        const data = await response.json();
        setStadiumData(data);
      } catch (err) {
        console.error('Failed to fetch stadium data');
      }
    };
    fetchStadiumData(); // Initial fetch
    const interval = setInterval(fetchStadiumData, 2000); // Poll every 2s
    return () => clearInterval(interval);
  }, [isOrganizerRoute, isFanRoute]);

  if (!isOrganizerRoute && !isFanRoute) {
    return (
      <div className="animate-fade-in">
        <LandingPage />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-[#f9f9fc] flex flex-col font-sans text-[#1a1c1e] overflow-hidden animate-fade-in">
      {/* Global Navigation Bar */}
      <nav className="bg-[#002d72] border-b border-[#001a48] p-4 shadow-md flex justify-between items-center z-50 relative shrink-0 transition-colors duration-300">
        <a href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity duration-200 cursor-pointer">
          <img src="/assets/logo.png" alt="Stadium Elite Logo" className="w-8 h-8 md:w-10 md:h-10 object-contain drop-shadow-sm" onError={(e) => { e.target.style.display = 'none'; }} />
          <span className="text-xl md:text-2xl font-[Montserrat] font-bold tracking-tight text-white uppercase">Stadium Elite</span>
        </a>
      </nav>
      
      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto animate-slide-up bg-[#f9f9fc]">
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
