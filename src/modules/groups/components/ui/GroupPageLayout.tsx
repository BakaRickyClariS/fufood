import React, {
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { ChevronLeft } from 'lucide-react';
import { cn } from '@/shared/utils/styleUtils';

type GroupPageLayoutProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
  /** 底部固定區域內容（如按鈕） */
  footer?: React.ReactNode;
  /** 是否使用半透明背景（用於覆蓋式 Modal） */
  hasBackdrop?: boolean;
  /** 自訂 z-index（預設 100） */
  zIndex?: number;
};

export type GroupPageLayoutRef = {
  close: () => void;
};

/**
 * 群組模組專用的全螢幕 Modal Layout
 * 仿 SettingsModalLayout 的 GSAP 動畫（從右側滑入/滑出）
 * 支援透過 ref 呼叫 close() 觸發滑出動畫
 */
export const GroupPageLayout = forwardRef<
  GroupPageLayoutRef,
  GroupPageLayoutProps
>(
  (
    {
      isOpen,
      onClose,
      title,
      children,
      className,
      footer,
      hasBackdrop = false,
      zIndex = 100,
    },
    ref,
  ) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const backdropRef = useRef<HTMLDivElement>(null);
    const hasAnimatedRef = useRef(false);

    // GSAP 進場動畫
    useEffect(() => {
      if (isOpen && modalRef.current && !hasAnimatedRef.current) {
        hasAnimatedRef.current = true;
        const tl = gsap.timeline();

        // 如果有 backdrop，先淡入
        if (hasBackdrop && backdropRef.current) {
          tl.fromTo(
            backdropRef.current,
            { opacity: 0 },
            { opacity: 1, duration: 0.3, ease: 'power2.out' },
          );
        }

        // 從右側滑入
        tl.fromTo(
          modalRef.current,
          { x: '100%' },
          { x: '0%', duration: 0.4, ease: 'power3.out' },
          hasBackdrop ? '-=0.2' : 0,
        );
      } else if (!isOpen) {
        hasAnimatedRef.current = false;
      }
    }, [isOpen, hasBackdrop]);

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

        // 如果有 backdrop，淡出
        if (hasBackdrop && backdropRef.current) {
          tl.to(
            backdropRef.current,
            { opacity: 0, duration: 0.3, ease: 'power2.in' },
            '-=0.3',
          );
        }
      } else {
        onClose();
      }
    };

    // 暴露 close 方法給父層使用
    useImperativeHandle(ref, () => ({
      close: handleClose,
    }));

    if (!isOpen) return null;

    return createPortal(
      <>
        {/* Backdrop（可選） */}
        {hasBackdrop && (
          <div
            ref={backdropRef}
            className="fixed inset-0 bg-black/40"
            style={{ zIndex: zIndex - 1 }}
            onClick={handleClose}
          />
        )}

        {/* Modal 主體 */}
        <div
          ref={modalRef}
          className="fixed inset-0 bg-neutral-100 flex flex-col"
          style={{ zIndex }}
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
          <div className={cn('flex-1 overflow-y-auto w-full', className)}>
            {children}
          </div>

          {/* Footer（可選） */}
          {footer && (
            <div className="shrink-0 px-4 py-4 bg-white border-t border-neutral-100">
              {footer}
            </div>
          )}
        </div>
      </>,
      document.body,
    );
  },
);

GroupPageLayout.displayName = 'GroupPageLayout';

export default GroupPageLayout;
