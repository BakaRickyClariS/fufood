import { useState } from 'react';
import type { ConsumptionConfirmation } from '@/modules/recipe/types';
import { recipeApi } from '@/modules/recipe/services';

export const useConsumption = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const confirmConsumption = async (data: ConsumptionConfirmation) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const result = await recipeApi.confirmCook(data);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : '消耗確認失敗';
      setError(message);
      throw new Error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return { confirmConsumption, isSubmitting, error };
};
