import { useRef, useEffect } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { X } from 'lucide-react';

type LayoutAppliedNotificationProps = {
  autoHide?: boolean;
  duration?: number;
  onClose: () => void;
};

const LayoutAppliedNotification = ({
  autoHide = false,
  duration = 60000,
  onClose,
}: LayoutAppliedNotificationProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  // 進場動畫
  useGSAP(
    () => {
      if (notificationRef.current) {
        gsap.fromTo(
          notificationRef.current,
          { y: -50, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.4, ease: 'power2.out' }
        );
      }
    },
    { scope: containerRef }
  );

  // 自動隱藏計時器
  useEffect(() => {
    if (autoHide && duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [autoHide, duration]);

  // 離場動畫
  const handleClose = () => {
    if (notificationRef.current) {
      gsap.to(notificationRef.current, {
        y: -50,
        opacity: 0,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => onClose(),
      });
    }
  };

  return (
    <div ref={containerRef} className="fixed top-32 left-4 right-4 z-50 max-w-layout-container mx-auto">
      <div
        ref={notificationRef}
        className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-success-200/50 backdrop-blur-md"
      >
        {/* 左側：更換成功標籤 + 訊息 */}
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 bg-success-400 text-white text-[14px] font-medium rounded-md whitespace-nowrap">
            更換成功
          </span>
          <span className="text-success-700 text-[14px]">已套用新版面</span>
        </div>

        {/* 右側：關閉按鈕 */}
        <button
          onClick={handleClose}
          className="p-1 hover:bg-success-300/30 rounded-full transition-colors"
          aria-label="關閉通知"
        >
          <X size={16} className="text-success-700" />
        </button>
      </div>
    </div>
  );
};

export default LayoutAppliedNotification;
