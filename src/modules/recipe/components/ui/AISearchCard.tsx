import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, AlertCircle } from 'lucide-react';

import { useRecipeSuggestions } from '@/modules/ai';

type AISearchCardProps = {
  remainingQueries?: number;
};

/** 預設建議標籤（API 不可用時的 fallback） */
const DEFAULT_SUGGESTION_TAGS = [
  '台灣屬性的美食',
  '晚餐想吃日式',
  '聖誕節吃什麼',
];

export const AISearchCard = ({ remainingQueries = 3 }: AISearchCardProps) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  // 從 API 取得建議標籤，失敗時使用預設值
  const { data: suggestionsData } = useRecipeSuggestions();

  // 安全檢查：確保 data 是陣列
  const suggestionTags = Array.isArray(suggestionsData?.data)
    ? suggestionsData.data
    : DEFAULT_SUGGESTION_TAGS;

  // 檢查是否使用 Mock 資料
  const isMock = suggestionsData?.isMock ?? false;

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (query.trim()) {
      params.append('q', query.trim());
    }
    navigate(`/planning/recipes/ai-query?${params.toString()}&from=recipes`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="w-full max-w-layout-container mx-auto">
      {/* Container with Gradient Background */}
      <div className="relative p-4 pt-8 rounded-[32px] bg-gradient-to-b from-[#FDE6E3] via-[#FFF5F3] to-white flex flex-col items-center text-center space-y-6">
        {/* Brand */}
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-primary-800 tracking-tight">
            FuFood.ai
          </h2>
        </div>

        {/* Mock 資料提示 */}
        {isMock && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/60 backdrop-blur-sm border border-amber-200 rounded-full text-xs text-amber-700 mb-2">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>AI 服務連線中，目前使用示範資料</span>
          </div>
        )}

        {/* Search Input */}
        <div className="w-full relative group max-w-md mx-auto">
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
            <Sparkles className="w-5 h-5 text-[#F58274]" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="詢問FuFood.AI"
            className="w-full h-14 pl-12 pr-14 bg-white rounded-full border border-neutral-400 text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F58274]/20 transition-all text-base"
          />
          <button
            onClick={handleSearch}
            className="absolute right-2 top-2 bottom-2 aspect-square bg-[#F58274] hover:bg-[#E06A5D] text-neutral-900 rounded-full flex items-center justify-center transition-transform active:scale-95 shadow-sm"
          >
            <ArrowRight className="w-5 h-5 text-neutral-900" />
          </button>
        </div>

        {/* Tags */}
        <div className="flex flex-row flex-nowrap overflow-x-auto w-[calc(100%+32px)] -mx-4 gap-3 pb-2 hide-scrollbar px-4 justify-start">
          {suggestionTags.map((tag) => (
            <button
              key={tag}
              onClick={() => {
                const params = new URLSearchParams();
                params.append('q', tag);
                navigate(`/planning/recipes/ai-query?${params.toString()}`);
              }}
              className="shrink-0 px-4 py-2 bg-white rounded-full text-[13px] text-gray-700 hover:text-[#F58274] border border-neutral-400 font-medium hover:border-[#F58274]/20 transition-all active:scale-95 whitespace-nowrap"
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Footer */}
        <p className="text-xs text-neutral-600 font-medium">
          今天還可以詢問 {remainingQueries} 次
        </p>
      </div>
    </div>
  );
};
