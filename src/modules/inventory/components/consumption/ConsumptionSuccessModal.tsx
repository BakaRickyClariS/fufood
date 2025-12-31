import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { ChevronLeft } from 'lucide-react';
import type {
  ConsumptionItem,
  ConsumptionReason,
  RecipeCategory,
} from '@/modules/recipe/types';
import type { RecipeListItem } from '@/modules/recipe/types';
import { RecipeCardCarousel } from '@/shared/components/recipe';
import { RecipeDetailModal } from '@/modules/recipe/components/ui/RecipeDetailModal';
import { aiRecipeApi } from '@/modules/ai/api/aiRecipeApi';
import { recipeApi } from '@/modules/recipe/services';
import successImage from '@/assets/images/recipe/consumption-success.png';

type ItemWithReason = ConsumptionItem & {
  selectedReasons?: ConsumptionReason[];
  customReasonStr?: string;
};

type ConsumptionSuccessModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onBackToInventory: () => void;
  items: ItemWithReason[];
};

const REASON_LABELS: Record<string, string> = {
  recipe_consumption: '食譜消耗',
  duplicate: '重複購買',
  short_shelf: '保存時間太短',
  bought_too_much: '買太多',
  custom: '自訂',
};

export const ConsumptionSuccessModal: React.FC<
  ConsumptionSuccessModalProps
> = ({ isOpen, onClose, onBackToInventory, items }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // 食譜詳細 modal 狀態
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeListItem | null>(
    null,
  );
  const [showRecipeDetail, setShowRecipeDetail] = useState(false);

  // 推薦食譜狀態
  const [recommendedRecipes, setRecommendedRecipes] = useState<
    RecipeListItem[]
  >([]);
  const [isLoadingRecipes, setIsLoadingRecipes] = useState(false);

  // 根據被消耗的食材載入推薦食譜（優先搜尋現有，否則 AI 生成並儲存）
  useEffect(() => {
    const loadRecommendedRecipes = async () => {
      if (!isOpen || items.length === 0 || isLoadingRecipes) return;
      
      // 避免重複呼叫 (如果已有結果)
      if (recommendedRecipes.length > 0) return;

      setIsLoadingRecipes(true);
      try {
        // 從消耗項目中提取食材名稱
        const ingredientNames = items.map((item) => item.ingredientName);
        console.log('正在為以下食材尋找食譜:', ingredientNames);

        // 1. 先嘗試從使用者現有的食譜中搜尋
        // 這裡我們取得所有食譜，前端進行簡單過濾
        // 注意：這裡不傳 refrigeratorId，這樣能搜尋到使用者所有已儲存的食譜
        const allSavedRecipes = await recipeApi.getRecipes();
        
        const matchedRecipes = allSavedRecipes.filter(recipe => {
          // 關鍵字比對：食譜名稱包含任何一個消耗的食材
          return ingredientNames.some(ing => recipe.name.includes(ing));
        });

        if (matchedRecipes.length > 0) {
          console.log('找到現有相關食譜:', matchedRecipes);
          // 根據匹配程度排序可能更好，這裡簡單取前 5 筆
          setRecommendedRecipes(matchedRecipes.slice(0, 5));
          setIsLoadingRecipes(false);
          return;
        }

        // 2. 如果沒有現有食譜，則呼叫 AI 生成
        console.log('無相符現有食譜，開始 AI 生成...');
        const prompt = `請幫我用以下食材製作簡單料理: ${ingredientNames.join('、')}`;
        
        const response = await aiRecipeApi.generateRecipe({
          prompt,
          selectedIngredients: ingredientNames,
        });
        
        // 轉換為標準格式
        // 轉換為標準格式 (暫時保留變數宣告，以防後面 fallback 需要，但不立即 setRecommendedRecipes)
        /*
        const generatedRecipes: RecipeListItem[] = (response.data.recipes || []).map((recipe) => ({
          id: recipe.id,
          name: recipe.name,
          imageUrl: recipe.imageUrl || null,
          category: (recipe.category || '中式料理') as RecipeCategory,
          cookTime: recipe.cookTime || 30,
          servings: recipe.servings || 2,
          isFavorite: recipe.isFavorite || false,
        }));
        */
        
        // 3. 自動儲存 AI 生成的食譜到後端，並取得真實 ID
        const savedRecipesToDisplay: RecipeListItem[] = [];

        if (response.data.recipes && response.data.recipes.length > 0) {
          // 使用 Promise.all 等待所有儲存完成
          await Promise.all(
            response.data.recipes.map(async (aiRecipe) => {
              // 確保必要欄位存在
              if (!aiRecipe.ingredients || !aiRecipe.steps) {
                console.warn(
                  `跳過儲存食譜 (${aiRecipe.name})：缺少食材或步驟資訊`,
                );
                return;
              }
              
              // 避免重複儲存：檢查是否已存在同名食譜
              // allSavedRecipes 在步驟 1 已取得
              const existingRecipe = allSavedRecipes.find(r => r.name === aiRecipe.name);
              
              if (existingRecipe) {
                 console.log(`食譜已存在，跳過儲存並使用現有資料: ${aiRecipe.name}`);
                 savedRecipesToDisplay.push(existingRecipe);
                 return;
              }

              try {
                const savedRecipe = await aiRecipeApi.saveRecipe({
                  name: aiRecipe.name,
                  category: aiRecipe.category,
                  imageUrl: aiRecipe.imageUrl,
                  servings: aiRecipe.servings,
                  cookTime: aiRecipe.cookTime,
                  difficulty: aiRecipe.difficulty,
                  ingredients: aiRecipe.ingredients,
                  seasonings: aiRecipe.seasonings || [],
                  steps: aiRecipe.steps,
                  originalPrompt: prompt,
                  description: `使用食材：${ingredientNames.join('、')} 生成的食譜`,
                });
                console.log(`已自動儲存食譜: ${aiRecipe.name}, ID: ${savedRecipe.id}`);
                
                // 將儲存後的食譜轉換為顯示格式
                savedRecipesToDisplay.push({
                  id: savedRecipe.id, // 使用真實的 DB ID
                  name: savedRecipe.name,
                  imageUrl: savedRecipe.imageUrl,
                  category: (savedRecipe.category || '中式料理') as RecipeCategory,
                  cookTime: savedRecipe.cookTime || 30,
                  servings: savedRecipe.servings,
                  isFavorite: savedRecipe.isFavorite,
                });

              } catch (err) {
                console.warn(`自動儲存食譜失敗 (${aiRecipe.name}):`, err);
              }
            }),
          );
        }

        // 顯示已成功儲存的食譜 (使用真實 ID)
        // 如果儲存全都失敗(例如網路問題)，則不顯示，避免 404
        if (savedRecipesToDisplay.length > 0) {
           setRecommendedRecipes(savedRecipesToDisplay.slice(0, 4));
        } else {
           // Fallback: 如果真的都存失敗了，顯示 AI 原始回傳的
           console.warn("所有食譜儲存失敗或無內容，使用原始暫時數據顯示");
           const generatedRecipes: RecipeListItem[] = (response.data.recipes || []).map((recipe) => ({
            id: recipe.id,
            name: recipe.name,
            imageUrl: recipe.imageUrl || null,
            category: (recipe.category || '中式料理') as RecipeCategory,
            cookTime: recipe.cookTime || 30,
            servings: recipe.servings || 2,
            isFavorite: recipe.isFavorite || false,
          }));
          setRecommendedRecipes(generatedRecipes.slice(0, 4));
        }
      } catch (error) {
        console.error('載入推薦食譜失敗', error);
        setRecommendedRecipes([]);
      } finally {
        setIsLoadingRecipes(false);
      }
    };

    loadRecommendedRecipes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, items]);

  useEffect(() => {
    if (isOpen && modalRef.current) {
      const tl = gsap.timeline();
      tl.fromTo(
        modalRef.current,
        { x: '100%' },
        { x: '0%', duration: 0.4, ease: 'power3.out' },
      );
    }
  }, [isOpen]);

  const handleClose = () => {
    // Usually back button would just close modal or go back.
    // "返回庫房" goes to inventory.
    if (modalRef.current) {
      gsap.to(modalRef.current, {
        x: '100%',
        duration: 0.3,
        ease: 'power3.in',
        onComplete: onClose,
      });
    } else {
      onClose();
    }
  };

  const handleBackToInventory = () => {
    if (modalRef.current) {
      gsap.to(modalRef.current, {
        x: '100%',
        duration: 0.3,
        ease: 'power3.in',
        onComplete: onBackToInventory,
      });
    } else {
      onBackToInventory();
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[120] flex justify-end pointer-events-none">
      <div
        ref={modalRef}
        className="w-full h-full bg-[#f6f6f6] pointer-events-auto overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white px-4 py-3 flex items-center justify-between shadow-sm">
          <button onClick={handleClose} className="p-1 -ml-1">
            <ChevronLeft size={24} className="text-neutral-900" />
          </button>
          <h1 className="text-lg font-bold text-neutral-900 absolute left-1/2 -translate-x-1/2">
            消耗完成
          </h1>
          <div className="w-8" />
        </div>

        {/* Content */}
        <div className="px-5 py-6 pb-24">
          {/* Success Section */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative w-48 h-48">
              <img
                src={successImage}
                alt="Success"
                className="w-full h-full object-contain scale-130"
              />
            </div>
          </div>

          {/* Result Section */}
          <div className="bg-white rounded-3xl p-5 shadow-sm mb-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-5 bg-primary-500 rounded-full"></div>
              <h3 className="font-bold text-neutral-900 text-base">
                食材消耗結果
              </h3>
            </div>

            <div className="space-y-4">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="border-b border-gray-100 last:border-0 pb-4 last:pb-0"
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="font-bold text-neutral-600 text-base">
                      {item.ingredientName}
                    </div>
                    <div className="font-bold text-neutral-900 text-base">
                      {item.consumedQuantity}
                      {item.unit}
                    </div>
                  </div>
                  {item.selectedReasons && item.selectedReasons.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {item.selectedReasons.map((r, reasonIndex) => (
                        <span
                          key={`${r}-${reasonIndex}`}
                          className="px-3 py-1 bg-neutral-100 text-neutral-600 rounded-full text-sm font-medium border border-neutral-400"
                        >
                          {r === 'custom' && item.customReasonStr
                            ? item.customReasonStr
                            : REASON_LABELS[r] || r}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleBackToInventory}
            className="w-full bg-white border border-gray-200 text-neutral-800 font-bold py-3.5 rounded-xl text-base mb-8"
          >
            返回庫房
          </button>

          {/* 推薦食譜區塊 - 使用共用的 RecipeCardCarousel 元件 */}
          {isLoadingRecipes ? (
            <div className="text-center py-8 text-gray-500">
              載入推薦食譜中...
            </div>
          ) : recommendedRecipes.length > 0 ? (
            <div className="-mx-5">
              <RecipeCardCarousel
                title="你可能會喜歡..."
                recipes={recommendedRecipes}
                onRecipeClick={(id) => {
                  const recipe = recommendedRecipes.find((r) => r.id === id);
                  if (recipe) {
                    setSelectedRecipe(recipe);
                    setShowRecipeDetail(true);
                  }
                }}
                showPopularTag={true}
              />
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              暫無相關食譜推薦
            </div>
          )}
        </div>
      </div>

      {/* 食譜詳細 Modal */}
      <RecipeDetailModal
        recipe={selectedRecipe}
        isOpen={showRecipeDetail}
        onClose={() => {
          setShowRecipeDetail(false);
          setSelectedRecipe(null);
        }}
      />
    </div>,
    document.body,
  );
};
