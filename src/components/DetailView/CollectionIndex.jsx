import React from 'react';
import DetailHeader from './DetailHeader';

export default function CollectionIndex({ item, onBack, lang, onSelectArticle }) {
  return (
    <div className="animate-fade-in-up">
      <DetailHeader title={item.title} onBack={onBack} lang={lang} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
        {item.articles.map((art, idx) => (
          <div key={art.id} onClick={() => onSelectArticle(art.id)} className="glass-card p-8 rounded-3xl cursor-pointer group transition-all hover:-translate-y-2">
            <span className="text-indigo-600 font-black text-xl mb-3 block">0{idx+1}</span>
            <h4 className="text-xl font-bold text-slate-800 group-hover:text-indigo-600 transition-colors mb-2">{art.title}</h4>
            <p className="text-slate-500 text-sm">{art.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}