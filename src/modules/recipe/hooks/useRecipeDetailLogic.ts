import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { recipeApi } from '@/modules/recipe/services';
import { useConsumption } from '@/modules/recipe/hooks/useConsumption';
import { parseQuantity } from '@/modules/recipe/utils/parseQuantity';
import type {
  Recipe,
  ConsumptionItem,
} from '@/modules/recipe/types';

type UseRecipeDetailLogicProps = {
  recipeId?: string;
  initialRecipe?: Recipe | null;
  onClose?: () => void;
};

export const useRecipeDetailLogic = ({
  recipeId,
  initialRecipe = null,
  onClose,
}: UseRecipeDetailLogicProps) => {
  const [recipe, setRecipe] = useState<Recipe | null>(initialRecipe);
  const [isLoading, setIsLoading] = useState(!initialRecipe);
  const [error, setError] = useState<string | null>(null);
  const [consumptionItems, setConsumptionItems] = useState<ConsumptionItem[]>([]);
  
  // Consumption related state
  const [showConsumptionModal, setShowConsumptionModal] = useState(false);
  const { confirmConsumption } = useConsumption();

  // Initialize consumption items from recipe
  const initConsumptionItems = (currentRecipe: Recipe) => {
    const items: ConsumptionItem[] = currentRecipe.ingredients.map((ing) => {
      const parsed = parseQuantity(ing.quantity);
      return {
        ingredientName: ing.name,
        originalQuantity: ing.quantity,
        consumedQuantity: parsed.quantity,
        unit: ing.unit || parsed.unit,
      };
    });
    setConsumptionItems(items);
  };

  // Load recipe data
  useEffect(() => {
    const loadRecipe = async () => {
      if (initialRecipe) {
        setRecipe(initialRecipe);
        initConsumptionItems(initialRecipe);
        setIsLoading(false);
        return;
      }

      if (!recipeId) return;

      setIsLoading(true);
      try {
        const data = await recipeApi.getRecipeById(recipeId);
        setRecipe(data);
        initConsumptionItems(data);
      } catch (err) {
        console.error('載入食譜失敗', err);
        setError(err instanceof Error ? err.message : '載入食譜失敗');
        toast.error('載入食譜失敗');
      } finally {
        setIsLoading(false);
      }
    };

    loadRecipe();
  }, [recipeId, initialRecipe]);

  // Handle favorite toggle
  const handleToggleFavorite = async () => {
    if (!recipe) return;
    try {
      const { isFavorite } = await recipeApi.toggleFavorite(
        recipe.id,
        !recipe.isFavorite
      );
      setRecipe((prev) => (prev ? { ...prev, isFavorite } : null));
      toast.success(isFavorite ? '已加入收藏' : '已取消收藏');
    } catch {
      toast.error('操作失敗');
    }
  };

  // Handle consumption confirmation
  const handleConfirmConsumption = async (success: boolean) => {
    if (!success || !recipe) return;

    try {
      await confirmConsumption({
        recipeId: recipe.id,
        recipeName: recipe.name,
        items: consumptionItems,
        addToShoppingList: false, // Default to false, handled by modal internal logic if needed
        timestamp: new Date().toISOString(),
      });
      
      toast.success('消耗記錄已更新');
      setShowConsumptionModal(false);
      onClose?.();
    } catch (err) {
      console.error('Consumption failed:', err);
      toast.error('更新失敗', {
        description: err instanceof Error ? err.message : '請稍後再試',
      });
    }
  };

  return {
    recipe,
    isLoading,
    error,
    consumptionItems,
    showConsumptionModal,
    setShowConsumptionModal,
    setRecipe, // Exposed for other updates if needed
    setConsumptionItems, // Exposed for editor if needed
    handleToggleFavorite,
    handleConfirmConsumption,
  };
};
