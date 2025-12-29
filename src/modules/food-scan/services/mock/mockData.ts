import type { ScanResult } from '../../types/scanResult';

export const MOCK_SCAN_RESULTS: ScanResult['data'][] = [
  {
    productName: '結球甘藍',
    category: '蔬果類',
    attributes: '葉菜根莖類',
    purchaseQuantity: 1,
    unit: '顆',
    purchaseDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    lowStockAlert: true,
    lowStockThreshold: 2,
    notes: '好市多購入，季節限定',
  },
  {
    productName: '鮮奶',
    category: '乳品飲料類',
    attributes: '鮮奶',
    purchaseQuantity: 2,
    unit: '瓶',
    purchaseDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    lowStockAlert: true,
    lowStockThreshold: 1,
    notes: '早餐必備',
  },
  {
    productName: '冷凍水餃',
    category: '冷凍調理類',
    attributes: '冷凍調理包',
    purchaseQuantity: 3,
    unit: '包',
    purchaseDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    lowStockAlert: false,
    lowStockThreshold: 2,
    notes: '宵夜',
  },
  {
    productName: '牛小排',
    category: '肉品類',
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
    category: '其他',
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
