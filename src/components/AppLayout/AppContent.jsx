import React, { useState } from 'react';
import { ChevronRight, ArrowLeft } from 'lucide-react';
import { translations } from '../../translations';
import { getCategoryStyles } from '../../utils/getCategoryStyles';

// ✨ 核心修正：引入全新的 ArticleView 引擎，完美平替了旧的 ProjectViewer
import ArticleView from '../DetailView/ArticleView';

export default function AppContent({ lang, filter, setFilter, selectedItem, setSelectedItem, filteredData }) {
  const t = translations[lang];
  // 你的专属状态：完美保留！
  const [activeSeries, setActiveSeries] = useState(null);

  // --- 情况 A: 最终层 - 显示具体的 Markdown 内容 ---
  if (selectedItem) {
    return (
      <main className="w-full max-w-5xl mx-auto px-8 lg:px-16 py-16 lg:py-24 relative z-10 flex-1">
        <div className="animate-fade-in">
          {/* ✨ 用 ArticleView 替代原来的 PostLoaderContainer，它内部自带了加载状态和 Markdown 渲染 */}
          <ArticleView 
            currentData={selectedItem} 
            item={activeSeries || selectedItem} 
            lang={lang} 
            onBack={() => { 
              setSelectedItem(null); 
              window.scrollTo({ top: 0, behavior: 'smooth' }); 
            }} 
            onDeselectArticle={() => { 
              setSelectedItem(null); 
              window.scrollTo({ top: 0, behavior: 'smooth' }); 
            }}
          />
        </div>
      </main>
    );
  }

  // --- 情况 B: 二级层 - 显示专题内的文章列表 (你写的漂亮 UI 回来了！) ---
  if (activeSeries) {
    return (
      <main className="w-full max-w-4xl mx-auto px-8 lg:px-16 py-16 lg:py-24 relative z-10 flex-1">
        <button 
          onClick={() => setActiveSeries(null)}
          className="mb-12 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition-all group"
        >
          <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
          {lang === 'zh' ? '返回主页' : 'Back to Home'}
        </button>

        <div className="animate-fade-in-up">
          <div className="mb-12">
            <h2 className="text-4xl font-black text-slate-900 mb-4">{activeSeries.title}</h2>
            <p className="text-slate-500 font-medium text-lg italic border-l-4 border-indigo-500 pl-4">
              "{activeSeries.description}"
            </p>
          </div>

          <div className="grid gap-4">
            {activeSeries.articles?.map((article) => (
              <div 
                key={article.id}
                onClick={() => { setSelectedItem(article); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="glass-card p-6 rounded-2xl flex items-center justify-between group cursor-pointer hover:border-indigo-500 transition-all"
              >
                <div>
                  <h4 className="text-xl font-black text-slate-800 group-hover:text-indigo-600 transition-colors">
                    {article.title}
                  </h4>
                  <p className="text-slate-400 text-xs mt-1 font-bold uppercase tracking-widest">{article.date}</p>
                </div>
                <ChevronRight className="text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  // --- 情况 C: 初始层 - 显示主时间轴列表 (你写的交互逻辑完美保留！) ---
  return (
    <main className="w-full max-w-4xl mx-auto px-8 lg:px-16 py-16 lg:py-24 relative z-10 flex-1">
      <div className="animate-fade-in-up">
        <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">{t.journey}</h2>
            <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">{t.subtitle}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {['all', 'learning', 'project', 'reading', 'life'].map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`px-4 py-1.5 rounded-full text-xs font-black transition-all border ${filter === f ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'bg-white text-slate-400 border-slate-200 hover:border-slate-400'}`}>
                {f === 'all' ? t.all : getCategoryStyles(f, lang).label.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="relative border-l-2 border-slate-200 ml-3">
          {filteredData.map((item, index) => {
            const styles = getCategoryStyles(item.category, lang);
            return (
              <div key={item.id} className="mb-16 relative pl-10 group animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className={`absolute -left-[17px] top-0 h-8 w-8 rounded-full border-4 border-slate-50 flex items-center justify-center text-white shadow-sm transition-transform duration-300 group-hover:scale-125 ${styles.color} z-10`}>{styles.icon}</div>
                <div className="flex items-center text-slate-400 font-black text-[11px] tracking-widest mb-3 uppercase">{item.date} <span className="mx-3 opacity-20">|</span> <span>{styles.label}</span></div>
                
                <div 
                  className="glass-card p-8 rounded-[2rem] transition-all duration-500 group-hover:-translate-y-1.5 cursor-pointer"
                  onClick={() => { 
                    if (item.articles && item.articles.length > 0) {
                      setActiveSeries(item);
                    } else {
                      setSelectedItem(item);
                    }
                    window.scrollTo({ top: 0, behavior: 'smooth' }); 
                  }}
                >
                  <h3 className="text-2xl font-black text-slate-800 mb-4 group-hover:text-indigo-600 transition-colors leading-tight">{item.title}</h3>
                  <p className="text-slate-500 leading-relaxed text-base mb-6 line-clamp-2 font-medium">{item.description}</p>
                  
                  <div className="flex flex-wrap items-center justify-between gap-4 mt-auto">
                    <div className="flex flex-wrap gap-2">
                      {item.tags?.map(tag => (
                        <span key={tag} className="text-[10px] font-black uppercase text-slate-400 bg-slate-100 px-2.5 py-1 rounded-md">#{tag}</span>
                      ))}
                    </div>
                    <span className="flex items-center gap-1 text-indigo-600 font-black text-sm group/btn">
                      {item.articles && item.articles.length > 0 ? (lang === 'zh' ? '查看系列' : 'View Series') : t.explore} 
                      <ChevronRight size={16} className="transition-transform group-hover/btn:translate-x-1" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}