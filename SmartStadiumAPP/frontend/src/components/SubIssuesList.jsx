import { useState } from 'react';

const SubIssuesList = ({ subIssues }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!subIssues || subIssues.length === 0) return null;

  return (
    <div className="mt-2.5 pb-2.5 border-t border-[#e9ecef]">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-1.5 mt-2.5 text-[11px] font-[Montserrat] font-bold uppercase tracking-widest text-[#bc000c] hover:text-red-800 transition-colors focus:outline-none cursor-pointer"
      >
        <span className="text-[10px] transform transition-transform duration-200 inline-block" style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}>
          ▶
        </span>
        <span>
          {isExpanded ? 'Hide follow-ups' : `+${subIssues.length} follow-up${subIssues.length > 1 ? 's' : ''}`}
        </span>
      </button>

      {isExpanded && (
        <div className="mt-2.5 pl-3 border-l-2 border-[#bc000c]/30 space-y-2 max-h-40 overflow-y-auto">
          {subIssues.map((sub, idx) => (
            <div key={idx} className="bg-white p-2.5 rounded-[8px] border border-[#e9ecef] text-xs shadow-sm">
              <div className="text-[#444651] font-bold mb-1 text-[10px] uppercase tracking-wider">
                {new Date(sub.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </div>
              <div className="text-[#1a1c1e] font-medium leading-relaxed">
                {sub.note}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SubIssuesList;
