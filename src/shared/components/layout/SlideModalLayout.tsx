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

export type SlideModalLayoutProps = {
  isOpen: boolean;
  onClose: () => void;
  /** 標題，若為空則不顯示 Header */
  title?: string;
  children: React.ReactNode;
  /** 自訂 className 用於主內容區域 */
  className?: string;
  /** 底部固定區域內容（如按鈕） */
  footer?: React.ReactNode;
  /** 是否顯示預設 Header，預設 true */
  showHeader?: boolean;
  /** 自訂 Header 內容（完全覆蓋預設 Header） */
  customHeader?: React.ReactNode;
  /** 是否使用半透明背景（用於覆蓋式 Modal） */
  hasBackdrop?: boolean;
  /** 自訂 z-index（預設 100） */
  zIndex?: number;
  /** 背景顏色 className（預設 bg-neutral-100） */
  bgClassName?: string;
  /** 內部滾動容器的 ref（供父層取得滾動位置） */
  scrollRef?: React.RefObject<HTMLDivElement | null>;
};

export type SlideModalLayoutRef = {
  close: () => void;
};

/**
 * 通用滑動 Modal Layout
 * - 從右側滑入/滑出的 GSAP 動畫
 * - 使用 Portal 渲染到 document.body
 * - 支援透過 ref 呼叫 close() 觸發滑出動畫
 * - 可自訂 Header、Footer、背景色等
 */
export const SlideModalLayout = forwardRef<
  SlideModalLayoutRef,
  SlideModalLayoutProps
>(
  (
    {
      isOpen,
      onClose,
      title,
      children,
      className,
      footer,
      showHeader = true,
      customHeader,
      hasBackdrop = false,
      zIndex = 100,
      bgClassName = 'bg-neutral-100',
      scrollRef,
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
          className={cn(
            'fixed top-0 bottom-0 left-0 right-0 max-w-layout-container mx-auto flex flex-col',
            bgClassName,
          )}
          style={{ zIndex }}
        >
          {/* Header */}
          {customHeader
            ? customHeader
            : showHeader && (
                <div className="bg-white px-4 py-3 flex items-center shadow-sm sticky top-0 z-10 shrink-0">
                  <button
                    onClick={handleClose}
                    className="p-1 -ml-1 text-neutral-700 hover:bg-neutral-50 rounded-full transition-colors"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  {title && (
                    <h1 className="absolute left-1/2 -translate-x-1/2 text-lg font-bold text-neutral-900">
                      {title}
                    </h1>
                  )}
                </div>
              )}

          {/* Main Content */}
          <div
            ref={scrollRef}
            className={cn('flex-1 overflow-y-auto w-full', className)}
          >
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

SlideModalLayout.displayName = 'SlideModalLayout';

export default SlideModalLayout;
