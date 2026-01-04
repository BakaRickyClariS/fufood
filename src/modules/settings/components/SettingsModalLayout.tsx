import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { ChevronLeft } from 'lucide-react';
import { cn } from '@/shared/utils/styleUtils';

type SettingsModalLayoutProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
};

export type SettingsModalLayoutRef = {
  close: () => void;
};

/**
 * 設定頁面專用的全螢幕 Modal Layout
 * 模仿 FoodDetailModal 的 GSAP 動畫與 Portal 行為
 * 支援透過 ref 呼叫 close() 觸發滑出動畫
 */
export const SettingsModalLayout = forwardRef<SettingsModalLayoutRef, SettingsModalLayoutProps>(({
  isOpen,
  onClose,
  title,
  children,
  className,
}, ref) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // GSAP 進場動畫
  useEffect(() => {
    if (isOpen && modalRef.current) {
      const tl = gsap.timeline();
      // 從右側滑入
      tl.fromTo(
        modalRef.current,
        { x: '100%' },
        { x: '0%', duration: 0.4, ease: 'power3.out' }
      );
    }
  }, [isOpen]);

  const handleClose = () => {
    if (modalRef.current) {
      const tl = gsap.timeline({
        onComplete: onClose,
      });
      // 向右滑出
      tl.to(modalRef.current, {
        x: '100%',
        duration: 0.3,
        ease: 'power3.in',
      });
    } else {
      onClose();
    }
  };

  // 暴露 close 方法給父層使用
  useImperativeHandle(ref, () => ({
    close: handleClose
  }));

  if (!isOpen) return null;

  return createPortal(
    <div
      ref={modalRef}
      className="fixed inset-0 z-[100] bg-neutral-100 flex flex-col"
    >
      {/* Header */}
      <div className="bg-white px-4 py-3 flex items-center shadow-sm sticky top-0 z-10 shrink-0">
        <button 
          onClick={handleClose} 
          className="p-1 -ml-1 text-neutral-700 hover:bg-neutral-50 rounded-full transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="absolute left-1/2 -translate-x-1/2 text-lg font-bold text-neutral-900">
          {title}
        </h1>
      </div>

      {/* Main Content */}
      <div className={cn("flex-1 overflow-y-auto w-full", className)}>
        {children}
      </div>
    </div>,
    document.body
  );
});

SettingsModalLayout.displayName = 'SettingsModalLayout';

export default SettingsModalLayout;
