import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, ChevronUp, Share2 } from 'lucide-react'; 

export default function Controls({ lang, setLang, isEyeCareMode, setIsEyeCareMode }) {
  const [showTopBtn, setShowTopBtn] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowTopBtn(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ✨ 2. 新增：终极智能分享逻辑 (带剪贴板双保险)
  const handleShare = async () => {
    const currentUrl = window.location.href; 
    const pageTitle = document.title; 
    
    // 准备好要分享的完整文案（标题 + 换行 + 网址）
    const shareText = lang === 'zh' 
      ? `来看看这篇文章：${pageTitle} \n${currentUrl}` 
      : `Check out this post: ${pageTitle} \n${currentUrl}`;

    // 💡 破解秘籍：无论支不支持原生分享，先强制把这段带标题的文字塞进剪贴板！
    try {
      await navigator.clipboard.writeText(shareText);
    } catch (err) {
      console.log('剪贴板写入失败', err);
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: pageTitle,
          text: lang === 'zh' ? `来看看：${pageTitle}` : `Check out: ${pageTitle}`,
          url: currentUrl,
        });
      } catch (error) {
        console.log('分享已取消或失败', error);
      }
    } else {
      // 电脑端降级提示
      alert(lang === 'zh' ? '✅ 专属链接与标题已复制！快去粘贴发给朋友吧。' : '✅ Link & Title copied to clipboard!');
    }
  };

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

      {/* ✨ 3. 分享按钮 */}
      <button 
        onClick={handleShare} 
        className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg bg-white/80 backdrop-blur-md border border-slate-200 text-slate-500 hover:text-indigo-600 hover:scale-110 transition-all"
        title={lang === 'zh' ? '分享当前页面' : 'Share this page'}
      >
        <Share2 size={20} />
      </button>

      <button onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')} className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg bg-white/80 backdrop-blur-md border border-slate-200 text-slate-600 font-black text-[10px] hover:text-indigo-600 hover:scale-110 transition-all">
        {lang.toUpperCase()}
      </button>
      
      <button onClick={() => setIsEyeCareMode(!isEyeCareMode)} className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg backdrop-blur-md border border-white/20 transition-all ${isEyeCareMode ? 'bg-amber-100 text-amber-600 scale-110' : 'bg-white/80 text-slate-500 hover:text-indigo-600'}`}>
        {isEyeCareMode ? <EyeOff size={20}/> : <Eye size={20}/>}
      </button>

    </div>
  );
}