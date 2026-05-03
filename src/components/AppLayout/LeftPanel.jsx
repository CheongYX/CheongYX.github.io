import React, { useState, useEffect } from 'react';
import { MapPin, List, User } from 'lucide-react'; 
import { translations } from '../../translations';

export default function LeftPanel({ lang }) {
  const t = translations[lang];
  
  const [toc, setToc] = useState([]);
  const [showToc, setShowToc] = useState(false);

  useEffect(() => {
    const handleTocUpdate = (e) => {
      setToc(e.detail);
      setShowToc(e.detail.length > 0);
    };
    window.addEventListener('update-toc', handleTocUpdate);
    return () => window.removeEventListener('update-toc', handleTocUpdate);
  }, []);

  return (
    <div className="relative w-full lg:w-[38%] xl:w-[32%] lg:fixed top-0 left-0 h-[60vh] lg:h-screen flex flex-col justify-end overflow-hidden z-30 bg-slate-950">
      
      <div 
        className={`absolute inset-0 pointer-events-none transition-opacity duration-1000 ease-in-out ${showToc && toc.length > 0 ? 'opacity-0' : 'opacity-100'}`}
        style={{
          WebkitMaskImage: 'linear-gradient(to right, black 85%, transparent 100%)',
          maskImage: 'linear-gradient(to right, black 85%, transparent 100%)'
        }}
      >
        <div className="absolute inset-0 bg-cover bg-center transition-transform duration-[2s] hover:scale-105" style={{ backgroundImage: "url('./images/my-photo.jpg')" }}></div>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/60 to-transparent"></div>
      </div>

      <div className="relative z-10 p-10 lg:p-14 text-white w-full h-full flex flex-col justify-end">
        
        <div className={`absolute top-10 right-10 z-50 transition-all duration-700 ${toc.length > 0 ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <button 
            onClick={() => setShowToc(!showToc)} 
            className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full transition-all hover:scale-110 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.2)]"
            title={showToc ? "查看作者简介" : "查看文章目录"}
          >
            {showToc ? <User size={20} /> : <List size={20} />}
          </button>
        </div>

        <div className="relative w-full flex-1">
          <div className={`absolute bottom-0 left-0 w-full flex flex-col gap-6 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${showToc && toc.length > 0 ? 'opacity-0 translate-y-12 pointer-events-none' : 'opacity-100 translate-y-0'}`}>
            <h1 className="text-5xl lg:text-7xl font-black tracking-tighter">CYX</h1>
            <div className="space-y-4">
              <p className="text-lg lg:text-xl text-slate-200 font-bold flex items-center gap-3 opacity-90">
                <span className="w-10 h-[2px] bg-indigo-500"></span>{t.title}
              </p>
              <p className="max-w-xs text-slate-300 leading-relaxed text-sm lg:text-base font-medium opacity-80">{t.bio}</p>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full w-fit backdrop-blur-md">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
                {t.activeStatus}
              </div>
            </div>

            <div className="flex items-center gap-4 pt-2">
              <a 
                href="https://www.linkedin.com/in/yx-cheong/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-bold rounded-full transition-all hover:-translate-y-1"
              >
                LinkedIn
              </a>
              
              <a 
                href="https://github.com/CheongYX" 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-bold rounded-full transition-all hover:-translate-y-1"
              >
                GitHub
              </a>

              <div className="flex items-center gap-2 text-slate-400 text-xs font-bold ml-2">
                <MapPin size={14} /> <span>{t.location}</span>
              </div>
            </div>
          </div>

          <div className={`absolute bottom-0 left-0 w-full max-h-[75vh] flex flex-col transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${!showToc || toc.length === 0 ? 'opacity-0 translate-y-12 pointer-events-none' : 'opacity-100 translate-y-0'}`}>
            <h3 className="text-2xl font-black mb-6 tracking-widest flex items-center gap-3">
              <List size={24} className="text-indigo-400" />
              {lang === 'zh' ? '内容大纲' : 'OUTLINE'}
            </h3>
            <div className="overflow-y-auto hide-scrollbar flex-1 pr-4 space-y-2 pb-6" style={{ maskImage: 'linear-gradient(to bottom, black 85%, transparent 100%)' }}>
              {toc.map((h, i) => (
                <div
                  key={i}
                  onClick={() => {
                    let el = document.getElementById(h.id);
                    if (!el) {
                      const domHeadings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
                      el = domHeadings.find(domH => domH.textContent.replace(/\s+/g, '') === h.text.replace(/\s+/g, ''));
                    }
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className={`cursor-pointer transition-all hover:text-indigo-400 hover:translate-x-1
                    ${h.level === 1 ? 'text-slate-100 mt-6 text-lg font-black leading-snug' :
                      h.level === 2 ? 'text-slate-300 font-bold text-sm border-l-2 border-indigo-500/50 hover:border-indigo-500 pl-4 py-1.5' :
                      'text-slate-400 text-xs font-bold pl-8 border-l-2 border-slate-700 hover:border-indigo-500 py-1'}`}
                >
                  {h.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}