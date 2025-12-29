import type { FoodItemInput } from '../../types/foodItem';

export const MOCK_SCAN_RESULT: FoodItemInput = {
  productName: '有機高雷菜',
  category: 'fruit', // fixed
  attributes: '葉菜類',
  purchaseQuantity: 1,
  unit: '顆',
  purchaseDate: '2023-11-20',
  expiryDate: '2023-12-05',
  lowStockAlert: true,
  lowStockThreshold: 1,
  notes: '全聯購入',
};

export const MOCK_HISTORY: FoodItemInput[] = [
  {
    productName: '全脂鮮乳',
    category: 'milk', // fixed
    attributes: '乳製品',
    purchaseQuantity: 1,
    unit: '瓶',
    purchaseDate: '2023-11-18',
    expiryDate: '2023-11-28',
    lowStockAlert: true,
    lowStockThreshold: 1,
    notes: '',
  },
  {
    productName: '冷凍水餃',
    category: 'frozen', // fixed
    attributes: '主食',
    purchaseQuantity: 2,
    unit: '包',
    purchaseDate: '2023-11-15',
    expiryDate: '2024-05-15',
    lowStockAlert: true,
    lowStockThreshold: 1,
    notes: '韭菜口味',
  },
  {
    productName: '牛小排',
    category: 'meat', // fixed
    attributes: '牛肉類',
    purchaseQuantity: 600,
    unit: 'g',
    purchaseDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    lowStockAlert: true,
    lowStockThreshold: 200,
    notes: '火鍋用',
  },
  {
    productName: '橄欖油',
    category: 'others', // fixed
    attributes: '油品與堅果',
    purchaseQuantity: 1,
    unit: '瓶',
    purchaseDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    lowStockAlert: false,
    lowStockThreshold: 1,
    notes: '義大利進口',
  },
];

export const MOCK_SCAN_RESULTS: FoodItemInput[] = [
  MOCK_SCAN_RESULT,
  ...MOCK_HISTORY,
];
