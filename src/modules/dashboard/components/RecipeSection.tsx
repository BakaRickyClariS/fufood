import { RecipeCardCarousel } from '@/shared/components/recipe';
import { useRecipesQuery } from '@/modules/recipe/api/queries';
import { useRecipeModal } from '@/modules/recipe/providers/RecipeModalProvider';
import AiRecommendCard from './AiRecommendCard';

import { useSelector } from 'react-redux';
import { selectActiveRefrigeratorId } from '@/store/slices/refrigeratorSlice';

const RecipeSection = () => {
  const activeRefrigeratorId = useSelector(selectActiveRefrigeratorId);
  const { data, isLoading, isError } = useRecipesQuery({
    refrigeratorId: activeRefrigeratorId || undefined,
  });
  const recipes = data?.slice(0, 6) ?? []; // 首頁最多顯示 6 筆

  const { openRecipeModal } = useRecipeModal();

  const handleRecipeClick = (id: string) => {
    const recipe = recipes.find((r) => r.id === id);
    if (recipe) {
      openRecipeModal(recipe);
    }
  };

  // 若發生錯誤或非載入中且無資料，顯示空狀態或錯誤訊息
  const showEmpty = !isLoading && (isError || recipes.length === 0);

  return (
    <section className="w-full rounded-t-3xl overflow-hidden bg-white px-4 mt-6 pb-32">
      <div className="max-w-layout-container mx-auto">
        {showEmpty ? (
          <div className="py-10 text-center">
            <p className="text-gray-500 mb-2">無法載入推薦食譜</p>
            <p className="text-sm text-gray-400">目前暫無資料或連線異常</p>
          </div>
        ) : (
          <RecipeCardCarousel
            title="推薦食譜"
            recipes={recipes}
            isLoading={isLoading}
            onRecipeClick={handleRecipeClick}
            showPopularTag={true}
            showMoreLink="/planning?tab=recipes"
            showScrollButton={false}
          />
        )}
      </div>
      <AiRecommendCard />
    </section>
  );
};

export default RecipeSection;
