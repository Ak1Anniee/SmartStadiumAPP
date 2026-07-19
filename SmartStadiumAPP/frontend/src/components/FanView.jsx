import { useState, useEffect, useRef } from 'react';
import MapGrid, { locations } from './MapGrid';

const UI_TRANSLATIONS = {
  English: {
    title: 'Smart Stadium Map',
    subtitle: 'Select any section to view details, or get navigation directions below.',
    fanNav: 'Fan Navigation',
    assistance: 'Assistance:',
    iAmAt: 'I am at',
    iWantToGoTo: 'I want to go to',
    selectStart: 'Select starting point...',
    selectDest: 'Select destination...',
    getDirections: 'Get Directions',
    requestHelp: 'Request Staff Help',
    reportIncident: 'Report Incident',
    calculating: 'Calculating...',
    requesting: 'Requesting...',
    myRequests: 'My Requests',
    noRequests: 'No requests submitted in this session.',
    raiseSubIssue: 'Raise Sub-issue',
    submit: 'Submit',
    cancel: 'Cancel',
    help: 'Help',
    from: 'From',
    to: 'To'
  },
  Spanish: {
    title: 'Mapa Inteligente del Estadio',
    subtitle: 'Seleccione cualquier sección para ver detalles, o busque direcciones abajo.',
    fanNav: 'Navegación para Fans',
    assistance: 'Asistencia:',
    iAmAt: 'Estoy en',
    iWantToGoTo: 'Quiero ir a',
    selectStart: 'Seleccione punto de partida...',
    selectDest: 'Seleccione destino...',
    getDirections: 'Obtener Direcciones',
    requestHelp: 'Solicitar Ayuda',
    reportIncident: 'Reportar Incidente',
    calculating: 'Calculando...',
    requesting: 'Solicitando...',
    myRequests: 'Mis Solicitudes',
    noRequests: 'No hay solicitudes en esta sesión.',
    raiseSubIssue: 'Añadir Detalle',
    submit: 'Enviar',
    cancel: 'Cancelar',
    help: 'Ayuda',
    from: 'De',
    to: 'A'
  },
  French: {
    title: 'Carte Intelligente du Stade',
    subtitle: 'Sélectionnez une section pour voir les détails, ou obtenez des directions ci-dessous.',
    fanNav: 'Navigation des Fans',
    assistance: 'Assistance:',
    iAmAt: 'Je suis à',
    iWantToGoTo: 'Je veux aller à',
    selectStart: 'Sélectionnez le point de départ...',
    selectDest: 'Sélectionnez la destination...',
    getDirections: 'Obtenir des Directions',
    requestHelp: 'Demander de l\'Aide',
    reportIncident: 'Signaler un Incident',
    calculating: 'Calcul en cours...',
    requesting: 'Demande en cours...',
    myRequests: 'Mes Demandes',
    noRequests: 'Aucune demande soumise lors de cette session.',
    raiseSubIssue: 'Ajouter un Détail',
    submit: 'Soumettre',
    cancel: 'Annuler',
    help: 'Aide',
    from: 'De',
    to: 'À'
  },
  Portuguese: {
    title: 'Mapa Inteligente do Estádio',
    subtitle: 'Selecione qualquer seção para ver detalhes, ou obtenha direções abaixo.',
    fanNav: 'Navegação de Fãs',
    assistance: 'Assistência:',
    iAmAt: 'Eu estou em',
    iWantToGoTo: 'Eu quero ir para',
    selectStart: 'Selecione o ponto de partida...',
    selectDest: 'Selecione o destino...',
    getDirections: 'Obter Direções',
    requestHelp: 'Solicitar Ajuda',
    reportIncident: 'Relatar Incidente',
    calculating: 'Calculando...',
    requesting: 'Solicitando...',
    myRequests: 'Minhas Solicitações',
    noRequests: 'Nenhuma solicitação enviada nesta sessão.',
    raiseSubIssue: 'Adicionar Detalhe',
    submit: 'Enviar',
    cancel: 'Cancelar',
    help: 'Ajuda',
    from: 'De',
    to: 'Para'
  },
  Arabic: {
    title: 'خريطة الملعب الذكية',
    subtitle: 'حدد أي قسم لعرض التفاصيل، أو احصل على اتجاهات التنقل أدناه.',
    fanNav: 'ملاحة المشجعين',
    assistance: 'مساعدة:',
    iAmAt: 'أنا في',
    iWantToGoTo: 'أريد الذهاب إلى',
    selectStart: 'حدد نقطة الانطلاق...',
    selectDest: 'حدد الوجهة...',
    getDirections: 'احصل على الاتجاهات',
    requestHelp: 'طلب مساعدة الموظفين',
    reportIncident: 'الإبلاغ عن حادث',
    calculating: 'جاري الحساب...',
    requesting: 'جاري الطلب...',
    myRequests: 'طلباتي',
    noRequests: 'لم يتم تقديم أي طلبات في هذه الجلسة.',
    raiseSubIssue: 'إضافة تفصيل',
    submit: 'إرسال',
    cancel: 'إلغاء',
    help: 'مساعدة',
    from: 'من',
    to: 'إلى'
  }
};

const SubIssueForm = ({ requestId, setAllRequests, language }) => {
  const t = UI_TRANSLATIONS[language] || UI_TRANSLATIONS.English;
  const [isOpen, setIsOpen] = useState(false);
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!note.trim()) return;
    setIsSubmitting(true);
    try {
      const response = await fetch(`http://localhost:3000/api/requests/${requestId}/subissue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note })
      });
      if (response.ok) {
        const updatedReq = await response.json();
        setAllRequests(prev => prev.map(r => r.id === requestId ? updatedReq : r));
        setNote('');
        setIsOpen(false);
      }
    } catch (err) {
      console.error('Failed to submit sub-issue');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="text-xs font-bold text-cyan-400 hover:text-cyan-300 underline cursor-pointer"
      >
        {t.raiseSubIssue}
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-2 flex flex-col gap-2">
      <input
        type="text"
        value={note}
        onChange={e => setNote(e.target.value)}
        placeholder="e.g., still no one has arrived"
        className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-sm text-slate-100 outline-none focus:border-cyan-500"
        disabled={isSubmitting}
      />
      <div className="flex gap-2">
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-1 px-3 rounded transition-colors disabled:opacity-50 cursor-pointer"
        >
          {t.submit}
        </button>
        <button 
          type="button" 
          onClick={() => setIsOpen(false)}
          disabled={isSubmitting}
          className="text-slate-400 hover:text-slate-300 text-xs font-bold cursor-pointer"
        >
          {t.cancel}
        </button>
      </div>
    </form>
  );
};

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
        const response = await fetch('http://localhost:3000/api/requests');
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
      const response = await fetch('http://localhost:3000/api/navigation', {
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
      const response = await fetch('http://localhost:3000/api/request-help', {
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
      const response = await fetch('http://localhost:3000/api/incidents', {
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
    <div className="w-full flex flex-col items-center py-8 px-4">
      <div className="w-full max-w-5xl mb-8 flex flex-col items-center text-center">
        <div className="w-full flex justify-end mb-2">
          <select 
            value={language} 
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-slate-800/80 border border-slate-600 text-slate-200 text-sm rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-cyan-500 backdrop-blur-sm shadow-lg"
          >
            {Object.keys(UI_TRANSLATIONS).map(lang => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600">
          {t.title}
        </h1>
        
        {/* Simulated Time Display */}
        <div className="flex items-center space-x-3 bg-slate-800/80 border border-slate-600 px-5 py-2.5 rounded-full mb-4 shadow-lg shadow-cyan-900/20 backdrop-blur-sm">
          <div className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.8)]"></div>
          <p className="text-cyan-300 font-semibold tracking-wide text-sm md:text-base">
            Simulated Time: <span className="text-white ml-1 font-bold">{stadiumData.time}</span>
          </p>
        </div>

        <p className="text-slate-400 text-lg">
          {t.subtitle}
        </p>
      </div>
      
      {/* Fan Navigation and My Requests Layout Container */}
      <div className="w-full max-w-5xl flex flex-col lg:flex-row gap-6 mb-8 items-start z-10 relative">
        {/* Fan Navigation Card */}
        <div className="flex-1 w-full bg-slate-800/80 p-6 rounded-2xl shadow-xl border border-slate-700">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <h2 className="text-2xl font-bold text-cyan-400">{t.fanNav}</h2>
            
            {/* Accessibility Toggle */}
            <div className="mt-4 md:mt-0 flex items-center space-x-3 bg-slate-900/50 p-2 rounded-xl border border-slate-700">
              <span className="text-sm text-slate-400 font-medium ml-2">{t.assistance}</span>
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
              <label className="block text-sm font-medium text-slate-400 mb-2">{t.iAmAt}</label>
              <select 
                className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg p-3 outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                value={fromZone}
                onChange={(e) => setFromZone(e.target.value)}
              >
                <option value="">{t.selectStart}</option>
                {locations.map(loc => <option key={`from-${loc.id}`} value={loc.name}>{loc.name}</option>)}
              </select>
            </div>
            
            <div className="flex-1 w-full">
              <label className="block text-sm font-medium text-slate-400 mb-2">{t.iWantToGoTo}</label>
              <select 
                className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg p-3 outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                value={toZone}
                onChange={(e) => setToZone(e.target.value)}
              >
                <option value="">{t.selectDest}</option>
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
                {isLoading ? t.calculating : t.getDirections}
              </button>
              {/* Report Incident Button */}
              <button
                onClick={openIncidentModal}
                className="px-6 py-3 rounded-lg font-bold text-white transition-all shadow-lg w-full md:w-auto bg-red-600 hover:bg-red-500 hover:shadow-red-500/25 border border-red-500 hover:-translate-y-0.5"
              >
                {t.reportIncident}
              </button>
              
              {/* Request Staff Help Button */}
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
                  {isRequestingHelp ? t.requesting : t.requestHelp}
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

        {/* Collapsible Sidebar/Section for My Requests */}
        <div className="w-full lg:w-80 shrink-0 bg-slate-800/80 border border-slate-700 rounded-2xl shadow-xl overflow-hidden">
          {/* Sidebar Header with Toggle */}
          <div className="flex justify-between items-center p-4 border-b border-slate-700 bg-slate-900/50">
            <div className="flex items-center gap-2">
              <span className="font-bold text-cyan-400">{t.myRequests}</span>
              {myRequestIds.length > 0 && (
                <span className="bg-cyan-500/25 text-cyan-300 text-xs px-2 py-0.5 rounded-full font-bold border border-cyan-500/30">
                  {myRequestIds.length}
                </span>
              )}
            </div>
            <button
              onClick={() => setIsMyRequestsExpanded(!isMyRequestsExpanded)}
              className="text-slate-400 hover:text-slate-200 transition-colors p-1 rounded hover:bg-slate-700/50 cursor-pointer focus:outline-none"
              title={isMyRequestsExpanded ? 'Collapse' : 'Expand'}
            >
              <span className="text-sm font-mono">{isMyRequestsExpanded ? '▼' : '▶'}</span>
            </button>
          </div>

          {/* Sidebar Body */}
          {isMyRequestsExpanded && (
            <div className="p-4 space-y-4 max-h-[500px] overflow-y-auto bg-slate-900/20">
              {myRequestIds.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">{t.noRequests}</p>
              ) : (
                myRequestIds.map(id => {
                  const req = allRequests.find(r => r.id === id);
                  if (!req) return null;
                  return (
                    <div key={id} className="bg-slate-900/40 p-4 rounded-xl border border-slate-700 hover:border-slate-600 transition-colors shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-slate-200 text-sm">{t.help}: {req.need}</span>
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider ${req.status === 'pending' ? 'bg-amber-900/50 text-amber-400 border border-amber-700/30' : 'bg-emerald-900/50 text-emerald-400 border border-emerald-700/30'}`}>
                          {req.status}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 mb-2 leading-relaxed">
                        <div><span className="text-slate-500 font-medium">{t.from}:</span> {req.from}</div>
                        {req.to && req.to !== 'Not specified' && <div><span className="text-slate-500 font-medium">{t.to}:</span> {req.to}</div>}
                      </div>
                      
                      {req.subIssues && req.subIssues.length > 0 && (
                        <div className="mt-2 pl-2.5 border-l-2 border-slate-600 space-y-2 mb-3">
                          {req.subIssues.map((sub, idx) => (
                            <div key={idx} className="text-xs text-slate-300">
                              <span className="text-slate-500 text-[10px] mr-1.5 font-mono">{new Date(sub.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              {sub.note}
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {req.status === 'pending' && (
                        <div className="mt-2 pt-2 border-t border-slate-700/50">
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
          <div className="mt-8 px-8 py-5 bg-slate-800 rounded-2xl shadow-xl border border-slate-600 flex items-center space-x-4">
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
      {/* Incident Modal */}
      {isIncidentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl w-full max-w-md relative">
            <h2 className="text-2xl font-bold text-red-400 mb-4 flex items-center gap-2">
              <span>⚠️</span> Report Incident
            </h2>
            <form onSubmit={handleReportIncident} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Incident Type</label>
                <select
                  value={incidentType}
                  onChange={(e) => setIncidentType(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded p-2.5 outline-none focus:border-red-500"
                >
                  <option value="Medical">Medical</option>
                  <option value="Security">Security</option>
                  <option value="Lost Person">Lost Person</option>
                  <option value="Overcrowding">Overcrowding</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Location / Zone</label>
                <select
                  value={incidentZone}
                  onChange={(e) => setIncidentZone(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded p-2.5 outline-none focus:border-red-500"
                >
                  <option value="">Select location...</option>
                  {locations.map(loc => <option key={`inc-${loc.id}`} value={loc.name}>{loc.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Additional Note (Optional)</label>
                <input
                  type="text"
                  value={incidentNote}
                  onChange={(e) => setIncidentNote(e.target.value)}
                  placeholder="e.g., Someone fell, need help"
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded p-2.5 outline-none focus:border-red-500"
                />
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  type="submit"
                  disabled={isSubmittingIncident}
                  className="flex-1 bg-red-600 hover:bg-red-500 disabled:bg-slate-700 text-white font-bold py-2.5 rounded transition-all cursor-pointer"
                >
                  {isSubmittingIncident ? 'Submitting...' : 'Submit Report'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsIncidentModalOpen(false)}
                  disabled={isSubmittingIncident}
                  className="px-4 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-bold rounded transition-all cursor-pointer"
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
