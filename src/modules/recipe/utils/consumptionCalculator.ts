import type { ConsumptionItem } from '@/modules/recipe/types';

export const calculateTotalItems = (items: ConsumptionItem[]): number => {
  return items.length;
};

export const filterConsumedItems = (items: ConsumptionItem[]): ConsumptionItem[] => {
  return items.filter(item => item.consumedQuantity > 0);
};
