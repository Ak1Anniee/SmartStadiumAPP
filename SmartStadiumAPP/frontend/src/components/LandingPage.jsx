const LandingPage = () => {
  return (
    <div className="w-full flex items-center justify-center min-h-screen bg-[#f9f9fc] font-sans p-4 animate-fade-in relative" style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(0, 45, 114, 0.02) 40px, rgba(0, 45, 114, 0.02) 80px)' }}>
      <div className="bg-white border border-[#e9ecef] rounded-2xl p-10 shadow-lg max-w-2xl w-full text-center flex flex-col items-center animate-slide-up relative z-10">
        
        <div className="w-20 h-20 mb-6 flex items-center justify-center bg-white rounded-full p-2 shadow-sm border border-[#e9ecef]">
          <img src="/assets/logo.png" alt="Stadium Elite Logo" className="w-full h-full object-contain" onError={(e) => { e.target.style.display = 'none'; }} />
        </div>
        
        <h1 className="text-4xl font-[Montserrat] font-black tracking-tight text-[#002d72] mb-4 uppercase">
          Stadium Elite
        </h1>
        
        <p className="text-lg text-[#444651] mb-10 max-w-lg">
          A real-time crowd density and accessibility routing platform to enhance the fan experience and streamline stadium operations.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-6 w-full">
          <a 
            href="/fan"
            className="flex-1 bg-[#002d72] hover:bg-blue-900 text-white font-[Montserrat] font-bold uppercase tracking-tight py-4 px-6 rounded-[8px] transition-all duration-300 ease-out shadow-md hover:shadow-lg hover:-translate-y-1 flex flex-col items-center justify-center gap-2 group"
          >
            <span className="text-2xl group-hover:scale-110 transition-transform duration-300">🏟️</span>
            <span>Enter as Fan</span>
          </a>
          
          <a 
            href="/organizer"
            className="flex-1 bg-[#bc000c] hover:bg-red-800 text-white font-[Montserrat] font-bold uppercase tracking-tight py-4 px-6 rounded-[8px] transition-all duration-300 ease-out shadow-md hover:shadow-lg hover:-translate-y-1 flex flex-col items-center justify-center gap-2 group"
          >
            <span className="text-2xl group-hover:scale-110 transition-transform duration-300">⚡</span>
            <span>Command Center</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
