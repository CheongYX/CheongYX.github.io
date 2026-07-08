import React, { useState, useEffect } from 'react';
import ClickFireworks from './components/ClickFireworks';
import MouseTechTrail from './components/MouseTechTrail';
import EmailComposeModal from './components/EmailComposeModal';
import Controls from './components/AppLayout/Controls';
import LayoutShell from './components/AppLayout/LayoutShell';
import AppContent from './components/AppLayout/AppContent';
import { getTimelineData } from './data/timelineData';

export default function App() {
  const [lang, setLang] = useState('zh');
  const [filter, setFilter] = useState('all');
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isEyeCareMode, setIsEyeCareMode] = useState(false); 
  
  // ✨ 核心魔法：深度查找引擎
  // 专门为了适配你有 `articles` 嵌套专栏的数据结构而设计
  const getPostById = (data, targetId) => {
    if (!targetId) return null;
    
    for (const item of data) {
      // 1. 先在最外层找（普通项目、阅读等）
      if (item.id === targetId) return item;
      
      // 2. 如果是专栏，深入 articles 数组里面找
      if (item.articles && Array.isArray(item.articles)) {
        const nestedItem = item.articles.find(sub => sub.id === targetId);
        if (nestedItem) return nestedItem;
      }
    }
    return targetId; // 兜底：如果没找到完整对象，至少返回个 ID 字符串
  };

  // 1️⃣ 初始化：读取网址小尾巴，并去 timelineData 里把完整数据挖出来
  const [selectedItem, setSelectedItem] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const postId = params.get('post');
    return getPostById(getTimelineData('zh'), postId);
  });

  // 2️⃣ 监听“前进/后退”按键
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const postId = params.get('post');
      // 确保使用当前的 lang 重新获取数据，防止语言错乱
      setSelectedItem(getPostById(getTimelineData(lang), postId));
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [lang]);

  // 3️⃣ 拦截器：修改状态的同时，修改网址
  const handleSetSelectedItem = (item) => {
    setSelectedItem(item);

    if (item) {
      // 提取正确的 id 字段
      const id = typeof item === 'object' ? item.id : item;
      const newUrl = window.location.pathname + '?post=' + id;
      window.history.pushState({}, '', newUrl);
    } else {
      // 关闭文章时，清除网址参数
      window.history.pushState({}, '', window.location.pathname);
    }
  };

  const myEmail = "yxcheong0226@gmail.com"; 
  const initialTimelineData = getTimelineData(lang);
  const filteredData = initialTimelineData.filter(item => filter === 'all' ? true : item.category === filter);

  return (
    <>
      <ClickFireworks />
      <MouseTechTrail />
      
      <EmailComposeModal isOpen={isEmailModalOpen} onClose={() => setIsEmailModalOpen(false)} targetEmail={myEmail} isEyeCareMode={isEyeCareMode} lang={lang}/>
      
      <Controls lang={lang} setLang={setLang} isEyeCareMode={isEyeCareMode} setIsEyeCareMode={setIsEyeCareMode} setIsEmailModalOpen={setIsEmailModalOpen} />
      
      <LayoutShell lang={lang} isEyeCareMode={isEyeCareMode}>
        <AppContent 
          lang={lang} 
          filter={filter} 
          setFilter={setFilter} 
          selectedItem={selectedItem} 
          setSelectedItem={handleSetSelectedItem}
          filteredData={filteredData} 
        />
      </LayoutShell>
    </>
  );
}