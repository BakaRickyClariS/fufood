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
    // Optimistic update: 立即建立暫時的計劃物件
    const tempId = `temp-${Date.now()}`;
    const optimisticPlan: MealPlan = {
      id: tempId,
      ...data,
      recipeName: '載入中...', // 暫時名稱，等待 API 響應
      status: 'planned' as const,
      createdAt: new Date().toISOString(),
    };

    // 立即更新 UI
    setMealPlans((prev: MealPlan[]) => [...prev, optimisticPlan]);

    try {
      // 發送 API 請求
      const actualPlan = await recipeApi.addMealPlan(data);

      // 成功後，用真實的計劃替換暫時的計劃
      setMealPlans((prev: MealPlan[]) =>
        prev.map((plan: MealPlan) => (plan.id === tempId ? actualPlan : plan)),
      );
    } catch (err) {
      // 失敗時回滾：移除樂觀添加的項目
      setMealPlans((prev: MealPlan[]) =>
        prev.filter((plan: MealPlan) => plan.id !== tempId),
      );
      throw err;
    }
  };

  const deleteMealPlan = async (planId: string) => {
    // Optimistic update: 立即從 UI 移除
    const previousPlans = mealPlans;
    setMealPlans((prev: MealPlan[]) =>
      prev.filter((plan: MealPlan) => plan.id !== planId),
    );

    try {
      // 發送刪除 API 請求
      await recipeApi.deleteMealPlan(planId);
    } catch (err) {
      // 失敗時回滾：恢復之前的狀態
      setMealPlans(previousPlans);
      throw err;
    }
  };

  useEffect(() => {
    fetchMealPlans();
  }, []);

  return {
    mealPlans,
    isLoading,
    error,
    addMealPlan,
    deleteMealPlan,
    refetch: fetchMealPlans,
  };
};
