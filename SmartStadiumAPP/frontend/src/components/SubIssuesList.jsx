import { useState } from 'react';

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

export default SubIssuesList;
