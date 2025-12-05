import type { RecipeCategory } from '@/modules/recipe/types';

export const RECIPE_CATEGORIES: RecipeCategory[] = [
  '中式料理',
  '美式料理',
  '義式料理',
  '日式料理',
  '泰式料理',
  '韓式料理',
  '墨西哥料理',
  '川菜',
  '越南料理',
  '健康輕食',
  '甜點',
  '飲品'
];

export const CATEGORY_IMAGES: Record<RecipeCategory, string> = {
  '中式料理': '/src/assets/images/recipe/category/Chinese.png',
  '美式料理': '/src/assets/images/recipe/category/American.png',
  '義式料理': '/src/assets/images/recipe/category/Italian.png',
  '日式料理': '/src/assets/images/recipe/category/Japanese.png',
  '泰式料理': '/src/assets/images/recipe/category/Thai.png',
  '韓式料理': '/src/assets/images/recipe/category/Korean.png',
  '墨西哥料理': '/src/assets/images/recipe/category/Mexican.png',
  '川菜': '/src/assets/images/recipe/category/Sichuan.png',
  '越南料理': '/src/assets/images/recipe/category/Vietnamese.png',
  '健康輕食': '/src/assets/images/recipe/category/Healthy.png',
  '甜點': '/src/assets/images/recipe/category/Sweets.png',
  '飲品': '/src/assets/images/recipe/category/Drinks.png'
};
