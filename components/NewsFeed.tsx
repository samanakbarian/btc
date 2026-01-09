import React from 'react';
import { NewsItem } from '../types';
import { ExternalLink, Newspaper } from 'lucide-react';

interface NewsFeedProps {
  news: NewsItem[];
}

export const NewsFeed: React.FC<NewsFeedProps> = ({ news }) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden h-full flex flex-col">
      <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 shrink-0">
        <h3 className="font-semibold text-slate-700 dark:text-slate-200 flex items-center">
          <Newspaper className="w-4 h-4 mr-2" /> Latest Headlines
        </h3>
        <span className="text-xs text-slate-400">Aggregated</span>
      </div>
      <div className="divide-y divide-slate-100 dark:divide-slate-700 overflow-y-auto custom-scrollbar flex-1 min-h-0">
        {news.length === 0 ? (
           <div className="p-8 text-center text-slate-400">Loading news...</div>
        ) : (
          news.map((item) => (
            <div key={item.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
              <div className="flex justify-between items-start mb-1">
                <span className="text-xs font-bold text-bitcoin uppercase">{item.source}</span>
                <span className="text-xs text-slate-400">{item.time}</span>
              </div>
              
              <a 
                href={item.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block group-hover:opacity-80 transition-opacity"
              >
                <h4 className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-snug mb-2 group-hover:text-bitcoin transition-colors">
                  {item.title}
                </h4>
              </a>

              <div className="flex justify-between items-center">
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  item.sentiment === 'positive' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                  item.sentiment === 'negative' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400' :
                  'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400'
                }`}>
                  {item.sentiment}
                </span>
                <a 
                  href={item.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                  aria-label="Read full article"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};