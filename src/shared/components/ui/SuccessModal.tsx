import React, { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import successImage from '@/assets/images/shared/storage-success.webp';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/shared/components/ui/dialog';

type SuccessModalProps = {
  /** 是否顯示 Modal */
  isOpen: boolean;
  /** 關閉 Modal 的回調 */
  onClose: () => void;
  /** 標題文字（預設：儲存成功！） */
  title?: string;
  /** 自動關閉時間（毫秒），設為 0 則不自動關閉 */
  autoCloseMs?: number;
};

/**
 * 通用儲存成功彈跳視窗
 * 使用專案 Design System (Radix Dialog) 和 useGSAP
 */
export const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  onClose,
  title = '儲存成功！',
  autoCloseMs = 1500,
}) => {
  const contentRef = useRef<HTMLDivElement>(null);

  // 進場動畫：使用 GSAP 的 Elastic 效果
  useGSAP(
    () => {
      if (isOpen && contentRef.current) {
        gsap.from(contentRef.current, {
          scale: 0.8,
          opacity: 0,
          duration: 0.4,
          ease: 'back.out(1.7)',
        });
      }
    },
    { dependencies: [isOpen], scope: contentRef },
  );

  // 自動關閉計時器
  React.useEffect(() => {
    if (isOpen && autoCloseMs > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseMs);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoCloseMs, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      {/* 
        使用 Design System 的 DialogContent
        !animate-none: 覆蓋預設的 CSS 動畫，改由 GSAP 控制
        min-w/max-w: 依照設計稿的尺寸限制
      */}
      <DialogContent
        ref={contentRef}
        className="!animate-none flex flex-col items-center justify-center p-8 rounded-2xl min-w-[200px] max-w-[280px] sm:rounded-2xl bg-white shadow-xl border-none outline-none"
      >
        <DialogTitle className="text-xl font-bold text-neutral-900 mb-6 text-center">
          {title}
        </DialogTitle>
        <div className="w-24 h-24">
          <img
            src={successImage}
            alt="Success"
            className="w-full h-full object-contain"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SuccessModal;
