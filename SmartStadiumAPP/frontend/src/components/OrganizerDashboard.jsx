import { useState, useEffect, useMemo, useRef } from 'react';
import MapGrid, { locations } from './MapGrid';

import SubIssuesList from './SubIssuesList';

const OrganizerDashboard = ({ stadiumData }) => {
  const [requests, setRequests] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [insights, setInsights] = useState(null);
  const [isFetchingInsights, setIsFetchingInsights] = useState(false);
  const [insightError, setInsightError] = useState(null);

  const latestDataRef = useRef({ stadiumData, requests });
  useEffect(() => {
    latestDataRef.current = { stadiumData, requests };
  }, [stadiumData, requests]);

  const isFetchingRef = useRef(false);
  const fetchInsights = async () => {
    if (isFetchingRef.current) return;
    
    const { stadiumData: currentStadiumData, requests: currentRequests } = latestDataRef.current;
    if (!currentStadiumData || !currentStadiumData.densities) return;
    
    setIsFetchingInsights(true);
    isFetchingRef.current = true;
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
      isFetchingRef.current = false;
    }
  };

  useEffect(() => {
    const timeout = setTimeout(fetchInsights, 1000);
    const interval = setInterval(fetchInsights, 45000);
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
    
    const fetchIncidents = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/incidents');
        const data = await response.json();
        setIncidents(data);
      } catch (err) {
        console.error('Failed to fetch incidents');
      }
    };

    fetchRequests();
    fetchIncidents();
    
    const interval = setInterval(() => {
      fetchRequests();
      fetchIncidents();
    }, 2000);
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

  const handleResolveIncident = async (id) => {
    try {
      const response = await fetch(`http://localhost:3000/api/incidents/${id}/resolve`, {
        method: 'PUT'
      });
      if (response.ok) {
        setIncidents(prev => prev.map(inc => inc.id === id ? { ...inc, status: 'resolved' } : inc));
      }
    } catch (err) {
      console.error('Failed to resolve incident', err);
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

  const activeRequestsCount = useMemo(() => 
    requests.filter(r => r.status === 'pending').length
  , [requests]);

  const openIncidents = useMemo(() => 
    incidents.filter(i => i.status === 'open')
  , [incidents]);

  return (
    <div className="w-full flex flex-col items-center py-8 px-4 bg-[#f9f9fc] min-h-screen font-sans animate-fade-in">
      
      {/* Dashboard Header */}
      <div className="w-full max-w-7xl mb-8 flex flex-col items-center animate-slide-up">
        <h1 className="text-3xl font-[Montserrat] font-bold text-[#002d72] mb-6 flex items-center gap-3 uppercase tracking-tight">
          <div className="w-3 h-3 bg-[#bc000c] rounded-full animate-pulse-glow"></div>
          Command Center
        </h1>

        {/* AI Recommendations Panel */}
        <div className="w-full bg-white border border-[#e9ecef] rounded-2xl p-6 shadow-sm mb-8 relative hover:shadow-md transition-shadow duration-300 overflow-hidden">
          <div className="flex justify-between items-center mb-6 border-b border-[#e9ecef] pb-4">
            <div className="flex items-center gap-3">
              <span className="text-xl font-[Montserrat] font-bold text-[#002d72] flex items-center gap-2 uppercase tracking-tight">
                <span className="text-2xl">✨</span> AI Recommendations
              </span>
              <span className="bg-[#002d72]/10 text-[#002d72] text-[10px] font-bold px-2 py-1 rounded-[4px] uppercase tracking-wider border border-[#002d72]/20">
                AI-Generated Insight
              </span>
            </div>
            <button 
              onClick={fetchInsights}
              disabled={isFetchingInsights}
              className="bg-white hover:bg-[#f9f9fc] text-[#002d72] font-[Montserrat] font-bold uppercase tracking-tight text-[11px] py-2 px-4 rounded-[8px] transition-all duration-300 border border-[#e9ecef] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer shadow-sm hover:shadow-md hover:-translate-y-0.5"
            >
              {isFetchingInsights ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-[#002d72] border-t-transparent rounded-full animate-spin"></div>
                  Refreshing...
                </>
              ) : 'Refresh Insights'}
            </button>
          </div>

          {insightError ? (
            <div className="flex flex-col items-center justify-center py-8 text-[#bc000c]">
              <span className="text-4xl mb-3">⚠️</span>
              <p className="mb-4 font-[Montserrat] font-bold">{insightError}</p>
              <button 
                onClick={fetchInsights}
                className="bg-white hover:bg-red-50 text-[#bc000c] py-2 px-4 rounded-[8px] border border-[#bc000c] transition-colors cursor-pointer font-[Montserrat] font-bold uppercase tracking-tight text-[11px] shadow-sm hover:shadow-md hover:-translate-y-0.5"
              >
                Retry
              </button>
            </div>
          ) : !insights ? (
            <div className="flex justify-center py-8 text-[#444651] font-bold animate-pulse">
              Generating AI insights based on current stadium state...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-highlight rounded-xl p-2 -m-2">
              {/* Risk Alert (red) */}
              <div className="bg-white border border-[#bc000c]/30 rounded-xl p-5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                <h3 className="text-[#bc000c] font-[Montserrat] font-bold uppercase tracking-tight mb-3 flex items-center gap-2">
                  <span>🚨</span> Risk Alert
                </h3>
                {insights.riskZones && insights.riskZones.length > 0 ? (
                  <ul className="space-y-3">
                    {insights.riskZones.map((risk, idx) => (
                      <li key={idx} className="text-[#444651] text-sm leading-relaxed">
                        <span className="font-bold text-[#1a1c1e]">{risk.zone}:</span> {risk.reason}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-[#444651] text-sm font-bold">No immediate risks detected.</p>
                )}
              </div>

              {/* Staffing Recommendation (blue) */}
              <div className="bg-white border border-[#002d72]/30 rounded-xl p-5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                <h3 className="text-[#002d72] font-[Montserrat] font-bold uppercase tracking-tight mb-3 flex items-center gap-2">
                  <span>👥</span> Staffing
                </h3>
                <p className="text-[#444651] text-sm leading-relaxed">
                  {insights.staffingRecommendation || 'Staffing levels look good.'}
                </p>
              </div>

              {/* Priority Requests (green) */}
              <div className="bg-white border border-[#00a651]/30 rounded-xl p-5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                <h3 className="text-[#00a651] font-[Montserrat] font-bold uppercase tracking-tight mb-3 flex items-center gap-2">
                  <span>⭐</span> Priority Requests
                </h3>
                {insights.prioritizedRequests && insights.prioritizedRequests.length > 0 ? (
                  <ul className="space-y-3">
                    {insights.prioritizedRequests.map((req, idx) => (
                      <li key={idx} className="text-[#444651] text-sm leading-relaxed border-b border-[#e9ecef] pb-2 last:border-0 last:pb-0">
                        <span className="font-bold text-[#002d72] uppercase text-xs mr-2">#{req.requestId.slice(-4)}</span>
                        {req.urgencyReason}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-[#444651] text-sm font-bold">No pending high-priority requests.</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Stat Bar */}
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="bg-white border-l-4 border-l-[#002d72] border border-[#e9ecef] rounded-r-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col items-center justify-center">
            <span className="text-[#444651] text-[11px] font-[Montserrat] font-bold uppercase tracking-widest mb-2">Total Fans Guided Today</span>
            <span className="text-4xl font-black text-[#002d72]">{totalFansGuided}</span>
          </div>
          
          <div className="bg-white border-l-4 border-l-[#bc000c] border border-[#e9ecef] rounded-r-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col items-center justify-center">
            <span className="text-[#444651] text-[11px] font-[Montserrat] font-bold uppercase tracking-widest mb-2">Active Requests</span>
            <span className="text-4xl font-black text-[#bc000c]">{activeRequestsCount}</span>
          </div>
          
          <div className="bg-white border-l-4 border-l-[#00a651] border border-[#e9ecef] rounded-r-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[#00a651]/5"></div>
            <span className="text-[#444651] text-[11px] font-[Montserrat] font-bold uppercase tracking-widest mb-2 relative z-10">Current Peak Zone</span>
            <span className="text-3xl font-black text-[#00a651] relative z-10 text-center uppercase tracking-tight">
              {peakZone ? peakZone.name : 'N/A'}
            </span>
            <span className="text-[#1a1c1e] font-bold text-sm mt-1 relative z-10">
              Density: {peakZone ? peakZone.density : 0}
            </span>
          </div>
        </div>
      </div>

      <div className="w-full max-w-7xl grid grid-cols-1 xl:grid-cols-3 gap-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
        
        {/* Large Map View */}
        <div className="xl:col-span-2 flex flex-col bg-white border border-[#e9ecef] rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 border-b border-[#e9ecef] pb-4">
            <h2 className="text-xl font-[Montserrat] font-bold text-[#002d72] uppercase tracking-tight">Live Density Heatmap</h2>
            <div className="text-[10px] font-bold uppercase tracking-widest bg-[#f9f9fc] px-3 py-1.5 rounded-[4px] text-[#002d72] border border-[#e9ecef] flex items-center gap-2">
              <div className="w-2 h-2 bg-[#bc000c] rounded-full animate-pulse-glow"></div>
              {stadiumData.time}
            </div>
          </div>
          <MapGrid stadiumData={stadiumData} large={true} />
        </div>

        {/* Right Column: Incidents and Requests */}
        <div className="xl:col-span-1 flex flex-col gap-6">
          
          {/* Active Incidents Panel */}
          <div className="flex flex-col flex-1 max-h-[400px]">
            <h2 className="text-xl font-[Montserrat] font-bold text-[#bc000c] mb-3 flex items-center gap-2 uppercase tracking-tight">
              <div className="w-2.5 h-2.5 bg-[#bc000c] rounded-full animate-pulse-glow"></div>
              Active Incidents
            </h2>
            <div className="bg-white border border-[#e9ecef] rounded-2xl shadow-sm flex-1 overflow-y-auto p-4 space-y-4">
              {openIncidents.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-20 text-[#444651] font-bold text-sm">
                  <p>No active incidents.</p>
                </div>
              ) : (
                openIncidents.map(inc => (
                  <div key={inc.id} className="bg-[#f9f9fc] border border-[#e9ecef] hover:border-[#bc000c]/30 rounded-xl p-4 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                    <div className="flex justify-between items-start mb-2">
                      <span className="px-2 py-1 text-[10px] font-[Montserrat] font-bold rounded-[4px] bg-[#bc000c]/10 text-[#bc000c] uppercase tracking-wider border border-[#bc000c]/20">
                        {inc.type}
                      </span>
                      <span className="text-[10px] text-[#444651] font-bold uppercase tracking-wider">
                        {new Date(inc.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="text-[#1a1c1e] text-sm font-medium mb-1">
                      <span className="text-[#444651] font-bold mr-1">Zone:</span> {inc.zone}
                    </div>
                    {inc.note && (
                      <div className="text-[#444651] text-sm mb-3">
                        <span className="text-[#1a1c1e] font-bold mr-1">Note:</span> {inc.note}
                      </div>
                    )}
                    {inc.suggestedResponse && (
                      <div className="mt-3 p-3 bg-white border border-[#002d72]/20 rounded-[8px]">
                        <div className="text-[10px] font-[Montserrat] text-[#002d72] font-bold mb-1 flex items-center gap-1 uppercase tracking-widest">
                          <span>✨</span> AI Suggestion
                        </div>
                        <p className="text-xs text-[#444651] italic">"{inc.suggestedResponse}"</p>
                      </div>
                    )}
                    <button
                      onClick={() => handleResolveIncident(inc.id)}
                      className="mt-3 w-full bg-white hover:bg-red-50 text-[#bc000c] text-[11px] font-[Montserrat] font-bold uppercase tracking-tight py-2.5 rounded-[6px] transition-colors border border-[#bc000c] cursor-pointer"
                    >
                      Mark Resolved
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Accessibility Requests Panel */}
          <div className="flex flex-col flex-1 max-h-[400px]">
            <h2 className="text-xl font-[Montserrat] font-bold text-[#002d72] mb-3 uppercase tracking-tight">Accessibility Requests</h2>
            <div className="bg-white border border-[#e9ecef] rounded-2xl shadow-sm flex-1 overflow-y-auto p-4 space-y-4">
            {requests.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-[#444651] font-bold text-sm">
                <p>No requests found.</p>
              </div>
            ) : (
              requests.map(req => (
                <div key={req.id} className={`bg-[#f9f9fc] border ${req.status === 'pending' ? 'border-[#e9ecef] hover:border-[#002d72]/30' : 'border-[#00a651]/20 opacity-80'} rounded-xl p-4 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1`}>
                  <div className="flex justify-between items-start mb-3">
                    <span className="px-2 py-1 text-[10px] font-[Montserrat] font-bold rounded-[4px] bg-[#002d72] text-white uppercase tracking-wider">
                      {req.need}
                    </span>
                    <span className="text-[10px] text-[#444651] font-bold uppercase tracking-wider">
                      {new Date(req.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="text-[#444651] text-sm mb-2">
                    <span className="text-[#1a1c1e] font-bold mr-1">From:</span> {req.from}
                  </div>
                  <div className="text-[#444651] text-sm mb-3">
                    <span className="text-[#1a1c1e] font-bold mr-1">To:</span> {req.to}
                  </div>
                  
                  {/* Expandable Sub-issues */}
                  <SubIssuesList subIssues={req.subIssues} />

                  <div className="flex justify-between items-center pt-3 border-t border-[#e9ecef]">
                    <span className={`px-2 py-1 text-[10px] font-bold rounded-[4px] uppercase tracking-wider transition-colors duration-300 ${req.status === 'pending' ? 'bg-[#bc000c]/10 text-[#bc000c]' : 'bg-[#00a651]/10 text-[#00a651]'}`}>
                      {req.status}
                    </span>
                    {req.status === 'pending' && (
                      <button 
                        onClick={() => handleResolve(req.id)}
                        className="text-[11px] font-[Montserrat] font-bold uppercase tracking-tight text-[#002d72] hover:text-blue-800 underline transition-colors"
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
    </div>
  );
};

export default OrganizerDashboard;
