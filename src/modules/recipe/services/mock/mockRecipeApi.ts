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
let memoryConsumptions: ConsumptionConfirmation[] | null = null;
type ShoppingListItem = {
  name: string;
  quantity: number;
  unit: string;
  source: string;
  recipeId: string;
};
let memoryShoppingList: ShoppingListItem[] | null = null;
let memoryMealPlans: MealPlan[] | null = null;

export class MockRecipeApi implements RecipeApi {
  private delay = (ms: number) => {
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

  getRecipes = async (params?: {
    category?: RecipeCategory;
    favorite?: boolean;
  }): Promise<RecipeListItem[]> => {
    await this.delay(600);

    let list = MOCK_RECIPE_LIST;

    if (params?.category) {
      list = list.filter((recipe) => recipe.category === params.category);
    }

    if (params?.favorite) {
      const favorites = this.getFavoriteIds();
      list = list.filter((recipe) => favorites.includes(recipe.id));
    }

    return list;
  };

  getRecipeById = async (id: string): Promise<Recipe> => {
    await this.delay(500);

    const recipe = MOCK_RECIPES.find((r) => r.id === id);
    if (!recipe) {
      throw new Error('Recipe not found');
    }

    return recipe;
  };

  toggleFavorite = async (
    id: string,
    shouldFavorite?: boolean,
  ): Promise<{ isFavorite: boolean }> => {
    await this.delay(400);

    const recipe = MOCK_RECIPES.find((r) => r.id === id);
    if (!recipe) {
      throw new Error('Recipe not found');
    }

    if (typeof shouldFavorite === 'boolean') {
      recipe.isFavorite = shouldFavorite;
    } else {
      recipe.isFavorite = !recipe.isFavorite;
    }

    const favorites = this.getFavoriteIds();

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

    const favorites = this.getFavoriteIds();

    return MOCK_RECIPE_LIST.filter((recipe) => favorites.includes(recipe.id));
  };

  confirmCook = async (
    data: ConsumptionConfirmation,
  ): Promise<{ success: boolean; message: string }> => {
    await this.delay(1000);

    let consumptions: ConsumptionConfirmation[] = [];
    if (mockRequestHandlers.shouldUseMemoryOnly() && memoryConsumptions) {
      consumptions = memoryConsumptions;
    } else {
      const stored = mockRequestHandlers.getItem('recipe_consumptions');
      const parsed: unknown = stored ? JSON.parse(stored) : [];
      consumptions = Array.isArray(parsed)
        ? (parsed as ConsumptionConfirmation[])
        : [];
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

    if (data.addToShoppingList) {
      let shoppingList: ShoppingListItem[] = [];
      if (mockRequestHandlers.shouldUseMemoryOnly() && memoryShoppingList) {
        shoppingList = memoryShoppingList;
      } else {
        const stored = mockRequestHandlers.getItem('shopping_list');
        const parsed: unknown = stored ? JSON.parse(stored) : [];
        shoppingList = Array.isArray(parsed)
          ? (parsed as ShoppingListItem[])
          : [];
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
        ? 'Added to shopping list'
        : 'Consumption recorded',
    };
  };

  addMealPlan = async (data: MealPlanInput): Promise<MealPlan> => {
    await this.delay(700);

    const recipe = MOCK_RECIPES.find((r) => r.id === data.recipeId);
    if (!recipe) {
      throw new Error('Recipe not found');
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
      const parsed: unknown = stored ? JSON.parse(stored) : [];
      plans = Array.isArray(parsed) ? (parsed as MealPlan[]) : [];
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
    const parsed: unknown = stored ? JSON.parse(stored) : [];
    const plans = Array.isArray(parsed) ? (parsed as MealPlan[]) : [];
    if (plans.length > 0) memoryMealPlans = plans;
    return plans;
  };

  deleteMealPlan = async (planId: string): Promise<{ success: boolean }> => {
    await this.delay(400);

    let plans: MealPlan[] = [];
    if (mockRequestHandlers.shouldUseMemoryOnly() && memoryMealPlans) {
      plans = memoryMealPlans;
    } else {
      const stored = mockRequestHandlers.getItem('meal_plans');
      const parsed: unknown = stored ? JSON.parse(stored) : [];
      plans = Array.isArray(parsed) ? (parsed as MealPlan[]) : [];
    }

    const filtered = plans.filter((plan: MealPlan) => plan.id !== planId);
    memoryMealPlans = filtered;
    mockRequestHandlers.setItem('meal_plans', JSON.stringify(filtered));

    return { success: true };
  };

  private getFavoriteIds(): string[] {
    if (mockRequestHandlers.shouldUseMemoryOnly() && memoryFavorites) {
      return memoryFavorites;
    }
    const stored = mockRequestHandlers.getItem('recipe_favorites');
    const parsed: unknown = stored ? JSON.parse(stored) : [];
    const favorites = Array.isArray(parsed) ? (parsed as string[]) : [];
    if (favorites.length > 0) memoryFavorites = favorites;
    return favorites;
  }
}
