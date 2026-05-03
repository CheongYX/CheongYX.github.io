import React, { useState, useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import { translations } from '../translations';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import 'katex/dist/katex.min.css';
import mermaid from 'mermaid';

// === 辅助函数：生成合法的 HTML ID 以供目录跳转 ===
const generateId = (text) => {
  if (typeof text !== 'string') return '';
  return text.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-一-龥]/g, '');
};

// === 自定义标题组件：自动注入 ID 并设置滚动偏移，防止被顶部 Tab 栏遮挡 ===
const Heading = ({ level, children, ...props }) => {
  const extractText = (node) => {
    if (typeof node === 'string') return node;
    if (typeof node === 'number') return String(node);
    if (Array.isArray(node)) return node.map(extractText).join('');
    if (node && node.props && node.props.children) return extractText(node.props.children);
    return '';
  };
  const text = extractText(children);
  const id = generateId(text);
  const Tag = `h${level}`;
  return <Tag id={id} className="scroll-mt-32" {...props}>{children}</Tag>;
};

// === Mermaid 流程图渲染组件 ===
function MermaidChart({ chart }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current && chart) {
      try {
        const id = `mermaid-svg-${Math.random().toString(36).slice(2)}`;
        mermaid.render(id, chart).then((result) => {
          if (ref.current) ref.current.innerHTML = result.svg;
        });
      } catch (e) {
        console.error('Mermaid rendering error:', e);
      }
    }
  }, [chart]);
  return <div className="flex justify-center my-8 w-full overflow-x-auto" ref={ref} />;
}

// === 剔除头部 Front-matter 的函数 ===
const extractMarkdownBody = (text) => {
  if (text.startsWith('---')) {
    const match = text.match(/^---[\s\S]*?---\s*/);
    if (match) return text.slice(match[0].length);
  }
  return text;
};

export default function AsyncMarkdown({ source, lang, category }) {
  const [tabs, setTabs] = useState([]); 
  const [activeTabIdx, setActiveTabIdx] = useState(0); 
  const [loading, setLoading] = useState(false);
  const t = translations[lang] || translations['zh'];

  // 初始化 Mermaid
  useEffect(() => {
    mermaid.initialize({ 
      startOnLoad: false, 
      theme: 'base',
      themeVariables: {
        primaryColor: '#f1f5f9',
        primaryBorderColor: '#cbd5e1',
        primaryTextColor: '#334155',
        lineColor: '#6366f1',
        fontFamily: 'inherit'
      },
      securityLevel: 'loose' 
    });
  }, []);

  // ✨ 核心逻辑：提取当前页面的标题并广播给 LeftPanel
  useEffect(() => {
    if (!tabs[activeTabIdx]) return;
    const content = tabs[activeTabIdx].content;

    // 1. 剔除代码块，防止注释内的 # 干扰
    const contentWithoutCodeBlocks = content.replace(/```[\s\S]*?```/g, '');
    
    // 2. 升级版正则：兼容前面有空格的情况，并确保准确提取
    const headingRegex = /^[ \t]*(#{1,6})\s+(.+)$/gm;
    const headings = [];
    let match;
    
    while ((match = headingRegex.exec(contentWithoutCodeBlocks)) !== null) {
      const rawText = match[2].trim();
      const cleanText = rawText.replace(/[*_~`]/g, '');
      headings.push({ 
        level: match[1].length, 
        text: cleanText, 
        id: generateId(cleanText) 
      });
    }

    // ✨ 终极修复 1：兜底占位。如果当前 Tab 完全没有标题，强行塞入一个带有当前 Tab 名字的虚拟标题。
    // 这样能够保证发出去的目录数组绝对不为空，左侧就能死死锁定在深色的 TOC 状态！
    if (headings.length === 0) {
      headings.push({
        level: 2,
        text: tabs.length > 1 ? tabs[activeTabIdx].title : (lang === 'zh' ? '本页无导航章节' : 'No Chapters'),
        id: 'dummy-no-scroll' 
      });
    }
    
    const timer = setTimeout(() => {
      window.dispatchEvent(new CustomEvent('update-toc', { detail: headings }));
    }, 50);
    
    // ✨ 终极修复 2：当切换 Tab 时，只取消旧的定时器，绝对不要发送 `[]` 广播！
    // 这消除了切换 Tab 时左侧面板一闪而过的头像。
    return () => clearTimeout(timer);
  }, [tabs, activeTabIdx]);

  // ✨ 终极修复 3：新增独立的生命周期钩子。
  // 只有当用户点击“返回主页”彻底退出整篇文章（组件卸载）时，才发出 `[]` 召唤照片回归。
  useEffect(() => {
    return () => {
      window.dispatchEvent(new CustomEvent('update-toc', { detail: [] }));
    };
  }, []);

  // 获取并解析 Markdown 文件
  useEffect(() => {
    if (!source) return;
    
    if (source.includes('\n') || source.includes(' ')) {
      processContent(source);
      return;
    }

    setLoading(true);
    const cleanSource = source.startsWith('/') ? source.slice(1) : source;
    const fetchUrl = `${import.meta.env.BASE_URL}${cleanSource.endsWith('.md') ? cleanSource : `posts/${lang}/${cleanSource}.md`}`;

    fetch(fetchUrl)
      .then(res => { 
        if (!res.ok) throw new Error(`找不到文件 (404)`); 
        return res.text(); 
      })
      .then(text => {
        if (text.trim().toLowerCase().startsWith('<!doctype html>')) {
          throw new Error(`文件不存在！Vite 未找到该 md 文件。`);
        }
        processContent(text);
      })
      .catch((err) => {
        console.error("加载 Markdown 失败:", fetchUrl, err);
        setTabs([{
          title: "Error",
          content: `> ⚠️ **Markdown 加载失败**\n>\n> 路径: \`${fetchUrl}\`\n> 原因: **${err.message}**`
        }]);
      })
      .finally(() => setLoading(false));
  }, [source, lang, t, category]);

  // ✨ 内容切片与纠错引擎
  const processContent = (text) => {
    try {
      let cleanBody = extractMarkdownBody(text);
      
      // 🛠️ 保护 <summary> 里面的文字不被断行
      cleanBody = cleanBody
        .replace(/<details[^>]*>/gi, '\n\n$&\n')
        .replace(/<summary[^>]*>[\s\S]*?<\/summary>/gi, '$&\n\n')
        .replace(/<\/details>/gi, '\n\n$&\n\n');
      
      const tabRegex = /<!--\s*tab:\s*([^\s>]+)\s*-->/gi;
      
      // 如果分类是 project，并且含有 tab 指令，则执行切片魔法
      if (category === 'project' && tabRegex.test(cleanBody)) {
        tabRegex.lastIndex = 0;
        const rawTabs = []; 
        let match; 
        let lastIndex = 0; 
        let currentTitle = "通用"; 
        
        while ((match = tabRegex.exec(cleanBody)) !== null) {
          const tabContent = cleanBody.slice(lastIndex, match.index).trim();
          if (tabContent || rawTabs.length > 0) {
            rawTabs.push({ title: currentTitle, content: tabContent });
          }
          currentTitle = match[1]; 
          lastIndex = tabRegex.lastIndex;
        }
        
        const lastContent = cleanBody.slice(lastIndex).trim();
        if (lastContent) {
          rawTabs.push({ title: currentTitle, content: lastContent });
        }
        
        setTabs(rawTabs);
      } else {
        // 普通文章渲染为一个整页
        setTabs([{ title: "Article", content: cleanBody }]);
      }
      
      setActiveTabIdx(0); 
    } catch (e) { 
      setTabs([{ title: "Error", content: text }]); 
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-slate-400 py-10 justify-center">
        <Loader2 className="animate-spin" size={20} /> {t.loading}
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in relative">
      
      {/* 🌟 Tab 导航栏 */}
      {tabs.length > 1 && (
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-200/60 pb-3 sticky top-[4rem] z-40 bg-[#f8fafc]/90 backdrop-blur-md p-2 rounded-xl">
          {tabs.map((tab, idx) => (
            <button 
              key={idx} 
              onClick={() => setActiveTabIdx(idx)} 
              className={`px-5 py-2.5 rounded-xl text-sm font-black transition-all ${
                activeTabIdx === idx 
                ? 'bg-slate-900 text-white shadow-md' 
                : 'text-slate-500 hover:bg-slate-200/80 hover:text-slate-800'
              }`}
            >
              {tab.title}
            </button>
          ))}
        </div>
      )}

      {/* 📝 当前显示的内容 */}
      {tabs[activeTabIdx] && (
        <div className="prose prose-slate prose-indigo max-w-none prose-headings:font-black prose-p:leading-relaxed prose-a:font-bold prose-img:rounded-2xl prose-li:marker:text-indigo-500">
          <ReactMarkdown
            remarkPlugins={[remarkMath]}
            rehypePlugins={[rehypeKatex, rehypeRaw]}
            components={{
              // 将标题替换为带有 ID 的自定义组件
              h1: (props) => <Heading level={1} {...props} />,
              h2: (props) => <Heading level={2} {...props} />,
              h3: (props) => <Heading level={3} {...props} />,
              h4: (props) => <Heading level={4} {...props} />,
              h5: (props) => <Heading level={5} {...props} />,
              h6: (props) => <Heading level={6} {...props} />,
              
              // ✨ 注入带有 Mac 风格的代码渲染器
              code({ node, inline, className, children, ...props }) {
                const match = /language-([a-zA-Z0-9_+#-]+)/.exec(className || '');
                const codeText = String(children).replace(/\n$/, '');
                
                if (!inline && match) {
                  let rawLang = match[1]; 
                  let hlLang = rawLang.toLowerCase(); 
                  
                  // 智能语言别名映射
                  if (hlLang === 'c++') hlLang = 'cpp';
                  if (hlLang === 'c#') hlLang = 'csharp';
                  if (hlLang === 'js') hlLang = 'javascript';
                  if (hlLang === 'ts') hlLang = 'typescript';
                  if (hlLang === 'py') hlLang = 'python';

                  // Mermaid 拦截渲染
                  if (hlLang === 'mermaid') {
                    return <MermaidChart chart={codeText} />;
                  }

                  // 渲染 Mac 风格黑底代码框
                  return (
                    <div className="my-8 rounded-xl overflow-hidden shadow-2xl border border-[#2d2d2d] bg-[#1e1e1e]">
                      
                      {/* Mac OS 风格顶栏 */}
                      <div className="flex items-center justify-between px-4 py-3 bg-[#1e1e1e] border-b border-[#2d2d2d] select-none">
                        
                        {/* 左侧：红黄绿小圆点 */}
                        <div className="flex gap-2 w-16">
                          <div className="w-3 h-3 rounded-full bg-[#ff5f56] shadow-sm"></div>
                          <div className="w-3 h-3 rounded-full bg-[#ffbd2e] shadow-sm"></div>
                          <div className="w-3 h-3 rounded-full bg-[#27c93f] shadow-sm"></div>
                        </div>
                        
                        {/* 中间：代码语言名称 */}
                        <div className="flex-1 text-center text-[10px] font-black text-slate-500 uppercase tracking-widest">
                          {rawLang}
                        </div>
                        
                        <div className="w-16"></div> 
                      </div>
                      
                      <SyntaxHighlighter 
                        style={vscDarkPlus} 
                        language={hlLang} 
                        PreTag="div" 
                        customStyle={{ margin: 0, padding: '1.25rem', background: '#1e1e1e' }}
                        className="text-sm font-mono leading-relaxed" 
                        {...props}
                      >
                        {codeText}
                      </SyntaxHighlighter>
                    </div>
                  );
                }
                
                // 行内短代码渲染
                return (
                  <code className="bg-slate-100 text-indigo-600 px-1.5 py-0.5 rounded-md text-sm font-mono" {...props}>
                    {children}
                  </code>
                );
              }
            }}
          >
            {tabs[activeTabIdx].content}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
}