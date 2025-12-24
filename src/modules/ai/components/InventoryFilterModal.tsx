import React, { useEffect, useMemo, useRef } from 'react';
import { useInventoryQuery } from '@/modules/inventory/api/queries';
import type { FoodItem } from '@/modules/inventory/types';
import { Check, X } from 'lucide-react';
import gsap from 'gsap';
import { cn } from '@/lib/utils';

// Component Props
type InventoryFilterModalProps = {
  isOpen: boolean;
  onClose: () => void;
  selectedItems: string[];
  onApply: (selectedItems: string[]) => void;
  maxSelection?: number;
};

// 主要元件
export const InventoryFilterModal: React.FC<InventoryFilterModalProps> = ({
  isOpen,
  onClose,
  selectedItems,
  onApply,
  maxSelection = 5,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // 本地選擇狀態
  const [localSelected, setLocalSelected] =
    React.useState<string[]>(selectedItems);

  // 取得庫存資料
  const { data, isLoading } = useInventoryQuery({ limit: 100 });
  const items = data?.data?.items || [];

  // 同步外部 props 到本地 state
  useEffect(() => {
    if (isOpen) {
      setLocalSelected(selectedItems);
    }
  }, [isOpen, selectedItems]);

  // 動畫處理
  useEffect(() => {
    if (isOpen) {
      const tl = gsap.timeline();

      // Overlay Fade In
      tl.fromTo(
        overlayRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: 'power2.out' },
      );

      // Modal Slide Up
      tl.fromTo(
        modalRef.current,
        { y: '100%' },
        { y: '0%', duration: 0.4, ease: 'power3.out' },
        '-=0.2',
      );
    }
  }, [isOpen]);

  // 關閉 Modal 動畫
  const handleClose = () => {
    const tl = gsap.timeline({
      onComplete: onClose,
    });

    tl.to(modalRef.current, {
      y: '100%',
      duration: 0.3,
      ease: 'power2.in',
    });

    tl.to(overlayRef.current, { opacity: 0, duration: 0.3 }, '-=0.3');
  };

  // 處理選擇邏輯
  const handleSelect = (itemName: string) => {
    setLocalSelected((prev) => {
      if (prev.includes(itemName)) {
        return prev.filter((i) => i !== itemName);
      }
      if (prev.length >= maxSelection) {
        return prev;
      }
      return [...prev, itemName];
    });
  };

  // 分組邏輯：優先消耗 (Expired/Expiring Soon) vs 一般庫存
  const groupedData = useMemo(() => {
    const groups: Record<string, { priority: FoodItem[]; normal: FoodItem[] }> =
      {};

    items.forEach((item) => {
      if (!groups[item.category]) {
        groups[item.category] = { priority: [], normal: [] };
      }

      // 判斷是否為優先消耗：過期、低庫存警示、或剩餘天數少
      // 這裡簡單使用 lowStockAlert，實際可加入 expiryDate 判斷
      const isPriority = item.lowStockAlert;
      // 若有需要更精確的過期判斷：
      // const daysLeft = differenceInDays(new Date(item.expiryDate), new Date());
      // const isPriority = daysLeft <= 3 || item.lowStockAlert;

      if (isPriority) {
        groups[item.category].priority.push(item);
      } else {
        groups[item.category].normal.push(item);
      }
    });

    return groups;
  }, [items]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-200 flex items-end justify-center sm:items-center">
      {/* Overlay */}
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal Content */}
      <div
        ref={modalRef}
        className="relative w-full max-w-md h-[90vh] bg-white rounded-t-3xl sm:rounded-2xl overflow-hidden flex flex-col shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
          <h2 className="text-lg font-bold text-gray-900">庫房食材</h2>
          <button
            onClick={() => setLocalSelected([])}
            className="text-sm font-medium text-red-500 hover:text-red-600 px-2"
          >
            清除篩選
          </button>
        </div>

        {/* Scrollable List */}
        <div
          ref={contentRef}
          className="flex-1 overflow-y-auto p-4 space-y-8 custom-scrollbar"
        >
          {/* Active Selection Count */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-900">庫存食材</h3>
            <span className="text-gray-500 font-medium">
              {localSelected.length}/{maxSelection}
            </span>
          </div>

          {isLoading ? (
            <div className="text-center py-10 text-gray-400">載入中...</div>
          ) : (
            Object.entries(groupedData).map(
              ([category, { priority, normal }]) => {
                if (priority.length === 0 && normal.length === 0) return null;

                return (
                  <div key={category} className="space-y-3">
                    <h4 className="text-gray-500 font-medium text-sm">
                      {category}
                    </h4>

                    {/* 優先消耗區塊 */}
                    {priority.length > 0 && (
                      <div className="mb-3">
                        <span className="inline-block px-2 py-1 bg-yellow-400 text-neutral-900 text-xs font-bold rounded-md mb-2">
                          優先消耗
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {priority.map((item) => {
                            const isSelected = localSelected.includes(
                              item.name,
                            );
                            return (
                              <button
                                key={item.id}
                                onClick={() => handleSelect(item.name)}
                                className={cn(
                                  'px-4 py-2 border rounded-full text-sm transition-all flex items-center gap-1.5',
                                  isSelected
                                    ? 'bg-[#F58274] text-white border-[#F58274]' // 選中樣式
                                    : 'text-neutral-600 border-neutral-200 hover:bg-gray-50 bg-white', // 預設樣式
                                )}
                              >
                                {isSelected && (
                                  <Check className="w-3.5 h-3.5" />
                                )}
                                {item.name}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* 有庫存區塊 */}
                    {normal.length > 0 && (
                      <div>
                        {priority.length > 0 && ( // 只有當有優先消耗時才顯示這個標題區隔，或者總是顯示
                          <span className="inline-block px-2 py-1 bg-green-500 text-white text-xs font-bold rounded-md mb-2">
                            有庫存
                          </span>
                        )}

                        <div className="flex flex-wrap gap-2">
                          {normal.map((item) => {
                            const isSelected = localSelected.includes(
                              item.name,
                            );
                            return (
                              <button
                                key={item.id}
                                onClick={() => handleSelect(item.name)}
                                className={cn(
                                  'px-4 py-2 border rounded-full text-sm transition-all flex items-center gap-1.5',
                                  isSelected
                                    ? 'bg-[#F58274] text-white border-[#F58274]'
                                    : 'text-neutral-600 border-neutral-200 hover:bg-gray-50 bg-white',
                                )}
                              >
                                {isSelected && (
                                  <Check className="w-3.5 h-3.5" />
                                )}
                                {item.name}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              },
            )
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-100 bg-white pb-safe">
          <button
            onClick={() => {
              onApply(localSelected);
              handleClose();
            }}
            className="w-full py-3 bg-[#F58274] text-white rounded-xl font-bold hover:bg-[#E07063] active:scale-[0.98] transition-all shadow-lg shadow-orange-100"
          >
            套用
          </button>
        </div>
      </div>
    </div>
  );
};
