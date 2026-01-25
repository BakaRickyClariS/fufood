import { useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import type { CookingStep } from '@/modules/recipe/types';
import { CookingSteps } from '../ui/CookingSteps';

type CookingStepsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  steps: CookingStep[];
};

/** 下滑關閉閾值 */
const DRAG_THRESHOLD = 200;

/**
 * 烹煮方式 Modal（從下方彈出）
 * - 仿照 HomeModal 邏輯
 * - 使用 GSAP 實現從下方滑入/滑出動畫
 * - 使用 createPortal 確保 Modal 在最上層
 * - 支援下滑手勢關閉
 * - z-index 設定為 140 (高於 RecipeDetailModal 的 130)
 */
export const CookingStepsModal = ({
  isOpen,
  onClose,
  steps,
}: CookingStepsModalProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // 下滑關閉用
  const dragStartY = useRef<number | null>(null);

  // 鎖定背景滾動
  useEffect(() => {
    if (isOpen) {
      // 鎖定背景滾動
      document.body.style.overflow = 'hidden';
      // 避免與其他已鎖定的 Modal 衝突，這裡只做基本的 overflow 處理
      // 如果有多層 Modal，可能需要更複雜的鎖定管理，但目前先依循 HomeModal 模式
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // 使用 useGSAP 管理動畫
  const { contextSafe } = useGSAP(
    () => {
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
    },
    { scope: containerRef, dependencies: [isOpen] },
  );

  const handleClose = contextSafe(() => {
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
  });

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

  if (!isOpen) return null;

  return createPortal(
    <div
      ref={containerRef}
      className="fixed inset-0 flex items-end justify-center pointer-events-auto z-140"
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
        style={{ maxHeight: 'min(85vh, 600px)', touchAction: 'none' }}
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

        {/* Header */}
        <div className="px-6 pb-2 shrink-0">
          <h2 className="text-xl font-bold text-gray-900">烹煮方式</h2>
        </div>

        {/* Content - 可滾動區域 */}
        <div className="px-6 pb-8 overflow-y-auto flex-1 select-none">
          <CookingSteps steps={steps} />
        </div>
      </div>
    </div>,
    document.body,
  );
};
