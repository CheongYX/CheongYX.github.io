export const projects = [
  {
    id: "os-series",
    type: "series", 
    category: "learning",
    date: "2025-08",
    title: "操作系统",
    description: "因为读不明白，所以运用现实的例子来学习",
    tags: ["OS", "Concept"],
    posts: [
      {
        id: "os-deadlock-gaming",
        title: "从王者荣耀的BP界面理解操作系统的临界区与死锁",
        date: "2025-08-20",
        description: "用游戏视角拆解并发编程的核心逻辑。"
      },
      { 
        id: "os-memory", 
        title: "从酒店订房理解内存管理", 
        date: "2025-09", 
        description: "待发布..." 
      }
    ]
  }
  // 如果还有其他项目，继续往后加
];