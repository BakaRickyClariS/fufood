import React from 'react';
import ScanResultModal from './FoodScan/ScanResult';
import type { FoodItemInput } from '@/modules/food-scan/types/foodItem';

export default function DevTestModal() {
  const [isOpen, setIsOpen] = React.useState(true);

  const mockData: FoodItemInput = {
    productName: '測試蘋果',
    category: 'fruit',
    attributes: ['新鮮'],
    purchaseQuantity: 3,
    unit: '顆',
    purchaseDate: '2026-03-04',
    expiryDate: '2026-03-10',
    lowStockAlert: true,
    lowStockThreshold: 1,
    notes: '假資料測試',
  };

  return (
    <div className="p-10 flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-4">ScanResult 測試環境</h1>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-blue-500 text-white px-4 py-2 rounded-lg"
      >
        重新開啟 Modal
      </button>

      <ScanResultModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        resultData={mockData}
        resultImageUrl="https://placehold.co/400"
      />
    </div>
  );
}
