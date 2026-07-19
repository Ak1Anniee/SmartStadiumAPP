import { useState, useEffect, useRef } from 'react';
import MapGrid, { locations } from './MapGrid';

import SubIssueForm from './SubIssueForm';
import { UI_TRANSLATIONS } from '../constants/translations';

const FanView = ({ stadiumData }) => {
  const [selectedBox, setSelectedBox] = useState(null);
  const [fromZone, setFromZone] = useState('');
  const [toZone, setToZone] = useState('');
  const [accessibilityNeed, setAccessibilityNeed] = useState('None');
  const [directions, setDirections] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [helpStatus, setHelpStatus] = useState('');
  const [isRequestingHelp, setIsRequestingHelp] = useState(false);
  
  const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);
  const [incidentType, setIncidentType] = useState('Medical');
  const [incidentZone, setIncidentZone] = useState('');
  const [incidentNote, setIncidentNote] = useState('');
  const [isSubmittingIncident, setIsSubmittingIncident] = useState(false);

  const [myRequestIds, setMyRequestIds] = useState([]);
  const myRequestIdsRef = useRef(myRequestIds);
  useEffect(() => {
    myRequestIdsRef.current = myRequestIds;
  }, [myRequestIds]);

  const [allRequests, setAllRequests] = useState([]);
  const [isMyRequestsExpanded, setIsMyRequestsExpanded] = useState(true);
  const isMyRequestsExpandedRef = useRef(isMyRequestsExpanded);
  useEffect(() => {
    isMyRequestsExpandedRef.current = isMyRequestsExpanded;
  }, [isMyRequestsExpanded]);
  
  const [language, setLanguage] = useState('English');
  const t = UI_TRANSLATIONS[language] || UI_TRANSLATIONS.English;

  useEffect(() => {
    const fetchRequests = async () => {
      if (myRequestIdsRef.current.length === 0 || !isMyRequestsExpandedRef.current) return;
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/requests`);
        const data = await response.json();
        setAllRequests(data);
      } catch (err) {
        console.error('Failed to fetch requests in FanView');
      }
    };
    fetchRequests();
    const interval = setInterval(fetchRequests, 2000);
    return () => clearInterval(interval);
  }, []);

  const accessibilityOptions = ['None', 'Wheelchair', 'Elderly', 'Visual', 'Hearing'];

  const handleGetDirections = async () => {
    if (!fromZone || !toZone) return;
    setIsLoading(true);
    setDirections('');
    setHelpStatus('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/navigation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: fromZone, to: toZone, accessibilityNeed, language })
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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/request-help`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: fromZone, to: toZone, need: accessibilityNeed, language })
      });
      const data = await response.json();
      if (data.message) {
        setHelpStatus(data.message);
        if (data.request && data.request.id) {
          setMyRequestIds(prev => [...prev, data.request.id]);
          setAllRequests(prev => [data.request, ...prev]);
        }
      } else {
        setHelpStatus('Error saving request.');
      }
    } catch (err) {
      setHelpStatus('Failed to connect to the server.');
    } finally {
      setIsRequestingHelp(false);
    }
  };

  const handleReportIncident = async (e) => {
    e.preventDefault();
    if (!incidentZone || !incidentType) {
      setHelpStatus('Please provide a zone and incident type.');
      return;
    }
    
    setIsSubmittingIncident(true);
    setHelpStatus('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/incidents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ zone: incidentZone, type: incidentType, note: incidentNote, language })
      });
      const data = await response.json();
      if (response.ok) {
        setHelpStatus('Incident reported successfully. Staff have been notified.');
        setIsIncidentModalOpen(false);
        setIncidentNote('');
      } else {
        setHelpStatus(data.error || 'Failed to report incident.');
      }
    } catch (err) {
      setHelpStatus('Failed to connect to the server.');
    } finally {
      setIsSubmittingIncident(false);
    }
  };

  const openIncidentModal = () => {
    setIncidentZone(fromZone || locations[0].name);
    setIsIncidentModalOpen(true);
  };

  return (
    <div className="w-full flex flex-col items-center py-8 px-4 animate-fade-in">
      <div className="w-full max-w-5xl mb-8 flex flex-col items-center text-center animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <div className="w-full flex justify-end mb-2">
          <select 
            value={language} 
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-white border border-[#e9ecef] text-[#1a1c1e] text-sm rounded-[8px] px-3 py-1.5 outline-none focus:ring-2 focus:ring-[#002d72] shadow-sm transition-colors duration-200"
          >
            {Object.keys(UI_TRANSLATIONS).map(lang => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
        </div>
        <h1 className="text-4xl md:text-5xl font-[Montserrat] font-black mb-4 tracking-tight text-[#002d72] uppercase">
          {t.title}
        </h1>
        
        {/* Simulated Time Display */}
        <div className="flex items-center space-x-3 bg-white border border-[#e9ecef] px-5 py-2.5 rounded-full mb-4 shadow-sm hover:shadow-md transition-shadow duration-300">
          <div className="w-2.5 h-2.5 bg-[#bc000c] rounded-full animate-pulse-glow"></div>
          <p className="text-[#444651] font-[Montserrat] font-bold uppercase tracking-widest text-[10px] md:text-xs">
            LIVE: <span className="text-[#1a1c1e] ml-1">{stadiumData.time}</span>
          </p>
        </div>

        <p className="text-[#444651] text-lg">
          {t.subtitle}
        </p>
      </div>
      
      {/* Fan Navigation and My Requests Layout Container */}
      <div className="w-full max-w-5xl flex flex-col lg:flex-row gap-6 mb-8 items-start z-10 relative animate-slide-up" style={{ animationDelay: '0.2s' }}>
        {/* Fan Navigation Card */}
        <div className="flex-1 w-full bg-white p-6 rounded-2xl shadow-sm border border-[#e9ecef] hover:shadow-md transition-shadow duration-300">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <h2 className="text-xl font-[Montserrat] font-bold text-[#002d72] uppercase tracking-tight">{t.fanNav}</h2>
            
            {/* Accessibility Toggle */}
            <div className="mt-4 md:mt-0 flex items-center space-x-3 bg-[#f9f9fc] p-1.5 rounded-[8px] border border-[#e9ecef]">
              <span className="text-[11px] text-[#444651] font-[Montserrat] font-bold uppercase tracking-widest ml-2">{t.assistance}</span>
              <div className="flex space-x-1">
                {accessibilityOptions.map(opt => (
                  <button
                    key={opt}
                    onClick={() => setAccessibilityNeed(opt)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-[6px] transition-colors duration-200 ${
                      accessibilityNeed === opt 
                        ? 'bg-[#002d72] text-white shadow-sm' 
                        : 'text-[#444651] hover:text-[#1a1c1e] hover:bg-[#e9ecef]/50'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-6 mb-6">
            <div className="flex-1 w-full">
              <label className="block text-[11px] font-[Montserrat] font-bold uppercase tracking-widest text-[#444651] mb-2">{t.iAmAt}</label>
              <select 
                className="w-full bg-white border border-[#e9ecef] text-[#1a1c1e] rounded-[8px] p-3 outline-none focus:ring-2 focus:ring-[#002d72] transition-all"
                value={fromZone}
                onChange={(e) => setFromZone(e.target.value)}
              >
                <option value="">{t.selectStart}</option>
                {locations.map(loc => <option key={`from-${loc.id}`} value={loc.name}>{loc.name}</option>)}
              </select>
            </div>
            
            <div className="flex-1 w-full">
              <label className="block text-[11px] font-[Montserrat] font-bold uppercase tracking-widest text-[#444651] mb-2">{t.iWantToGoTo}</label>
              <select 
                className="w-full bg-white border border-[#e9ecef] text-[#1a1c1e] rounded-[8px] p-3 outline-none focus:ring-2 focus:ring-[#002d72] transition-all"
                value={toZone}
                onChange={(e) => setToZone(e.target.value)}
              >
                <option value="">{t.selectDest}</option>
                {locations.map(loc => <option key={`to-${loc.id}`} value={loc.name}>{loc.name}</option>)}
              </select>
            </div>
          </div>
            
          <div className="flex flex-col sm:flex-row flex-wrap gap-4 w-full">
            <button 
              onClick={handleGetDirections}
              disabled={!fromZone || !toZone || isLoading}
              className={`px-8 py-3 rounded-[8px] font-[Montserrat] font-bold uppercase tracking-tight text-white transition-all duration-300 shadow-sm flex-1 min-w-[200px] whitespace-nowrap
                ${(!fromZone || !toZone || isLoading) 
                  ? 'bg-[#e9ecef] text-[#444651] cursor-not-allowed border border-[#e9ecef]' 
                  : 'bg-[#002d72] hover:bg-blue-900 hover:shadow-md hover:-translate-y-0.5'
                }
              `}
            >
              {isLoading ? t.calculating : t.getDirections}
            </button>
            {/* Report Incident Button */}
            <button
              onClick={openIncidentModal}
              className="px-6 py-3 rounded-[8px] font-[Montserrat] font-bold uppercase tracking-tight transition-all duration-300 shadow-sm flex-1 min-w-[200px] whitespace-nowrap text-[#bc000c] bg-white hover:bg-red-50 border border-[#bc000c] hover:-translate-y-0.5"
            >
              {t.reportIncident}
            </button>
            
            {/* Request Staff Help Button */}
            {accessibilityNeed !== 'None' && (
              <button
                onClick={handleRequestHelp}
                disabled={isRequestingHelp || !fromZone}
                className={`px-6 py-3 rounded-[8px] font-[Montserrat] font-bold uppercase tracking-tight transition-all duration-300 shadow-sm flex-1 min-w-[200px] whitespace-nowrap
                  ${(!fromZone || isRequestingHelp)
                    ? 'bg-white text-[#444651] cursor-not-allowed border border-[#e9ecef]'
                    : 'text-[#bc000c] bg-white hover:bg-red-50 border border-[#bc000c] hover:-translate-y-0.5'
                  }
                `}
              >
                {isRequestingHelp ? t.requesting : t.requestHelp}
              </button>
            )}
          </div>
          
          {/* Help Status Message */}
          {helpStatus && (
            <div className={`mt-4 p-4 rounded-[8px] border text-sm font-medium ${
              helpStatus.includes('ETA') 
                ? 'bg-[#00a651]/10 border-[#00a651]/30 text-[#00a651]' 
                : 'bg-[#bc000c]/10 border-[#bc000c]/30 text-[#bc000c]'
            }`}>
              {helpStatus}
            </div>
          )}

          {/* Directions Display Card */}
          {directions && (
            <div className="mt-6 p-6 bg-[#f9f9fc] rounded-[8px] border border-[#e9ecef] shadow-sm animate-fade-in text-[#1a1c1e] leading-relaxed whitespace-pre-wrap">
              <h3 className="text-[12px] font-[Montserrat] font-bold uppercase tracking-widest text-[#002d72] mb-3">Your Route:</h3>
              {directions}
            </div>
          )}
        </div>

        {/* Collapsible Sidebar/Section for My Requests */}
        <div className="w-full lg:w-80 shrink-0 bg-white border border-[#e9ecef] rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300">
          {/* Sidebar Header with Toggle */}
          <div className="flex justify-between items-center p-4 border-b border-[#e9ecef] bg-[#f9f9fc]">
            <div className="flex items-center gap-2">
              <span className="font-[Montserrat] font-bold text-[#002d72] uppercase tracking-tight">{t.myRequests}</span>
              {myRequestIds.length > 0 && (
                <span className="bg-[#002d72]/10 text-[#002d72] text-[12px] px-2 py-0.5 rounded-[4px] font-bold border border-[#002d72]/20">
                  {myRequestIds.length}
                </span>
              )}
            </div>
            <button
              onClick={() => setIsMyRequestsExpanded(!isMyRequestsExpanded)}
              className="text-[#444651] hover:text-[#002d72] transition-colors p-1 rounded hover:bg-slate-100 cursor-pointer focus:outline-none"
              title={isMyRequestsExpanded ? 'Collapse' : 'Expand'}
            >
              <span className="text-sm font-mono">{isMyRequestsExpanded ? '▼' : '▶'}</span>
            </button>
          </div>

          {/* Sidebar Body */}
          {isMyRequestsExpanded && (
            <div className="p-4 space-y-4 max-h-[500px] overflow-y-auto bg-white">
              {myRequestIds.length === 0 ? (
                <p className="text-sm text-[#444651] text-center py-4">{t.noRequests}</p>
              ) : (
                myRequestIds.map(id => {
                  const req = allRequests.find(r => r.id === id);
                  if (!req) return null;
                  return (
                    <div key={id} className="bg-white p-4 rounded-[8px] border border-[#e9ecef] hover:border-[#002d72]/30 transition-all duration-300 hover:shadow-md hover:-translate-y-1">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-[Montserrat] font-bold text-[#1a1c1e] text-sm">{t.help}: {req.need}</span>
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-[4px] uppercase tracking-wider transition-colors duration-300 ${req.status === 'pending' ? 'bg-[#bc000c]/10 text-[#bc000c] border border-[#bc000c]/20' : 'bg-[#00a651]/10 text-[#00a651] border border-[#00a651]/20'}`}>
                          {req.status}
                        </span>
                      </div>
                      <div className="text-xs text-[#444651] mb-2 leading-relaxed">
                        <div><span className="text-[#1a1c1e] font-bold">{t.from}:</span> {req.from}</div>
                        {req.to && req.to !== 'Not specified' && <div><span className="text-[#1a1c1e] font-bold">{t.to}:</span> {req.to}</div>}
                      </div>
                      
                      {req.subIssues && req.subIssues.length > 0 && (
                        <div className="mt-2 pl-2.5 border-l-2 border-[#e9ecef] space-y-2 mb-3">
                          {req.subIssues.map((sub, idx) => (
                            <div key={idx} className="text-xs text-[#444651]">
                              <span className="text-[#1a1c1e] text-[10px] mr-1.5 font-bold">{new Date(sub.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              {sub.note}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {req.status === 'pending' && (
                        <div className="mt-2 pt-2 border-t border-[#e9ecef]">
                          <SubIssueForm requestId={req.id} setAllRequests={setAllRequests} language={language} />
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>


      <MapGrid stadiumData={stadiumData} onSelectBox={setSelectedBox} />

      <div className={`
        transition-all duration-500 ease-in-out transform
        ${selectedBox ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95 pointer-events-none'}
      `}>
        {selectedBox && (
          <div className="mt-8 px-8 py-5 bg-white rounded-2xl shadow-lg border border-[#e9ecef] flex items-center space-x-4">
            <div className="w-3 h-3 rounded-full bg-[#00a651] animate-pulse-glow"></div>
            <p className="text-xl md:text-2xl font-[Montserrat] font-bold">
              <span className="text-[#444651] mr-2">Selected Zone:</span> 
              <span className="text-[#002d72]">
                {selectedBox}
              </span>
            </p>
          </div>
        )}
      </div>
      {/* Incident Modal */}
      {isIncidentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1a1c1e]/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white border border-[#e9ecef] rounded-2xl p-6 shadow-2xl w-full max-w-md relative animate-slide-up">
            <h2 className="text-2xl font-[Montserrat] font-bold text-[#bc000c] mb-4 flex items-center gap-2 uppercase tracking-tight">
              <span>⚠️</span> Report Incident
            </h2>
            <form onSubmit={handleReportIncident} className="flex flex-col gap-4">
              <div>
                <label className="block text-[11px] font-[Montserrat] font-bold uppercase tracking-widest text-[#444651] mb-1">Incident Type</label>
                <select
                  value={incidentType}
                  onChange={(e) => setIncidentType(e.target.value)}
                  className="w-full bg-white border border-[#e9ecef] text-[#1a1c1e] rounded-[8px] p-2.5 outline-none focus:border-[#002d72] focus:ring-1 focus:ring-[#002d72] transition-colors"
                >
                  <option value="Medical">Medical</option>
                  <option value="Security">Security</option>
                  <option value="Lost Person">Lost Person</option>
                  <option value="Overcrowding">Overcrowding</option>
                </select>
              </div>
              
              <div>
                <label className="block text-[11px] font-[Montserrat] font-bold uppercase tracking-widest text-[#444651] mb-1">Location / Zone</label>
                <select
                  value={incidentZone}
                  onChange={(e) => setIncidentZone(e.target.value)}
                  className="w-full bg-white border border-[#e9ecef] text-[#1a1c1e] rounded-[8px] p-2.5 outline-none focus:border-[#002d72] focus:ring-1 focus:ring-[#002d72] transition-colors"
                >
                  <option value="">Select location...</option>
                  {locations.map(loc => <option key={`inc-${loc.id}`} value={loc.name}>{loc.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-[Montserrat] font-bold uppercase tracking-widest text-[#444651] mb-1">Additional Note (Optional)</label>
                <input
                  type="text"
                  value={incidentNote}
                  onChange={(e) => setIncidentNote(e.target.value)}
                  placeholder="e.g., Someone fell, need help"
                  className="w-full bg-white border border-[#e9ecef] text-[#1a1c1e] rounded-[8px] p-2.5 outline-none focus:border-[#002d72] focus:ring-1 focus:ring-[#002d72] transition-colors"
                />
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  type="submit"
                  disabled={isSubmittingIncident}
                  className="flex-1 bg-[#bc000c] hover:bg-red-800 disabled:bg-[#e9ecef] disabled:text-[#444651] text-white font-[Montserrat] font-bold uppercase tracking-tight py-2.5 rounded-[8px] transition-all cursor-pointer shadow-sm hover:shadow-md hover:-translate-y-0.5"
                >
                  {isSubmittingIncident ? 'Submitting...' : 'Submit Report'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsIncidentModalOpen(false)}
                  disabled={isSubmittingIncident}
                  className="px-4 bg-white hover:bg-[#f9f9fc] border border-[#e9ecef] text-[#444651] font-[Montserrat] font-bold uppercase tracking-tight rounded-[8px] transition-all cursor-pointer shadow-sm hover:shadow-md hover:-translate-y-0.5"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FanView;
