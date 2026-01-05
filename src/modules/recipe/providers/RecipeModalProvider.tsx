import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import { useSearchParams } from 'react-router-dom';
import { RecipeDetailModal } from '@/modules/recipe/components/ui/RecipeDetailModal';
import type { RecipeListItem } from '@/modules/recipe/types';

type RecipeModalContextType = {
  /** 開啟食譜詳情 Modal */
  openRecipeModal: (recipe: RecipeListItem) => void;
  /** 關閉食譜詳情 Modal */
  closeRecipeModal: () => void;
  /** Modal 是否開啟 */
  isOpen: boolean;
};

const RecipeModalContext = createContext<RecipeModalContextType | undefined>(
  undefined,
);

type RecipeModalProviderProps = {
  children: ReactNode;
};

/**
 * Recipe Modal Provider - 提供全局食譜詳情 Modal 控制
 * 使用 URL query param `recipe=xxx` 控制開關狀態
 */
export const RecipeModalProvider = ({ children }: RecipeModalProviderProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentRecipe, setCurrentRecipe] = useState<RecipeListItem | null>(
    null,
  );

  // 從 URL 判斷 Modal 是否開啟
  const recipeId = searchParams.get('recipe');
  const isOpen = !!recipeId && !!currentRecipe;

  const openRecipeModal = useCallback(
    (recipe: RecipeListItem) => {
      setCurrentRecipe(recipe);
      const params = new URLSearchParams(searchParams);
      params.set('recipe', recipe.id);
      setSearchParams(params);
    },
    [searchParams, setSearchParams],
  );

  const closeRecipeModal = useCallback(() => {
    const params = new URLSearchParams(searchParams);
    params.delete('recipe');
    setSearchParams(params);
    // 延遲清除狀態，等動畫結束
    setTimeout(() => setCurrentRecipe(null), 300);
  }, [searchParams, setSearchParams]);

  return (
    <RecipeModalContext.Provider
      value={{ openRecipeModal, closeRecipeModal, isOpen }}
    >
      {children}

      {/* 全局食譜詳情 Modal 渲染 */}
      <RecipeDetailModal
        recipe={currentRecipe}
        isOpen={isOpen}
        onClose={closeRecipeModal}
      />
    </RecipeModalContext.Provider>
  );
};

/**
 * Hook to access Recipe Modal controls
 */
export const useRecipeModal = () => {
  const context = useContext(RecipeModalContext);
  if (context === undefined) {
    throw new Error('useRecipeModal must be used within a RecipeModalProvider');
  }
  return context;
};
