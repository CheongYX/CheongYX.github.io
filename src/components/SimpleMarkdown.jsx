import React from 'react';

export default function SimpleMarkdown({ text }) {
  if (!text) return null;
  const parseInline = (text) => {
    let html = text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900">$1</strong>');
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="rounded-2xl shadow-lg my-6 max-w-full border border-slate-200" />');
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" class="text-indigo-600 font-bold border-b border-indigo-200 hover:border-indigo-600 transition-colors">$1</a>');
    html = html.replace(/`([^`\n]+)`/g, '<code class="bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded font-mono text-[0.9em]">$1</code>');
    return <span dangerouslySetInnerHTML={{ __html: html }} />;
  };
  const blocks = text.split('\n\n');
  return (
    <div className="space-y-4">
      {blocks.map((block, index) => {
        const t = block.trim();
        if (t.startsWith('# ')) return <h1 key={index} className="text-3xl font-extrabold text-slate-900 mt-8 mb-4">{parseInline(t.replace('# ', ''))}</h1>;
        if (t.startsWith('## ')) return <h2 key={index} className="text-2xl font-bold text-slate-800 mt-6 mb-3 border-b border-slate-100 pb-2">{parseInline(t.replace('## ', ''))}</h2>;
        if (t.startsWith('> ')) return <blockquote key={index} className="border-l-4 border-indigo-500 bg-indigo-50/50 p-4 rounded-r-xl italic text-slate-700">{parseInline(t.replace('> ', ''))}</blockquote>;
        if (t.startsWith('```')) return <pre key={index} className="bg-slate-900 text-slate-300 p-5 rounded-xl font-mono text-sm overflow-x-auto hide-scrollbar"><code>{t.split('\n').slice(1, -1).join('\n')}</code></pre>;
        return <p key={index} className="text-slate-600 leading-relaxed text-lg">{parseInline(t)}</p>;
      })}
    </div>
  );
}