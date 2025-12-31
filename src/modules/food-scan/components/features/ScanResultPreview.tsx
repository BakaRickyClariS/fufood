import React, { useRef, useEffect, useState } from 'react';
import {
  ChefHat,
  ChevronLeft,
  ChevronRight,
  Trash2,
  CheckCheck,
} from 'lucide-react';
import gsap from 'gsap';
import type { FoodItemInput } from '../../types';
import { calculateShelfLife } from '../../utils/dateHelpers';
import resultDecoration from '@/assets/images/food-scan/result.png';
import { InfoTooltip } from '@/shared/components/feedback/InfoTooltip';
import { categories } from '@/modules/inventory/constants/categories';

type ScanResultPreviewProps = {
  result: FoodItemInput;
  imageUrl: string;
  onEdit: () => void;
  onConfirm: () => void;
  onBack?: () => void;
  onDelete?: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  onConfirmAll?: () => void;
  submitStatus?: 'idle' | 'submitting' | 'completed';
  currentIndex?: number;
  totalCount?: number;
};

type DetailRowProps = {
  label: string;
  value: string | number;
  tooltip?: React.ReactNode;
};

const DetailRow: React.FC<DetailRowProps> = ({ label, value, tooltip }) => (
  <div className="flex justify-between items-center py-2">
    <span className="text-slate-500 font-medium flex items-center gap-1">
      {label}
      {tooltip && <InfoTooltip content={tooltip} />}
    </span>
    <span className="text-slate-800 font-bold">{value}</span>
  </div>
);

const Divider: React.FC = () => (
  <div className="w-full h-px bg-gray-100 my-2" />
);

export const ScanResultPreview: React.FC<ScanResultPreviewProps> = ({
  result,
  imageUrl,
  onEdit,
  onConfirm,
  onBack,
  onDelete,
  onPrev,
  onNext,
  onConfirmAll,
  submitStatus = 'idle',
  currentIndex,
  totalCount,
}) => {
  const contentRef = useRef<HTMLDivElement>(null);

  // Touch swipe state
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // 計算保存期限
  const shelfLifeDays = calculateShelfLife(
    result.purchaseDate,
    result.expiryDate,
  );

  const isBatchMode = totalCount && totalCount > 1;
  const canGoPrev = currentIndex !== undefined && currentIndex > 1;
  const canGoNext =
    currentIndex !== undefined &&
    totalCount !== undefined &&
    currentIndex < totalCount;

  // Minimum swipe distance required (in px)
  const minSwipeDistance = 50;

  // Touch handlers for swipe
  const onTouchStart = (e: React.TouchEvent) => {
    if (submitStatus !== 'idle') return;
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setIsDragging(true);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    setTouchEnd(e.targetTouches[0].clientX);

    // Apply drag transform in real-time
    if (contentRef.current && touchStart !== null) {
      const currentX = e.targetTouches[0].clientX;
      const diff = currentX - touchStart;
      // Limit drag distance and add resistance
      const limitedDiff = Math.sign(diff) * Math.min(Math.abs(diff) * 0.5, 100);
      gsap.set(contentRef.current, { x: limitedDiff });
    }
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) {
      // Reset position if no valid swipe
      if (contentRef.current) {
        gsap.to(contentRef.current, { x: 0, duration: 0.2 });
      }
      setIsDragging(false);
      return;
    }

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && canGoNext && onNext) {
      // Animate out to the left, then trigger navigation
      if (contentRef.current) {
        gsap.to(contentRef.current, {
          x: -window.innerWidth * 0.3,
          duration: 0.15,
          ease: 'power2.in',
          onComplete: () => {
            onNext();
          },
        });
      } else {
        onNext();
      }
    } else if (isRightSwipe && canGoPrev && onPrev) {
      // Animate out to the right, then trigger navigation
      if (contentRef.current) {
        gsap.to(contentRef.current, {
          x: window.innerWidth * 0.3,
          duration: 0.15,
          ease: 'power2.in',
          onComplete: () => {
            onPrev();
          },
        });
      } else {
        onPrev();
      }
    } else {
      // Snap back to original position
      if (contentRef.current) {
        gsap.to(contentRef.current, {
          x: 0,
          duration: 0.2,
          ease: 'power2.out',
        });
      }
    }

    setIsDragging(false);
    setTouchStart(null);
    setTouchEnd(null);
  };

  // GSAP slide animation when content changes (enter animation)
  // Using result.productName as trigger since currentIndex doesn't change when item is removed
  const prevProductRef = useRef(result.productName);

  useEffect(() => {
    if (contentRef.current && prevProductRef.current !== result.productName) {
      // Slide in from the right
      gsap.fromTo(
        contentRef.current,
        { x: window.innerWidth * 0.3, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.25, ease: 'power2.out' },
      );
    }
    prevProductRef.current = result.productName;
  }, [result.productName]);

  // Slide-out animation when item is confirmed (completed state)
  useEffect(() => {
    if (submitStatus === 'completed' && contentRef.current && isBatchMode) {
      // Animate slide-out to the left
      gsap.to(contentRef.current, {
        x: -window.innerWidth * 0.5,
        opacity: 0,
        duration: 0.4,
        delay: 0.3, // Short delay to show "歸納完成" state
        ease: 'power2.in',
      });
    }
  }, [submitStatus, isBatchMode]);

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      {/* Header with Back Button */}
      <div className="bg-white p-4 shadow-sm sticky top-0 z-10 flex items-center">
        {onBack && (
          <button onClick={onBack} className="p-1 -ml-1 mr-2">
            <ChevronLeft size={24} className="text-slate-800" />
          </button>
        )}
        <h1 className="flex-1 text-center text-lg font-bold text-slate-800">
          掃描結果
        </h1>
        {onBack && <div className="w-8" />}
      </div>

      {/* Swipeable Content Area */}
      <div
        ref={contentRef}
        className="overflow-y-auto"
        style={{
          touchAction: isBatchMode ? 'pan-y' : 'auto',
          willChange: isBatchMode ? 'transform' : 'auto',
        }}
        onTouchStart={isBatchMode ? onTouchStart : undefined}
        onTouchMove={isBatchMode ? onTouchMove : undefined}
        onTouchEnd={isBatchMode ? onTouchEnd : undefined}
      >
        {/* 頂部裝飾圖片 - result.png */}
        <div className="relative w-full">
          <img
            src={resultDecoration}
            alt="Result decoration"
            className="w-full h-auto object-cover"
          />

          {/* 刪除項目按鈕 - 位於圖片右下角 (只在批次模式顯示) */}
          {isBatchMode && onDelete && (
            <button
              onClick={onDelete}
              className="absolute bottom-4 right-6 text-red-500 font-medium flex items-center gap-1 text-sm bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-sm transition-opacity hover:bg-white"
            >
              <Trash2 size={16} />
              刪除項目
            </button>
          )}
        </div>

        {/* 內容區域 */}
        <div
          className={`px-6 ${onDelete ? '-mt-4' : '-mt-12'} relative z-10 pb-6`}
        >
          {/* 產品名稱區塊 - 修改佈局：圖片在右側 */}
          <div className="bg-white rounded-2xl p-4 mb-4 flex items-center justify-between shadow-sm">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-1 h-5 bg-red-500 rounded-full"></div>
                <p className="text-xs text-slate-500 font-medium">辨識產品名</p>
              </div>
              <h2 className="text-xl font-bold text-slate-800">
                {result.productName}
              </h2>
            </div>

            {/* 產品小圖 (右側) */}
            <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-slate-100 shrink-0 shadow-sm">
              <img
                src={imageUrl}
                className="w-full h-full object-cover"
                alt="Product Thumbnail"
              />
            </div>
          </div>

          {/* 詳細說明 */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-5 bg-red-500 rounded-full"></div>
              <h3 className="font-bold text-slate-800">詳細說明</h3>
            </div>

            <div className="space-y-1">
              <DetailRow
                label="產品分類"
                value={
                  categories.find((c) => c.id === result.category)?.title ||
                  result.category
                }
              />
              <DetailRow
                label="產品屬性"
                value={
                  Array.isArray(result.attributes)
                    ? result.attributes.join('、')
                    : result.attributes
                }
              />
              <DetailRow
                label="單位數量"
                value={`${result.purchaseQuantity} / ${result.unit}`}
                tooltip={
                  <>
                    表示此食材的剛存數量與計量單位。
                    <br />
                    <br />
                    例如：「3 / 個」表示有 3 個該食材。
                  </>
                }
              />

              <Divider />

              <DetailRow label="入庫日期" value={result.purchaseDate} />
              <DetailRow
                label="保存期限"
                value={`約${shelfLifeDays}天`}
                tooltip={<>根據入庫日期與過期日期自動計算的預估保存天數。</>}
              />
              <DetailRow label="過期日期" value={result.expiryDate} />

              <Divider />

              <DetailRow
                label="備註"
                value={result.notes || '-'}
                tooltip={<>可註記該食材的特殊資訊，如保存方式或購買來源等。</>}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Bottom Area - Buttons */}
      <div className="px-4 py-4 bg-gray-50">
        {/* 批次模式頁面指示器 - 只有箭頭圖示，不可點擊 */}
        {isBatchMode && (
          <div className="flex items-center justify-center gap-4 mb-3">
            <span
              className={`text-slate-300 ${canGoPrev ? 'text-slate-400' : ''}`}
            >
              <ChevronLeft size={24} />
            </span>
            <div className="text-slate-500 font-medium">
              <span className="text-slate-800 font-bold text-xl">
                {currentIndex}
              </span>
              <span className="text-lg"> / {totalCount}</span>
            </div>
            <span
              className={`text-slate-300 ${canGoNext ? 'text-slate-400' : ''}`}
            >
              <ChevronRight size={24} />
            </span>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <button
            onClick={onEdit}
            disabled={submitStatus !== 'idle'}
            className="w-full bg-primary-500 hover:bg-primary-600 text-white py-3.5 rounded-xl font-bold transition-colors shadow-lg shadow-primary-500/20 disabled:opacity-50"
          >
            編輯草稿
          </button>
          <button
            onClick={onConfirm}
            disabled={submitStatus !== 'idle'}
            className="w-full bg-white border-2 border-slate-100 text-slate-800 hover:bg-slate-50 py-3.5 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
          >
            <ChefHat size={20} />
            {submitStatus === 'submitting'
              ? '送出中...'
              : submitStatus === 'completed'
                ? '歸納完成'
                : '確認歸納'}
          </button>

          {/* 一鍵歸納全部按鈕 - 只在批次模式顯示 */}
          {isBatchMode && onConfirmAll && (
            <button
              onClick={onConfirmAll}
              disabled={submitStatus !== 'idle'}
              className="w-full bg-white border-2 border-slate-100 text-slate-800 hover:bg-slate-50 py-3.5 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              <CheckCheck size={20} />
              一鍵歸納全部
            </button>
          )}
        </div>
      </div>

      {/* 底部留白，確保不被 Bottom Navigation 遮擋 */}
      <div className="h-20"></div>
    </div>
  );
};
