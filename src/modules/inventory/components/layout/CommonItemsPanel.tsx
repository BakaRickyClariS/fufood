import React from 'react';
import CommonItemCard from '@/modules/inventory/components/ui/card/CommonItemCard';
import { useInventory } from '@/modules/inventory/hooks';
import type { FoodItem } from '@/modules/inventory/types';

const CommonItemsPanel: React.FC = () => {
  const { items, isLoading } = useInventory();

  // Group items by category
  const groupedItems = React.useMemo(() => {
    const groups: Record<string, FoodItem[]> = {};

    items.forEach((item) => {
      if (!groups[item.category]) {
        groups[item.category] = [];
      }
      groups[item.category].push(item);
    });

    // Sort categories (optional, can be customized)
    const categoryOrder = ['蔬果類', '主食烘焙類', '冷凍調理類', '其他'];

    return categoryOrder
      .map((category) => ({
        category,
        items: groups[category] || [],
      }))
      .filter((group) => group.items.length > 0);
  }, [items]);

  if (isLoading) {
    return <div className="p-4 text-center">Loading...</div>;
  }

  return (
    <div className="pb-24 space-y-6">
      {groupedItems.map((group) => (
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

export default CommonItemsPanel;
