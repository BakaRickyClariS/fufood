import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecipes } from '@/modules/recipe/hooks';
import { RecipeCard } from '@/modules/recipe/components/ui/RecipeCard';
import { CategorySection } from '@/modules/recipe/components/layout/CategorySection';
import { SearchBar } from '@/modules/recipe/components/layout/SearchBar';
import type { RecipeCategory } from '@/modules/recipe/types';

export const RecipeList = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<RecipeCategory | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  
  const { recipes, isLoading, error } = useRecipes(selectedCategory);

  const filteredRecipes = useMemo(() => {
    if (!searchQuery) return recipes;
    return recipes.filter(recipe => 
      recipe.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [recipes, searchQuery]);

  const handleRecipeClick = (id: string) => {
    navigate(`/recipe/${id}`);
  };

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="px-4">
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
      </div>

      <div className="pl-4">
        <CategorySection 
          selectedCategory={selectedCategory} 
          onSelectCategory={setSelectedCategory} 
        />
      </div>

      <div className="px-4 pb-20">
        {isLoading ? (
          <div className="text-center py-10 text-gray-500">載入中...</div>
        ) : filteredRecipes.length === 0 ? (
          <div className="text-center py-10 text-gray-500">沒有找到相關食譜</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredRecipes.map(recipe => (
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
