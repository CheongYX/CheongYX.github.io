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
  const [selectedItem, setSelectedItem] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const postId = params.get('post');
    return getPostById(getTimelineData('zh'), postId);
  });

  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const postId = params.get('post');
      setSelectedItem(getPostById(getTimelineData(lang), postId));
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [lang]);

  const handleSetSelectedItem = (item) => {
    setSelectedItem(item);

    if (item) {
      const id = typeof item === 'object' ? item.id : item;
      const newUrl = window.location.pathname + '?post=' + id;
      window.history.pushState({}, '', newUrl);
    } else {
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