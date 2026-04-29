import React, { useState } from 'react';
import CollectionIndex from './CollectionIndex';
import ArticleView from './ArticleView';

export default function DetailView({ item, onBack, lang }) {
  const [selectedArticleId, setSelectedArticleId] = useState(null);
  
  const isCollectionIndex = item.layout === 'collection' && !selectedArticleId;
  const currentData = item.layout === 'collection' && selectedArticleId 
    ? item.articles.find(a => a.id === selectedArticleId) 
    : item;

  if (isCollectionIndex) {
    return <CollectionIndex item={item} onBack={onBack} lang={lang} onSelectArticle={setSelectedArticleId} />;
  }

  return <ArticleView currentData={currentData} item={item} onBack={onBack} lang={lang} onDeselectArticle={() => setSelectedArticleId(null)} />;
}