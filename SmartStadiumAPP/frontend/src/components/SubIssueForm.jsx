import { useState } from 'react';
import { UI_TRANSLATIONS } from '../constants/translations';

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
        className="text-[11px] font-[Montserrat] font-bold uppercase tracking-tight text-[#002d72] hover:text-blue-800 underline transition-colors cursor-pointer"
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
        className="w-full bg-white border border-[#e9ecef] rounded-[8px] p-2 text-sm text-[#1a1c1e] outline-none focus:border-[#002d72] focus:ring-1 focus:ring-[#002d72] transition-colors"
        disabled={isSubmitting}
      />
      <div className="flex gap-2">
        <button 
          type="submit" 
          disabled={isSubmitting}
          className="bg-[#002d72] hover:bg-blue-900 text-white text-[11px] font-[Montserrat] font-bold uppercase tracking-tight py-1.5 px-3 rounded-[6px] transition-colors disabled:opacity-50 cursor-pointer shadow-sm hover:shadow-md"
        >
          {t.submit}
        </button>
        <button 
          type="button" 
          onClick={() => setIsOpen(false)}
          disabled={isSubmitting}
          className="text-[#444651] hover:text-[#1a1c1e] text-[11px] font-[Montserrat] font-bold uppercase tracking-tight cursor-pointer"
        >
          {t.cancel}
        </button>
      </div>
    </form>
  );
};

export default SubIssueForm;
