import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import SimpleMarkdown from './SimpleMarkdown';
import { translations } from '../translations';

export default function AsyncMarkdown({ source, lang }) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const t = translations[lang];

  useEffect(() => {
    if (!source) return;
    if (source.endsWith('.md')) {
      setLoading(true);
      fetch(source).then(res => res.text()).then(text => setContent(text)).catch(() => setContent(`> ${t.error}`)).finally(() => setLoading(false));
    } else setContent(source);
  }, [source, lang, t]);

  if (loading) return <div className="flex items-center gap-2 text-slate-400 py-6"><Loader2 className="animate-spin" size={18} /> {t.loading}</div>;
  return <SimpleMarkdown text={content} />;
}