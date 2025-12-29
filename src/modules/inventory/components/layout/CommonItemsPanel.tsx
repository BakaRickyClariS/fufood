import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectAllGroups, fetchGroups } from '@/modules/groups/store/groupsSlice';
import CommonItemCard from '@/modules/inventory/components/ui/card/CommonItemCard';
import { useInventoryExtras } from '@/modules/inventory/hooks';
import FoodDetailModal from '@/modules/inventory/components/ui/modal/FoodDetailModal';
import useFadeInAnimation from '@/shared/hooks/useFadeInAnimation';
import type { FoodItem } from '@/modules/inventory/types';

const CommonItemsPanel: React.FC = () => {
  const { frequentItems, isLoading, fetchFrequentItems } = useInventoryExtras();
  const [selectedItem, setSelectedItem] = useState<FoodItem | null>(null);
  const { ref: contentRef } = useFadeInAnimation<HTMLDivElement>({ isLoading });

  const { groupId } = useParams<{ groupId: string }>();
  const dispatch = useDispatch();
  const groups = useSelector(selectAllGroups);
  const targetGroupId = groupId || groups[0]?.id;

  useEffect(() => {
    if (groups.length === 0) {
        // @ts-ignore
        dispatch(fetchGroups());
    }
    if (targetGroupId) {
        fetchFrequentItems(10, targetGroupId);
    }
  }, [fetchFrequentItems, groupId, groups.length, targetGroupId, dispatch]);

  // Group items by category
  const groupedItems = useMemo(() => {
    const groups: Record<string, FoodItem[]> = {};

    frequentItems.forEach((item) => {
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
        items: (groups[category] || [])
          .sort((a, b) => (b.purchaseCount || 0) - (a.purchaseCount || 0))
          .slice(0, 4),
      }))
      .filter((group) => group.items.length > 0);
  }, [frequentItems]);

  if (isLoading) {
    return <div className="p-4 text-center text-neutral-400">Loading...</div>;
  }

  return (
    <>
      <div ref={contentRef} className="pb-24 space-y-6">
        {groupedItems.map((group) => (
          <div key={group.category}>
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <div className="w-1 h-4 bg-[#7F9F3F] rounded-full" />
                <h3 className="text-base font-bold text-neutral-600">
                  {group.category}
                </h3>
              </div>
              <div className="flex items-baseline gap-1 text-lg font-bold">
                <span className="text-neutral-900">{group.items.length}</span>
                <span className="text-neutral-500">/</span>
                <span className="text-neutral-500">{4}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {group.items.map((item) => (
                <CommonItemCard
                  key={item.id}
                  name={item.name}
                  image={item.imageUrl || ''}
                  value={item.lastPurchaseQuantity || 1}
                  label="上次購買數量"
                  onClick={() => setSelectedItem(item)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {selectedItem && (
        <FoodDetailModal
          item={selectedItem}
          isOpen={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          onItemUpdate={() => {
            if (targetGroupId) fetchFrequentItems(10, targetGroupId);
          }}
        />
      )}
    </>
  );
};

export default CommonItemsPanel;

