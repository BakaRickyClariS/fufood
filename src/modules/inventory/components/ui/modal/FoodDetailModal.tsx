import React, { useEffect, useRef } from 'react';
import { X, Check } from 'lucide-react';
import gsap from 'gsap';
import { Button } from '@/shared/components/ui/button';
import { type FoodItem } from '@/modules/inventory/constants/foods';

type FoodDetailModalProps = {
  item: FoodItem;
  isOpen: boolean;
  onClose: () => void;
};

const FoodDetailModal: React.FC<FoodDetailModalProps> = ({
  item,
  isOpen,
  onClose,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      const tl = gsap.timeline();

      // Animate overlay
      tl.fromTo(
        overlayRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: 'power2.out' },
      );

      // Animate modal (slide up)
      tl.fromTo(
        modalRef.current,
        { y: '100%', opacity: 0 },
        { y: '0%', opacity: 1, duration: 0.5, ease: 'back.out(1.2)' },
        '-=0.2',
      );
    }
  }, [isOpen]);

  const handleClose = () => {
    const tl = gsap.timeline({
      onComplete: onClose,
    });

    // Animate modal (slide down)
    tl.to(modalRef.current, {
      y: '100%',
      opacity: 0,
      duration: 0.3,
      ease: 'power2.in',
    });

    // Animate overlay
    tl.to(
      overlayRef.current,
      { opacity: 0, duration: 0.3, ease: 'power2.in' },
      '-=0.3',
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      {/* Backdrop */}
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal Content */}
      <div
        ref={modalRef}
        className="relative w-full max-w-md bg-white rounded-t-3xl overflow-hidden shadow-2xl"
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-0 translate-y-1/3 left-4 z-10 p-2 text-white/90 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Image Section */}
        <div className="relative h-36 w-full rounded-b-3xl overflow-hidden">
          <img {...item.img} className="w-full h-full object-cover" />
          <div className="absolute inset-0 backdrop-blur-md h-15" />
          <div className="absolute top-0 translate-y-1/2 left-1/2 -translate-x-1/2 text-white font-bold text-lg tracking-wider">
            {item.category}
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-neutral-900 tracking-wide">
              {item.name}
            </h2>
          </div>

          {/* Details List */}
          <div className="space-y-3 text-lg">
            {/* Status */}
            <div className="flex items-center justify-between border-gray-100">
              <span className="text-neutral-500 font-medium">食材狀態</span>
              <span className="px-3 py-1 bg-green-500 text-white text-sm font-medium rounded-full flex items-center gap-1">
                <Check className="w-3 h-3" />
                有庫存
              </span>
            </div>

            {/* Category */}
            <div className="flex items-center justify-between border-gray-100">
              <span className="text-neutral-500 font-medium">產品分類</span>
              <span className="text-neutral-900 font-medium">
                {item.category || '未分類'}
              </span>
            </div>

            {/* Quantity */}
            <div className="flex items-center justify-between">
              <span className="text-neutral-500 font-medium">單位數量</span>
              <span className="text-neutral-900 font-medium">
                {item.quantity} / {item.unit || '個'}
              </span>
            </div>
            <div className="w-full h-[1px] bg-gray-100" />

            {/* Dates */}
            <div className="flex flex-col gap-4 border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-neutral-500 font-medium block mb-1">
                  入庫日期
                </span>
                <span className="text-neutral-900 font-medium">
                  {item.addedAt}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-500 font-medium block mb-1">
                  保存期限
                </span>
                <span className="text-neutral-900 font-medium">約5天</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-neutral-500 font-medium">過期日期</span>
              <span className="text-neutral-900 font-medium">
                {item.expireAt}
              </span>
            </div>
            <div className="w-full h-[1px] bg-gray-100" />

            {/* Notes */}
            <div className="flex items-start justify-between">
              <span className="text-neutral-500 font-medium shrink-0">
                備註
              </span>
              <span className="text-neutral-900 font-medium text-right">
                {item.notes || '無'}
              </span>
            </div>
          </div>

          {/* Action Button */}
          <Button
            className="w-full bg-[#EE5D50] hover:bg-[#D94A3D] text-white rounded-xl h-12 text-base font-medium shadow-lg shadow-orange-200"
            onClick={() => {
              // TODO: Implement consume logic
              console.log('Consume item:', item.id);
            }}
          >
            確定消耗
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FoodDetailModal;
