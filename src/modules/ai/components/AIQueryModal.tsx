import { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  ChevronLeft,
  Sparkles,
  SlidersHorizontal,
  Plus,
  ArrowUp,
} from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { cn } from '@/lib/utils';
import { useDispatch } from 'react-redux';
import { triggerRecipeRefresh } from '@/modules/recipe/store/recipeSlice';
import { useAIRecipeGenerate, useRecipeSuggestions } from '@/modules/ai';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';

import { RecipeCard } from '@/shared/components/recipe/RecipeCard';
import { InventoryFilterModal } from '@/modules/ai/components/InventoryFilterModal';
import { SelectedIngredientTags } from '@/modules/ai/components/SelectedIngredientTags';
import { RecipeDetailModal } from '@/modules/recipe/components/ui/RecipeDetailModal';
import { validatePrompt, validateIngredients } from '../utils/promptSecurity';
import { recipeKeys } from '@/modules/recipe/api/queries';
import type { RecipeListItem } from '@/modules/recipe/types';
import aiAvatar from '@/assets/images/recipe/ai-avator.webp';
import processingImage from '@/assets/images/shared/processing.webp';

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
  initialSelectedIngredients?: string[];
  initialRecipes?: RecipeListItem[];
  useStreaming?: boolean;
  autoGenerate?: boolean;
  mode?: 'default' | 'inspiration';
};

export const AIQueryModal = ({
  isOpen,
  onClose,
  initialQuery = '',
  initialSelectedIngredients = [],
  initialRecipes = [],
  useStreaming = false,
  autoGenerate = false,
  mode = 'default',
}: AIQueryModalProps) => {
  const [query, setQuery] = useState('');
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [showFilterModal, setShowFilterModal] = useState(false);
  /* New State for Frontend Validation Error */
  const [validationError, setValidationError] = useState<string | null>(null);
  /* New State: Store actual submitted prompt to decouple from input query */
  const [submittedPrompt, setSubmittedPrompt] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const queryClient = useQueryClient();
  //用來追蹤本次開啟是否生成過食譜
  const hasGeneratedRef = useRef(false);
  // 用來追蹤是否已經自動開啟過食譜 (避免重複開啟)
  const hasAutoOpenedRef = useRef(false);

  const dispatch = useDispatch();

  // 食譜詳細 Modal 狀態
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeListItem | null>(
    null,
  );
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);

  // 取得使用者資訊
  const { user } = useAuth();
  const userName = user?.name || user?.displayName || 'User';

  // AI 生成 Hook
  const { generate, isLoading, text, recipes, error, remainingQueries, reset } =
    useAIRecipeGenerate({ useStreaming });

  // 結合 initialRecipes 與生成結果
  const displayRecipes = useMemo(() => {
    if (recipes && recipes.length > 0) return recipes;
    if (initialRecipes && initialRecipes.length > 0) return initialRecipes;
    return null;
  }, [recipes, initialRecipes]);

  // 建議標籤
  const { data: suggestionsData } = useRecipeSuggestions();
  const suggestionTags = useMemo(() => {
    const tags = Array.isArray(suggestionsData?.data)
      ? suggestionsData.data
      : DEFAULT_SUGGESTION_TAGS;
    // 確保標籤不重複
    return Array.from(new Set(tags));
  }, [suggestionsData]);

  // 判斷是否有結果
  const hasResult = text || displayRecipes || validationError || error;

  // 初始化 Query 與 Ingredients
  useEffect(() => {
    if (isOpen) {
      if (initialSelectedIngredients.length > 0) {
        setSelectedIngredients(initialSelectedIngredients);
      }

      // 重置生成標記
      hasGeneratedRef.current = false;
      hasAutoOpenedRef.current = false;

      // 如果設定了 autoGenerate，且有 query 或 ingredients，自動觸發
      if (
        autoGenerate &&
        (initialQuery || initialSelectedIngredients.length > 0)
      ) {
        // 使用 setTimeout 確保 state 更新後執行，且避免 React 警告
        setTimeout(() => {
          handleSubmit(initialQuery, initialSelectedIngredients);
        }, 100);
      } else if (initialQuery) {
        // 如果沒有 autoGenerate 但有 initialQuery，預填入 input (但不提交)
        // 或者是為了保持與舊邏輯兼容，也可以視情況提交
        // 但根據需求，這裡主要處理 autoGenerate
        setQuery(initialQuery);
      }
    }
  }, [isOpen, autoGenerate]); // initialQuery & initialSelectedIngredients usually stable or changes with isOpen

  // 監聽 recipes 變化，判斷是否需要自動開啟 (Inspiration Mode)
  useEffect(() => {
    if (recipes && recipes.length > 0) {
      hasGeneratedRef.current = true;

      // 如果是靈感模式，且尚未自動開啟過，則開啟第一道食譜
      if (mode === 'inspiration' && !hasAutoOpenedRef.current) {
        const firstRecipe = recipes[0];
        if (firstRecipe) {
          hasAutoOpenedRef.current = true;
          // 稍微延遲一點開啟，讓使用者能看到生成的過程或結果卡片出現的瞬間
          setTimeout(() => {
            // 這裡直接使用 handleCardClick 邏輯，但為了避免重複 code，直接呼叫
            const mappedRecipe = recipes.find((r) => r.id === firstRecipe.id);
            if (mappedRecipe) {
              setSelectedRecipe(mappedRecipe as unknown as RecipeListItem);
              setIsRecipeModalOpen(true);
            }
          }, 500);
        }
      }
    }
  }, [recipes, mode]);

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
    if (containerRef.current) {
      gsap.to(containerRef.current, {
        x: '100%',
        duration: 0.3,
        ease: 'power3.in',
        onComplete: () => {
          // 如果有生成過食譜，刷新列表
          if (hasGeneratedRef.current) {
            queryClient.invalidateQueries({ queryKey: recipeKeys.lists() });
            dispatch(triggerRecipeRefresh());
          }

          // 清除狀態與對話紀錄
          reset();
          setQuery('');
          setSelectedIngredients([]);
          setSubmittedPrompt('');
          setValidationError(null);
          onClose();
        },
      });
    }
  });

  const handleSubmit = async (
    textToSubmit: string = query,
    ingredientsToSubmit: string[] = selectedIngredients,
  ) => {
    // 0. Reset validation error
    setValidationError(null);

    // 1. 驗證 Prompt
    const validation = validatePrompt(textToSubmit);

    // 2. 如果 Prompt 無效且沒有選擇食材，顯示錯誤
    if (!validation.isValid && ingredientsToSubmit.length === 0) {
      if (validation.reason) {
        setValidationError(validation.reason);
        setSubmittedPrompt(textToSubmit);
      }
      return;
    }

    // 3. 清理食材列表
    const cleanedIngredients = validateIngredients(ingredientsToSubmit);

    // 4. 防止重複提交
    if (isLoading) return;

    // 5. 處理 Prompt
    let finalPrompt = validation.isValid
      ? validation.sanitized
      : '請根據我選擇的食材推薦食譜';

    // 如果是靈感模式，強制加入 "只提供一道" 的指令
    if (mode === 'inspiration') {
      finalPrompt += ' (請只提供一道食譜)';
    }

    setSubmittedPrompt(finalPrompt);

    // 6. 發送請求
    try {
      await generate({
        prompt: finalPrompt,
        selectedIngredients: cleanedIngredients,
      });
    } catch (err) {
      console.error('[AIQueryModal] Generation failed:', err);
    }
  };

  const handleApplyIngredients = (items: string[]) => {
    setSelectedIngredients(items);
    // 如果選擇了食材且目前有輸入內容（即使無效），自動觸發提交
    if (items.length > 0 && query.trim()) {
      handleSubmit(query, items);
    }
  };

  const handleCardClick = (recipeId: string) => {
    // 優先從 displayRecipes 找
    const recipe = displayRecipes?.find((r) => r.id === recipeId);
    if (recipe) {
      setSelectedRecipe(recipe as unknown as RecipeListItem);
      setIsRecipeModalOpen(true);
    }
  };

  const handleCloseRecipeModal = () => {
    setIsRecipeModalOpen(false);
    setTimeout(() => setSelectedRecipe(null), 300);
  };

  // 如果是在靈感模式下且正在 Loading，顯示全版 Loading 畫面
  if (isOpen && mode === 'inspiration' && isLoading && !text) {
    return createPortal(
      <div className="fixed inset-0 z-100 bg-white flex flex-col items-center justify-center">
        <div className="w-full max-w-[320px] aspect-square relative mb-8">
          <img
            src={processingImage}
            alt="Processing"
            className="w-full h-full object-contain"
          />
        </div>
        <h3 className="text-xl font-bold text-neutral-900 mb-2">
          正在配對適合的食譜
        </h3>
        <p className="text-neutral-500 font-medium tracking-wider">
          請給我們幾秒鐘...
        </p>
      </div>,
      document.body,
    );
  }

  return (
    <>
      {createPortal(
        <div
          className={cn(
            'fixed inset-0 z-100 flex flex-col transition-all duration-0',
            !isOpen && 'invisible pointer-events-none',
          )}
        >
          <div
            ref={containerRef}
            className="absolute inset-0 bg-white flex flex-col shadow-xl"
            style={{ transform: 'translate(100%, 0)' }}
          >
            {/* Header */}
            <header className="bg-white border-b border-neutral-100 shrink-0">
              <div className="flex items-center px-4 h-14 relative justify-center">
                <button
                  onClick={handleCloseAnimation}
                  className="absolute left-4 p-2 -ml-2 hover:bg-neutral-100 rounded-full transition-colors"
                >
                  <ChevronLeft className="w-6 h-6 text-neutral-700" />
                </button>
                <span className="font-bold text-base text-neutral-900">
                  FuFood AI
                </span>
              </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto bg-white pb-32 custom-scrollbar">
              {/* Welcome Section (Only show when no results) */}
              {!hasResult && !isLoading && (
                <div className="flex flex-col min-h-full px-4 pt-8 pb-4 text-center">
                  <div className="flex-1 flex flex-col justify-center">
                    <h1 className="text-xl font-bold text-neutral-700">
                      {userName}，您好！
                    </h1>
                  </div>

                  {/* Suggestion Tags Grid */}
                  <div className="flex overflow-x-auto gap-4 pb-2 -mx-1 px-1 custom-scrollbar hide-scrollbar mb-4">
                    {suggestionTags.map((tag, idx) => (
                      <button
                        key={`${tag}-${idx}`}
                        onClick={() => handleSubmit(tag)}
                        className="shrink-0 max-w-[80px] bg-white border border-neutral-400 rounded-sm px-2 py-2 text-neutral-600 text-sm font-medium hover:border-primary-400 hover:text-primary-400 transition-all active:scale-95"
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
                    <p className="text-xs font-medium text-neutral-600">
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
                        <p className="text-neutral-800 text-[14px]">
                          {submittedPrompt ||
                            initialQuery ||
                            '庫存食材食譜推薦'}
                        </p>
                      </div>
                    </div>

                    {/* Loader (New Design: White bubble with dots) */}
                    {isLoading && !text && (
                      <div className="flex justify-start">
                        <div className="bg-white border border-neutral-100 rounded-2xl rounded-tl-none px-5 py-4 shadow-sm flex items-center gap-1.5 min-h-[52px]">
                          <span className="w-2 h-2 bg-neutral-800 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                          <span className="w-2 h-2 bg-neutral-800 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                          <span className="w-2 h-2 bg-neutral-800 rounded-full animate-bounce"></span>
                        </div>
                      </div>
                    )}

                    {/* AI Response (Left) */}
                    {(text ||
                      error ||
                      validationError ||
                      (displayRecipes && displayRecipes.length > 0)) && (
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
                          {error || validationError ? (
                            <div className="bg-primary-50 text-primary-600 rounded-2xl px-4 py-3 border border-primary-100">
                              {error || validationError}
                            </div>
                          ) : (
                            <div className="text-neutral-900 font-bold text-lg px-1 leading-relaxed whitespace-pre-wrap">
                              {text ||
                                (initialRecipes.length > 0
                                  ? `為您找到 ${initialRecipes.length} 道相關食譜：`
                                  : '')}
                            </div>
                          )}

                          {/* Recipe Horizontal Scroll */}
                          {displayRecipes && displayRecipes.length > 0 && (
                            <div className="w-full overflow-x-auto pb-4 pt-2 -mx-1 px-1 custom-scrollbar hide-scrollbar">
                              <div className="flex gap-4">
                                {displayRecipes.map((recipe) => (
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
              onApply={handleApplyIngredients}
            />

            {/* Footer Input Area */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-400 rounded-t-2xl p-4 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.03)] z-101">
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
                      className={cn(
                        'absolute right-2 top-1.5 w-8 h-8 bg-neutral-900 disabled:bg-neutral-200 text-white rounded-full flex items-center justify-center transition-all duration-200 shadow-sm hover:scale-105 active:scale-95',
                        query.trim() || selectedIngredients.length > 0
                          ? 'opacity-100 scale-100'
                          : 'opacity-0 scale-0 pointer-events-none',
                      )}
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
        </div>,
        document.body,
      )}

      {/* 巢狀食譜詳細 Modal (覆蓋在 AI Modal 之上) */}
      <RecipeDetailModal
        recipe={selectedRecipe}
        isOpen={isRecipeModalOpen}
        onClose={handleCloseRecipeModal}
      />
    </>
  );
};
