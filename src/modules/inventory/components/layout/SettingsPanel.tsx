import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Minus, Plus } from 'lucide-react';
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
import gsap from 'gsap';
import { Button } from '@/shared/components/ui/button';
import InfoTooltip from '@/shared/components/feedback/InfoTooltip';
import { inventoryApi } from '@/modules/inventory/api';
import {
  selectCategoryOrder,
  setCategoryOrder,
  setLayout,
} from '@/modules/inventory/store/inventorySlice';
import type { CategoryInfo } from '@/modules/inventory/types';
import type { LayoutType } from '@/modules/inventory/types/layoutTypes';
import { LAYOUT_CONFIGS } from '@/modules/inventory/types/layoutTypes';
import { toast } from 'sonner';

// 可編輯類別項目
type EditableCategoryInfo = {
  id: string;
  title: string;
};

// 計數器項目元件
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
      className="flex items-center gap-2 mb-3 group"
    >
      {/* Drag Handle */}
      <div
        {...listeners}
        className="p-2 transition-colors cursor-grab active:cursor-grabbing touch-none hover:bg-neutral-100 rounded-lg"
      >
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
      {/* 靜態類別名稱 (已禁用編輯) */}
      <div className="text-base font-bold text-neutral-900 bg-white px-4 py-3 rounded-lg w-full border border-neutral-200">
        {category.title}
      </div>
    </div>
  );
};

const SettingsPanel: React.FC = () => {
  // 版型狀態
  const [savedLayoutType, setSavedLayoutType] =
    useState<LayoutType>('layout-a');
  const [selectedLayoutType, setSelectedLayoutType] =
    useState<LayoutType>('layout-a');

  // 類別狀態
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [savedCategories, setSavedCategories] = useState<
    EditableCategoryInfo[]
  >([]);
  const [editedCategories, setEditedCategories] = useState<
    EditableCategoryInfo[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  // 主控庫存提醒設定狀態
  const [totalInventory, setTotalInventory] = useState(1);
  const [expiredCount, setExpiredCount] = useState(1);
  const [expiringSoonCount, setExpiringSoonCount] = useState(1);

  // 三角形指示器 ref
  const triangleRef = useRef<HTMLDivElement>(null);
  const layoutContainerRef = useRef<HTMLDivElement>(null);

  const categoryOrder = useSelector(selectCategoryOrder);
  const dispatch = useDispatch();

  // 設定拖拉感應器
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        const settingsResponse = await inventoryApi.getSettings();
        const layoutType =
          settingsResponse.data.settings.layoutType || 'layout-a';
        setSavedLayoutType(layoutType);
        setSelectedLayoutType(layoutType);
        dispatch(setLayout(layoutType));

        const categoriesResponse = await inventoryApi.getCategories();
        setCategories(categoriesResponse.data.categories);

        const catInfos = categoriesResponse.data.categories.map((c) => ({
          id: c.id,
          title: c.title,
        }));
        setSavedCategories(catInfos);
        setEditedCategories(catInfos);

        if (categoryOrder.length === 0) {
          const ids = categoriesResponse.data.categories.map((c) => c.id);
          dispatch(setCategoryOrder(ids));
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
        toast.error('無法載入設定');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const sortedCategories = useMemo(() => {
    if (!categoryOrder || categoryOrder.length === 0) {
      return categories;
    }
    const ordered: CategoryInfo[] = [];
    categoryOrder.forEach((id) => {
      const category = categories.find((c) => c.id === id);
      if (category) ordered.push(category);
    });
    categories.forEach((category) => {
      if (!categoryOrder.includes(category.id)) ordered.push(category);
    });
    return ordered;
  }, [categories, categoryOrder]);

  const sortedEditedCategories = useMemo(() => {
    if (!categoryOrder || categoryOrder.length === 0) {
      return editedCategories;
    }
    const ordered: EditableCategoryInfo[] = [];
    categoryOrder.forEach((id) => {
      const cat = editedCategories.find((c) => c.id === id);
      if (cat) ordered.push(cat);
    });
    editedCategories.forEach((cat) => {
      if (!categoryOrder.includes(cat.id)) ordered.push(cat);
    });
    return ordered;
  }, [editedCategories, categoryOrder]);

  const hasChanges = useMemo(() => {
    if (selectedLayoutType !== savedLayoutType) return true;
    const savedOrder = savedCategories.map((c) => c.id);
    const editedOrder = sortedEditedCategories.map((c) => c.id);
    if (JSON.stringify(savedOrder) !== JSON.stringify(editedOrder)) return true;
    for (const edited of sortedEditedCategories) {
      const saved = savedCategories.find((c) => c.id === edited.id);
      if (saved && saved.title !== edited.title) return true;
    }
    return false;
  }, [
    selectedLayoutType,
    savedLayoutType,
    savedCategories,
    sortedEditedCategories,
  ]);

  // 三角形動畫 - offset 修正為 16 (對應 16px border)
  const animateTriangle = (targetIndex: number) => {
    if (!triangleRef.current || !layoutContainerRef.current) return;

    const layoutItems =
      layoutContainerRef.current.querySelectorAll('[data-layout-item]');
    if (layoutItems[targetIndex]) {
      const targetItem = layoutItems[targetIndex] as HTMLElement;
      const containerRect = layoutContainerRef.current.getBoundingClientRect();
      const targetRect = targetItem.getBoundingClientRect();
      const targetX =
        targetRect.left + targetRect.width / 2 - containerRect.left;

      gsap.to(triangleRef.current, {
        x: targetX - 16, // Offset for 32px width triangle center
        duration: 0.3,
        ease: 'power2.out',
      });
    }
  };

  useEffect(() => {
    if (!isLoading) {
      const targetIndex = LAYOUT_CONFIGS.findIndex(
        (c) => c.id === selectedLayoutType,
      );
      requestAnimationFrame(() => animateTriangle(targetIndex));
    }
  }, [isLoading, selectedLayoutType]);

  const handleSelectLayout = (layoutId: LayoutType) => {
    setSelectedLayoutType(layoutId);
    dispatch(setLayout(layoutId));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = sortedCategories.findIndex((c) => c.id === active.id);
      const newIndex = sortedCategories.findIndex((c) => c.id === over.id);
      const newOrderIds = arrayMove(sortedCategories, oldIndex, newIndex).map(
        (c) => c.id,
      );
      dispatch(setCategoryOrder(newOrderIds));
    }
  };

  const handleApply = async () => {
    try {
      await inventoryApi.updateSettings({
        layoutType: selectedLayoutType,
        categoryOrder: sortedEditedCategories.map((c) => c.id),
        categories: sortedEditedCategories,
      });

      setSavedLayoutType(selectedLayoutType);
      setSavedCategories([...sortedEditedCategories]);
      toast.success('設定已套用');
    } catch (error) {
      console.error('Failed to apply settings:', error);
      toast.error('套用失敗，請稍後再試');
    }
  };

  return (
    <div className="pb-24 space-y-8 px-1 mt-8">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-neutral-900">庫存外觀</h2>
          <InfoTooltip
            content="您可以在此選擇喜歡的庫存呈現版型，設定將即時套用至您的庫存管理頁面。"
            className="text-neutral-400"
          />
        </div>

        <div className="bg-white rounded-[20px] p-4 space-y-6">
          <div ref={layoutContainerRef} className="relative z-10">
            <div className="grid grid-cols-3 gap-3">
              {LAYOUT_CONFIGS.map((config) => {
                const isSelected = selectedLayoutType === config.id;
                const isSaved = savedLayoutType === config.id;
                return (
                  // 為此 Div 加上 relative，以便定位「目前」標籤
                  <div
                    key={config.id}
                    data-layout-item
                    className="flex flex-col items-center cursor-pointer group relative"
                    onClick={() => handleSelectLayout(config.id)}
                  >
                    <div className="relative w-full h-[156px] rounded-xl overflow-hidden transition-all duration-200">
                      <img
                        src={
                          isSelected ? config.imageActive : config.imageDefault
                        }
                        alt={config.name}
                        className="w-full h-full object-contain"
                      />
                      {/* 「目前」標籤已移出此 overflow-hidden 容器 */}
                    </div>

                    {/* 「目前」標籤 - 移至圖片容器外，並定位於底部 */}
                    {isSaved && (
                      <span className="absolute top-[37%] left-1/2 -translate-x-1/2 px-2.5 py-1 bg-primary-400 text-white text-[10px] rounded-full whitespace-nowrap z-20">
                        目前
                      </span>
                    )}

                    <div className="flex flex-col items-center gap-2 mt-4">
                      <span
                        className={`text-sm font-medium ${isSelected ? 'text-primary-400' : 'text-neutral-600'}`}
                      >
                        {config.name}
                      </span>
                      <div
                        className={`
                          w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors
                          ${isSelected ? 'bg-primary-400 border-primary-400' : 'bg-white border-neutral-400'}
                        `}
                      >
                        {isSelected && (
                          <div className="w-3.5 h-3.5 bg-primary-400 rounded-full border-white border-2" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {/* 三角形指示器 - border 16px */}
            <div
              ref={triangleRef}
              className="absolute -bottom-6 left-0 w-0 h-0 border-l-[16px] border-r-[16px] border-b-[16px] border-l-transparent border-r-transparent border-b-primary-50"
            />
          </div>

          {/* 庫存排序設定 */}
          <div className="bg-primary-50 rounded-lg px-4 py-6 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-1 h-5 bg-primary-400" />
              <h3 className="text-base font-bold text-neutral-900">
                庫存排序設定
              </h3>
            </div>

            <div className="space-y-2">
              {isLoading ? (
                <div className="text-center py-8 text-neutral-500">
                  載入中...
                </div>
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
                    {sortedCategories.map((category) => {
                      return (
                        <SortableCategoryItem
                          key={category.id}
                          category={category}
                        />
                      );
                    })}
                  </SortableContext>
                </DndContext>
              )}
            </div>
          </div>

          <Button
            className="w-full bg-primary-400 hover:bg-primary-500 text-white rounded-xl h-12 text-base font-bold active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleApply}
            disabled={!hasChanges}
          >
            套用版型
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-neutral-900">
            主控庫存提醒設定
          </h2>
          <InfoTooltip
            content="設定庫存管理頁面上方資訊卡顯示的預設數值。"
            className="text-neutral-400"
          />
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
