import React from 'react';
import { BookOpen, Code, Library, Coffee, Calendar } from 'lucide-react';
import { translations } from '../translations';

export const getCategoryStyles = (category, lang) => {
  const t = translations[lang];
  switch (category) {
    case 'learning': return { icon: <BookOpen size={16} />, color: 'bg-blue-500', bgColor: 'bg-blue-100/80 text-blue-800', label: t.learning };
    case 'project': return { icon: <Code size={16} />, color: 'bg-emerald-500', bgColor: 'bg-emerald-100/80 text-emerald-800', label: t.project };
    case 'reading': return { icon: <Library size={16} />, color: 'bg-amber-500', bgColor: 'bg-amber-100/80 text-amber-800', label: t.reading };
    case 'life': return { icon: <Coffee size={16} />, color: 'bg-rose-500', bgColor: 'bg-rose-100/80 text-rose-800', label: t.life };
    default: return { icon: <Calendar size={16} />, color: 'bg-slate-500', bgColor: 'bg-slate-100/80 text-slate-800', label: 'EVENT' };
  }
};