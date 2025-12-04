import { useState } from 'react';
import type { ConsumptionItem } from '@/modules/recipe/types';
import { Minus, Plus, Save } from 'lucide-react';

interface ConsumptionEditorProps {
  items: ConsumptionItem[];
  onSave: (items: ConsumptionItem[]) => void;
  onCancel: () => void;
}

export const ConsumptionEditor = ({ items: initialItems, onSave, onCancel }: ConsumptionEditorProps) => {
  const [items, setItems] = useState<ConsumptionItem[]>(initialItems);

  const handleQuantityChange = (index: number, delta: number) => {
    const newItems = [...items];
    const item = newItems[index];
    const newQuantity = Math.max(0, item.consumedQuantity + delta);
    newItems[index] = { ...item, consumedQuantity: newQuantity };
    setItems(newItems);
  };

  return (
    <div className="bg-white min-h-screen pb-20">
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
        <button onClick={onCancel} className="text-gray-500 font-medium">取消</button>
        <h1 className="text-lg font-bold">編輯消耗數量</h1>
        <button onClick={() => onSave(items)} className="text-orange-600 font-bold">儲存</button>
      </div>

      <div className="p-4 space-y-4">
        <div className="flex justify-center py-6">
          {/* Placeholder for mascot */}
          <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center text-4xl">
            🥘
          </div>
        </div>

        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={index} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <span className="font-bold text-gray-800">{item.ingredientName}</span>
                <span className="text-xs text-gray-500">原始需求: {item.originalQuantity}</span>
              </div>
              
              <div className="flex items-center justify-between bg-gray-50 rounded-lg p-2">
                <button 
                  onClick={() => handleQuantityChange(index, -1)}
                  className="p-2 bg-white rounded-md shadow-sm text-gray-600 active:scale-95 transition-transform"
                >
                  <Minus className="w-4 h-4" />
                </button>
                
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-gray-900">{item.consumedQuantity}</span>
                  <span className="text-sm text-gray-500">{item.unit}</span>
                </div>
                
                <button 
                  onClick={() => handleQuantityChange(index, 1)}
                  className="p-2 bg-white rounded-md shadow-sm text-gray-600 active:scale-95 transition-transform"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100">
        <button 
          onClick={() => onSave(items)}
          className="w-full flex items-center justify-center gap-2 py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-colors"
        >
          <Save className="w-5 h-5" />
          <span>確認修改</span>
        </button>
      </div>
    </div>
  );
};
