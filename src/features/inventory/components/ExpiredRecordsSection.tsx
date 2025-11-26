import React, { useMemo } from 'react';
import CommonItemCard from '@/features/inventory/components/CommonItemCard';
import { foodData, type FoodItem } from '@/features/inventory/constants/foodImages';

const categoryMapping: Record<string, string> = {
  fruit: '蔬果類',
  bake: '主食烘焙類',
  frozen: '冷凍調理類',
  others: '其他',
  milk: '乳製品飲料類',
  seafood: '海鮮類',
  meat: '肉類',
};

const ExpiredRecordsSection: React.FC = () => {
  const expiredGroups = useMemo(() => {
    const groups: { category: string; items: FoodItem[] }[] = [];

    Object.entries(foodData).forEach(([key, items]) => {
      const expiredItems = items.filter((item) => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const expireDate = new Date(item.expireAt);
        expireDate.setHours(0, 0, 0, 0);
        // 當過期日嚴格小於今天時，才算是已過期
        return expireDate < today;
      });

      if (expiredItems.length > 0) {
        groups.push({
          category: categoryMapping[key] || key,
          items: expiredItems,
        });
      }
    });

    return groups;
  }, []);

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
                image={item.img.src}
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

export default ExpiredRecordsSection;
