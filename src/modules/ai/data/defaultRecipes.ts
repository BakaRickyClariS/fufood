/**
 * 預設食譜資料
 *
 * 用於新使用者首次進入時自動儲存的範例食譜
 */
import type { SaveRecipeInput } from '../types';

// 使用 public 資料夾的固定路徑，避免 Vite hash 導致部署後路徑失效
const RECIPE_IMAGE_BASE = '/images/recipe';

/**
 * 五道預設食譜資料
 * 會在使用者首次進入食譜頁面時自動儲存
 */
export const DEFAULT_RECIPES: SaveRecipeInput[] = [
  {
    name: '涼拌小黃瓜',
    category: '中式料理',
    imageUrl: `${RECIPE_IMAGE_BASE}/Spicy-cucumber-salad.webp`,
    servings: 2,
    cookTime: 30,
    difficulty: '簡單',
    ingredients: [
      { name: '小黃瓜', quantity: '3-4條', unit: '' },
      { name: '蒜頭', quantity: '4-5顆', unit: '' },
      { name: '辣椒', quantity: '1-2根', unit: '' },
    ],
    seasonings: [
      { name: '鹽', quantity: '1/2', unit: '茶匙' },
      { name: '醬油', quantity: '1.5', unit: '大匙' },
      { name: '黑醋或白醋', quantity: '1', unit: '大匙' },
      { name: '砂糖', quantity: '1/2', unit: '茶匙' },
      { name: '麻油/香油', quantity: '1/2', unit: '大匙' },
    ],
    steps: [
      {
        step: 1,
        description:
          '將小黃瓜拍扁後切段，用 1/2 茶匙鹽抓勻，靜置 15-20 分鐘瀝出水。',
      },
      { step: 2, description: '倒掉瀝出的水分，準備蒜末、辣椒圈。' },
      { step: 3, description: '混合醬油、醋、砂糖、麻油/香油（可加花椒油）。' },
      { step: 4, description: '將瀝乾的黃瓜、蒜末、辣椒圈與醬汁充分拌勻。' },
      { step: 5, description: '放入冰箱冷藏 30-60 分鐘冰鎮入味，即可享用。' },
    ],
  },
  {
    name: '鐵鍋煎餃',
    category: '日式料理',
    imageUrl: `${RECIPE_IMAGE_BASE}/Pan-fried-dumplings.webp`,
    servings: 2,
    cookTime: 20,
    difficulty: '簡單',
    ingredients: [
      { name: '水餃', quantity: '15', unit: '顆' },
      { name: '水', quantity: '100', unit: 'ml' },
    ],
    seasonings: [
      { name: '油', quantity: '2', unit: '大匙' },
      { name: '白芝麻', quantity: '少許', unit: '' },
    ],
    steps: [
      { step: 1, description: '熱鍋加油，排入水餃煎至底部金黃（約 3 分鐘）。' },
      {
        step: 2,
        description: '加入水，蓋上鍋蓋燜煮至水份收乾（約 10 分鐘）。',
      },
      { step: 3, description: '撒上白芝麻，即可起鍋。' },
    ],
  },
  {
    name: '青醬義大利麵蛤蠣',
    category: '義式料理',
    imageUrl: `${RECIPE_IMAGE_BASE}/Pesto-spaghetti-clams.webp`,
    servings: 2,
    cookTime: 25,
    difficulty: '中等',
    ingredients: [
      { name: '義大利麵', quantity: '200', unit: 'g' },
      { name: '蛤蠣', quantity: '300', unit: 'g' },
    ],
    seasonings: [
      { name: '青醬', quantity: '3', unit: '大匙' },
      { name: '大蒜', quantity: '3', unit: '瓣' },
      { name: '白酒', quantity: '50', unit: 'ml' },
    ],
    steps: [
      { step: 1, description: '義大利麵煮熟，撈起備用（約 8-10 分鐘）。' },
      { step: 2, description: '熱鍋爆香蒜末，加入蛤蠣和白酒。' },
      { step: 3, description: '蛤蠣開口後，加入義大利麵和青醬拌炒均勻即可。' },
    ],
  },
  {
    name: '雞絲飯',
    category: '中式料理',
    imageUrl: `${RECIPE_IMAGE_BASE}/Shredded-chicken-rice.webp`,
    servings: 2,
    cookTime: 30,
    difficulty: '簡單',
    ingredients: [
      { name: '雞胸肉', quantity: '200', unit: 'g' },
      { name: '白飯', quantity: '2', unit: '碗' },
      { name: '小黃瓜', quantity: '1', unit: '根' },
    ],
    seasonings: [
      { name: '醬油膏', quantity: '2', unit: '大匙' },
      { name: '麻油', quantity: '1', unit: '大匙' },
    ],
    steps: [
      { step: 1, description: '雞胸肉汆燙至熟，撕成絲（約 15 分鐘）。' },
      { step: 2, description: '小黃瓜切絲，與雞絲混合醬油膏、麻油。' },
      { step: 3, description: '舖在白飯上，即可享用。' },
    ],
  },
  {
    name: '乾炒鮮蝦麵',
    category: '中式料理',
    imageUrl: `${RECIPE_IMAGE_BASE}/Stir-fried-shrimp-noodles.webp`,
    servings: 2,
    cookTime: 15,
    difficulty: '簡單',
    ingredients: [
      { name: '油麵', quantity: '200', unit: 'g' },
      { name: '鮮蝦', quantity: '150', unit: 'g' },
      { name: '豆芽菜', quantity: '100', unit: 'g' },
    ],
    seasonings: [
      { name: '醬油', quantity: '2', unit: '大匙' },
      { name: '蠔油', quantity: '1', unit: '大匙' },
    ],
    steps: [
      { step: 1, description: '鮮蝦去殼去腸泥，豆芽菜燙熟。' },
      {
        step: 2,
        description: '熱鍋爆香蝦仁，加入油麵、豆芽菜同炒（約 8 分鐘）。',
      },
      { step: 3, description: '加入醬油、蠔油調味，大火快炒均勻即可。' },
    ],
  },
];
