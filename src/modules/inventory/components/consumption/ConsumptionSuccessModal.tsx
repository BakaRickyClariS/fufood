import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { ChevronLeft } from 'lucide-react';
import type {
  ConsumptionItem,
  ConsumptionReason,
} from '@/modules/recipe/types';
import type { RecipeListItem } from '@/modules/recipe/types';
import { RecipeCardCarousel } from '@/shared/components/recipe';
import { RecipeDetailModal } from '@/modules/recipe/components/ui/RecipeDetailModal';
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

  // 根據被消耗的食材載入推薦食譜
  useEffect(() => {
    const loadRecommendedRecipes = async () => {
      if (!isOpen || items.length === 0) return;

      setIsLoadingRecipes(true);
      try {
        // 從消耗項目中提取食材名稱
        const ingredientNames = items.map((item) => item.ingredientName);
        const recipes = await recipeApi.getRecommendedRecipes(ingredientNames);
        setRecommendedRecipes(recipes.slice(0, 4)); // 最多顯示 4 個
      } catch (error) {
        console.error('載入推薦食譜失敗', error);
        setRecommendedRecipes([]);
      } finally {
        setIsLoadingRecipes(false);
      }
    };

    loadRecommendedRecipes();
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
