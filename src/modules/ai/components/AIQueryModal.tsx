import { useState, useEffect, useRef, useMemo } from 'react';
import { X, Sparkles, SlidersHorizontal, Plus, ArrowUp } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { cn } from '@/lib/utils';
import { useSelector } from 'react-redux';
import { selectActiveRefrigeratorId } from '@/store/slices/refrigeratorSlice';
import { useAIRecipeGenerate, useRecipeSuggestions } from '@/modules/ai';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { useInventoryQuery } from '@/modules/inventory/api/queries';
import { useToast } from '@/shared/contexts/ToastContext';
import { RecipeCard } from '@/shared/components/recipe/RecipeCard';
import { InventoryFilterModal } from '@/modules/ai/components/InventoryFilterModal';
import { SelectedIngredientTags } from '@/modules/ai/components/SelectedIngredientTags';
import { RecipeDetailModal } from '@/modules/recipe/components/ui/RecipeDetailModal';
import { validatePrompt, validateIngredients } from '../utils/promptSecurity';
import type { RecipeListItem } from '@/modules/recipe/types';
import aiAvatar from '@/assets/images/recipe/ai-avator.png';

/** 預設建議標籤（API 不可用時的 fallback） */
const DEFAULT_SUGGESTION_TAGS = [
  '冰箱剩餘食材食譜',
  '低卡路里晚餐',
  '快速早餐建議',
  '適合小孩的便當',
];

type AIQueryModalProps = {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
  useStreaming?: boolean;
};
export const AIQueryModal = ({
  isOpen,
  onClose,
  initialQuery = '',
  useStreaming = false,
}: AIQueryModalProps) => {
  const [query, setQuery] = useState('');
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [useInventory, setUseInventory] = useState(true); // 預設開啟庫存食材
  const containerRef = useRef<HTMLDivElement>(null);

  const activeRefrigeratorId = useSelector(selectActiveRefrigeratorId);

  // 食譜詳細 Modal 狀態
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeListItem | null>(
    null,
  );
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);

  // 取得使用者資訊
  const { user } = useAuth();
  const userName = user?.name || user?.displayName || 'User';

  // AI 生成 Hook
  const {
    generate,
    isLoading,
    text,
    stage,
    recipes,
    error,
    remainingQueries,
    reset,
  } = useAIRecipeGenerate({ useStreaming });

  // 建議標籤
  const { data: suggestionsData } = useRecipeSuggestions();
  const suggestionTags = useMemo(() => {
    const tags = Array.isArray(suggestionsData?.data)
      ? suggestionsData.data
      : DEFAULT_SUGGESTION_TAGS;
    // 確保標籤不重複
    return Array.from(new Set(tags));
  }, [suggestionsData]);

  // 庫存食材資料
  const { data: inventoryData } = useInventoryQuery({
    limit: 100,
    refrigeratorId: activeRefrigeratorId || undefined,
  });
  const allInventoryItems = useMemo(() => {
    return inventoryData?.data?.items?.map((item) => item.name) || [];
  }, [inventoryData]);

  // 當開啟「使用庫存食材」時，自動載入所有庫存食材
  useEffect(() => {
    if (useInventory && allInventoryItems.length > 0) {
      setSelectedIngredients(allInventoryItems);
    } else if (!useInventory) {
      setSelectedIngredients([]);
    }
  }, [useInventory, allInventoryItems]);

  // 判斷是否有結果
  const hasResult = text || recipes;

  // 初始化 Query
  useEffect(() => {
    if (isOpen && initialQuery) {
      setQuery(initialQuery);
      generate({ prompt: initialQuery });
    }
  }, [isOpen, initialQuery]);

  // 追蹤是否已經播放過進場動畫
  const hasAnimatedIn = useRef(false);

  // GSAP 動畫
  useGSAP(
    () => {
      // 只有當 Modal 首次開啟時播放進場動畫
      if (isOpen && !hasAnimatedIn.current && containerRef.current) {
        hasAnimatedIn.current = true;
        gsap.fromTo(
          containerRef.current,
          { x: '100%' },
          { x: '0%', duration: 0.4, ease: 'power3.out' },
        );
      }
      // 當 Modal 關閉時重置動畫狀態
      if (!isOpen) {
        hasAnimatedIn.current = false;
      }
    },
    { scope: containerRef, dependencies: [isOpen] },
  );

  const { contextSafe } = useGSAP({ scope: containerRef });

  const handleCloseAnimation = contextSafe(() => {
    gsap.to(containerRef.current, {
      x: '100%',
      duration: 0.3,
      ease: 'power3.in',
      onComplete: () => {
        reset(); // 關閉時重置 AI 狀態
        setQuery('');
        setSelectedIngredients([]);
        onClose();
      },
    });
  });

  const { showToast } = useToast();

  const handleSubmit = async (textToSubmit: string = query) => {
    // 1. 驗證 Prompt
    const validation = validatePrompt(textToSubmit);

    // 2. 如果 Prompt 無效且沒有選擇食材，顯示錯誤
    if (!validation.isValid && selectedIngredients.length === 0) {
      if (validation.reason) {
        showToast(validation.reason, 'error');
      }
      return;
    }

    // 3. 清理食材列表
    const cleanedIngredients = validateIngredients(selectedIngredients);

    // 4. 防止重複提交
    if (isLoading) return;

    // 5. 更新 UI 顯示
    const finalPrompt = validation.isValid
      ? validation.sanitized
      : '請根據我選擇的食材推薦食譜';
    setQuery(finalPrompt);

    // 6. 發送請求
    await generate({
      prompt: finalPrompt,
      selectedIngredients: cleanedIngredients,
    });
  };

  const handleCardClick = (recipeId: string) => {
    const recipe = recipes?.find((r) => r.id === recipeId);
    if (recipe) {
      // 轉換為 RecipeListItem 格式
      const listItem: RecipeListItem = {
        id: recipe.id,
        name: recipe.name,
        category: recipe.category as any, // 暫時轉型
        imageUrl: recipe.imageUrl,
        servings: recipe.servings,
        cookTime: recipe.cookTime,
        isFavorite: recipe.isFavorite,
      };

      setSelectedRecipe(listItem);
      setIsRecipeModalOpen(true);
    }
  };

  const handleCloseRecipeModal = () => {
    setIsRecipeModalOpen(false);
    setTimeout(() => setSelectedRecipe(null), 300);
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        ref={containerRef}
        className="fixed inset-0 bg-white z-100 flex flex-col"
      >
        {/* Header */}
        <header className="bg-white border-b border-neutral-100 shrink-0">
          <div className="flex items-center px-4 h-14 relative justify-center">
            <button
              onClick={handleCloseAnimation}
              className="absolute left-4 p-2 -ml-2 hover:bg-neutral-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6 text-neutral-700" />
            </button>
            <span className="font-bold text-lg text-neutral-900">
              FuFood AI
            </span>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto bg-white pb-32 custom-scrollbar">
          {/* Welcome Section (Only show when no results) */}
          {!hasResult && !isLoading && (
            <div className="flex flex-col min-h-full px-4 pt-8 pb-4 text-center">
              <h1 className="text-2xl font-bold text-neutral-900">
                {userName}，您好！
              </h1>

              {/* Spacer to push suggestions to bottom */}
              <div className="flex-1" />

              {/* Suggestion Tags Grid */}
              <div className="flex overflow-x-auto gap-4 pb-2 -mx-1 px-1 custom-scrollbar hide-scrollbar mb-4">
                {suggestionTags.map((tag, idx) => (
                  <button
                    key={`${tag}-${idx}`}
                    onClick={() => handleSubmit(tag)}
                    className="shrink-0 max-w-[80px] bg-white border border-neutral-200 rounded-sm px-2 py-2 text-neutral-600 text-sm font-medium hover:border-primary-400 hover:text-primary-400 transition-all active:scale-95"
                  >
                    {tag}
                  </button>
                ))}
              </div>

              <div className="space-y-2 mb-4">
                {remainingQueries !== null && (
                  <p className="text-primary-500 text-sm font-bold">
                    今天還可以詢問 {remainingQueries} 次
                  </p>
                )}
                <p className="text-xs text-neutral-400">
                  AI可能會出錯，請查證。
                </p>
              </div>
            </div>
          )}

          {/* Result Area */}
          {(hasResult || isLoading) && (
            <div className="p-4 space-y-6">
              {/* AI Response Bubble */}
              <div className="space-y-4">
                {/* User Query (Right) */}
                <div className="flex justify-end">
                  <div className="max-w-[80%] bg-white border border-neutral-200 rounded-2xl rounded-tr-none px-4 py-3 shadow-sm">
                    {selectedIngredients.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {selectedIngredients.map((ing, idx) => (
                          <span
                            key={`${ing}-${idx}`}
                            className="text-xs px-2 py-0.5 bg-primary-50 text-primary-400 rounded-full"
                          >
                            {ing}
                          </span>
                        ))}
                      </div>
                    )}
                    <p className="text-neutral-800">
                      {query || '庫存食材食譜推薦'}
                    </p>
                  </div>
                </div>

                {/* Loader */}
                {isLoading && !text && (
                  <div className="flex justify-start">
                    <div className="bg-neutral-100 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex items-center gap-2">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                        <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                        <span className="w-2 h-2 bg-neutral-400 rounded-full animate-bounce"></span>
                      </div>
                      {stage && (
                        <span className="text-xs text-neutral-500 ml-2">
                          {stage}...
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* AI Response (Left) */}
                {(text || error) && (
                  <div className="space-y-4">
                    {/* Avatar Row */}
                    <div className="flex justify-start">
                      <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shrink-0 overflow-hidden shadow-sm border border-neutral-100">
                        <img
                          src={aiAvatar}
                          alt="AI"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        <Sparkles
                          className="w-6 h-6 text-warning-500 absolute"
                          style={{ display: 'none' }}
                        />
                      </div>
                    </div>

                    {/* Content Column */}
                    <div className="space-y-4">
                      {error ? (
                        <div className="bg-primary-50 text-primary-600 rounded-2xl px-4 py-3 border border-primary-100">
                          {error}
                        </div>
                      ) : (
                        <div className="text-neutral-900 font-bold text-lg px-1 leading-relaxed whitespace-pre-wrap">
                          {text}
                        </div>
                      )}

                      {/* Recipe Horizontal Scroll */}
                      {recipes && recipes.length > 0 && (
                        <div className="w-full overflow-x-auto pb-4 pt-2 -mx-1 px-1 custom-scrollbar hide-scrollbar">
                          <div className="flex gap-4">
                            {recipes.map((recipe) => (
                              <div
                                key={recipe.id}
                                className="w-[280px] h-[280px] shrink-0"
                              >
                                <RecipeCard
                                  recipe={{
                                    id: recipe.id,
                                    name: recipe.name,
                                    category:
                                      recipe.category as import('@/modules/recipe/types').RecipeCategory,
                                    imageUrl: recipe.imageUrl,
                                    servings: recipe.servings,
                                    cookTime: recipe.cookTime,
                                    isFavorite: recipe.isFavorite,
                                  }}
                                  onClick={handleCardClick}
                                  showCategoryBadge
                                  className="w-full h-full shadow-md border-0"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <InventoryFilterModal
          isOpen={showFilterModal}
          onClose={() => setShowFilterModal(false)}
          selectedItems={selectedIngredients}
          onApply={setSelectedIngredients}
          useInventory={useInventory}
          onToggleInventory={setUseInventory}
        />

        {/* Footer Input Area */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-100 p-4 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.03)] z-101">
          <div className="max-w-layout-container mx-auto space-y-3">
            <div className="relative">
              {/* Input Field */}
              <div className="relative">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                  maxLength={200}
                  placeholder={
                    selectedIngredients.length > 0
                      ? '想做什麼料理？'
                      : '輸入食材或料理名稱...'
                  }
                  className="w-full pl-4 pr-12 pb-3 bg-white focus:outline-none focus:border-neutral-400 transition-all text-neutral-800 placeholder-neutral-400"
                />
                <button
                  onClick={() => handleSubmit()}
                  disabled={
                    (!query.trim() && selectedIngredients.length === 0) ||
                    isLoading
                  }
                  className="absolute right-2 top-1.5 w-8 h-8 bg-neutral-900 disabled:bg-neutral-200 text-white rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 shadow-sm"
                >
                  <ArrowUp className="w-5 h-5" />
                </button>
              </div>
              {/* Selected Tags Area */}
              <div className="flex items-center gap-2 mb-2 overflow-x-auto hide-scrollbar p-1">
                {/* Filter Trigger Button */}
                <button
                  onClick={() => setShowFilterModal(true)}
                  className={cn(
                    'shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-colors relative',
                    selectedIngredients.length > 0
                      ? 'bg-neutral-100 text-neutral-800'
                      : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200',
                  )}
                >
                  <SlidersHorizontal className="w-5 h-5" />
                  {selectedIngredients.length > 0 && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary-500 text-white rounded-full text-[10px] flex items-center justify-center font-bold border-2 border-white box-content">
                      {selectedIngredients.length}
                    </div>
                  )}
                </button>

                {/* Tags */}
                {selectedIngredients.length > 0 ? (
                  <SelectedIngredientTags
                    items={selectedIngredients.slice(0, 5)} // 顯示最多 5 個
                    onRemove={(item) =>
                      setSelectedIngredients((prev) =>
                        prev.filter((i) => i !== item),
                      )
                    }
                  />
                ) : (
                  <button
                    onClick={() => setShowFilterModal(true)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-dashed border-neutral-300 text-neutral-400 text-sm hover:border-neutral-400 hover:text-neutral-500 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    加入庫存食材
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 巢狀食譜詳細 Modal (覆蓋在 AI Modal 之上) */}
      <RecipeDetailModal
        recipe={selectedRecipe}
        isOpen={isRecipeModalOpen}
        onClose={handleCloseRecipeModal}
      />
    </>
  );
};
