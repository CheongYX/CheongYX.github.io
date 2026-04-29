import React, { useState } from 'react';
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
  const [selectedItem, setSelectedItem] = useState(null);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isEyeCareMode, setIsEyeCareMode] = useState(false); 
  
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
          setSelectedItem={setSelectedItem} 
          filteredData={filteredData} 
        />
      </LayoutShell>
    </>
  );
}