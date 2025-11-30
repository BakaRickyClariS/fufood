import type { FoodItemInput } from './foodItem';

export type ScanResult = {
  success: boolean;
  data: FoodItemInput;
  timestamp: string;
};
