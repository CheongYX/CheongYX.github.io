import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, FileText, ChevronUp } from 'lucide-react'; // ✨ 移除了 Mail，加入了 FileText

export default function Controls({ lang, setLang, isEyeCareMode, setIsEyeCareMode }) { // ✨ 移除了 setIsEmailModalOpen
  const [showTopBtn, setShowTopBtn] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowTopBtn(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed bottom-8 right-8 z-[150] flex flex-col gap-4 items-center">
      
      {showTopBtn && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg bg-white/80 backdrop-blur-md border border-slate-200 text-slate-500 hover:text-indigo-600 hover:scale-110 transition-all animate-fade-in-up"
          title={lang === 'zh' ? "回到顶部" : "Back to Top"}
        >
          <ChevronUp size={24} />
        </button>
      )}

      <button onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')} className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg bg-white/80 backdrop-blur-md border border-slate-200 text-slate-600 font-black text-[10px] hover:text-indigo-600 hover:scale-110 transition-all">
        {lang.toUpperCase()}
      </button>
      
      <button onClick={() => setIsEyeCareMode(!isEyeCareMode)} className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg backdrop-blur-md border border-white/20 transition-all ${isEyeCareMode ? 'bg-amber-100 text-amber-600 scale-110' : 'bg-white/80 text-slate-500 hover:text-indigo-600'}`}>
        {isEyeCareMode ? <EyeOff size={20}/> : <Eye size={20}/>}
      </button>

      {/* ✨ 替换后的 CV 悬浮按钮 */}
      <a 
        href="https://cheongyx.github.io/CV-CYX/" 
        target="_blank" 
        rel="noopener noreferrer"
        title={lang === 'zh' ? '查看我的简历' : 'View My CV'}
        className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-[0_8px_32px_rgba(99,102,241,0.4)] transition-all hover:scale-110"
      >
        <FileText size={24} className="hover:animate-bounce" />
      </a>
    </div>
  );
}