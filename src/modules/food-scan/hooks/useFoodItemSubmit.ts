import { useState } from 'react';
import { foodScanApi } from '../services';
import type { FoodItemInput, FoodItemResponse } from '../types';

export const useFoodItemSubmit = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitFoodItem = async (data: FoodItemInput): Promise<FoodItemResponse | null> => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await foodScanApi.submitFoodItem(data);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : '提交失敗，請稍後再試';
      setError(message);
      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { submitFoodItem, isSubmitting, error };
};
