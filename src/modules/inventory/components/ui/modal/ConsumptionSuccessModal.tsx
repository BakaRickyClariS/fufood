import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { ChevronLeft, ArrowRight } from 'lucide-react';
import type {
  ConsumptionItem,
  ConsumptionReason,
} from '@/modules/recipe/types';
import successImage from '@/assets/images/recipe/consumption-success.png';
// Mock data for recommendations or pass in? Using static for now as per design
// Need to check if these exist, or use placeholders.
// User didn't provide recipe images. I'll use placeholders or skip if not available.
// I'll check available images later, for now comment out or use safe imports if possible.
// Actually, I'll use a placeholder div or check what's available.
// The user "updated" specific images for consumption, but not recommendation.
// I will just use text or placeholders for recommendation to avoid breaking build.

type ItemWithReason = ConsumptionItem & {
  selectedReasons?: ConsumptionReason[];
};

type ConsumptionSuccessModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onBackToInventory: () => void;
  items: ItemWithReason[];
};

const REASON_LABELS: Record<string, string> = {
  duplicate: '重複購買',
  short_shelf: '保存時間太短',
  bought_too_much: '買太多',
  custom: '自訂',
};

export const ConsumptionSuccessModal: React.FC<
  ConsumptionSuccessModalProps
> = ({ isOpen, onClose, onBackToInventory, items }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && modalRef.current) {
      const tl = gsap.timeline();
      tl.fromTo(
        modalRef.current,
        { x: '100%' },
        { x: '0%', duration: 0.4, ease: 'power3.out' },
      );
    }
  }, [isOpen]);

  const handleClose = () => {
    // Usually back button would just close modal or go back.
    // "返回庫房" goes to inventory.
    if (modalRef.current) {
      gsap.to(modalRef.current, {
        x: '100%',
        duration: 0.3,
        ease: 'power3.in',
        onComplete: onClose,
      });
    } else {
      onClose();
    }
  };

  const handleBackToInventory = () => {
    if (modalRef.current) {
      gsap.to(modalRef.current, {
        x: '100%',
        duration: 0.3,
        ease: 'power3.in',
        onComplete: onBackToInventory,
      });
    } else {
      onBackToInventory();
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[120] flex justify-end pointer-events-none">
      <div
        ref={modalRef}
        className="w-full h-full bg-[#f6f6f6] pointer-events-auto overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white px-4 py-3 flex items-center justify-between shadow-sm">
          <button onClick={handleClose} className="p-1 -ml-1">
            <ChevronLeft size={24} className="text-neutral-900" />
          </button>
          <h1 className="text-lg font-bold text-neutral-900 absolute left-1/2 -translate-x-1/2">
            消耗完成
          </h1>
          <div className="w-8" />
        </div>

        {/* Content */}
        <div className="px-5 py-6 pb-24">
          {/* Success Section */}
          <div className="flex flex-col items-center mb-8">
            <h2 className="text-xl font-bold text-neutral-800 mb-4 tracking-wider">
              \ 食材消耗成功！/
            </h2>
            <div className="relative w-48 h-48">
              <img
                src={successImage}
                alt="Success"
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          {/* Result Section */}
          <div className="bg-white rounded-3xl p-5 shadow-sm mb-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-5 bg-[#EE5D50] rounded-full"></div>
              <h3 className="font-bold text-neutral-900 text-base">
                食材消耗結果
              </h3>
            </div>

            <div className="space-y-4">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="border-b border-gray-100 last:border-0 pb-4 last:pb-0"
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="font-bold text-neutral-900 text-base">
                      {item.ingredientName}
                    </div>
                    <div className="font-bold text-neutral-900 text-base">
                      {item.consumedQuantity}
                      {item.unit}
                    </div>
                  </div>
                  {item.selectedReasons && item.selectedReasons.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {item.selectedReasons.map((r) => (
                        <span
                          key={r}
                          className="px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-xs font-medium"
                        >
                          {REASON_LABELS[r] || '自訂'}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleBackToInventory}
            className="w-full bg-white border border-gray-200 text-neutral-800 font-bold py-3.5 rounded-xl text-base mb-8"
          >
            返回庫房
          </button>

          {/* Recommendation - Placeholder */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-neutral-900">
                你可能會喜歡...
              </h3>
              <button className="p-2 rounded-full hover:bg-gray-100">
                <ArrowRight size={20} className="text-neutral-400" />
              </button>
            </div>
            {/* Mock Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="relative rounded-2xl overflow-hidden aspect-[4/5] bg-gray-200">
                <div className="absolute top-2 left-2 bg-[#EE5D50] text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                  熱門
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-3 left-3 text-white">
                  <div className="text-xs bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-md inline-block mb-1">
                    甜品
                  </div>
                  <div className="font-bold text-sm mb-1">莓果巴斯克蛋糕</div>
                  <div className="text-[10px] opacity-90">
                    👤 6人份 🕒 30分鐘
                  </div>
                </div>
              </div>
              <div className="relative rounded-2xl overflow-hidden aspect-[4/5] bg-gray-200">
                <div className="absolute top-2 left-2 bg-[#EE5D50] text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                  熱門
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                <div className="absolute bottom-3 left-3 text-white">
                  <div className="text-xs bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-md inline-block mb-1">
                    中式
                  </div>
                  <div className="font-bold text-sm mb-1">汕頭牛肉火鍋</div>
                  <div className="text-[10px] opacity-90">
                    👤 6人份 🕒 30分鐘
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};
