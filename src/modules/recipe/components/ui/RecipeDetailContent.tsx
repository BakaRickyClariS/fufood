import React from 'react';
import { toast } from 'sonner';
import { Clock, Users, ChefHat, Heart, Loader2 } from 'lucide-react';
import type { Recipe, ConsumptionItem } from '@/modules/recipe/types';
import { recipeApi } from '@/modules/recipe/services';
import { IngredientList } from '@/modules/recipe/components/ui/IngredientList';
import { CookingSteps } from '@/modules/recipe/components/ui/CookingSteps';
import { ConsumptionModal } from '@/modules/inventory/components/consumption';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/shared/components/ui/sheet';

type RecipeDetailContentProps = {
  recipe: Recipe;
  consumptionItems: ConsumptionItem[];
  showConsumptionModal: boolean;
  onShowConsumptionModal: (show: boolean) => void;
  onRecipeUpdate?: (recipe: Recipe) => void;
  onConfirmConsumption?: (success: boolean) => void;
  // 消耗 Modal 配置
  showShoppingListButton?: boolean;
  onAddToShoppingList?: () => void;
  isLoading?: boolean;
  // Parent visibility controls
  onHideParent?: () => void;
  onShowParent?: () => void;
  refrigeratorId?: string;
};

/**
 * 共用的食譜詳細內容元件
 * 用於 RecipeDetailView (頁面) 和 RecipeDetailModal (Modal) 共用相同的 UI
 */
export const RecipeDetailContent: React.FC<RecipeDetailContentProps> = ({
  recipe,
  consumptionItems,
  showConsumptionModal,
  onShowConsumptionModal,
  onRecipeUpdate,
  onConfirmConsumption,
  showShoppingListButton = false,
  onAddToShoppingList,
  isLoading = false,
  onHideParent,
  onShowParent,
  refrigeratorId,
}) => {
  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const { isFavorite } = await recipeApi.toggleFavorite(
        recipe.id,
        !recipe.isFavorite,
      );
      onRecipeUpdate?.({ ...recipe, isFavorite });
      toast.success(isFavorite ? '已加入收藏' : '已取消收藏');
    } catch {
      toast.error('操作失敗');
    }
  };

  return (
    <>
      {/* 消耗 Modal */}
      <ConsumptionModal
        isOpen={showConsumptionModal}
        onClose={() => onShowConsumptionModal(false)}
        items={consumptionItems}
        showShoppingListButton={showShoppingListButton}
        onAddToShoppingList={onAddToShoppingList}
        defaultReasons={['recipe_consumption']}
        onHideParent={onHideParent}
        onShowParent={onShowParent}
        refrigeratorId={refrigeratorId}
        onConfirm={(success) => {
          onShowConsumptionModal(false);
          onConfirmConsumption?.(success);
        }}
      />

      {/* 圖片區域 */}
      <div className="relative w-full h-[40vh]">
        <img
          src={recipe.imageUrl}
          alt={recipe.name}
          className="w-full h-full object-cover"
        />

        {/* 我的最愛按鈕 */}
        <button
          onClick={handleToggleFavorite}
          className="absolute top-18 right-4 z-50 p-2.5 bg-white/30 rounded-full backdrop-blur-[2px] transition-transform active:scale-95"
        >
          <Heart
            className={`w-6 h-6 transition-colors ${
              recipe.isFavorite ? 'fill-white text-white' : 'text-white'
            }`}
          />
        </button>
      </div>

      {/* 內容區域 */}
      <div className="relative -mt-10 bg-white rounded-t-3xl min-h-screen px-4 py-6">
        <div className="flex items-center justify-between mb-4 gap-2">
          <div className="flex-1 min-w-0">
            <h1 className="text-[20px] font-bold text-gray-900 tracking-tight mb-3 truncate">
              {recipe.name}
            </h1>

            <div className="flex items-center gap-2 text-sm flex-wrap">
              <span className="px-2 py-1 bg-primary-500 text-white rounded-sm font-medium text-[10px] shrink-0">
                {recipe.category.slice(0, 2)}
              </span>

              <div className="flex items-center gap-1 text-primary-500 font-medium text-[16px] shrink-0">
                <Users className="w-4 h-4" />
                <span>{recipe.servings}人份</span>
              </div>
              <div className="flex items-center gap-1 text-primary-500 font-medium text-[16px] shrink-0">
                <Clock className="w-4 h-4" />
                <span>{recipe.cookTime}分鐘</span>
              </div>
            </div>
          </div>

          {/* 烹煮方式按鈕 */}
          <Sheet>
            <SheetTrigger asChild>
              <button
                disabled={isLoading}
                className="flex items-center gap-1.5 px-6 py-3 bg-white border-2 border-neutral-300 rounded-sm hover:bg-gray-50 transition-colors shrink-0 disabled:opacity-50"
              >
                <ChefHat className="w-5 h-5 text-gray-700" />
                <span className="font-bold text-gray-900 text-sm">
                  烹煮方式
                </span>
              </button>
            </SheetTrigger>
            <SheetContent
              side="bottom"
              className="h-[85vh] rounded-t-2xl px-0 pb-0 [&>button]:hidden"
            >
              <SheetHeader className="px-5 text-left mb-2 pb-4">
                <SheetTitle className="text-xl font-bold text-gray-900">
                  烹煮方式
                </SheetTitle>
              </SheetHeader>
              <div className="overflow-y-auto h-full px-5 pb-32">
                {isLoading ? (
                  <div className="flex justify-center py-10">
                    <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                  </div>
                ) : (
                  <CookingSteps steps={recipe.steps} />
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* 食材列表 */}
        {isLoading ? (
          <div className="py-8 text-center text-gray-400 flex flex-col items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="text-sm">載入食材與詳細資訊...</span>
          </div>
        ) : (
          <>
            <IngredientList ingredients={recipe.ingredients} />

            {/* 確認消耗按鈕 */}
            <div className="mt-8 mb-6">
              <button
                disabled={consumptionItems.length === 0}
                onClick={() => onShowConsumptionModal(true)}
                className="w-full py-3.5 bg-[#F5655D] text-white rounded-xl font-bold hover:bg-[#E5554D] transition-colors shadow-lg shadow-red-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
              >
                {consumptionItems.length === 0 ? '無可消耗食材' : '確認消耗'}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
};
