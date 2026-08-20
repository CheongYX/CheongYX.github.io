import React, { useState, useEffect } from 'react';
import ClickFireworks from './components/ClickFireworks';
import MouseTechTrail from './components/MouseTechTrail';
import EmailComposeModal from './components/EmailComposeModal';
import Controls from './components/AppLayout/Controls';
import LayoutShell from './components/AppLayout/LayoutShell';
import AppContent from './components/AppLayout/AppContent';
import { getTimelineData } from './data/timelineData';

export default function App() {
  const [lang, setLang] = useState('en'); // 默认英文
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isEyeCareMode, setIsEyeCareMode] = useState(false); 
  
  const getPostById = (data, targetId) => {
    if (!targetId) return null;
    for (const item of data) {
      if (item.id === targetId) return item;
      if (item.articles && Array.isArray(item.articles)) {
        const nestedItem = item.articles.find(sub => sub.id === targetId);
        if (nestedItem) return nestedItem;
      }
    }
    return targetId; 
  };

  // 1️⃣ 初始化：读取网址中的 post 和 filter 参数
  const [selectedItem, setSelectedItem] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const postId = params.get('post');
    return getPostById(getTimelineData('en'), postId);
  });

  const [filter, setFilter] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('filter') || 'all'; // 默认是 'all'
  });

  // 2️⃣ 监听“前进/后退”按键，同时同步两个状态
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      setSelectedItem(getPostById(getTimelineData(lang), params.get('post')));
      setFilter(params.get('filter') || 'all');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [lang]);

  // 3️⃣ 强化版文章拦截器：修改文章时不丢失分类参数
  const handleSetSelectedItem = (item) => {
    setSelectedItem(item);
    const params = new URLSearchParams(window.location.search);
    
    if (item) {
      const id = typeof item === 'object' ? item.id : item;
      params.set('post', id);
    } else {
      params.delete('post'); // 关闭文章时只删掉 post，保留 filter
    }
    
    const newUrl = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
    window.history.pushState({}, '', newUrl);
  };

  // 4️⃣ 新增：分类筛选拦截器
  const handleSetFilter = (newFilter) => {
    setFilter(newFilter);
    const params = new URLSearchParams(window.location.search);
    
    if (newFilter === 'all') {
      params.delete('filter'); // 如果选了 all，为了网址干净，直接删掉参数
    } else {
      params.set('filter', newFilter);
    }
    
    const newUrl = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
    window.history.pushState({}, '', newUrl);
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
      
      <LayoutShell lang={lang} isEyeCareMode={isEyeCareMode} showGrid={!selectedItem}>
        <AppContent 
          lang={lang} 
          filter={filter} 
          setFilter={handleSetFilter}
          selectedItem={selectedItem} 
          setSelectedItem={handleSetSelectedItem}
          filteredData={filteredData} 
        />
      </LayoutShell>
    </>
  );
}