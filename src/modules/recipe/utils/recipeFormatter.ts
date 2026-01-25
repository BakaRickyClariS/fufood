import type { Recipe } from '@/modules/recipe/types';

export const formatRecipeTime = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes}分鐘`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0
    ? `${hours}小時${remainingMinutes}分鐘`
    : `${hours}小時`;
};

export const getDifficultyColor = (
  difficulty: Recipe['difficulty'],
): string => {
  switch (difficulty) {
    case '簡單':
      return 'text-green-500';
    case '中等':
      return 'text-yellow-500';
    case '困難':
      return 'text-red-500';
    default:
      return 'text-gray-500';
  }
};
