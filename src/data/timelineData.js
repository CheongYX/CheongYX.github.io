export const getTimelineData = (lang) => [
  {
    id: "os-series", // 建议把 id 改成字符串，避免潜在的类型错误
    date: '2026.05', 
    title: lang === 'zh' ? '操作系统：跨学科专栏' : 'Operating System: Column',
    category: 'learning', 
    layout: 'collection', // 你原本的标记，非常棒
    description: lang === 'zh' ? '因为读不明白，所以运用现实的例子来学习' : 'Learning through real-world analogies.',
    tags: ['OS', 'Learning'],
    // 这里使用你的 articles！
    articles: [
      { 
        id: 'os-deadlock-gaming', // 🚨 核心：这个 ID 必须等于 os-deadlock-gaming.md
        title: lang === 'zh' ? '从王者荣耀的BP界面理解操作系统的临界区与死锁' : 'Deadlocks via MOBA Drafts', 
        date: '2025-08-20'
      }
    ]
  },
  {
    id: "reading-skin", 
    date: '2026.04', 
    title: lang === 'zh' ? '课外阅读：《非对称风险》' : 'Reading: Skin in the Game',
    category: 'reading', 
    layout: 'tabs', 
    description: lang === 'zh' ? '塔勒布关于责任与决策的思考。' : 'Taleb\'s insights on accountability and decision making.',
    tags: ['Philosophy']
  }
];