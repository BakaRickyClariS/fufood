import type { ConsumptionItem } from '@/modules/recipe/types';
import { X } from 'lucide-react';

type ConsumptionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (addToShoppingList: boolean) => void;
  onEdit: () => void;
  items: ConsumptionItem[];
};

export const ConsumptionModal = ({ isOpen, onClose, onConfirm, onEdit, items }: ConsumptionModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl animate-in fade-in zoom-in duration-200">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold text-lg text-gray-900">確認食材消耗</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        <div className="p-4 max-h-[60vh] overflow-y-auto">
          <p className="text-gray-600 mb-4 text-sm">以下食材將從庫存中扣除：</p>
          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                <span className="font-medium text-gray-800">{item.ingredientName}</span>
                <span className="text-gray-600">
                  {item.consumedQuantity} {item.unit}
                </span>
              </div>
            ))}
          </div>
          
          <div className="mt-4 text-right">
            <button 
              onClick={onEdit}
              className="text-orange-600 text-sm font-medium hover:underline"
            >
              編輯消耗數量 &gt;
            </button>
          </div>
        </div>
        
        <div className="p-4 border-t border-gray-100 space-y-3">
          <button
            onClick={() => onConfirm(true)}
            className="w-full py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-colors"
          >
            已消耗，加入採買清單
          </button>
          <button
            onClick={() => onConfirm(false)}
            className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
          >
            僅消耗，暫不採買
          </button>
        </div>
      </div>
    </div>
  );
};
