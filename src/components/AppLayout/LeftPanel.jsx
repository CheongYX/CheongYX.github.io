import React from 'react';
import { MapPin } from 'lucide-react';
import { translations } from '../../translations';

export default function LeftPanel({ lang }) {
  const t = translations[lang];
  return (
    <div className="relative w-full lg:w-[38%] xl:w-[32%] lg:fixed top-0 left-0 h-[60vh] lg:h-screen flex flex-col justify-end overflow-hidden z-30">
      
      {/* 遮罩层容器：让照片自然消融 */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          WebkitMaskImage: 'linear-gradient(to right, black 85%, transparent 100%)',
          maskImage: 'linear-gradient(to right, black 85%, transparent 100%)'
        }}
      >
        <div className="absolute inset-0 bg-cover bg-center transition-transform duration-[2s] hover:scale-105" style={{ backgroundImage: "url('/images/my-photo.jpg')" }}></div>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/60 to-transparent"></div>
      </div>

      <div className="relative z-10 p-10 lg:p-14 text-white w-full">
        <div className="flex flex-col gap-6 animate-fade-in-up">
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
            {/* ✨ LinkedIn 链接修改处 */}
            <a 
              href="https://www.linkedin.com/in/yx-cheong/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-bold rounded-full transition-all hover:-translate-y-1"
            >
              LinkedIn
            </a>
            
            {/* ✨ GitHub 链接修改处 */}
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
      </div>
    </div>
  );
}