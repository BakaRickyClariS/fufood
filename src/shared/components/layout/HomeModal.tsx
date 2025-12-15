import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import gsap from 'gsap';

type HomeModalMember = {
  id: string;
  name: string;
  avatar: string;
  role: string;
};

type HomeModalProps = {
  isOpen: boolean;
  onClose: () => void;
  currentUser: {
    name: string;
    avatar: string;
    role: string;
  };
  members: HomeModalMember[];
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
        { opacity: 1, duration: 0.3, ease: 'power2.out' }
      );

      // Animate modal (slide up)
      tl.fromTo(
        modalRef.current,
        { y: '100%', opacity: 0 },
        { y: '0%', opacity: 1, duration: 0.5, ease: 'back.out(1.2)' },
        '-=0.2'
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
      '-=0.3'
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
    <div className="fixed inset-0 z-50 flex items-end justify-center">
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
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4">
          <button
            onClick={handleClose}
            className="p-2 -ml-2 text-neutral-700 hover:text-neutral-900"
          >
            <X className="w-6 h-6" />
          </button>
          <h2 className="text-lg font-bold text-neutral-900 absolute left-1/2 -translate-x-1/2">
            群組成員
          </h2>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto pb-28">
          {/* Current User Info */}
          <div className="flex items-center gap-3 pb-4 border-b border-stone-100">
            <div className="w-12 h-12 rounded-full overflow-hidden bg-primary-100">
              {currentUser.avatar ? (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-primary-700 text-lg font-medium">
                  {currentUser.name?.charAt(0) || '?'}
                </div>
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-base font-medium text-stone-800">
                {currentUser.name} (你)
              </span>
              <span className="text-sm text-stone-400">
                {getRoleLabel(currentUser.role)}
              </span>
            </div>
          </div>

          {/* Other Members */}
          {members
            .filter((m) => m.id !== 'current')
            .map((member) => (
              <div key={member.id} className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-neutral-100">
                  {member.avatar ? (
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-600 text-lg font-medium">
                      {member.name?.charAt(0) || '?'}
                    </div>
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="text-base font-medium text-stone-800">
                    {member.name}
                  </span>
                  <span className="text-sm text-stone-400">
                    {getRoleLabel(member.role)}
                  </span>
                </div>
              </div>
            ))}

          {/* Edit Members Button - 跟隨內容排列 */}
          <div className="pt-4">
            <Button
              className="w-full bg-primary-500 hover:bg-primary-600 text-white rounded-xl h-12 text-base font-medium"
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
