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
import { RecipeSeriesTag } from '@/modules/recipe/components/ui/RecipeSeriesTag';
import { IngredientList } from '@/modules/recipe/components/ui/IngredientList';
import { CookingSteps } from '@/modules/recipe/components/ui/CookingSteps';
import { ConsumptionModal } from '@/modules/recipe/components/ui/ConsumptionModal';
import { ConsumptionEditor } from '@/modules/recipe/components/ui/ConsumptionEditor';
import { useConsumption } from '@/modules/recipe/hooks';
import { parseQuantity } from '@/modules/recipe/utils/parseQuantity';
import { Clock, Users, Sparkles, ChefHat } from 'lucide-react';
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
    <div className="bg-gray-50 min-h-screen pb-24">
      <RecipeHeader
        title={recipe.name}
        recipeId={recipe.id}
        isFavorite={recipe.isFavorite}
      />

      <div className="relative w-full h-[40vh]">
        <img
          src={recipe.imageUrl}
          alt={recipe.name}
          className="w-full h-full object-cover"
        />
        {/* AI 食譜標記 */}
        {isAIRecipe && (
          <div className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-orange-500 to-red-500 rounded-full text-white text-xs font-medium shadow-lg">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI 推薦</span>
          </div>
        )}
      </div>

      <div className="relative -mt-10 bg-white rounded-t-3xl min-h-screen px-5 py-6 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 mr-4">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              {recipe.name}
            </h1>
          </div>

          <Sheet>
            <SheetTrigger asChild>
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors shrink-0">
                <ChefHat className="w-4 h-4 text-gray-700" />
                <span className="font-bold text-gray-900 text-sm">
                  烹煮方式
                </span>
              </button>
            </SheetTrigger>
            <SheetContent
              side="bottom"
              className="h-[85vh] rounded-t-2xl px-0 pb-0"
            >
              <SheetHeader className="px-5 text-left mb-6 border-b border-gray-100 pb-4">
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

        <div className="flex items-center gap-3 mb-8 text-sm">
          {recipe.series && (
            <RecipeSeriesTag series={recipe.series} className="mt-0!" />
          )}
          <div className="flex items-center gap-1 text-gray-500 font-medium">
            <Users className="w-4 h-4 text-red-400" />
            <span className="text-red-400">{recipe.servings}人份</span>
          </div>
          <div className="flex items-center gap-1 text-gray-500 font-medium">
            <Clock className="w-4 h-4 text-red-400" />
            <span className="text-red-400">{recipe.cookTime}分鐘</span>
          </div>
        </div>

        <IngredientList ingredients={recipe.ingredients} />

        {/* Padding for bottom button */}
        <div className="h-24"></div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-sm border-t border-gray-100 z-10">
        <button
          onClick={() => setShowConsumptionModal(true)}
          className="w-full py-3.5 bg-[#F5655D] text-white rounded-xl font-bold hover:bg-[#E5554D] transition-colors shadow-lg shadow-red-200"
        >
          確認消耗
        </button>
      </div>

      <ConsumptionModal
        isOpen={showConsumptionModal}
        onClose={() => setShowConsumptionModal(false)}
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
