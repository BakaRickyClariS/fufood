import type { RecipeCategory } from '@/modules/recipe/types';

// Category 圖片 - 必須使用 import 才能在 Vercel 部署後正確顯示
import chineseImg from '@/assets/images/recipe/category/Chinese.png';
import americanImg from '@/assets/images/recipe/category/American.png';
import italianImg from '@/assets/images/recipe/category/Italian.png';
import japaneseImg from '@/assets/images/recipe/category/Japanese.png';
import thaiImg from '@/assets/images/recipe/category/Thai.png';
import koreanImg from '@/assets/images/recipe/category/Korean.png';
import mexicanImg from '@/assets/images/recipe/category/Mexican.png';
import sichuanImg from '@/assets/images/recipe/category/Sichuan.png';
import vietnameseImg from '@/assets/images/recipe/category/Vietnamese.png';
import healthyImg from '@/assets/images/recipe/category/Healthy.png';
import sweetsImg from '@/assets/images/recipe/category/Sweets.png';
import drinksImg from '@/assets/images/recipe/category/Drinks.png';

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
  '中式料理': chineseImg,
  '美式料理': americanImg,
  '義式料理': italianImg,
  '日式料理': japaneseImg,
  '泰式料理': thaiImg,
  '韓式料理': koreanImg,
  '墨西哥料理': mexicanImg,
  '川菜': sichuanImg,
  '越南料理': vietnameseImg,
  '健康輕食': healthyImg,
  '甜點': sweetsImg,
  '飲品': drinksImg
};

