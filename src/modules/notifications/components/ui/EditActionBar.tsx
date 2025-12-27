/**
 * 底部編輯操作欄元件
 */
import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

interface EditActionBarProps {
  selectedCount: number;
  onDelete: () => void;
  onMarkAsRead: () => void;
}

export const EditActionBar = ({
  selectedCount,
  onDelete,
  onMarkAsRead,
}: EditActionBarProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { y: 100, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.3, ease: 'back.out(1.2)' },
      );
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 transform"
    >
      <div className="flex bg-white rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.15)] overflow-hidden">
        <button
          onClick={onDelete}
          disabled={selectedCount === 0}
          className="px-8 py-3 bg-white text-gray-900 font-bold hover:bg-gray-50 disabled:opacity-50 transition-colors border-r border-gray-100 min-w-[100px]"
        >
          刪除
        </button>
        <button
          onClick={onMarkAsRead}
          disabled={selectedCount === 0}
          className="px-8 py-3 bg-[#F58274] text-white font-bold hover:bg-[#E67062] disabled:opacity-50 transition-colors min-w-[100px]"
        >
          已讀
        </button>
      </div>
    </div>
  );
};
