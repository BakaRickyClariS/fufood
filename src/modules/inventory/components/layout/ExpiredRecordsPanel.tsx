import React, { useMemo } from 'react';
import CommonItemCard from '@/modules/inventory/components/ui/card/CommonItemCard';
import { useInventory } from '@/modules/inventory/hooks';
import type { FoodItem } from '@/modules/inventory/types';

const ExpiredRecordsPanel: React.FC = () => {
  const { items, isLoading } = useInventory();

  const expiredGroups = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const expiredItems = items.filter(item => {
      const expiry = new Date(item.expiryDate);
      expiry.setHours(0, 0, 0, 0);
      return expiry < today;
    });

    const groups: Record<string, FoodItem[]> = {};
    expiredItems.forEach(item => {
      if (!groups[item.category]) {
        groups[item.category] = [];
      }
      groups[item.category].push(item);
    });

    return Object.entries(groups).map(([category, items]) => ({
      category,
      items
    }));
  }, [items]);

  if (isLoading) {
    return <div className="p-4 text-center">Loading...</div>;
  }

  if (expiredGroups.length === 0) {
    return (
      <div className="text-center py-10 text-neutral-400">目前沒有過期紀錄</div>
    );
  }

  return (
    <div className="pb-24 space-y-6">
      {expiredGroups.map((group) => (
        <div key={group.category}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-4 bg-[#D4E1A0] rounded-full" />
            <h3 className="text-base font-bold text-neutral-600">
              {group.category}
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {group.items.map((item) => (
              <CommonItemCard
                key={item.id}
                name={item.name}
                image={item.imageUrl || ''}
                value={item.quantity}
                label="庫存"
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ExpiredRecordsPanel;
