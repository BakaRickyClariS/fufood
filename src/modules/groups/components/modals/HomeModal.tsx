import { useEffect, useRef } from 'react';
import { Button } from '@/shared/components/ui/button';
import gsap from 'gsap';
import type { GroupMember } from '../../types/group.types';

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

/**
 * Home 選單 Modal（從下方彈出）
 * - 使用 GSAP 實現從下方滑入/滑出動畫
 * - 顯示當前使用者資訊與群組成員列表
 */
export const HomeModal = ({
  isOpen,
  onClose,
  currentUser,
  members,
  onEditMembers,
}: HomeModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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
  }, [isOpen]);

  const handleClose = () => {
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
  };

  // 將角色轉換為顯示文字
  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'owner':
        return '擁有者';
      case 'organizer':
        return '組織者';
      case 'member':
        return '成員';
      default:
        return role;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center">
      {/* Backdrop */}
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal Content */}
      <div
        ref={modalRef}
        className="relative w-full bg-white max-w-layout-container mx-auto rounded-t-3xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header (Hidden visually but kept for structure if needed, or customized) */}
        {/* 設計稿中沒有明顯的 Header，只有叉叉和內容，我們保留叉叉但調整位置 */}
        <div className="absolute top-4 right-4 z-10 hidden">
          {/* 隱藏預設的 Header，根據設計稿調整 */}
        </div>

        <div className="pt-6 px-6 pb-2">
          {/* Close Button - Custom Position if needed or rely on backdrop click. 
               Design shows clean card. Let's keep a subtle close button or just rely on backdrop.
               Design shows nothing at top right. Let's keep it clean. 
           */}
        </div>

        {/* Content */}
        <div className="p-6 pt-2 space-y-6 overflow-y-auto pb-28">
          {/* Current User Info */}
          <div className="flex items-center gap-4 py-2 border-b border-stone-100 pb-6">
            <div className="w-14 h-14 rounded-full overflow-hidden border border-stone-100 shrink-0">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-stone-800 flex items-center gap-2">
                {currentUser.name}{' '}
                <span className="text-stone-500 text-sm font-normal">(你)</span>
              </span>
              <span className="text-sm text-stone-400 font-medium">
                {getRoleLabel(currentUser.role)}
              </span>
            </div>
          </div>

          {/* Other Members */}
          <div className="flex flex-col gap-6">
            {members
              .filter((m) => m.name !== currentUser.name) // Filter out current user if in list
              .map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-4 py-2 border-b border-stone-100 pb-6 last:border-0 last:pb-2"
                >
                  <div className="w-14 h-14 rounded-full overflow-hidden border border-stone-100 shrink-0">
                    <img
                      src={member.avatar || ''} // Handle potential undefined avatar
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-lg font-bold text-stone-800">
                      {member.name}
                    </span>
                    <span className="text-sm text-stone-400 font-medium">
                      {getRoleLabel(member.role)}
                    </span>
                  </div>
                </div>
              ))}
          </div>

          {/* Edit Members Button */}
          <div className="pt-4">
            <Button
              className="w-full bg-[#EE5D50] hover:bg-[#D94A3D] text-white rounded-xl h-14 text-lg font-bold shadow-sm"
              onClick={onEditMembers}
            >
              編輯成員
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
