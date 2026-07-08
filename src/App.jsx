import React, { useState, useEffect } from 'react'; // ✨ 记得顶部引入 useEffect
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
  
  // 1️⃣ 强化版初始化：页面一刷新，先看网址里有没有要求打开某篇文章
  const [selectedItem, setSelectedItem] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const postId = params.get('post');
    if (!postId) return null;

    // 为了防止你的 selectedItem 存的是完整对象，这里去原始数据里把它找出来
    const allData = getTimelineData('zh'); // 初始先用中文找
    const foundItem = allData.find(item => item.id === postId || item.mdSource === postId);
    return foundItem || postId; 
  });

  // 2️⃣ 监听浏览器的“前进/后退”按键
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const postId = params.get('post');
      if (!postId) {
        setSelectedItem(null); // 回到列表页
      } else {
        const allData = getTimelineData(lang);
        const foundItem = allData.find(item => item.id === postId || item.mdSource === postId);
        setSelectedItem(foundItem || postId);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [lang]); // 依赖 lang，确保切换语言时找对数据

  // 3️⃣ 创建一个“带修改网址功能”的拦截函数
  const handleSetSelectedItem = (item) => {
    setSelectedItem(item); // 照常更新 React 状态

    if (item) {
      // 打开文章时，在网址后面加上 ?post=xxx 
      const id = typeof item === 'object' ? (item.mdSource || item.id) : item;
      window.history.pushState({}, '', window.location.pathname + '?post=' + id);
    } else {
      // 关闭文章时，把网址后面那串清理掉
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
          setSelectedItem={handleSetSelectedItem} // ✨ 这里换成了我们自定义的强化函数！
          filteredData={filteredData} 
        />
      </LayoutShell>
    </>
  );
}