import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { ChevronLeft, Package, Camera } from 'lucide-react';
import successImage from '@/assets/images/food-scan/result.png';

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
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && modalRef.current) {
      gsap.fromTo(
        modalRef.current,
        { x: '100%' },
        { x: '0%', duration: 0.4, ease: 'power3.out' },
      );
    }
  }, [isOpen]);

  const handleClose = (callback: () => void) => {
    if (modalRef.current) {
      gsap.to(modalRef.current, {
        x: '100%',
        duration: 0.3,
        ease: 'power3.in',
        onComplete: callback,
      });
    } else {
      callback();
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-120 flex justify-end pointer-events-none">
      <div
        ref={modalRef}
        className="w-full h-full bg-[#f6f6f6] pointer-events-auto overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white px-4 py-3 flex items-center justify-between shadow-sm">
          <button
            onClick={() => handleClose(onViewInventory)}
            className="p-1 -ml-1"
          >
            <ChevronLeft size={24} className="text-neutral-900" />
          </button>
          <h1 className="text-lg font-bold text-neutral-900 absolute left-1/2 -translate-x-1/2">
            入庫完成
          </h1>
          <div className="w-8" />
        </div>

        {/* Content */}
        <div className="px-5 py-6 pb-24">
          {/* Success Section */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative w-48 h-48">
              <img
                src={successImage}
                alt="Success"
                className="w-full h-full object-contain"
              />
            </div>
            <h2 className="text-2xl font-bold text-neutral-900 mt-4">
              入庫成功！
            </h2>
            <p className="text-neutral-500 mt-2">
              已成功將{' '}
              <span className="font-bold text-primary-500">{itemCount}</span>{' '}
              項食材加入庫存
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => handleClose(onViewInventory)}
              className="w-full bg-red-500 text-white font-bold py-3.5 rounded-xl text-base shadow-lg shadow-red-500/20 flex items-center justify-center gap-2"
            >
              <Package size={20} />
              前往查看庫存
            </button>
            <button
              onClick={() => handleClose(onContinueScan)}
              className="w-full bg-white border border-gray-200 text-neutral-800 font-bold py-3.5 rounded-xl text-base flex items-center justify-center gap-2"
            >
              <Camera size={20} />
              繼續入庫
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};
