import { useState, useEffect } from 'react';
import type { MealPlan, MealPlanInput } from '@/modules/recipe/types';
import { recipeApi } from '@/modules/recipe/services';

export const useMealPlan = () => {
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMealPlans = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await recipeApi.getMealPlans();
      setMealPlans(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '載入烹煮計劃失敗');
    } finally {
      setIsLoading(false);
    }
  };

  const addMealPlan = async (data: MealPlanInput) => {
    try {
      await recipeApi.addMealPlan(data);
      await fetchMealPlans();
    } catch (err) {
      throw err;
    }
  };

  const deleteMealPlan = async (planId: string) => {
    try {
      await recipeApi.deleteMealPlan(planId);
      await fetchMealPlans();
    } catch (err) {
      throw err;
    }
  };

  useEffect(() => {
    fetchMealPlans();
  }, []);

  return { mealPlans, isLoading, error, addMealPlan, deleteMealPlan, refetch: fetchMealPlans };
};
