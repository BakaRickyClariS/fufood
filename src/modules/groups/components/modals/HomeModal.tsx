import { useRef } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/shared/components/ui/button';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import type { GroupMember } from '../../types/group.types';
import { useBodyScrollLock } from '@/shared/hooks/useBodyScrollLock';

type HomeModalProps = {
  isOpen: boolean;
  onClose: () => void;
  currentUser: {
    name: string;
    avatar: string;
    role: string;
  };
  members: GroupMember[];
  onEditMembers: () => void;
};

/** 下滑關閉閾值 */
const DRAG_THRESHOLD = 200;

/**
 * Home 選單 Modal（從下方彈出）
 * - 使用 GSAP 實現從下方滑入/滑出動畫
 * - 使用 createPortal 確保 Modal 在最上層
 * - 支援下滑手勢關閉
 * - 顯示當前使用者資訊與群組成員列表
 */
export const HomeModal = ({
  isOpen,
  onClose,
  currentUser,
  members,
  onEditMembers,
}: HomeModalProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // 下滑關閉用
  const dragStartY = useRef<number | null>(null);

  // 鎖定背景滾動
  useBodyScrollLock(isOpen);

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
        style={{ maxHeight: 'min(60vh, 700px)', touchAction: 'none' }}
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
        <div className="px-6 space-y-4 overflow-y-auto flex-1 select-none">
          {/* Current User Info */}
          <div className="flex items-center gap-4 py-2 border-b border-neutral-100 pb-4">
            <div className="w-14 h-14 rounded-full overflow-hidden border border-neutral-300 shrink-0">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-primary-400 flex items-center gap-1">
                {currentUser.name}
                <span className="text-primary-400 text-xs font-semibold">
                  （你）
                </span>
              </span>
              {currentUser.role === 'owner' && (
                <span className="text-[10px] text-white font-semibold bg-primary-400 px-2 py-1 rounded-full w-fit">
                  擁有者
                </span>
              )}
            </div>
          </div>

          {/* Other Members */}
          <div className="flex flex-col">
            {members
              .filter((m) => m.name !== currentUser.name) // Filter out current user if in list
              .map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-4 py-4 border-b border-neutral-100 last:border-0"
                >
                  <div className="w-14 h-14 rounded-full overflow-hidden border border-neutral-300 shrink-0">
                    <img
                      src={member.avatar || ''} // Handle potential undefined avatar
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-neutral-700">
                      {member.name}
                    </span>
                    {member.role === 'owner' && (
                      <span className="text-[10px] text-white font-semibold bg-primary-400 px-2 py-1 rounded-full w-fit">
                        擁有者
                      </span>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* 按鈕固定在底部 */}
        <div className="shrink-0 px-6 py-4 bg-white border-t border-neutral-100">
          <Button
            className="w-full bg-primary-500 hover:bg-primary-600 text-white rounded-xl h-14 text-base font-semibold"
            onClick={onEditMembers}
          >
            編輯成員
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
};
