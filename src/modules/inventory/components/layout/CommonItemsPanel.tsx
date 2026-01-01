import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectAllGroups,
  fetchGroups,
} from '@/modules/groups/store/groupsSlice';
import { selectActiveRefrigeratorId } from '@/store/slices/refrigeratorSlice';
import CommonItemCard from '@/modules/inventory/components/ui/card/CommonItemCard';
import { useInventoryExtras } from '@/modules/inventory/hooks';
import FoodDetailModal from '@/modules/inventory/components/ui/modal/FoodDetailModal';
import useFadeInAnimation from '@/shared/hooks/useFadeInAnimation';
import { useInventorySettingsQuery } from '@/modules/inventory/api/queries';
import { categories as defaultCategories } from '@/modules/inventory/constants/categories';
import type { FoodItem } from '@/modules/inventory/types';

const CommonItemsPanel: React.FC = () => {
  const { frequentItems, isLoading, fetchFrequentItems } = useInventoryExtras();
  const [selectedItem, setSelectedItem] = useState<FoodItem | null>(null);
  const { ref: contentRef } = useFadeInAnimation<HTMLDivElement>({ isLoading });

  const { groupId } = useParams<{ groupId: string }>();
  const dispatch = useDispatch();
  const groups = useSelector(selectAllGroups);
  const activeRefrigeratorId = useSelector(selectActiveRefrigeratorId);
  // Prioritize activeId from Redux, then URL param, then fallback
  const targetGroupId = activeRefrigeratorId || groupId || groups[0]?.id;

  // 取得設定資料以獲取分類中文名稱
  const { data: settingsData } = useInventorySettingsQuery(targetGroupId);

  // 建立 category ID → 中文名稱的映射
  const categoryNameMap = useMemo(() => {
    const map: Record<string, string> = {};
    defaultCategories.forEach((c) => {
      map[c.id] = c.title;
    });
    const categories = settingsData?.data?.settings?.categories || [];
    categories.forEach((cat) => {
      map[cat.id] = cat.title;
    });
    return map;
  }, [settingsData]);

  // Effect 1: 確保 groups 已載入
  useEffect(() => {
    if (groups.length === 0) {
      // @ts-ignore
      dispatch(fetchGroups());
    }
  }, [dispatch, groups.length]);

  // Effect 2: 當有有效 targetGroupId 時才載入資料
  useEffect(() => {
    if (!targetGroupId) {
      // groups 還在載入，不執行任何動作
      return;
    }
    fetchFrequentItems(10, targetGroupId);
  }, [fetchFrequentItems, targetGroupId]);

  // Group items by category (使用英文 id 進行分組)
  const groupedItems = useMemo(() => {
    const groupsMap: Record<string, FoodItem[]> = {};

    frequentItems.forEach((item) => {
      if (!groupsMap[item.category]) {
        groupsMap[item.category] = [];
      }
      groupsMap[item.category].push(item);
    });

    // 使用英文 id 排序（與 categories.ts 一致）
    const categoryOrder = ['fruit', 'bake', 'frozen', 'milk', 'seafood', 'meat', 'others'];

    return categoryOrder
      .map((categoryId) => ({
        categoryId,
        categoryName: categoryNameMap[categoryId] || categoryId,
        items: (groupsMap[categoryId] || [])
          .sort((a, b) => (b.purchaseCount || 0) - (a.purchaseCount || 0))
          .slice(0, 4),
      }))
      .filter((group) => group.items.length > 0);
  }, [frequentItems, categoryNameMap]);

  if (isLoading) {
    return <div className="p-4 text-center text-neutral-400">Loading...</div>;
  }

  return (
    <>
      <div ref={contentRef} className="pb-24 space-y-6">
        {groupedItems.length === 0 ? (
          <div className="text-center py-10 text-neutral-400">
            目前沒有常買項目紀錄
          </div>
        ) : (
          groupedItems.map((group) => (
            <div key={group.categoryId}>
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-4 bg-[#7F9F3F] rounded-full" />
                  <h3 className="text-base font-bold text-neutral-600">
                    {group.categoryName}
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
          ))
        )}
      </div>

      {selectedItem && (
        <FoodDetailModal
          item={selectedItem}
          isOpen={!!selectedItem}
          onClose={() => setSelectedItem(null)}
          isCompleted={selectedItem.quantity <= 0}
          onItemUpdate={() => {
            if (targetGroupId) fetchFrequentItems(10, targetGroupId);
          }}
        />
      )}
    </>
  );
};

export default CommonItemsPanel;

