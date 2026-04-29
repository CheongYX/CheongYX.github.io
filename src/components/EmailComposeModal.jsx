import React, { useState } from 'react';
import { Send, X, User } from 'lucide-react';
import { translations } from '../translations';

export default function EmailComposeModal({ isOpen, onClose, targetEmail, isEyeCareMode, lang }) {
  const t = translations[lang];
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/20 backdrop-blur-md animate-fade-in">
      <div className={`w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-fade-in-up flex flex-col ${isEyeCareMode ? 'eye-care-active' : ''}`}>
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-sm tracking-widest"><Send size={16} className="text-indigo-400" /> NEW MESSAGE</div>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-all"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex gap-4 border-b border-slate-100 pb-3"><span className="text-slate-400 font-bold text-xs uppercase w-12">To</span><span className="font-bold text-sm text-slate-700">{targetEmail}</span></div>
          <input type="text" placeholder={t.emailSubject} className="w-full border-none focus:ring-0 text-sm font-bold text-slate-800 px-0" value={subject} onChange={e => setSubject(e.target.value)}/>
          <textarea placeholder={t.emailPlaceholder} className="w-full min-h-[180px] border-none focus:ring-0 text-sm text-slate-600 resize-none px-0" value={body} onChange={e => setBody(e.target.value)}></textarea>
        </div>
        <div className="p-5 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-slate-400 hover:text-slate-700 transition-all">{t.cancel}</button>
          <button onClick={() => window.location.href = `mailto:${targetEmail}?subject=${subject || t.emailSubject}&body=${body}`} className="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-xl transition-all">{t.send}</button>
        </div>
      </div>
    </div>
  );
}