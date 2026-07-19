import { useState, useEffect, useMemo, useRef } from 'react';
import MapGrid, { locations } from './MapGrid';

const SubIssuesList = ({ subIssues }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!subIssues || subIssues.length === 0) return null;

  return (
    <div className="mt-2.5 pb-2.5 border-t border-slate-800">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-1.5 mt-2.5 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors focus:outline-none cursor-pointer"
      >
        <span className="text-[10px] transform transition-transform duration-200 inline-block" style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}>
          ▶
        </span>
        <span>
          {isExpanded ? 'Hide follow-ups' : `+${subIssues.length} follow-up${subIssues.length > 1 ? 's' : ''}`}
        </span>
      </button>

      {isExpanded && (
        <div className="mt-2.5 pl-3 border-l-2 border-amber-500/50 space-y-2 max-h-40 overflow-y-auto">
          {subIssues.map((sub, idx) => (
            <div key={idx} className="bg-slate-950/60 p-2 rounded border border-slate-800 text-xs">
              <div className="text-slate-400 font-mono mb-1 text-[10px]">
                {new Date(sub.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </div>
              <div className="text-slate-200 font-medium">
                {sub.note}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const OrganizerDashboard = ({ stadiumData }) => {
  const [requests, setRequests] = useState([]);
  const [insights, setInsights] = useState(null);
  const [isFetchingInsights, setIsFetchingInsights] = useState(false);
  const [insightError, setInsightError] = useState(null);

  const latestDataRef = useRef({ stadiumData, requests });
  useEffect(() => {
    latestDataRef.current = { stadiumData, requests };
  }, [stadiumData, requests]);

  const fetchInsights = async () => {
    const { stadiumData: currentStadiumData, requests: currentRequests } = latestDataRef.current;
    if (!currentStadiumData || !currentStadiumData.densities) return;
    
    setIsFetchingInsights(true);
    setInsightError(null);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout
      
      const response = await fetch('http://localhost:3000/api/ai-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stadiumData: currentStadiumData, requests: currentRequests }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      const data = await response.json();
      if (data.error) {
        setInsightError(data.error);
      } else {
        setInsights(data);
      }
    } catch (err) {
      console.error('Failed to fetch AI insights', err);
      setInsightError(err.name === 'AbortError' ? 'Request timed out after 15s.' : 'Failed to connect to the server.');
    } finally {
      setIsFetchingInsights(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(fetchInsights, 1000);
    const interval = setInterval(fetchInsights, 10000);
    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/requests');
        const data = await response.json();
        setRequests(data);
      } catch (err) {
        console.error('Failed to fetch requests');
      }
    };
    fetchRequests();
    const interval = setInterval(fetchRequests, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleResolve = async (id) => {
    try {
      const response = await fetch(`http://localhost:3000/api/requests/${id}/resolve`, {
        method: 'PUT'
      });
      if (response.ok) {
        setRequests(prev => prev.map(req => req.id === id ? { ...req, status: 'resolved' } : req));
      }
    } catch (err) {
      console.error('Failed to resolve request', err);
    }
  };

  const totalFansGuided = 1420; // Mock stat for now
  
  // Calculate Peak Zone
  const peakZone = useMemo(() => {
    if (!stadiumData || !stadiumData.densities) return null;
    let maxDensity = -1;
    let peakId = null;
    for (const [id, density] of Object.entries(stadiumData.densities)) {
      if (density > maxDensity) {
        maxDensity = density;
        peakId = id;
      }
    }
    const zoneName = locations.find(l => l.id === peakId)?.name || peakId;
    return { name: zoneName, density: maxDensity };
  }, [stadiumData]);

  const activeRequestsCount = requests.filter(r => r.status === 'pending').length;

  return (
    <div className="w-full flex flex-col items-center py-8 px-4 bg-slate-950 min-h-screen font-sans">
      
      {/* Dashboard Header */}
      <div className="w-full max-w-7xl mb-8 flex flex-col items-center">
        <h1 className="text-3xl font-bold text-slate-100 mb-6 flex items-center gap-3">
          <div className="w-3 h-3 bg-rose-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.8)]"></div>
          Command Center
        </h1>

        {/* AI Recommendations Panel */}
        <div className="w-full bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-xl mb-8 relative">
          <div className="flex justify-between items-center mb-6 border-b border-slate-700 pb-4">
            <div className="flex items-center gap-3">
              <span className="text-xl font-bold text-slate-100 flex items-center gap-2">
                <span className="text-2xl">✨</span> AI Recommendations
              </span>
              <span className="bg-indigo-900/50 text-indigo-300 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider border border-indigo-700/50">
                AI-Generated Insight
              </span>
            </div>
            <button 
              onClick={fetchInsights}
              disabled={isFetchingInsights}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold py-2 px-4 rounded-lg transition-colors border border-slate-600 disabled:opacity-50 flex items-center gap-2 cursor-pointer"
            >
              {isFetchingInsights ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                  Refreshing...
                </>
              ) : 'Refresh Insights'}
            </button>
          </div>

          {insightError ? (
            <div className="flex flex-col items-center justify-center py-8 text-rose-500">
              <span className="text-4xl mb-3">⚠️</span>
              <p className="mb-4">{insightError}</p>
              <button 
                onClick={fetchInsights}
                className="bg-rose-900/50 hover:bg-rose-900 text-rose-200 py-2 px-4 rounded-lg border border-rose-700 transition-colors cursor-pointer"
              >
                Retry
              </button>
            </div>
          ) : !insights ? (
            <div className="flex justify-center py-8 text-slate-500 animate-pulse">
              Generating AI insights based on current stadium state...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Risk Alert (red/orange) */}
              <div className="bg-slate-950 border border-rose-900/50 rounded-xl p-5 shadow-lg shadow-rose-900/10">
                <h3 className="text-rose-400 font-bold mb-3 flex items-center gap-2">
                  <span>🚨</span> Risk Alert
                </h3>
                {insights.riskZones && insights.riskZones.length > 0 ? (
                  <ul className="space-y-3">
                    {insights.riskZones.map((risk, idx) => (
                      <li key={idx} className="text-slate-300 text-sm">
                        <span className="font-bold text-slate-200">{risk.zone}:</span> {risk.reason}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-400 text-sm">No immediate risks detected.</p>
                )}
              </div>

              {/* Staffing Recommendation (blue) */}
              <div className="bg-slate-950 border border-cyan-900/50 rounded-xl p-5 shadow-lg shadow-cyan-900/10">
                <h3 className="text-cyan-400 font-bold mb-3 flex items-center gap-2">
                  <span>👥</span> Staffing Recommendation
                </h3>
                <p className="text-slate-300 text-sm">
                  {insights.staffingRecommendation || 'Staffing levels look good.'}
                </p>
              </div>

              {/* Priority Requests (purple) */}
              <div className="bg-slate-950 border border-fuchsia-900/50 rounded-xl p-5 shadow-lg shadow-fuchsia-900/10">
                <h3 className="text-fuchsia-400 font-bold mb-3 flex items-center gap-2">
                  <span>⭐</span> Priority Requests
                </h3>
                {insights.prioritizedRequests && insights.prioritizedRequests.length > 0 ? (
                  <ul className="space-y-3">
                    {insights.prioritizedRequests.map((req, idx) => (
                      <li key={idx} className="text-slate-300 text-sm border-b border-slate-800 pb-2 last:border-0 last:pb-0">
                        <span className="font-bold text-slate-200 uppercase text-xs mr-2 text-fuchsia-300">#{req.requestId.slice(-4)}</span>
                        {req.urgencyReason}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-400 text-sm">No pending high-priority requests.</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Stat Bar */}
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-xl flex flex-col items-center justify-center">
            <span className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-2">Total Fans Guided Today</span>
            <span className="text-4xl font-black text-cyan-400">{totalFansGuided}</span>
          </div>
          
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-xl flex flex-col items-center justify-center">
            <span className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-2">Active Requests</span>
            <span className="text-4xl font-black text-rose-400">{activeRequestsCount}</span>
          </div>
          
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-xl flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-rose-900/20 to-transparent"></div>
            <span className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-2 relative z-10">Current Peak Zone</span>
            <span className="text-3xl font-black text-amber-400 relative z-10 text-center">
              {peakZone ? peakZone.name : 'N/A'}
            </span>
            <span className="text-slate-500 text-sm mt-1 relative z-10">
              Density: {peakZone ? peakZone.density : 0}
            </span>
          </div>
        </div>
      </div>

      <div className="w-full max-w-6xl grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Large Map View */}
        <div className="xl:col-span-2 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-200">Live Density Heatmap</h2>
            <div className="text-sm font-mono bg-slate-800 px-3 py-1 rounded text-cyan-400 border border-slate-700">
              {stadiumData.time}
            </div>
          </div>
          <MapGrid stadiumData={stadiumData} large={true} />
        </div>

        {/* Accessibility Requests Panel */}
        <div className="xl:col-span-1 flex flex-col">
          <h2 className="text-xl font-bold text-slate-200 mb-4">Accessibility Requests</h2>
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-xl flex-1 max-h-[800px] overflow-y-auto p-4 space-y-4">
            {requests.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-slate-500">
                <p>No requests found.</p>
              </div>
            ) : (
              requests.map(req => (
                <div key={req.id} className={`bg-slate-800 border ${req.status === 'pending' ? 'border-slate-600' : 'border-slate-700 opacity-80'} rounded-xl p-4 shadow-md transition-all hover:border-slate-500`}>
                  <div className="flex justify-between items-start mb-3">
                    <span className="px-2 py-1 text-xs font-bold rounded bg-indigo-900 text-indigo-300 uppercase tracking-wider">
                      {req.need}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {new Date(req.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="text-slate-300 text-sm mb-2">
                    <span className="text-slate-500 mr-1">From:</span> {req.from}
                  </div>
                  <div className="text-slate-300 text-sm mb-3">
                    <span className="text-slate-500 mr-1">To:</span> {req.to}
                  </div>
                  
                  {/* Expandable Sub-issues */}
                  <SubIssuesList subIssues={req.subIssues} />

                  <div className="flex justify-between items-center pt-3 border-t border-slate-700">
                    <span className={`px-2 py-1 text-xs font-bold rounded uppercase ${req.status === 'pending' ? 'bg-amber-900/50 text-amber-400' : 'bg-emerald-900/50 text-emerald-400'}`}>
                      {req.status}
                    </span>
                    {req.status === 'pending' && (
                      <button 
                        onClick={() => handleResolve(req.id)}
                        className="text-xs font-bold text-cyan-400 hover:text-cyan-300 underline"
                      >
                        Mark Resolved
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default OrganizerDashboard;
