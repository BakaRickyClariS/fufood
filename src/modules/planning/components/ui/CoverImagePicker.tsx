import { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { COVER_IMAGES } from '@/modules/planning/constants/coverImages';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useBodyScrollLock } from '@/shared/hooks/useBodyScrollLock';

type CoverImagePickerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedImage: string;
  onSelect: (image: string) => void;
};

/** 下滑關閉閾值 */
const DRAG_THRESHOLD = 200;

export const CoverImagePicker = ({
  open,
  onOpenChange,
  selectedImage,
  onSelect,
}: CoverImagePickerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const [tempSelected, setTempSelected] = useState(selectedImage);

  // 下滑關閉用
  const dragStartY = useRef<number | null>(null);

  // 鎖定背景滾動
  useBodyScrollLock(open);

  // 初始化選擇狀態
  useEffect(() => {
    if (open) {
      setTempSelected(selectedImage);
    }
  }, [open, selectedImage]);

  // 使用 useGSAP 管理動畫
  const { contextSafe } = useGSAP(
    () => {
      if (open) {
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
    },
    { scope: containerRef, dependencies: [open] },
  );

  const handleClose = contextSafe(() => {
    const tl = gsap.timeline({
      onComplete: () => {
        onOpenChange(false);
      },
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
  });

  const handleApply = () => {
    onSelect(tempSelected);
    handleClose();
  };

  // 下滑關閉 - Touch Events
  const handleTouchStart = contextSafe((e: React.TouchEvent) => {
    dragStartY.current = e.touches[0].clientY;
  });

  const handleTouchMove = contextSafe((e: React.TouchEvent) => {
    if (dragStartY.current === null || !modalRef.current) return;

    const deltaY = e.touches[0].clientY - dragStartY.current;
    if (deltaY > 0) {
      gsap.set(modalRef.current, { y: deltaY });
    }
  });

  const handleTouchEnd = contextSafe((e: React.TouchEvent) => {
    if (dragStartY.current === null || !modalRef.current) return;

    const deltaY = e.changedTouches[0].clientY - dragStartY.current;

    if (deltaY > DRAG_THRESHOLD) {
      handleClose();
    } else {
      gsap.to(modalRef.current, {
        y: 0,
        duration: 0.3,
        ease: 'power2.out',
      });
    }

    dragStartY.current = null;
  });

  if (!open) return null;

  return createPortal(
    <div
      ref={containerRef}
      className="fixed inset-0 flex items-end pointer-events-auto z-110"
    >
      {/* Backdrop */}
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal Content */}
      <div
        ref={modalRef}
        className="relative w-full bg-white max-w-layout-container mx-auto rounded-t-3xl overflow-hidden flex flex-col shadow-2xl"
        style={{ maxHeight: 'min(60vh, 600px)', touchAction: 'none' }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* 下滑提示條 */}
        <div
          className="flex justify-center py-3 shrink-0"
          style={{ touchAction: 'none' }}
        >
          <div className="w-10 h-1 bg-neutral-300 rounded-full" />
        </div>

        {/* Content - 可滾動區域 */}
        <div className="px-6 pb-6 overflow-y-auto flex-1 select-none">
          {/* Header */}
          <div className="flex items-center gap-2 mb-6">
            <div className="w-1 h-6 bg-primary-500 rounded-full" />
            <h2 className="text-lg font-bold text-neutral-800">選擇圖庫照片</h2>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {COVER_IMAGES.map((img: string, index: number) => {
              const isSelected = tempSelected === img;
              return (
                <div
                  key={index}
                  onClick={() => setTempSelected(img)}
                  className={cn(
                    'relative aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-all',
                    isSelected ? 'border-primary-500' : 'border-transparent',
                  )}
                >
                  <img
                    src={img}
                    alt={`Cover ${index}`}
                    className="w-full h-full object-cover"
                  />
                  {isSelected && (
                    <div className="absolute top-2 left-2 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center shadow-sm">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 按鈕固定在底部 */}
        <div className="shrink-0 px-6 py-4 bg-white border-t border-neutral-100">
          <Button
            className="w-full bg-primary-500 hover:bg-primary-600 text-white rounded-xl h-14 text-base font-semibold"
            onClick={handleApply}
          >
            套用
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
};
