import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { translations } from '../../translations';

export default function DetailHeader({ title, sub = false, onBack, lang, onDeselectArticle }) {
  const t = translations[lang];
  return (
    <div className="mb-10 animate-fade-in-up">
      <button onClick={() => sub ? onDeselectArticle() : onBack()} className="flex items-center text-slate-500 hover:text-indigo-600 font-bold mb-6 gap-2 transition-all">
        <ArrowLeft size={16} /> {sub ? t.backToList : t.back}
      </button>
      <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">{title}</h2>
    </div>
  );
}