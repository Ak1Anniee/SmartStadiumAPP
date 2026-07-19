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

export default SubIssueForm;
