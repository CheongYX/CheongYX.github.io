# 🚀 CYX 的数字花园 (Digital Garden)

欢迎来到我的个人数字花园！本项目是一个基于 React + Tailwind CSS 构建的现代化、极客风个人主页。它不仅是一份动态简历，更是一个支持 **Markdown 异步加载**、**多维排版引擎**、**中英双语切换** 以及 **Gemini AI 智能交互** 的知识沉淀平台。

## ✨ 核心特性

- **🎨 极客美学与沉浸视效**：
  - 全屏人像背景配合“左深右浅”渐变遮罩，确保文字在任何背景下绝对清晰。
  - 全局玻璃拟物化 (Glassmorphism) 卡片，带有鼠标探照灯光晕、极光拖尾及点击烟花特效。
- **📝 Markdown 内容驱动**：代码与内容完全解耦。支持在 `public` 文件夹下放置 `.md` 文件并异步加载，支持本地与远程图片渲染。
- **📚 智能排版引擎**：
  - **标签页模式 (Tabs)**：适合模块化的项目复盘与精简阅读。
  - **沉浸阅读模式 (Book)**：自动生成侧边栏目录，支持点击跳转及“收起目录”的纯净阅读模式。
  - **知识专栏模式 (Collection)**：支持多级嵌套，将庞大体系（如“操作系统”系列）整合在一个优雅的导航页。
- **🌐 国际化与无障碍体验**：
  - **中英双语 (ZH/EN)**：一键切换全站语言。
  - **护眼模式 (Eye-Care)**：一键开启暖色柔光滤镜，降低蓝光与对比度，提供“类纸质”阅读体验。
- **📬 沉浸式邮件编辑**：右下角固定悬浮邮件按钮，点击弹出拟真邮件撰写窗口，直接调用本地邮件客户端投递。
- **🤖 AI 导师交互**：集成 Gemini API，支持对长文一键“提取核心思想”并召唤“AI导师”进行跨学科延伸提问。

## 🛠️ 本地开发与快速启动

请确保你的电脑已安装 [Node.js](https://nodejs.org/)。

### 1. 初始化项目

在终端中依次运行：

```
npm create vite@latest my-portfolio -- --template react
cd my-portfolio
npm install
```

### 2. 安装必要依赖

```
# 安装图标库
npm install lucide-react

# 安装 Tailwind CSS 引擎
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 3. 配置与代码注入

- **Tailwind 配置**：打开 `tailwind.config.js`，修改 `content` 数组：

  ```
  export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: { extend: {} },
    plugins: [],
  }
  ```

- **配置全局 CSS**：打开 `src/index.css`，清空并加入：

  ```
  @tailwind base;
  @tailwind components;
  @tailwind utilities;
  ```

- **注入主代码**：将准备好的 `portfolio.jsx` 的全部代码复制，并覆盖到 `src/App.jsx` 中。

### 4. 运行

```
npm run dev
# 打开浏览器访问 http://localhost:5173
```

## ☁️ 一键部署到 GitHub Pages

1. 在 GitHub 上新建一个公开仓库（例如 `my-portfolio`），并将本地代码推送上去。

2. 安装部署工具：

   ```
   npm install gh-pages --save-dev
   ```

3. 修改 `package.json`：

   - 在顶层添加：`"homepage": "https://<你的GitHub用户名>.github.io/<你的仓库名>",`

   - 在 `scripts` 中添加：

     ```
     "predeploy": "npm run build",
     "deploy": "gh-pages -d dist"
     ```

4. 执行部署：

   ```
   npm run deploy
   ```

## ✍️ 多语言内容维护指南 (核心)

本项目支持全站中英文切换。为了保证专业内容的准确性，建议采用以下流程维护文章：

### 1. 整理双语文件夹与资源

在项目的 `public` 目录下，你可以无限制地嵌套文件夹来分类归档文章和图片。建议结构如下：

```
public/
├── images/              # 存放所有图片
│   └── os/
│       └── cpu.png
└── posts/               # 存放 Markdown 文件
    ├── zh/              # 中文文章
    │   └── os-ch1.md
    └── en/              # 英文文章
        └── os-ch1.md
```

*(在 Markdown 中引用图片语法：`![图片说明](/images/os/cpu.png)`)*

### 2. 在代码中配置动态路径

打开 `src/App.jsx`，找到 `initialTimelineData` 数组。利用 `lang` 变量来动态选择展示的标题和对应的本地文件路径：

#### 模板 A：沉浸式阅读带侧边栏 (单篇或长文)

```
{
  id: 105,
  date: '2026.05',
  category: 'learning', // 可选: learning, project, reading, life
  // 标题和描述根据语言手动翻译
  title: lang === 'zh' ? '操作系统：进程' : 'OS: Process',
  description: lang === 'zh' ? '探讨进程的本质。' : 'Deep dive into process internals.',
  tags: ['OS', 'Learning'],
  
  // 路径根据 lang 自动加载对应的文件
  chapters: [
    { 
      id: 'ch1', 
      title: lang === 'zh' ? '序章' : 'Prologue', 
      content: `/posts/${lang}/os-ch1.md` 
    }
  ]
}
```

#### 模板 B：多标签页排版 (适合项目复盘)

```
{
  id: 106,
  date: '2026.04',
  category: 'project',
  layout: 'tabs',
  title: lang === 'zh' ? '支付架构重构' : 'Payment Arch Refactor',
  description: lang === 'zh' ? '微服务拆分实践。' : 'Microservices practice.',
  tags: ['Microservices'],
  tabs: [
    { 
      id: 'tb1', 
      title: lang === 'zh' ? '设计方案' : 'Design', 
      content: `/posts/${lang}/payment-design.md` 
    }
  ]
}
```

### 3. UI 界面翻译补充

如果你未来新增了按钮或分类标签，请在 `App.jsx` 顶部的 `translations` 对象中分别补充 `zh` 和 `en` 的对应词条。

## ⚙️ 个人信息快速配置

在 `src/App.jsx` 中，搜索以下关键词进行快速修改：

- **肖像背景图**：搜索 `backgroundImage: "url('`，将其替换为你的高质量照片链接或本地路径 (如 `/images/avatar.jpg`)。
- **联系邮箱**：搜索 `const myEmail =`，填入你的真实邮箱地址。
- **社交链接**：搜索 `Linkedin` 和 `Github` 图标所在的 `<a>` 标签，修改 `href` 属性。
- **个人简介**：在 `translations` 对象中修改 `bio` 字段的中英文内容。

## 🚨 核心避坑指南

1. **ID 必须绝对唯一**：`initialTimelineData` 里的所有 `id`（包括外层、`tabs`、`articles`、`chapters`里的）**绝对不能重复**，否则会导致 React 渲染错误或侧边栏跳转失效。
2. **路径以斜杠 `/` 开头**：在 `content` 字段引用 `.md` 文件时，路径必须写为 `/posts/...`，前面的 `/` 代表从网站根目录寻找。
3. **本地预览跨域问题**：不可直接双击 `index.html` 打开。必须使用 `npm run dev` 启动本地服务器，否则无法通过 fetch 加载 Markdown 文件。
4. **GitHub Pages 图片裂开**：部署后若图片不显示，请在 Markdown 的图片路径前加上你的仓库名，如 `![图片](/my-portfolio/images/pic.png)`。

## 💎 进阶：解锁 LaTeX 公式与代码高亮

目前代码内置了极速轻量的 `SimpleMarkdown` 解析器。如果你需要书写大量**复杂数学公式（LaTeX）\**和\**专业代码高亮**：

1. 终端运行：`npm install react-markdown remark-math rehype-katex rehype-highlight`

2. 在 `App.jsx` 顶部引入：

   ```
   import ReactMarkdown from 'react-markdown';
   import remarkMath from 'remark-math';
   import rehypeKatex from 'rehype-katex';
   import rehypeHighlight from 'rehype-highlight';
   import 'katex/dist/katex.min.css'; 
   import 'highlight.js/styles/github-dark.css'; 
   ```

3. 将底部的 `AsyncMarkdown` 组件渲染部分替换为 `<ReactMarkdown>` 组件即可。