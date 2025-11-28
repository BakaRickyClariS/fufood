import React, { useState } from 'react';
import { GripVertical, Info, Minus, Plus } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

const categories = [
  '蔬果類',
  '冷凍調理類',
  '主食烘焙類',
  '乳品飲料類',
  '冷凍海鮮類',
  '肉品類',
  '乾貨醬料類',
];

const CounterItem = ({ label, value, onChange }: { label: string; value: number; onChange: (val: number) => void }) => (
  <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0">
    <span className="text-base font-bold text-neutral-900">{label}</span>
    <div className="flex items-center gap-3">
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-full bg-[#FFF1F0] hover:bg-[#FFE4E1] text-neutral-900"
        onClick={() => onChange(Math.max(0, value - 1))}
      >
        <Minus className="w-4 h-4" />
      </Button>
      <span className="text-lg font-bold w-4 text-center">{value}</span>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 rounded-full bg-[#FFF1F0] hover:bg-[#FFE4E1] text-neutral-900"
        onClick={() => onChange(value + 1)}
      >
        <Plus className="w-4 h-4" />
      </Button>
    </div>
  </div>
);

const SettingsPanel: React.FC = () => {
  const [totalInventory, setTotalInventory] = useState(1);
  const [expiredCount, setExpiredCount] = useState(1);
  const [expiringSoonCount, setExpiringSoonCount] = useState(1);

  return (
    <div className="pb-24 space-y-8 px-1 mt-8">
      {/* Inventory Sort Settings */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-neutral-900">庫存排序設定</h2>
          <Info className="w-4 h-4 text-neutral-500" />
        </div>
        
        <div className="bg-white rounded-[20px] p-4 space-y-2">
          {categories.map((category) => (
            <div
              key={category}
              className="flex items-center gap-4 bg-[#FFF5F5] p-4 rounded-xl"
            >
              <GripVertical className="w-5 h-5 text-neutral-400 cursor-grab" />
              <span className="text-base font-bold text-neutral-900">{category}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Inventory Reminder Settings */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-neutral-900">主控庫存提醒設定</h2>
          <Info className="w-4 h-4 text-neutral-400" />
        </div>

        <div className="bg-white rounded-[20px] px-6 py-2">
          <CounterItem
            label="總庫存數量"
            value={totalInventory}
            onChange={setTotalInventory}
          />
          <CounterItem
            label="過期食材數量"
            value={expiredCount}
            onChange={setExpiredCount}
          />
          <CounterItem
            label="即將過期食材數量"
            value={expiringSoonCount}
            onChange={setExpiringSoonCount}
          />
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
