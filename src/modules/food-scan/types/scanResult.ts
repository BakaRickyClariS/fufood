import type { FoodItemInput } from './foodItem';

export type ScanResult = {
  success: boolean;
  data: FoodItemInput;
  timestamp: string;
};

export type MultipleIngredientItem = FoodItemInput & {
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  confidence?: number;
};

export type MultipleScanResult = {
  success: boolean;
  data: {
    originalImageUrl: string;
    totalCount: number;
    ingredients: MultipleIngredientItem[];
    analyzedAt: string;
  };
  timestamp: string;
};
