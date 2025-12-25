import { useRef, useEffect } from 'react';
import gsap from 'gsap';
import type { ConsumptionItem } from '@/modules/recipe/types';

// 通用 Props 定義，支援傳入 ConsumptionItem 陣列或單一食材資訊
type ConsumptionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (addToShoppingList: boolean) => void;
  onEdit?: () => void;
  // 支援多食材模式
  items?: ConsumptionItem[];
  // 支援單一食材模式 (如果沒傳 item，則顯示 items)
  singleItem?: {
    name: string;
    quantity: number;
    unit: string;
    expiryDate?: string;
  };
};

export const ConsumptionModal = ({
  isOpen,
  onClose,
  onConfirm,
  onEdit,
  items = [],
  singleItem,
}: ConsumptionModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // 動畫處理
  useEffect(() => {
    if (isOpen) {
      const tl = gsap.timeline();
      // Overlay 淡入
      tl.fromTo(
        overlayRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.2, ease: 'power2.out' },
      );
      // Modal 縮放淡入
      tl.fromTo(
        modalRef.current,
        { scale: 0.9, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.2)' },
        '-=0.1',
      );
    }
  }, [isOpen]);

  const handleClose = (callback?: () => void) => {
    const tl = gsap.timeline({
      onComplete: () => {
        onClose();
        callback?.();
      },
    });
    tl.to(modalRef.current, {
      scale: 0.9,
      opacity: 0,
      duration: 0.2,
      ease: 'power2.in',
    });
    tl.to(
      overlayRef.current,
      { opacity: 0, duration: 0.2, ease: 'power2.in' },
      '-=0.2',
    );
  };

  const handleConfirm = (addToShoppingList: boolean) => {
    handleClose(() => onConfirm(addToShoppingList));
  };

  if (!isOpen) return null;

  // 統一處理顯示資料
  const displayItems = singleItem
    ? [
        {
          ingredientName: singleItem.name,
          consumedQuantity: singleItem.quantity,
          unit: singleItem.unit,
        } as ConsumptionItem,
      ]
    : items;

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center p-4">
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => handleClose()}
      />

      <div
        ref={modalRef}
        className="relative bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-xl"
      >
        {/* Header */}
        <div className="p-5 flex justify-between items-center bg-white border-b border-gray-100">
          <h3 className="font-bold text-xl text-neutral-900 tracking-tight">
            消耗通知
          </h3>
          {onEdit && (
            <button
              onClick={onEdit}
              className="flex items-center gap-1 text-primary-500 text-sm font-medium hover:opacity-80 transition-opacity"
            >
              <span className="text-lg">✎</span>
              <span>加入消耗原因</span>
            </button>
          )}
        </div>

        {/* Content */}
        <div className="px-5 py-4 bg-gray-50/50">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-4 bg-primary-500 rounded-full"></div>
            <h4 className="font-bold text-neutral-900">本次消耗</h4>
          </div>

          <div className="space-y-3 max-h-[50vh] overflow-y-auto custom-scrollbar pr-1">
            {displayItems.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-100 shadow-sm"
              >
                <div>
                  <div className="font-bold text-neutral-900 mb-1 text-[15px]">
                    {item.ingredientName}
                  </div>
                  {/* 如果是單一食材且有過期日，可以顯示 */}
                  {singleItem?.expiryDate && (
                    <div className="text-primary-500 text-xs font-medium bg-primary-50 px-2 py-0.5 rounded inline-block">
                      {singleItem.expiryDate} 過期
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-bold text-neutral-900 text-lg">
                    {item.consumedQuantity}
                  </span>
                  <span className="font-bold text-neutral-500 text-sm">
                    {item.unit}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 space-y-3 bg-white border-t border-gray-100">
          <button
            onClick={() => handleConfirm(true)}
            className="w-full py-3.5 bg-white border border-neutral-300 text-neutral-900 rounded-lg font-bold text-[15px] hover:bg-gray-50 transition-colors shadow-sm"
          >
            已消耗，加入採買清單
          </button>
          <button
            onClick={() => handleConfirm(false)}
            className="w-full py-3.5 bg-neutral-100 text-neutral-600 rounded-lg font-bold text-[15px] hover:bg-neutral-200 transition-colors"
          >
            僅消耗，暫不採買
          </button>
        </div>
      </div>
    </div>
  );
};
