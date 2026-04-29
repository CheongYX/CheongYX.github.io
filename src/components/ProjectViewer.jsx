import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import mermaid from 'mermaid';

// 初始化 Mermaid 主题配置
mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose',
});

// 专门渲染 Mermaid 的子组件
function MermaidChart({ chart }) {
  const ref = useRef(null);
  
  useEffect(() => {
    if (ref.current && chart) {
      try {
        // 使用随机 ID 避免 React 严格模式下的渲染冲突
        const id = `mermaid-svg-${Math.random().toString(36).slice(2)}`;
        mermaid.render(id, chart).then((result) => {
          if (ref.current) ref.current.innerHTML = result.svg;
        });
      } catch (e) {
        console.error('Mermaid rendering error:', e);
      }
    }
  }, [chart]);

  return <div className="flex justify-center my-8 overflow-x-auto" ref={ref} />;
}

export default function ProjectViewer({ project }) {
  const [activeTab, setActiveTab] = useState(0);

  if (!project) return null;

  // 🎨 强化的组件渲染器
  const MarkdownComponents = {
    code({ node, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '');
      const codeText = String(children).replace(/\n$/, '');

      // 1. 如果标记为 mermaid，直接调用图表组件
      if (match && match[1] === 'mermaid') {
        return <MermaidChart chart={codeText} />;
      }

      // 2. 如果是代码块 (包含换行符，或者是明确标记了语言的)
      const isBlock = match || codeText.includes('\n');
      
      if (isBlock) {
        return (
          <SyntaxHighlighter
            style={vscDarkPlus}
            language={match ? match[1] : 'text'}
            PreTag="div"
            className="rounded-xl my-6 text-sm font-mono shadow-lg"
            {...props}
          >
            {codeText}
          </SyntaxHighlighter>
        );
      }

      // 3. 否则就是普通的行内代码 (比如 `代码`)
      return (
        <code className="bg-slate-100 text-indigo-600 px-1.5 py-0.5 rounded-md text-sm font-mono" {...props}>
          {children}
        </code>
      );
    }
  };

  const renderMarkdown = (content) => (
    <ReactMarkdown
      remarkPlugins={[remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={MarkdownComponents}
    >
      {content}
    </ReactMarkdown>
  );

  // --- 以下保持你原本的拆分渲染逻辑不变 ---

  if (project.layout === 'book' && project.chapters) {
    return (
      <div className="space-y-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">{project.title}</h1>
          {project.description && <p className="text-lg text-slate-500 font-medium">{project.description}</p>}
        </div>
        
        {project.chapters.map((chapter) => (
          <div key={chapter.id} className="glass-card p-8 md:p-12 rounded-3xl relative overflow-hidden group">
            <h2 className="text-2xl font-black text-indigo-600 mb-8 pb-4 border-b-2 border-indigo-50 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm">#</span>
              {chapter.title}
            </h2>
            <div className="prose prose-slate prose-indigo max-w-none prose-headings:font-black prose-p:leading-relaxed prose-a:font-bold prose-img:rounded-2xl">
              {renderMarkdown(chapter.content)}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (project.tabs && project.tabs.length > 0) {
    return (
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-8 md:px-12 pt-10 pb-6 bg-slate-50/50 border-b border-slate-100">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-8">{project.title}</h1>
          <div className="flex flex-wrap gap-2">
            {project.tabs.map((tab, index) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(index)}
                className={`px-6 py-2.5 rounded-full text-sm font-black tracking-wide transition-all duration-300 ${
                  activeTab === index 
                    ? 'bg-slate-900 text-white shadow-lg -translate-y-0.5' 
                    : 'bg-white text-slate-500 hover:bg-slate-100 hover:text-slate-700 border border-slate-200'
                }`}
              >
                {tab.title}
              </button>
            ))}
          </div>
        </div>
        
        <div className="p-8 md:p-12 animate-fade-in">
           <div className="prose prose-slate prose-indigo max-w-none prose-headings:font-black prose-p:leading-relaxed">
             {renderMarkdown(project.tabs[activeTab].content)}
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-8 md:p-12 rounded-3xl">
      <h1 className="text-4xl font-black text-slate-900 mb-8">{project.title}</h1>
      <div className="prose prose-slate max-w-none">
         {renderMarkdown(project.content || "正在加载内容...")}
      </div>
    </div>
  );
}