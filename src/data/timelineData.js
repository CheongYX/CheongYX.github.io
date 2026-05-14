export const getTimelineData = (lang) => [
    {
    id: "zenith_framework_2026", 
    date: '2026.05', 
    title: lang === 'zh' ? 'Zenith: 个人作品集与博客渲染框架' : 'Zenith: Personal Portfolio & Blog Rendering Framework',
    category: 'project', 
    layout: 'tabs', 
    description: lang === 'zh' ? '一个基于 React 构建的 Markdown 渲染框架，实现了文档的多标签页动态切片，并修复了移动端代码块与图片的响应式布局溢出问题。' : 'A React-based Markdown rendering framework that implements dynamic multi-tab slicing and resolves responsive layout overflow issues for code blocks and images on mobile devices.',
    tags: ['React', 'Vite', 'Tailwind CSS', 'Markdown', 'Framer Motion']
  },
  {
    id: "GoodMorning_Monster", 
    date: '2026.04', 
    title: lang === 'zh' ? '课外阅读：《早安，怪物》' : 'Reading: Skin in the Game',
    category: 'reading', 
    layout: 'tabs', 
    description: lang === 'zh' ? '《早安，怪物》-[加]凯瑟琳·吉尔迪纳 / 木草草 译 。认知愿意相信自己愿意相信的，所以我总是在思考如何才不会成为认知的囚徒。' : 'Taleb\'s insights on accountability and decision making.',
    tags: ['Philosophy']
  },
  {
    id: "os-series", 
    date: '2025.08', 
    title: lang === 'zh' ? '操作系统：跨学科解构专栏' : 'Operating System: Column',
    category: 'learning', 
    layout: 'collection',
    description: lang === 'zh' ? '一场摒弃传统死记硬背、通过游戏机制与社会博弈逻辑完成的系统级通关，证明了理解底层逻辑的路径不止一条。' : 'Winning through game mechanics rather than memorization proves there are diverse routes to mastering fundamental logic.',
    tags: ['OS', 'Learning'],
    articles: [
      { 
        id: 'os-deadlock-gaming', 
        title: lang === 'zh' ? '从王者荣耀的BP界面理解操作系统的临界区与死锁' : 'Deadlocks via MOBA Drafts', 
        date: '2025-08-20'
      },
      { 
        id: 'os_memory_management_2025', 
        title: lang === 'zh' ? '从图书馆借书聊内存管理：页式、段式与快表' : 'Library Analogy for Memory Management: Paging, Segmentation & TLB', 
        date: '2025-08-20'
      },
      {
        id: 'os_psych_deadlock_2025', 
        title: lang === 'zh' ? '关系中的“死锁”与“调试”：当心理学遇上操作系统' : 'Deadlocks and Debugging in Relationships: When Psychology Meets OS', 
        date: '2025-08-22'
      },
      {
        id: 'os_dining_philosophers_2025', 
        title: lang === 'zh' ? '哲学家进餐问题：四大破局智慧与死锁解析' : 'The Dining Philosophers Problem: Deadlock Analysis and Four Solutions', 
        date: '2025-09-01'
      },
      {
        id: 'os_hotel_analogy_2025', 
        title: lang === 'zh' ? '在酒店里理解操作系统的四大特性' : 'Understanding OS Characteristics Through a Hotel Analogy', 
        date: '2025-09-03'
      },
      {
        id: 'os_social_metaphor_2025', 
        title: lang === 'zh' ? '操作系统的世界，也像我们的世界' : 'The OS World: A Reflection of Our Own', 
        date: '2025-09-12'
      },
      {
        id: 'os_linux_memory_management_2025', 
        title: lang === 'zh' ? '深入理解Linux内存管理：从进程地址空间到物理页框' : 'Deep Dive into Linux Memory Management: From Address Space to Page Frames', 
        date: '2025-09-29'
      },
      {
        id: 'os_filesystem_treasure_2025', 
        title: lang === 'zh' ? '彻底理解文件系统：四大宝藏存储方案完全指南' : 'Understanding File Systems: Four Treasure Storage Schemes', 
        date: '2025-10-29'
      },
      { 
        id: 'os_linux_inode_concept_2025', 
        title: lang === 'zh' ? '终于搞懂 inode 了：一篇关于仓库、钥匙与储物柜的故事' : 'testing123', 
        date: '2025-12-09',
        description: lang == 'zh'?'一篇关于仓库、钥匙与储物柜的故事，用生活中的仓库管理员类比，轻松搞懂 Linux 文件系统中的 inode 机制。':'-',
        tags: ['Linux']
      },
      {
        id: 'os_linux_excel_search_2025', 
        title: lang === 'zh' ? '用Excel学Linux：小白也能懂的搜索原理' : 'Learning Linux through Excel: Search Principles for Beginners', 
        date: '2025-12-11'
      },
      {
        id: 'os_windows_kernel_restaurant_2026', 
        title: lang === 'zh' ? '当操作系统成为一家餐厅：Windows内核的趣味比喻' : 'When OS Becomes a Restaurant: A Fun Analogy for Windows Kernel', 
        date: '2026-01-04'
      }
    ]
  },
  {
    id: "chinese_chess_ai_2022", 
    date: '2022.08', 
    title: lang === 'zh' ? '中国象棋博弈系统的混合架构实现' : 'Hybrid Architecture Implementation of Chinese Chess AI Game System',
    category: 'project', 
    layout: 'tabs', 
    description: lang === 'zh' ? '本项目完整解构了一个基于高性能全栈架构的中国象棋AI，实现了从传统启发式剪枝搜索到CNN神经网络评估的技术跨越。文章不仅硬核攻克了分布式状态同步难题，更通过Grad-CAM热力图与可视化决策树，带您直观透视博弈大脑底层“算力”与“直觉”的运作逻辑。' : 'Project fully deconstructs a high-performance, full-stack Chinese Chess AI, showcasing the technical leap from traditional heuristic pruning search to Convolutional Neural Network (CNN) evaluation. Beyond rigorously tackling the complexities of distributed state synchronization, it utilizes Grad-CAM heatmaps and visualized decision trees to provide an intuitive look into how the underlying "computing power" and "intuition" of the gaming brain truly operate.',
    tags: ['FullStack','Minimax', 'Alpha-Beta Pruning', 'Monte Carlo Tree Search (MCTS)', 'Zobrist Hashing']
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