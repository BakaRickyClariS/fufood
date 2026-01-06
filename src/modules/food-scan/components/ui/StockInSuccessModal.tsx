import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { X } from 'lucide-react';
import successImage from '@/assets/images/food-scan/inventory-success.webp';

type StockInSuccessModalProps = {
  isOpen: boolean;
  onViewInventory: () => void;
  onContinueScan: () => void;
  itemCount: number;
};

export const StockInSuccessModal: React.FC<StockInSuccessModalProps> = ({
  isOpen,
  onViewInventory,
  onContinueScan,
  itemCount,
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // 鎖定背景滾動
  useEffect(() => {
    if (isOpen) {
      // 儲存原始 overflow 值
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      // 清理函式：恢復滾動
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && modalRef.current && overlayRef.current) {
      // 背景淡入
      gsap.fromTo(
        overlayRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3, ease: 'power2.out' },
      );
      // Modal 彈跳動畫
      gsap.fromTo(
        modalRef.current,
        { scale: 0.8, opacity: 0, y: 20 },
        { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: 'back.out(1.7)' },
      );
    }
  }, [isOpen]);

  const handleClose = (callback: () => void) => {
    if (modalRef.current && overlayRef.current) {
      gsap.to(overlayRef.current, {
        opacity: 0,
        duration: 0.2,
        ease: 'power2.in',
      });
      gsap.to(modalRef.current, {
        scale: 0.9,
        opacity: 0,
        duration: 0.2,
        ease: 'power2.in',
        onComplete: callback,
      });
    } else {
      callback();
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      ref={overlayRef}
      className="fixed inset-0 z-120 flex items-center justify-center bg-black/50 px-6"
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* 關閉按鈕 */}
        <button
          onClick={() => handleClose(onContinueScan)}
          className="absolute top-4 left-4 p-1 text-neutral-600 hover:text-neutral-800 transition-colors z-10"
          aria-label="關閉"
        >
          <X size={24} />
        </button>

        {/* 內容區域 */}
        <div className="px-8 pt-12 pb-8 flex flex-col items-center">
          {/* 冰箱插圖 */}
          <div className="w-48 h-48 my-4">
            <img
              src={successImage}
              alt="入庫成功"
              className="w-full h-full object-contain scale-125"
            />
          </div>

          {/* 項目計數 */}
          <p className="text-neutral-500 text-sm mb-6">
            已將{' '}
            <span className="font-bold text-primary-500">{itemCount}</span>{' '}
            項加入庫存
          </p>

          {/* 按鈕區域 */}
          <div className="w-full flex gap-2">
            {/* 繼續入庫 - 白色邊框按鈕 */}
            <button
              onClick={() => handleClose(onContinueScan)}
              className="flex-1 py-4 px-4 border-2 border-neutral-300 rounded-2xl text-neutral-700 font-semibold text-base hover:bg-neutral-50 transition-colors"
            >
              繼續入庫
            </button>

            {/* 查看庫房 - 橘色實心按鈕 */}
            <button
              onClick={() => handleClose(onViewInventory)}
              className="flex-1 py-4 px-4 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-2xl text-base transition-colors shadow-lg shadow-[#f58274]/30"
            >
              查看庫房
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};

