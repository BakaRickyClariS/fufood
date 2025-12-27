import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { recipeApi } from '@/modules/recipe/services';
import type { RecipeListItem } from '@/modules/recipe/types';
import { RecipeCard } from '@/shared/components/recipe';
import { RecipeHeader } from '@/modules/recipe/components/layout/RecipeHeader';

export const FavoriteRecipes = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<RecipeListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const data = await recipeApi.getFavorites();
        setFavorites(data);
      } catch (err) {
        console.error('Failed to load favorites', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavorites();
  }, []);

  const handleRecipeClick = (id: string) => {
    navigate(`/recipe/${id}`);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <RecipeHeader />

      <div className="p-4">
        {isLoading ? (
          <div className="text-center py-10 text-gray-500">載入中...</div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            目前沒有收藏的食譜
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {favorites.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                onClick={handleRecipeClick}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
