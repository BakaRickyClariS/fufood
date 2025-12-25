import { useState, useEffect, useMemo } from 'react';
import CommonItemCard from '@/modules/inventory/components/ui/card/CommonItemCard';
import { useInventoryExtras } from '@/modules/inventory/hooks';
import FoodDetailModal from '@/modules/inventory/components/ui/modal/FoodDetailModal';
import type { FoodItem } from '@/modules/inventory/types';

const ExpiredRecordsPanel: React.FC = () => {
  const { expiredItems, isLoading, fetchExpiredItems } = useInventoryExtras();
  const [selectedItem, setSelectedItem] = useState<FoodItem | null>(null);
  const [filter, setFilter] = useState<'expired' | 'completed'>('expired');

  useEffect(() => {
    fetchExpiredItems(filter);
  }, [fetchExpiredItems, filter]);

  const expiredGroups = useMemo(() => {
    const groups: Record<string, FoodItem[]> = {};
    expiredItems.forEach((item) => {
      if (!groups[item.category]) {
        groups[item.category] = [];
      }
      groups[item.category].push(item);
    });

    return Object.entries(groups).map(([category, groupItems]) => ({
      category,
      items: groupItems,
    }));
  }, [expiredItems]);

  if (isLoading) {
    return <div className="p-4 text-center">Loading...</div>;
  }

  return (
    <>
      <div className="pb-24 space-y-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setFilter('expired')}
            className={`px-3 py-1.5 rounded-full text-sm font-bold flex items-center gap-1 transition-colors ${
              filter === 'expired'
                ? 'bg-primary-400 text-white border border-primary-400'
                : 'bg-transparent text-neutral-500 border border-neutral-400'
            }`}
          >
            {filter === 'expired' && (
              <svg
                width="16"
                height="16"
                viewBox="0 0 12 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10 3L4.5 8.5L2 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
            已過期
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-3 py-1.5 rounded-full text-sm font-bold flex items-center gap-1 transition-colors ${
              filter === 'completed'
                ? 'bg-primary-400 text-white border border-primary-400'
                : 'bg-transparent text-neutral-500 border border-neutral-400'
            }`}
          >
            {filter === 'completed' && (
              <svg
                width="16"
                height="16"
                viewBox="0 0 12 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10 3L4.5 8.5L2 6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
            已完成
          </button>
        </div>

        {expiredGroups.length === 0 ? (
          <div className="text-center py-10 text-neutral-400">
            目前沒有{filter === 'expired' ? '過期' : '完成'}紀錄
          </div>
        ) : (
          expiredGroups.map((group) => (
            <div key={group.category}>
              <div className="flex items-center gap-2 mb-3 px-1">
                <div className="w-1 h-4 bg-[#7F9F3F] rounded-full" />
                <h3 className="text-base font-bold text-neutral-600">
                  {group.category}
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {group.items.map((item) => (
                  <CommonItemCard
                    key={item.id}
                    name={item.name}
                    image={item.imageUrl || ''}
                    value={item.lastPurchaseQuantity || item.quantity || 1}
                    label="上次購買數量"
                    onClick={() => setSelectedItem(item)}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {selectedItem && (
        <FoodDetailModal
          item={selectedItem}
          isOpen={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          onItemUpdate={() => fetchExpiredItems(filter)}
        />
      )}
    </>
  );
};

export default ExpiredRecordsPanel;
