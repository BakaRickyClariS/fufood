import { Plus, Minus, Trash2 } from 'lucide-react';
import type { ShoppingItem } from '@/modules/planning/types';

type ShoppingItemEditorProps = {
  items: ShoppingItem[];
  onChange: (items: ShoppingItem[]) => void;
};

export const ShoppingItemEditor = ({ items, onChange }: ShoppingItemEditorProps) => {
  const addItem = () => {
    const newItem: ShoppingItem = {
      id: `item_${Date.now()}`,
      name: '',
      quantity: 1,
    };
    onChange([...items, newItem]);
  };

  const updateItem = (id: string, field: keyof ShoppingItem, value: any) => {
    onChange(items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const removeItem = (id: string) => {
    onChange(items.filter(item => item.id !== id));
  };

  const handleQuantity = (id: string, delta: number) => {
    const item = items.find(i => i.id === id);
    if (!item) return;
    const newQty = Math.max(1, item.quantity + delta);
    updateItem(id, 'quantity', newQty);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-l-4 border-red-400 pl-3">
        <h3 className="font-bold text-neutral-800">購物明細</h3>
        {items.length > 0 && (
          <button 
            onClick={() => onChange([])}
            className="text-xs text-red-400 flex items-center gap-1"
          >
            <Trash2 className="w-3 h-3" /> 刪除全部
          </button>
        )}
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="bg-red-50/50 p-4 rounded-xl space-y-3">
            {/* 數量控制 */}
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-neutral-700">商品數量</span>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => handleQuantity(item.id, -1)}
                  className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center text-red-500"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="font-bold w-4 text-center">{item.quantity}</span>
                <button 
                  onClick={() => handleQuantity(item.id, 1)}
                  className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center text-red-500"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 商品名稱 */}
            <div>
              <div className="text-xs text-neutral-500 mb-1">商品名</div>
              <input
                type="text"
                value={item.name}
                onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                placeholder="Add value"
                className="w-full px-3 py-2 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:border-red-400"
              />
            </div>
      
            {/* 單項刪除 */}
            {items.length > 1 && (
               <div className="flex justify-end">
                  <button onClick={() => removeItem(item.id)} className="text-xs text-neutral-400">移除項目</button>
               </div>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={addItem}
        className="w-full py-3 border border-neutral-200 rounded-xl flex items-center justify-center gap-2 text-neutral-600 font-medium active:bg-neutral-50"
      >
        <span className="text-lg">+</span> 新增購買商品
      </button>
    </div>
  );
};
