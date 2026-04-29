import React from 'react';
import { List } from 'lucide-react';
import DetailHeader from './DetailHeader';
import AsyncMarkdown from '../AsyncMarkdown';
import { translations } from '../../translations';

export default function ArticleView({ currentData, item, onBack, lang, onDeselectArticle }) {
  const t = translations[lang];
  return (
    <div className="animate-fade-in-up">
      <DetailHeader title={currentData.title} sub={item.layout === 'collection'} onBack={onBack} onDeselectArticle={onDeselectArticle} lang={lang} />
      <div className="flex flex-col lg:flex-row gap-10 mt-6 relative">
        {currentData.chapters && (
          <div className="w-full lg:w-[260px] shrink-0">
            <div className="sticky top-6 bg-white/40 backdrop-blur-xl border border-white/50 p-6 rounded-2xl shadow-sm">
              <div className="font-black text-slate-800 mb-6 border-b border-slate-200 pb-3 flex items-center gap-2 text-sm"><List size={14}/> {t.toc}</div>
              <ul className="space-y-4">
                {currentData.chapters.map((ch, idx) => (
                  <li key={ch.id}><button onClick={() => document.getElementById(ch.id)?.scrollIntoView({ behavior: 'smooth' })} className="text-left w-full text-xs font-bold text-slate-500 hover:text-indigo-600 flex gap-2"><span className="opacity-30">0{idx+1}</span> {ch.title}</button></li>
                ))}
              </ul>
            </div>
          </div>
        )}
        <div className="flex-1">
          {currentData.chapters ? currentData.chapters.map(ch => <div key={ch.id} id={ch.id} className="mb-20 scroll-mt-8"><AsyncMarkdown source={ch.content} lang={lang} /></div>) : <AsyncMarkdown source={currentData.tabs?.[0]?.content || currentData.content} lang={lang} />}
        </div>
      </div>
    </div>
  );
}