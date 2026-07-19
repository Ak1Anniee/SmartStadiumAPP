const LandingPage = () => {
  return (
    <div className="w-full flex items-center justify-center min-h-screen bg-slate-950 font-sans p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl p-10 shadow-2xl max-w-2xl w-full text-center flex flex-col items-center">
        
        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-[0_0_20px_rgba(99,102,241,0.5)] mb-6 text-4xl">
          S
        </div>
        
        <h1 className="text-4xl font-black tracking-wider text-slate-100 mb-4">
          Smart Stadium
        </h1>
        
        <p className="text-lg text-slate-400 mb-10 max-w-lg">
          A real-time crowd density and accessibility routing platform to enhance the fan experience and streamline stadium operations.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-6 w-full">
          <a 
            href="/fan"
            className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg shadow-indigo-900/20 flex flex-col items-center justify-center gap-2 group"
          >
            <span className="text-2xl">🏟️</span>
            <span>Enter as Fan</span>
          </a>
          
          <a 
            href="/organizer"
            className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg shadow-rose-900/20 flex flex-col items-center justify-center gap-2 group"
          >
            <span className="text-2xl">⚡</span>
            <span>Enter as Organizer</span>
          </a>
        </div>

      </div>
    </div>
  );
};

export default LandingPage;
