import type { Recipe, RecipeListItem } from '@/modules/recipe/types';

export const MOCK_RECIPES: Recipe[] = [
  {
    id: 'recipe-001',
    name: '涼拌小黃瓜',
    category: '慢火煮',
    series: '慢火煮系列',
    imageUrl: '/src/assets/images/recipe/Spicy-cucumber-salad.png',
    servings: 2,
    cookTime: 30,
    difficulty: '簡單',
    ingredients: [
      { name: '小黃瓜', quantity: '3-4條', category: '準備材料' },
      { name: '蒜頭', quantity: '4-5顆', category: '準備材料' },
      { name: '辣椒', quantity: '1-2根', category: '準備材料' },
      { name: '鹽', quantity: '1/2茶匙', category: '調味料' },
      { name: '醬油', quantity: '1.5大匙', category: '調味料' },
      { name: '黑醋或白醋', quantity: '1大匙', category: '調味料' },
      { name: '砂糖', quantity: '1/2茶匙', category: '調味料' },
      { name: '麻油/香油', quantity: '1/2大匙', category: '調味料' },
    ],
    steps: [
      {
        stepNumber: 1,
        description: '將小黃瓜拍扁後切段，用 S1/2S 茶匙鹽抓勻，靜置 15-20分鐘瀝出水。',
        time: '15-20分鐘',
      },
      {
        stepNumber: 2,
        description: '倒掉瀝出的水分，準備蒜末、辣椒圈。',
      },
      {
        stepNumber: 3,
        description: '混合醬油、醋、砂糖、麻油/香油（可加花椒油）。',
      },
      {
        stepNumber: 4,
        description: '將瀝乾的黃瓜、蒜末、辣椒圈與醬汁充分拌勻。',
      },
      {
        stepNumber: 5,
        description: '放入冰箱冷藏 30-60分鐘 冰鎮入味。',
        time: '30-60分鐘',
      },
      {
        stepNumber: 6,
        description: '擺盤即可享用。',
      },
    ],
    isFavorite: false,
    createdAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'recipe-002',
    name: '鐵鍋煎餃',
    category: '快速菜',
    imageUrl: '/src/assets/images/recipe/Pan-fried-dumplings.png',
    servings: 2,
    cookTime: 20,
    difficulty: '簡單',
    ingredients: [
      { name: '水餃', quantity: '15顆', category: '準備材料' },
      { name: '水', quantity: '100ml', category: '準備材料' },
      { name: '油', quantity: '2大匙', category: '調味料' },
      { name: '白芝麻', quantity: '少許', category: '調味料' },
    ],
    steps: [
      {
        stepNumber: 1,
        description: '熱鍋加油，排入水餃煎至底部金黃。',
        time: '3分鐘',
      },
      {
        stepNumber: 2,
        description: '加入水，蓋上鍋蓋燜煮至水份收乾。',
        time: '10分鐘',
      },
      {
        stepNumber: 3,
        description: '撒上白芝麻，即可起鍋。',
      },
    ],
    isFavorite: false,
    createdAt: '2025-01-02T00:00:00Z',
  },
  {
    id: 'recipe-003',
    name: '青醬義大利麵蛤蠣',
    category: '過火菜',
    imageUrl: '/src/assets/images/recipe/Pesto-spaghetti-clams.png',
    servings: 2,
    cookTime: 25,
    difficulty: '中等',
    ingredients: [
      { name: '義大利麵', quantity: '200g', category: '準備材料' },
      { name: '蛤蠣', quantity: '300g', category: '準備材料' },
      { name: '青醬醬', quantity: '3大匙', category: '調味料' },
      { name: '大蒜', quantity: '3瓣', category: '調味料' },
      { name: '白酒', quantity: '50ml', category: '調味料' },
    ],
    steps: [
      {
        stepNumber: 1,
        description: '義大利麵煮熟，撈起備用。',
        time: '8-10分鐘',
      },
      {
        stepNumber: 2,
        description: '熱鍋爆香蒜末，加入蛤蠣和白酒。',
      },
      {
        stepNumber: 3,
        description: '蛤蠣開口後，加入義大利麵和青醬醬拌炒均勻。',
      },
    ],
    isFavorite: true,
    createdAt: '2025-01-03T00:00:00Z',
  },
  {
    id: 'recipe-004',
    name: '雞絲飯',
    category: '韓味系',
    imageUrl: '/src/assets/images/recipe/Shredded-chicken-rice.png',
    servings: 2,
    cookTime: 30,
    difficulty: '簡單',
    ingredients: [
      { name: '雞胸肉', quantity: '200g', category: '準備材料' },
      { name: '白飯', quantity: '2碗', category: '準備材料' },
      { name: '小黃瓜', quantity: '1根', category: '準備材料' },
      { name: '醬油膏', quantity: '2大匙', category: '調味料' },
      { name: '麻油', quantity: '1大匙', category: '調味料' },
    ],
    steps: [
      {
        stepNumber: 1,
        description: '雞胸肉汆燙至熟，撕成絲。',
        time: '15分鐘',
      },
      {
        stepNumber: 2,
        description: '小黃瓜切絲，與雞絲混合醬油膏、麻油。',
      },
      {
        stepNumber: 3,
        description: '舖在白飯上，即可享用。',
      },
    ],
    isFavorite: false,
    createdAt: '2025-01-04T00:00:00Z',
  },
  {
    id: 'recipe-005',
    name: '乾炒鮮蝦麵',
    category: '輕食系',
    imageUrl: '/src/assets/images/recipe/Stir-fried-shrimp-noodles.png',
    servings: 2,
    cookTime: 15,
    difficulty: '簡單',
    ingredients: [
      { name: '油麵', quantity: '200g', category: '準備材料' },
      { name: '鮮蝦', quantity: '150g', category: '準備材料' },
      { name: '豆芽菜', quantity: '100g', category: '準備材料' },
      { name: '醬油', quantity: '2大匙', category: '調味料' },
      { name: '蠔油', quantity: '1大匙', category: '調味料' },
    ],
    steps: [
      {
        stepNumber: 1,
        description: '鮮蝦去殼去腸泥，熟豆芽菜燙熟。',
      },
      {
        stepNumber: 2,
        description: '熱鍋爆香蝦仁，加入油麵、豆芽菜同炒。',
        time: '8分鐘',
      },
      {
        stepNumber: 3,
        description: '加入醬油、蠔油調味，大火快炒均勻。',
      },
    ],
    isFavorite: false,
    createdAt: '2025-01-05T00:00:00Z',
  },
];

export const MOCK_RECIPE_LIST: RecipeListItem[] = MOCK_RECIPES.map(recipe => ({
  id: recipe.id,
  name: recipe.name,
  category: recipe.category,
  imageUrl: recipe.imageUrl,
  servings: recipe.servings,
  cookTime: recipe.cookTime,
  isFavorite: recipe.isFavorite,
}));
