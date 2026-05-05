export const getTimelineData = (lang) => [
  {
    id: "os-series", // 建议把 id 改成字符串，避免潜在的类型错误
    date: '2025.08', 
    title: lang === 'zh' ? '操作系统：跨学科解构专栏' : 'Operating System: Column',
    category: 'learning', 
    layout: 'collection', // 你原本的标记，非常棒
    description: lang === 'zh' ? '一场摒弃传统死记硬背、通过游戏机制与社会博弈逻辑完成的系统级通关，证明了理解底层逻辑的路径不止一条。' : 'Winning through game mechanics rather than memorization proves there are diverse routes to mastering fundamental logic.',
    tags: ['OS', 'Learning'],
    // 这里使用你的 articles！
    articles: [
      { 
        id: 'os-deadlock-gaming', // 🚨 核心：这个 ID 必须等于 os-deadlock-gaming.md
        title: lang === 'zh' ? '从王者荣耀的BP界面理解操作系统的临界区与死锁' : 'Deadlocks via MOBA Drafts', 
        date: '2025-08-20'
      },
      { 
        id: 'os-try2', // 🚨 核心：这个 ID 必须等于 os-deadlock-gaming.md
        title: lang === 'zh' ? 'testing123' : 'testing123', 
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
  },
    {
    id: "java_project_2022", 
    date: '2022.01', 
    title: lang === 'zh' ? '基于 Java 与 SQLite 的蛋白质序列属性管理系统实现' : 'Implementation of a Protein Sequence Attribute Management System Based on Java and SQLite',
    category: 'project', 
    layout: 'tabs', 
    description: lang === 'zh' ? '基于 Java 与 SQLite 的蛋白质序列属性管理系统实现解析，聚焦面向对象架构下的模块解耦设计，并探讨异构科学数据处理中的容错补全、分页调度与统计分析。' : 'An analysis of a Protein Sequence Attribute Management System built with Java and SQLite, focusing on modular OOP design, fault-tolerant handling of heterogeneous scientific data, pagination scheduling, and statistical analysis.',
    tags: ['Java','SQLite']
  }
];