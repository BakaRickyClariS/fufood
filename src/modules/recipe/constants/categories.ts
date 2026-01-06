import type { RecipeCategory } from '@/modules/recipe/types';

import chineseImg from '@/assets/images/recipe/category/Chinese.webp';
import americanImg from '@/assets/images/recipe/category/American.webp';
import italianImg from '@/assets/images/recipe/category/Italian.webp';
import japaneseImg from '@/assets/images/recipe/category/Japanese.webp';
import thaiImg from '@/assets/images/recipe/category/Thai.webp';
import koreanImg from '@/assets/images/recipe/category/Korean.webp';
import mexicanImg from '@/assets/images/recipe/category/Mexican.webp';
import sichuanImg from '@/assets/images/recipe/category/Sichuan.webp';
import vietnameseImg from '@/assets/images/recipe/category/Vietnamese.webp';
import healthyImg from '@/assets/images/recipe/category/Healthy.webp';
import sweetsImg from '@/assets/images/recipe/category/Sweets.webp';
import drinksImg from '@/assets/images/recipe/category/Drinks.webp';

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
  '飲品',
];

export const CATEGORY_IMAGES: Record<RecipeCategory, string> = {
  中式料理: chineseImg,
  美式料理: americanImg,
  義式料理: italianImg,
  日式料理: japaneseImg,
  泰式料理: thaiImg,
  韓式料理: koreanImg,
  墨西哥料理: mexicanImg,
  川菜: sichuanImg,
  越南料理: vietnameseImg,
  健康輕食: healthyImg,
  甜點: sweetsImg,
  飲品: drinksImg,
};
