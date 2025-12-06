import type { RecipeApi } from '../api/recipeApi';
import type {
  Recipe,
  RecipeListItem,
  RecipeCategory,
  MealPlan,
  ConsumptionConfirmation,
  MealPlanInput,
} from '@/modules/recipe/types';
import { MOCK_RECIPES, MOCK_RECIPE_LIST } from './mockData';
import { mockRequestHandlers } from '@/utils/debug/mockRequestHandlers';

// Memory cache
let memoryFavorites: string[] | null = null;
let memoryConsumptions: any[] | null = null;
let memoryShoppingList: any[] | null = null;
let memoryMealPlans: any[] | null = null;

export class MockRecipeApi implements RecipeApi {
  private delay = (ms: number) => {
    // Check reset on every call entry or just once? Ideally once but class is instantiated once?
    // Actually MockApi is usually instantiated once.
    // We can check reset in methods if we want instant reaction, or just rely on page reload.
    // Page reload is the standard way to trigger reset via URL param.
    if (mockRequestHandlers.shouldResetData()) {
      mockRequestHandlers.resetData([
        'recipe_favorites',
        'recipe_consumptions',
        'shopping_list',
        'meal_plans',
      ]);
      memoryFavorites = null;
      memoryConsumptions = null;
      memoryShoppingList = null;
      memoryMealPlans = null;
    }
    return new Promise((resolve) => setTimeout(resolve, ms));
  };

  getRecipes = async (category?: RecipeCategory): Promise<RecipeListItem[]> => {
    await this.delay(600);

    if (!category) {
      return MOCK_RECIPE_LIST;
    }

    return MOCK_RECIPE_LIST.filter((recipe) => recipe.category === category);
  };

  getRecipeById = async (id: string): Promise<Recipe> => {
    await this.delay(500);

    const recipe = MOCK_RECIPES.find((r) => r.id === id);
    if (!recipe) {
      throw new Error('食譜不存在');
    }

    return recipe;
  };

  toggleFavorite = async (id: string): Promise<{ isFavorite: boolean }> => {
    await this.delay(400);

    const recipe = MOCK_RECIPES.find((r) => r.id === id);
    if (!recipe) {
      throw new Error('食譜不存在');
    }

    recipe.isFavorite = !recipe.isFavorite;

    recipe.isFavorite = !recipe.isFavorite;

    // 更新 localStorage / Memory
    let favorites: string[] = [];
    if (mockRequestHandlers.shouldUseMemoryOnly() && memoryFavorites) {
      favorites = memoryFavorites;
    } else {
      const stored = mockRequestHandlers.getItem('recipe_favorites');
      favorites = stored ? JSON.parse(stored) : [];
    }

    if (recipe.isFavorite) {
      if (!favorites.includes(id)) favorites.push(id);
    } else {
      const index = favorites.indexOf(id);
      if (index > -1) favorites.splice(index, 1);
    }

    memoryFavorites = favorites;
    mockRequestHandlers.setItem('recipe_favorites', JSON.stringify(favorites));

    return { isFavorite: recipe.isFavorite };
  };

  getFavorites = async (): Promise<RecipeListItem[]> => {
    await this.delay(500);

    await this.delay(500);

    let favorites: string[] = [];
    if (mockRequestHandlers.shouldUseMemoryOnly() && memoryFavorites) {
      favorites = memoryFavorites;
    } else {
      const stored = mockRequestHandlers.getItem('recipe_favorites');
      favorites = stored ? JSON.parse(stored) : [];
      if (favorites.length > 0) memoryFavorites = favorites;
    }

    return MOCK_RECIPE_LIST.filter((recipe) => favorites.includes(recipe.id));
  };

  confirmCook = async (
    data: ConsumptionConfirmation,
  ): Promise<{ success: boolean; message: string }> => {
    await this.delay(1000);

    // Mock: 記錄消耗資料
    let consumptions: any[] = [];
    if (mockRequestHandlers.shouldUseMemoryOnly() && memoryConsumptions) {
      consumptions = memoryConsumptions;
    } else {
      const stored = mockRequestHandlers.getItem('recipe_consumptions');
      consumptions = stored ? JSON.parse(stored) : [];
    }

    consumptions.push({
      ...data,
      timestamp: new Date().toISOString(),
    });

    memoryConsumptions = consumptions;
    mockRequestHandlers.setItem(
      'recipe_consumptions',
      JSON.stringify(consumptions),
    );

    // 如果選擇加入採買清單，記錄到 shopping list
    if (data.addToShoppingList) {
      let shoppingList: any[] = [];
      if (mockRequestHandlers.shouldUseMemoryOnly() && memoryShoppingList) {
        shoppingList = memoryShoppingList;
      } else {
        const stored = mockRequestHandlers.getItem('shopping_list');
        shoppingList = stored ? JSON.parse(stored) : [];
      }

      data.items.forEach((item) => {
        shoppingList.push({
          name: item.ingredientName,
          quantity: item.consumedQuantity,
          unit: item.unit,
          source: 'recipe',
          recipeId: data.recipeId,
        });
      });

      memoryShoppingList = shoppingList;
      mockRequestHandlers.setItem(
        'shopping_list',
        JSON.stringify(shoppingList),
      );
    }

    return {
      success: true,
      message: data.addToShoppingList
        ? '已消耗並加入採買清單'
        : '已完成消耗記錄',
    };
  };

  addMealPlan = async (data: MealPlanInput): Promise<MealPlan> => {
    await this.delay(700);

    const recipe = MOCK_RECIPES.find((r) => r.id === data.recipeId);
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

    let plans: MealPlan[] = [];
    if (mockRequestHandlers.shouldUseMemoryOnly() && memoryMealPlans) {
      plans = memoryMealPlans;
    } else {
      const stored = mockRequestHandlers.getItem('meal_plans');
      plans = stored ? JSON.parse(stored) : [];
    }

    plans.push(newPlan);
    memoryMealPlans = plans;
    mockRequestHandlers.setItem('meal_plans', JSON.stringify(plans));

    return newPlan;
  };

  getMealPlans = async (): Promise<MealPlan[]> => {
    await this.delay(500);
    if (mockRequestHandlers.shouldUseMemoryOnly() && memoryMealPlans) {
      return memoryMealPlans;
    }
    const stored = mockRequestHandlers.getItem('meal_plans');
    const plans = stored ? JSON.parse(stored) : [];
    if (plans.length > 0) memoryMealPlans = plans;
    return plans;
  };

  deleteMealPlan = async (planId: string): Promise<{ success: boolean }> => {
    await this.delay(400);

    await this.delay(400);

    let plans: MealPlan[] = [];
    if (mockRequestHandlers.shouldUseMemoryOnly() && memoryMealPlans) {
      plans = memoryMealPlans;
    } else {
      const stored = mockRequestHandlers.getItem('meal_plans');
      plans = stored ? JSON.parse(stored) : [];
    }

    const filtered = plans.filter((plan: MealPlan) => plan.id !== planId);
    memoryMealPlans = filtered;
    mockRequestHandlers.setItem('meal_plans', JSON.stringify(filtered));

    return { success: true };
  };
}
