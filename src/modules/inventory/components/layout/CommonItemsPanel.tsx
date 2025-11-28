import React from 'react';
import CommonItemCard from '@/modules/inventory/components/ui/card/CommonItemCard';
import { foodData } from '@/modules/inventory/constants/foods';

// const categoryMapping: Record<string, string> = {
//   fruit: '蔬果類',
//   bake: '主食烘焙類',
//   frozen: '冷凍調理類',
//   others: '其他',
// };

const CommonItemsPanel: React.FC = () => {
  // Select specific items to simulate "Common Items" based on the design/available data
  const commonItems = [
    {
      category: '蔬果類',
      items: foodData.fruit.slice(0, 4), // Take first 4 items
    },
    {
      category: '主食烘焙類',
      items: foodData.bake.slice(0, 2), // Take first 2 items
    },
    {
      category: '冷凍調理類',
      items: foodData.frozen.slice(0, 1), // Take first 1 item
    },
    {
      category: '其他',
      items: foodData.others.slice(0, 1), // Take first 1 item
    },
  ].filter((group) => group.items.length > 0);

  return (
    <div className="pb-24 space-y-6">
      {commonItems.map((group) => (
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
                image={item.img.src}
                value={item.quantity} // Using quantity as a proxy for "frequency" or just displaying quantity
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
