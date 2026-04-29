import React, { useState } from 'react';
import LeftPanel from './LeftPanel';
import { translations } from '../../translations';

export default function LayoutShell({ lang, isEyeCareMode, children }) {
  const [mousePos, setMousePos] = useState({ x: -1000, y: -1000 });
  const t = translations[lang];

  return (
    <div className={`min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col lg:flex-row relative overflow-hidden transition-all duration-700 ${isEyeCareMode ? 'eye-care-active' : ''}`}>
      <LeftPanel lang={lang} />
      
      <div 
        className="w-full lg:w-[62%] xl:w-[68%] lg:ml-[38%] xl:ml-[32%] min-h-screen flex flex-col relative z-10 bg-[#f8fafc] overflow-hidden"
        onMouseMove={(e) => setMousePos({ x: e.clientX - e.currentTarget.getBoundingClientRect().left, y: e.clientY - e.currentTarget.getBoundingClientRect().top })}
      >
        <div className="absolute inset-0 z-0 opacity-[0.5]" style={{ backgroundImage: `linear-gradient(to right, #cbd5e1 1px, transparent 1px), linear-gradient(to bottom, #cbd5e1 1px, transparent 1px)`, backgroundSize: '24px 24px', maskImage: 'linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)' }}></div>
        <div className="absolute inset-0 z-0 pointer-events-none transition-all duration-500" style={{ background: `radial-gradient(120px circle at ${mousePos.x}px ${mousePos.y}px, ${isEyeCareMode ? 'rgba(252,211,77,0.15)' : 'rgba(99,102,241,0.2)'}, transparent 100%)` }}/>
        
        {children}

        <footer className="w-full text-center py-12 text-slate-300 text-[10px] font-black tracking-[0.2em] uppercase relative z-10">© {new Date().getFullYear()} CYX · {t.location}</footer>
      </div>
    </div>
  );
}