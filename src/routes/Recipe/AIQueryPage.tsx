import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { X, Sparkles, Send } from 'lucide-react';
import gsap from 'gsap';

const SUGGESTION_TAGS = [
  '冰箱剩餘食材食譜',
  '低卡路里晚餐',
  '快速早餐建議',
  '適合小孩的便當'
];

type AIQueryPageProps = {
  remainingQueries?: number;
};

const AIQueryPage = ({ remainingQueries = 3 }: AIQueryPageProps) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initialQuery = searchParams.get('q');
    if (initialQuery) {
      setQuery(initialQuery);
    }

    // GSAP slide in animation from right
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { x: '100%' },
        { x: '0%', duration: 0.4, ease: 'power3.out' }
      );
    }
  }, [searchParams]);

  const handleClose = () => {
    // GSAP slide out animation to right
    if (containerRef.current) {
      gsap.to(containerRef.current, {
        x: '100%',
        duration: 0.3,
        ease: 'power3.in',
        onComplete: () => {
          navigate(-1);
        }
      });
    }
  };

  const handleSubmit = async (text: string = query) => {
    if (!text.trim() || isLoading) return;

    setIsLoading(true);
    setResult(null);

    try {
      // TODO: Replace with actual API call to /api/v1/ai/recipe
      await new Promise(resolve => setTimeout(resolve, 1500));
      setResult(`這是針對「${text}」的食譜建議...\n\n[API 整合後顯示真實內容]`);
    } catch (error) {
      console.error('AI Query failed:', error);
      setResult('抱歉，發生錯誤，請稍後再試。');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 bg-white z-[100] flex flex-col"
    >
      {/* Header */}
      <header className="bg-gradient-to-b from-orange-50 to-white border-b border-orange-100">
        <div className="flex items-center justify-between px-4 h-14">
          <button
            onClick={handleClose}
            className="p-2 -ml-2 hover:bg-orange-50 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-700" />
          </button>
          <span className="font-bold text-lg bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
            FuFood.ai
          </span>
          <div className="w-10" />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-white to-orange-50/20">
        {/* Welcome Section */}
        {!result && !isLoading && (
          <div className="text-center mt-12 mb-8 px-4">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-400 via-orange-500 to-red-500 rounded-3xl mx-auto flex items-center justify-center shadow-xl shadow-orange-200/50 mb-6">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">詢問 FuFood.ai</h1>
            <p className="text-gray-500 text-sm mb-1">
              讓 AI 為您推薦美味食譜
            </p>
            <p className="text-orange-500 text-sm font-bold">
              今天還可以詢問 {remainingQueries} 次
            </p>
          </div>
        )}

        {/* Result Area */}
        {(result || isLoading) && (
          <div className="p-4">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-orange-100">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center shrink-0 shadow-md">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 space-y-4">
                  <p className="font-semibold text-gray-900 text-lg">{query}</p>
                  <div className="h-px bg-gradient-to-r from-orange-200 via-orange-100 to-transparent w-full" />
                  {isLoading ? (
                    <div className="space-y-3 animate-pulse">
                      <div className="h-4 bg-orange-100 rounded w-3/4" />
                      <div className="h-4 bg-orange-50 rounded w-1/2" />
                      <div className="h-4 bg-orange-100 rounded w-5/6" />
                    </div>
                  ) : (
                    <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {result}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Suggestions */}
        {!result && !isLoading && (
          <div className="px-4 space-y-3">
            <p className="text-sm text-gray-500 font-medium mb-4">試試這些問題</p>
            {SUGGESTION_TAGS.map((tag) => (
              <button
                key={tag}
                onClick={() => {
                  setQuery(tag);
                  handleSubmit(tag);
                }}
                className="w-full p-4 bg-white rounded-2xl border-2 border-orange-100 text-left text-gray-700 hover:border-orange-300 hover:bg-gradient-to-r hover:from-orange-50 hover:to-white transition-all flex items-center justify-between group shadow-sm"
              >
                <span className="font-medium">{tag}</span>
                <Sparkles className="w-5 h-5 text-orange-300 group-hover:text-orange-500 transition-colors" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-orange-100 p-4 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
        <div className="max-w-layout-container mx-auto relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="詢問 FuFood.AI..."
            className="w-full pl-4 pr-12 py-4 bg-orange-50 border-2 border-orange-200 rounded-2xl focus:outline-none focus:bg-white focus:ring-2 focus:ring-orange-300 focus:border-orange-400 transition-all placeholder-gray-400"
          />
          <button
            onClick={() => handleSubmit()}
            disabled={!query.trim() || isLoading}
            className="absolute right-2 top-2 bottom-2 aspect-square bg-gradient-to-br from-orange-500 to-red-500 disabled:from-gray-200 disabled:to-gray-300 text-white rounded-xl flex items-center justify-center transition-all shadow-md hover:shadow-lg disabled:shadow-none"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIQueryPage;
