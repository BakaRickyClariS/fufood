import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { recipeApi } from '@/modules/recipe/services';
import type {
  Recipe,
  ConsumptionItem,
  RecipeCategory,
  RecipeIngredient,
  CookingStep,
} from '@/modules/recipe/types';
import type { AIRecipeItem } from '@/modules/ai';
import { RecipeHeader } from '@/modules/recipe/components/layout/RecipeHeader';

import { IngredientList } from '@/modules/recipe/components/ui/IngredientList';
import { CookingSteps } from '@/modules/recipe/components/ui/CookingSteps';
import { ConsumptionModal } from '@/modules/recipe/components/ui/ConsumptionModal';
import { ConsumptionEditor } from '@/modules/recipe/components/ui/ConsumptionEditor';
import { useConsumption } from '@/modules/recipe/hooks';
import { parseQuantity } from '@/modules/recipe/utils/parseQuantity';
import { Clock, Users, Sparkles, ChefHat, Heart } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/shared/components/ui/sheet';

/** 將 AI 食譜格式轉換為 Recipe 格式 */
const convertAIRecipeToRecipe = (aiRecipe: AIRecipeItem): Recipe => {
  // 合併 ingredients 和 seasonings
  const ingredients: RecipeIngredient[] = [
    ...(aiRecipe.ingredients || []).map((ing) => ({
      name: ing.name,
      quantity: `${ing.amount}${ing.unit}`,
      unit: ing.unit,
      category: '準備材料' as const,
    })),
    ...(aiRecipe.seasonings || []).map((sea) => ({
      name: sea.name,
      quantity: `${sea.amount}${sea.unit}`,
      unit: sea.unit,
      category: '調味料' as const,
    })),
  ];

  // 轉換步驟格式
  const steps: CookingStep[] = (aiRecipe.steps || []).map((step) => ({
    stepNumber: step.step,
    description: step.description,
  }));

  return {
    id: aiRecipe.id,
    name: aiRecipe.name,
    category: aiRecipe.category as RecipeCategory,
    imageUrl: aiRecipe.imageUrl,
    servings: aiRecipe.servings,
    cookTime: aiRecipe.cookTime,
    difficulty: aiRecipe.difficulty || '中等',
    isFavorite: aiRecipe.isFavorite,
    ingredients,
    steps,
    createdAt: new Date().toISOString(),
  };
};

type LocationState = {
  aiRecipe?: AIRecipeItem;
};

export const RecipeDetailView = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const state = location.state as LocationState | null;

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAIRecipe, setIsAIRecipe] = useState(false);

  // Consumption state
  const [showConsumptionModal, setShowConsumptionModal] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [consumptionItems, setConsumptionItems] = useState<ConsumptionItem[]>(
    [],
  );

  const { confirmConsumption } = useConsumption();

  useEffect(() => {
    const loadRecipe = async () => {
      if (!id) return;

      // 優先使用從 state 傳入的 AI 食譜
      if (state?.aiRecipe) {
        const convertedRecipe = convertAIRecipeToRecipe(state.aiRecipe);
        setRecipe(convertedRecipe);
        setIsAIRecipe(true);

        // Initialize consumption items
        const items: ConsumptionItem[] = convertedRecipe.ingredients.map(
          (ing) => {
            const parsed = parseQuantity(ing.quantity);
            return {
              ingredientName: ing.name,
              originalQuantity: ing.quantity,
              consumedQuantity: parsed.quantity,
              unit: ing.unit || parsed.unit,
            };
          },
        );
        setConsumptionItems(items);
        setIsLoading(false);
        return;
      }

      // 否則從 API 取得食譜
      try {
        setIsLoading(true);
        const data = await recipeApi.getRecipeById(id);
        setRecipe(data);
        setIsAIRecipe(false);

        // Initialize consumption items with parseQuantity
        const items: ConsumptionItem[] = data.ingredients.map((ing) => {
          const parsed = parseQuantity(ing.quantity);
          return {
            ingredientName: ing.name,
            originalQuantity: ing.quantity,
            consumedQuantity: parsed.quantity,
            unit: ing.unit || parsed.unit,
          };
        });
        setConsumptionItems(items);
      } catch (err) {
        setError(err instanceof Error ? err.message : '載入食譜失敗');
      } finally {
        setIsLoading(false);
      }
    };

    loadRecipe();
  }, [id, state?.aiRecipe]);

  const handleConfirmConsumption = async (addToShoppingList: boolean) => {
    if (!recipe) return;

    try {
      await confirmConsumption({
        recipeId: recipe.id,
        recipeName: recipe.name,
        items: consumptionItems,
        addToShoppingList,
        timestamp: new Date().toISOString(),
      });
      setShowConsumptionModal(false);
      toast.success('消耗記錄已更新', {
        description: addToShoppingList ? '已加入採買清單' : '已記錄消耗',
      });
    } catch (err) {
      toast.error('更新失敗', {
        description: err instanceof Error ? err.message : '請稍後再試',
      });
    }
  };

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!recipe) return;
    try {
      const { isFavorite } = await recipeApi.toggleFavorite(
        recipe.id,
        !recipe.isFavorite,
      );
      setRecipe((prev) => (prev ? { ...prev, isFavorite } : null));
      toast.success(isFavorite ? '已加入收藏' : '已取消收藏');
    } catch (error) {
      toast.error('操作失敗');
    }
  };

  if (isLoading) return <div className="p-4 text-center">載入中...</div>;
  if (error || !recipe)
    return (
      <div className="p-4 text-center text-red-500">
        {error || '食譜不存在'}
      </div>
    );

  if (showEditor) {
    return (
      <ConsumptionEditor
        items={consumptionItems}
        onSave={(items) => {
          setConsumptionItems(items);
          setShowEditor(false);
        }}
        onCancel={() => setShowEditor(false)}
      />
    );
  }

  return (
    <div className="min-h-screen">
      <RecipeHeader />

      <div className="relative w-full h-[40vh]">
        <img
          src={recipe.imageUrl}
          alt={recipe.name}
          className="w-full h-full object-cover"
        />
        
        {/* 我的最愛按鈕 */}
        <button
          onClick={handleToggleFavorite}
          className={`absolute top-18 right-4 z-50 p-2.5 bg-white/30 rounded-full backdrop-blur-[2px] transition-transform active:scale-95`}
        >
          <Heart
            className={`w-6 h-6 transition-colors ${
              recipe.isFavorite ? 'fill-white text-white' : 'text-white'
            }`}
          />
        </button>

        {/* AI 食譜標記 */}
        {isAIRecipe && (
          <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-linear-to-r from-orange-500 to-red-500 rounded-full text-white text-xs font-medium shadow-lg z-10">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI 推薦</span>
          </div>
        )}
      </div>

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

          <Sheet>
            <SheetTrigger asChild>
              <button className="flex items-center gap-1.5 px-6 py-3 bg-white border-2 border-neutral-300 rounded-sm hover:bg-gray-50 transition-colors shrink-0">
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
                <CookingSteps steps={recipe.steps} />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <IngredientList ingredients={recipe.ingredients} />

        <div className="mt-8 mb-6">
          <button
            onClick={() => setShowConsumptionModal(true)}
            className="w-full py-3.5 bg-[#F5655D] text-white rounded-xl font-bold hover:bg-[#E5554D] transition-colors shadow-lg shadow-red-200"
          >
            確認消耗
          </button>
        </div>
      </div>

      <ConsumptionModal
        isOpen={showConsumptionModal}
        onConfirm={handleConfirmConsumption}
        onEdit={() => {
          setShowConsumptionModal(false);
          setShowEditor(true);
        }}
        items={consumptionItems}
      />
    </div>
  );
};
