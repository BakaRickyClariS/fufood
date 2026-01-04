import { useState, useEffect, useMemo, useCallback } from 'react';
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

// 篩選按鈕元件
type FilterButtonProps = {
  isActive: boolean;
  onClick: () => void;
  children: React.ReactNode;
};

const FilterButton = ({ isActive, onClick, children }: FilterButtonProps) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 rounded-full text-sm font-bold flex items-center gap-1 transition-colors ${
      isActive
        ? 'bg-primary-400 text-white border border-primary-400'
        : 'bg-transparent text-neutral-500 border border-neutral-400'
    }`}
  >
    {isActive && (
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
    {children}
  </button>
);

const ExpiredRecordsPanel: React.FC = () => {
  const { expiredItems, isLoading, fetchExpiredItems } = useInventoryExtras();
  const [selectedItem, setSelectedItem] = useState<FoodItem | null>(null);
  const [filter, setFilter] = useState<'expired' | 'completed'>('expired');
  const [isContentLoading, setIsContentLoading] = useState(false);
  const { groupId } = useParams<{ groupId: string }>();
  const dispatch = useDispatch();

  // 使用共用的淡入動畫 hook
  const {
    ref: contentRef,
    resetAnimation,
    isAnimationComplete,
  } = useFadeInAnimation<HTMLDivElement>({
    isLoading: isLoading || isContentLoading,
  });

  // Restore usage of Session Storage for memory
  useEffect(() => {
    // Wait for loading to finish AND animation to complete
    if (isLoading || isContentLoading || !isAnimationComplete) return;

    const savedId = sessionStorage.getItem('active_food_id');
    if (savedId && !selectedItem && expiredItems.length > 0) {
      // Add a noticeable delay after animation completes
      const timer = setTimeout(() => {
        const found = expiredItems.find((item) => item.id === savedId);
        if (found) setSelectedItem(found);
      }, 800); // Increased to 0.8s
      return () => clearTimeout(timer);
    }
  }, [
    expiredItems,
    selectedItem,
    isLoading,
    isContentLoading,
    isAnimationComplete,
  ]);

  const groups = useSelector(selectAllGroups);
  const activeRefrigeratorId = useSelector(selectActiveRefrigeratorId);
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
    fetchExpiredItems(filter, 1, 20, targetGroupId);
  }, [fetchExpiredItems, filter, targetGroupId]);

  // 切換篩選的處理函數
  const handleFilterChange = useCallback(
    (newFilter: 'expired' | 'completed') => {
      if (newFilter === filter || isContentLoading) return;

      setIsContentLoading(true);
      resetAnimation(); // 重置動畫狀態，讓下次載入完成時可以再次播放動畫
      setFilter(newFilter);
      if (targetGroupId) {
        fetchExpiredItems(newFilter, 1, 20, targetGroupId);
      }

      // 模擬載入完成（實際上 isLoading 會由 hook 控制）
      // 這裡需要等待實際的 isLoading 變化
    },
    [filter, isContentLoading, fetchExpiredItems, resetAnimation],
  );

  // 監聽 isLoading 變化，當載入完成時關閉 isContentLoading
  useEffect(() => {
    if (!isLoading && isContentLoading) {
      setIsContentLoading(false);
    }
  }, [isLoading, isContentLoading]);

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

  const showLoading = isLoading || isContentLoading;

  return (
    <>
      <div className="pb-24 space-y-6">
        <div className="flex items-center gap-3">
          <FilterButton
            isActive={filter === 'expired'}
            onClick={() => handleFilterChange('expired')}
          >
            已過期
          </FilterButton>
          <FilterButton
            isActive={filter === 'completed'}
            onClick={() => handleFilterChange('completed')}
          >
            已完成
          </FilterButton>
        </div>

        {showLoading ? (
          <div className="p-4 text-center text-neutral-400">Loading...</div>
        ) : (
          <div ref={contentRef}>
            {expiredGroups.length === 0 ? (
              <div className="text-center py-10 text-neutral-400">
                目前沒有{filter === 'expired' ? '過期' : '完成'}紀錄
              </div>
            ) : (
              expiredGroups.map((group) => (
                <div key={group.category} className="mb-6">
                  <div className="flex items-center gap-2 mb-3 px-1">
                    <div className="w-1 h-4 bg-[#7F9F3F] rounded-full" />
                    <h3 className="text-base font-bold text-neutral-600">
                      {categoryNameMap[group.category] || group.category}
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
                        onClick={() => {
                          setSelectedItem(item);
                          sessionStorage.setItem('active_food_id', item.id);
                        }}
                      />
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {selectedItem && (
        <FoodDetailModal
          item={selectedItem}
          isOpen={!!selectedItem}
          onClose={() => {
            setSelectedItem(null);
            sessionStorage.removeItem('active_food_id');
          }}
          isCompleted={filter === 'completed'}
          onItemUpdate={() => {
            if (targetGroupId) fetchExpiredItems(filter, 1, 20, targetGroupId);
          }}
        />
      )}
    </>
  );
};

export default ExpiredRecordsPanel;
