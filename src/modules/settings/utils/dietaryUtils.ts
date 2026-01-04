import {
  COOKING_FREQUENCY_OPTIONS,
  PREP_TIME_OPTIONS,
  SEASONING_LEVEL_OPTIONS,
  DIETARY_RESTRICTION_OPTIONS,
} from '@/modules/settings/constants/dietaryOptions';
import type {
  DietaryPreference,
  CookingFrequency,
  PrepTime,
  SeasoningLevel,
  DietaryRestriction,
} from '@/modules/settings/types/settings.types';

/**
 * 解析後端 preference 字串陣列為 DietaryPreference 物件
 */
export const parsePreferences = (prefs: string[]): DietaryPreference => {
  let cookingFrequency: CookingFrequency | undefined;
  let prepTime: PrepTime | undefined;
  let seasoningLevel: SeasoningLevel | undefined;
  const restrictions: DietaryRestriction[] = [];

  prefs.forEach((p) => {
    if (COOKING_FREQUENCY_OPTIONS.some((o) => o.value === p)) {
      cookingFrequency = p as CookingFrequency;
    } else if (PREP_TIME_OPTIONS.some((o) => o.value === p)) {
      prepTime = p as PrepTime;
    } else if (SEASONING_LEVEL_OPTIONS.some((o) => o.value === p)) {
      seasoningLevel = p as SeasoningLevel;
    } else if (DIETARY_RESTRICTION_OPTIONS.some((o) => o.value === p)) {
      restrictions.push(p as DietaryRestriction);
    }
  });

  return { cookingFrequency, prepTime, seasoningLevel, restrictions };
};
