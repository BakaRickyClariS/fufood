import { useNavigate } from 'react-router-dom';
import recipe1 from '@/assets/images/dashboard/recipe-1.png';
import recipe2 from '@/assets/images/dashboard/recipe-2.png';
import { RecipeCardCarousel } from '@/shared/components/recipe';
import type { RecipeListItem, RecipeCategory } from '@/modules/recipe/types';
import AiRecommendCard from './AiRecommendCard';

// Mock 食譜資料（未來可接 API）
const MOCK_RECIPES: RecipeListItem[] = [
  {
    id: 'dashboard-1',
    name: '涼拌小黃瓜',
    category: '中式料理' as RecipeCategory,
    imageUrl: recipe1,
    servings: 6,
    cookTime: 10,
    isFavorite: false,
  },
  {
    id: 'dashboard-2',
    name: '鮮蝦冰花煎餃',
    category: '中式料理' as RecipeCategory,
    imageUrl: recipe2,
    servings: 1,
    cookTime: 20,
    isFavorite: false,
  },
];

const RecipeSection = () => {
  const navigate = useNavigate();

  const handleRecipeClick = (id: string) => {
    navigate(`/recipe/${id}`);
  };

  return (
    <section className="w-full rounded-t-3xl overflow-hidden bg-white px-4 mt-6 pb-32">
      <div className="max-w-layout-container mx-auto">
        <RecipeCardCarousel
          title="推薦食譜"
          recipes={MOCK_RECIPES}
          onRecipeClick={handleRecipeClick}
          showPopularTag={true}
          showMoreLink="/recipe"
          showScrollButton={false}
        />
      </div>
      <AiRecommendCard />
    </section>
  );
};

export default RecipeSection;

