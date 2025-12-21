import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, AlertCircle } from 'lucide-react';
import { HeroCard } from './HeroCard';
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
    <HeroCard>
      <div className="p-8 flex flex-col items-center text-center space-y-6">
        {/* Brand */}
        <div className="space-y-2">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
            FuFood.ai
          </h2>
        </div>

        {/* Mock 資料提示 */}
        {isMock && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-full text-xs text-amber-700">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>AI 服務連線中，目前使用示範資料</span>
          </div>
        )}

        {/* Search Input */}
        <div className="w-full relative group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Sparkles className="w-5 h-5 text-orange-400" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="詢問FuFood.AI"
            className="w-full py-4 pl-12 pr-14 bg-white border-2 border-orange-100 rounded-full shadow-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-400 transition-all"
          />
          <button
            onClick={handleSearch}
            className="absolute right-2 top-2 bottom-2 aspect-square bg-orange-500 hover:bg-orange-600 text-white rounded-full flex items-center justify-center transition-colors shadow-md shadow-orange-200"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap justify-center gap-2.5">
          {suggestionTags.map((tag) => (
            <button
              key={tag}
              onClick={() => {
                const params = new URLSearchParams();
                params.append('q', tag);
                navigate(`/planning/recipes/ai-query?${params.toString()}`);
              }}
              className="px-5 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-600 hover:border-orange-300 hover:text-orange-600 hover:bg-orange-50 transition-all shadow-sm font-medium"
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Footer */}
        <p className="text-sm text-gray-500 font-medium pt-1">
          今天還可以詢問 {remainingQueries} 次
        </p>
      </div>
    </HeroCard>
  );
};
