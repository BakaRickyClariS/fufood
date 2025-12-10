import React, { useState, useEffect, useMemo } from 'react';
import { Info, Minus, Plus } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/shared/components/ui/button';
import LayoutAppearanceSection from '@/modules/inventory/components/ui/other/LayoutAppearanceSection';
import { inventoryApi } from '@/modules/inventory/api';
import {
  selectCategoryOrder,
  setCategoryOrder,
} from '@/modules/inventory/store/inventorySlice';
import type { CategoryInfo } from '@/modules/inventory/types';
import { toast } from 'sonner';

const CounterItem = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (val: number) => void;
}) => (
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

// 可拖拉的類別項目元件
type SortableCategoryItemProps = {
  category: CategoryInfo;
};

const SortableCategoryItem: React.FC<SortableCategoryItemProps> = ({
  category,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: category.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="flex items-center gap-2 mb-3 cursor-grab active:cursor-grabbing touch-none group"
    >
      <div className="p-2 transition-colors">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-neutral-900"
        >
          <circle cx="8" cy="4" r="2" fill="currentColor" />
          <circle cx="8" cy="12" r="2" fill="currentColor" />
          <circle cx="8" cy="20" r="2" fill="currentColor" />
          <circle cx="16" cy="4" r="2" fill="currentColor" />
          <circle cx="16" cy="12" r="2" fill="currentColor" />
          <circle cx="16" cy="20" r="2" fill="currentColor" />
        </svg>
      </div>
      <span className="text-base font-bold text-neutral-900 bg-primary-50 px-6 py-4 rounded-xl w-full select-none group-hover:bg-primary-100 transition-colors">
        {category.title}
      </span>
    </div>
  );
};

const SettingsPanel: React.FC = () => {
  const [totalInventory, setTotalInventory] = useState(1);
  const [expiredCount, setExpiredCount] = useState(1);
  const [expiringSoonCount, setExpiringSoonCount] = useState(1);

  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const categoryOrder = useSelector(selectCategoryOrder);
  const dispatch = useDispatch();

  // 設定拖拉感應器
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // 取得類別列表
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        const response = await inventoryApi.getCategories();
        setCategories(response.data.categories);

        // 如果還沒有設定順序，使用 API 回傳的順序
        if (categoryOrder.length === 0) {
          const ids = response.data.categories.map((c) => c.id);
          dispatch(setCategoryOrder(ids));
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
        toast.error('無法載入類別列表');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // 根據 categoryOrder 排序類別
  const sortedCategories = useMemo(() => {
    if (!categoryOrder || categoryOrder.length === 0) {
      return categories;
    }

    const ordered: CategoryInfo[] = [];

    // 按照 categoryOrder 順序添加類別
    categoryOrder.forEach((id) => {
      const category = categories.find((c) => c.id === id);
      if (category) {
        ordered.push(category);
      }
    });

    // 添加不在 categoryOrder 中的類別（如果有新類別）
    categories.forEach((category) => {
      if (!categoryOrder.includes(category.id)) {
        ordered.push(category);
      }
    });

    return ordered;
  }, [categories, categoryOrder]);

  // 處理拖拉結束 - 直接儲存
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = sortedCategories.findIndex((c) => c.id === active.id);
      const newIndex = sortedCategories.findIndex((c) => c.id === over.id);

      const newOrder = arrayMove(sortedCategories, oldIndex, newIndex);
      const newOrderIds = newOrder.map((c) => c.id);

      // 立即更新 Redux 狀態
      dispatch(setCategoryOrder(newOrderIds));

      // 自動儲存到後端
      try {
        await inventoryApi.updateSettings({ categoryOrder: newOrderIds });
      } catch (error) {
        console.error('Failed to save category order:', error);
        toast.error('儲存失敗，請稍後再試');
        // 如果儲存失敗，可以考慮回復之前的順序
      }
    }
  };

  return (
    <div className="pb-24 space-y-8 px-1 mt-8">
      {/* Inventory Layout Settings */}
      <LayoutAppearanceSection />

      {/* Inventory Sort Settings */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-neutral-900">庫存排序設定</h2>
          <Info className="w-4 h-4 text-neutral-500" />
        </div>

        <div className="bg-white rounded-[20px] p-4 space-y-2">
          {isLoading ? (
            <div className="text-center py-8 text-neutral-500">載入中...</div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
              modifiers={[restrictToVerticalAxis]}
            >
              <SortableContext
                items={sortedCategories.map((c) => c.id)}
                strategy={verticalListSortingStrategy}
              >
                {sortedCategories.map((category) => (
                  <SortableCategoryItem key={category.id} category={category} />
                ))}
              </SortableContext>
            </DndContext>
          )}
        </div>
      </div>

      {/* Main Inventory Reminder Settings */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-neutral-900">
            主控庫存提醒設定
          </h2>
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
