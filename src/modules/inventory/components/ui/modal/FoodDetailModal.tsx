import React, { useEffect, useRef } from 'react';
import { X, Check, AlertCircle, Clock, ShoppingCart, Ban, Bell, BellRing } from 'lucide-react';
import gsap from 'gsap';
import { useDispatch } from 'react-redux';
import { Button } from '@/shared/components/ui/button';
import type { FoodItem } from '@/modules/inventory/types';
import { useExpiryCheck } from '@/modules/inventory/hooks';
import { toggleLowStockAlert } from '@/modules/inventory/store/inventorySlice';

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
  const { status, daysUntilExpiry } = useExpiryCheck(item);
  const dispatch = useDispatch();

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

  const handleToggleAlert = () => {
    dispatch(toggleLowStockAlert(item.id));
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'expired':
        return (
          <span className="px-3 py-1 bg-red-500 text-white text-sm font-medium rounded-full flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            已過期
          </span>
        );
      case 'expiring-soon':
        return (
          <span className="px-3 py-1 bg-orange-500 text-white text-sm font-medium rounded-full flex items-center gap-1">
            <Clock className="w-3 h-3" />
            即將過期
          </span>
        );
      case 'low-stock':
        return (
          <span className="px-3 py-1 bg-yellow-500 text-white text-sm font-medium rounded-full flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            低庫存
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 bg-green-500 text-white text-sm font-medium rounded-full flex items-center gap-1">
            <Check className="w-3 h-3" />
            狀態良好
          </span>
        );
    }
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
        className="relative w-full max-w-md bg-white rounded-t-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]" // Added flex col and max-h
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-0 translate-y-1/3 left-4 z-10 p-2 text-white/90 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Image Section - Fixed height */}
        <div className="relative h-36 w-full shrink-0 overflow-hidden"> 
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 backdrop-blur-md h-15" />
          <div className="absolute top-0 translate-y-1/2 left-1/2 -translate-x-1/2 text-white font-bold text-lg tracking-wider">
            {item.category}
          </div>
        </div>

        {/* Content Section - Scrollable */}
        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-neutral-900 tracking-wide">
              {item.name}
            </h2>
            <button
              onClick={handleToggleAlert}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-colors ${
                item.lowStockAlert
                  ? 'bg-primary-50 text-primary-500' // Pinkish bg, red text
                  : 'bg-primary-50 text-primary-500 hover:bg-primary-100'
              }`}
            >
              {item.lowStockAlert ? (
                <>
                  <BellRing className="w-4 h-4 fill-current" />
                  已開啟低庫存通知
                </>
              ) : (
                <>
                  <Bell className="w-4 h-4" />
                  開啟低庫存通知
                </>
              )}
            </button>
          </div>

          {/* Details List */}
          <div className="space-y-3 text-lg">
            {/* Status */}
            <div className="flex items-center justify-between border-gray-100">
              <span className="text-neutral-500 font-medium">食材狀態</span>
              {getStatusBadge()}
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
            <div className="w-full h-px bg-gray-100" />

            {/* Dates */}
            <div className="flex flex-col gap-4 border-gray-100">
              <div className="flex items-center justify-between">
                <span className="text-neutral-500 font-medium block mb-1">
                  入庫日期
                </span>
                <span className="text-neutral-900 font-medium">
                  {item.purchaseDate}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-500 font-medium block mb-1">
                  剩餘天數
                </span>
                <span
                  className={`font-medium ${daysUntilExpiry < 0 ? 'text-red-500' : 'text-neutral-900'}`}
                >
                  {daysUntilExpiry < 0
                    ? `已過期 ${Math.abs(daysUntilExpiry)} 天`
                    : `約 ${daysUntilExpiry} 天`}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-neutral-500 font-medium">過期日期</span>
              <span className="text-neutral-900 font-medium">
                {item.expiryDate}
              </span>
            </div>
            <div className="w-full h-px bg-gray-100" />

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

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 pb-24"> {/* Increased padding to clear BottomNav */}
             <Button
              className="w-full bg-[#EE5D50] hover:bg-[#D94A3D] text-white rounded-xl h-12 text-base font-medium shadow-lg shadow-orange-200 flex items-center justify-center gap-2"
              onClick={() => {
                // TODO: Add to shopping list logic
                onClose();
              }}
            >
              <ShoppingCart className="w-5 h-5" />
              已消耗，加入採買清單
            </Button>
            
            <Button
              variant="outline"
              className="w-full border-gray-200 text-neutral-600 hover:bg-gray-50 rounded-xl h-12 text-base font-medium flex items-center justify-center gap-2"
               onClick={() => {
                // TODO: Just consume logic
                onClose();
              }}
            >
              <Ban className="w-5 h-5" />
              僅消耗，暫不採買
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodDetailModal;
