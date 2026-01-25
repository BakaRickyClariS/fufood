import type {
  CookingFrequency,
  PrepTime,
  SeasoningLevel,
  DietaryRestriction,
} from '../types/settings.types';

export const COOKING_FREQUENCY_OPTIONS: {
  value: CookingFrequency;
  label: string;
}[] = [
  { value: '1-2', label: '1-2 次 (偶爾)' },
  { value: '3-4', label: '3-4 次 (普通)' },
  { value: '5-7', label: '5-7 次 (經常)' },
  { value: 'daily', label: '每天都煮 (重度)' },
];

export const PREP_TIME_OPTIONS: { value: PrepTime; label: string }[] = [
  { value: 'under15', label: '15 分鐘內' },
  { value: '15-30', label: '15-30 分鐘' },
  { value: 'over30', label: '30 分鐘以上' },
];

export const SEASONING_LEVEL_OPTIONS: {
  value: SeasoningLevel;
  label: string;
}[] = [
  { value: 'light', label: '少油少鹽' },
  { value: 'moderate', label: '適中家常' },
  { value: 'spicy', label: '辛辣' },
  { value: 'rich', label: '濃厚' },
];

export const DIETARY_RESTRICTION_OPTIONS: {
  value: DietaryRestriction;
  label: string;
}[] = [
  { value: 'none', label: '無' },
  { value: 'vegan', label: '全素食者' },
  { value: 'vegetarian', label: '鍋邊素食者' },
  { value: 'omnivore', label: '葷食者' },
  { value: 'seafood-allergy', label: '對海鮮過敏' },
  { value: 'gluten-allergy', label: '對麩質過敏' },
  { value: 'dairy-egg-allergy', label: '奶蛋豆過敏' },
  { value: 'nut-allergy', label: '堅果穀物過敏' },
];
