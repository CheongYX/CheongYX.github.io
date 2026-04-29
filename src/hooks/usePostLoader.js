import { useState, useEffect } from 'react';
import fm from 'front-matter'; // ✨ 换成了专门为浏览器设计的解析器

export function usePostLoader(postId, lang) {
  const [postData, setPostData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMarkdown() {
      setLoading(true);
      try {
        const path = `/posts/${lang}/${postId}.md`;
        
        const response = await fetch(path);
        if (!response.ok) throw new Error('File not found');

        const text = await response.text();
        
        // ✨ 核心修改：使用 front-matter 来解析，彻底告别 Buffer 报错
        const { attributes: data, body: content } = fm(text);

        let processed = { ...data, id: postId };

        // --- 👇 你引以为傲的排版引擎完美保留 👇 ---
        if (data.layout === 'book') {
          // 书本模式按一级标题 (#) 切分
          const sections = content.split(/^# /m).filter(Boolean);
          processed.chapters = sections.map((s, i) => {
            const [title, ...body] = s.split('\n');
            return { id: `s${i}`, title: title.trim(), content: body.join('\n') };
          });
        } else {
          // 标签 (Tabs) 模式按二级标题 (##) 切分
          const sections = content.split(/^## /m).filter(Boolean);
          processed.tabs = sections.map((s, i) => {
            const [title, ...body] = s.split('\n');
            return { id: `t${i}`, title: title.trim(), content: body.join('\n') };
          });
        }
        // --- 👆 排版引擎部分结束 👆 ---

        setPostData(processed);
      } catch (err) {
        console.error("Markdown 加载失败:", err.message);
        setPostData(null);
      }
      setLoading(false);
    }

    if (postId) fetchMarkdown();
  }, [postId, lang]);

  return { postData, loading };
}