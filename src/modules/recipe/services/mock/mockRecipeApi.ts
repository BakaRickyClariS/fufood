import type { RecipeApi } from '../api/recipeApi';
import type { Recipe, RecipeListItem, RecipeCategory, MealPlan, ConsumptionConfirmation, MealPlanInput } from '@/modules/recipe/types';
import { MOCK_RECIPES, MOCK_RECIPE_LIST } from './mockData';

export class MockRecipeApi implements RecipeApi {
  private delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  getRecipes = async (category?: RecipeCategory): Promise<RecipeListItem[]> => {
    await this.delay(600);
    
    if (!category) {
      return MOCK_RECIPE_LIST;
    }
    
    return MOCK_RECIPE_LIST.filter(recipe => recipe.category === category);
  };

  getRecipeById = async (id: string): Promise<Recipe> => {
    await this.delay(500);
    
    const recipe = MOCK_RECIPES.find(r => r.id === id);
    if (!recipe) {
      throw new Error('食譜不存在');
    }
    
    return recipe;
  };

  toggleFavorite = async (id: string): Promise<{ isFavorite: boolean }> => {
    await this.delay(400);
    
    const recipe = MOCK_RECIPES.find(r => r.id === id);
    if (!recipe) {
      throw new Error('食譜不存在');
    }
    
    recipe.isFavorite = !recipe.isFavorite;
    
    // 更新 localStorage
    const favorites = JSON.parse(localStorage.getItem('recipe_favorites') || '[]');
    if (recipe.isFavorite) {
      favorites.push(id);
    } else {
      const index = favorites.indexOf(id);
      if (index > -1) favorites.splice(index, 1);
    }
    localStorage.setItem('recipe_favorites', JSON.stringify(favorites));
    
    return { isFavorite: recipe.isFavorite };
  };

  getFavorites = async (): Promise<RecipeListItem[]> => {
    await this.delay(500);
    
    const favorites = JSON.parse(localStorage.getItem('recipe_favorites') || '[]');
    return MOCK_RECIPE_LIST.filter(recipe => favorites.includes(recipe.id));
  };

  confirmCook = async (data: ConsumptionConfirmation): Promise<{ success: boolean; message: string }> => {
    await this.delay(1000);
    
    // Mock: 記錄消耗資料到 localStorage
    const consumptions = JSON.parse(localStorage.getItem('recipe_consumptions') || '[]');
    consumptions.push({
      ...data,
      timestamp: new Date().toISOString(),
    });
    localStorage.setItem('recipe_consumptions', JSON.stringify(consumptions));
    
    // 如果選擇加入採買清單，記錄到 shopping list
    if (data.addToShoppingList) {
      const shoppingList = JSON.parse(localStorage.getItem('shopping_list') || '[]');
      data.items.forEach(item => {
        shoppingList.push({
          name: item.ingredientName,
          quantity: item.consumedQuantity,
          unit: item.unit,
          source: 'recipe',
          recipeId: data.recipeId,
        });
      });
      localStorage.setItem('shopping_list', JSON.stringify(shoppingList));
    }
    
    return { 
      success: true, 
      message: data.addToShoppingList ? '已消耗並加入採買清單' : '已完成消耗記錄' 
    };
  };

  addMealPlan = async (data: MealPlanInput): Promise<MealPlan> => {
    await this.delay(700);
    
    const recipe = MOCK_RECIPES.find(r => r.id === data.recipeId);
    if (!recipe) {
      throw new Error('食譜不存在');
    }
    
    const newPlan: MealPlan = {
      id: `plan-${Date.now()}`,
      recipeId: data.recipeId,
      recipeName: recipe.name,
      scheduledDate: data.scheduledDate,
      servings: data.servings,
      status: 'planned',
      createdAt: new Date().toISOString(),
    };
    
    const plans = JSON.parse(localStorage.getItem('meal_plans') || '[]');
    plans.push(newPlan);
    localStorage.setItem('meal_plans', JSON.stringify(plans));
    
    return newPlan;
  };

  getMealPlans = async (): Promise<MealPlan[]> => {
    await this.delay(500);
    return JSON.parse(localStorage.getItem('meal_plans') || '[]');
  };

  deleteMealPlan = async (planId: string): Promise<{ success: boolean }> => {
    await this.delay(400);
    
    const plans = JSON.parse(localStorage.getItem('meal_plans') || '[]');
    const filtered = plans.filter((plan: MealPlan) => plan.id !== planId);
    localStorage.setItem('meal_plans', JSON.stringify(filtered));
    
    return { success: true };
  };
}
