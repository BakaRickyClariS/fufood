/**
 * Service Worker 更新提示元件
 * 當偵測到新版本時顯示更新按鈕
 */
import React, { useRef } from 'react';
import { createPortal } from 'react-dom';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

export type SWPromptProps = {
  onUpdate: () => void;
  onClose: () => void;
  show: boolean;
};

export const SWPrompt: React.FC<SWPromptProps> = ({
  onUpdate,
  onClose,
  show,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const { contextSafe } = useGSAP(
    () => {
      if (show) {
        const tl = gsap.timeline();

        tl.fromTo(
          overlayRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 0.3, ease: 'power2.out' },
        );

        tl.fromTo(
          modalRef.current,
          { y: 50, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.4, ease: 'back.out(1.2)' },
          '-=0.15',
        );
      }
    },
    { scope: containerRef, dependencies: [show] },
  );

  const handleClose = contextSafe(() => {
    const tl = gsap.timeline({
      onComplete: onClose,
    });

    tl.to(modalRef.current, {
      y: 30,
      opacity: 0,
      duration: 0.2,
      ease: 'power2.in',
    });

    tl.to(
      overlayRef.current,
      { opacity: 0, duration: 0.2, ease: 'power2.in' },
      '-=0.2',
    );
  });

  if (!show) return null;

  return createPortal(
    <div
      ref={containerRef}
      className="fixed inset-0 flex items-center justify-center z-110 px-6"
    >
      {/* Backdrop */}
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal Content */}
      <div
        ref={modalRef}
        className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="pt-8 pb-4 px-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-primary-100 rounded-full flex items-center justify-center">
            <RefreshCw className="w-8 h-8 text-primary-500" />
          </div>
          <h2 className="text-lg font-bold text-neutral-900">發現新版本 🎉</h2>
          <p className="mt-2 text-sm text-neutral-500">
            點擊更新以獲得最新功能與修復
          </p>
        </div>

        {/* Buttons */}
        <div className="px-6 pb-6 flex gap-3">
          <Button
            variant="outline"
            className="flex-1 h-12 rounded-xl text-neutral-600"
            onClick={handleClose}
          >
            稍後
          </Button>
          <Button
            className="flex-1 h-12 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-semibold"
            onClick={onUpdate}
          >
            <RefreshCw className="w-4 h-4 mr-1.5" />
            立即更新
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default SWPrompt;
