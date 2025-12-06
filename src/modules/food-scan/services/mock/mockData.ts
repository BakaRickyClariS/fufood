import type { ScanResult } from '../../types/scanResult';

export const MOCK_SCAN_RESULTS: ScanResult['data'][] = [
  {
    productName: '鮮奶',
    category: '乳製品',
    attributes: '冷藏',
    purchaseQuantity: 1,
    unit: '瓶',
    purchaseDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    lowStockAlert: true,
    lowStockThreshold: 2,
    notes: '常備品',
  },
  {
    productName: '雞蛋',
    category: '其他',
    attributes: '冷藏',
    purchaseQuantity: 10,
    unit: '顆',
    purchaseDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    lowStockAlert: true,
    lowStockThreshold: 5,
    notes: '每週必買',
  },
  {
    productName: '花椰菜',
    category: '蔬菜',
    attributes: '冷藏',
    purchaseQuantity: 1,
    unit: '顆',
    purchaseDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    lowStockAlert: false,
    lowStockThreshold: 1,
    notes: '趁新鮮吃完',
  },
  {
    productName: '豬肉片',
    category: '肉類',
    attributes: '冷凍',
    purchaseQuantity: 500,
    unit: 'g',
    purchaseDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    lowStockAlert: true,
    lowStockThreshold: 200,
    notes: '備用食材',
  },
  {
    productName: '番茄醬',
    category: '調味料',
    attributes: '常溫',
    purchaseQuantity: 1,
    unit: '瓶',
    purchaseDate: new Date().toISOString().split('T')[0],
    expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    lowStockAlert: true,
    lowStockThreshold: 1,
    notes: '',
  },
];
