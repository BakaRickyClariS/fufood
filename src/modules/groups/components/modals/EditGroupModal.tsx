import { useRef, useEffect, useState, type FC } from 'react';
import { createPortal } from 'react-dom';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import type { Group } from '../../types/group.types';
import { useGroupModal } from '../../hooks/useGroupModal';
import { useTheme } from '@/shared/providers/ThemeProvider';
import { getThemeById, DEFAULT_THEME_ID } from '@/shared/constants/themes';
import { useAuth } from '@/modules/auth/hooks';
import { useBodyScrollLock } from '@/shared/hooks/useBodyScrollLock';
import { toast } from 'sonner';

type EditGroupModalProps = {
  open: boolean;
  onClose: () => void;
  group: Group | null;
  onBack?: () => void;
};

/** 下滑關閉閾值 */
const DRAG_THRESHOLD = 200;

/**
 * 編輯群組 Modal（從下方彈出的 BottomSheet 樣式）
 * - 使用 GSAP 實現從下方滑入/滑出動畫
 * - 使用 createPortal 確保 Modal 在最上層
 * - 支援下滑手勢關閉
 * - 只能修改群組名稱
 */
export const EditGroupModal: FC<EditGroupModalProps> = ({
  open,
  onClose,
  group,
  onBack,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const { user } = useAuth();
  const { currentTheme } = useTheme();
  const { updateGroup, isGroupsLoading: isLoading } = useGroupModal();

  // 下滑關閉用
  const dragStartY = useRef<number | null>(null);

  // 表單狀態
  const [name, setName] = useState('');

  // 判斷自己是否為 owner，若是則顯示自己的主題群組圖片
  const isOwner = group?.ownerId === user?.id;
  const displayGroupImage = isOwner
    ? currentTheme.groupImage
    : getThemeById(DEFAULT_THEME_ID).groupImage;

  // 初始化表單
  useEffect(() => {
    if (open && group) {
      setName(group.name);
    }
  }, [open, group]);

  // 鎖定背景滾動
  useBodyScrollLock(open);

  // 使用 useGSAP 管理動畫
  const { contextSafe } = useGSAP(
    () => {
      if (open) {
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
    { scope: containerRef, dependencies: [open] },
  );

  const handleClose = contextSafe(() => {
    const tl = gsap.timeline({
      onComplete: () => {
        if (onBack) {
          onBack();
        } else {
          onClose();
        }
      },
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

  // 處理儲存
  const handleSave = async () => {
    if (!group || !name.trim()) return;

    try {
      await updateGroup(group.id, { name: name.trim() });

      toast.success('群組名稱已更新');
      handleClose();
    } catch (error) {
      console.error('更新群組失敗:', error);
      toast.error('更新群組失敗');
    }
  };

  // 判斷是否可以儲存
  const canSave = isOwner && name.trim() && name.trim() !== group?.name;

  if (!open || !group) return null;

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
        <div className="px-6 overflow-y-auto flex-1 select-none">
          {/* 群組圖片 */}
          <div className="flex justify-center mb-6">
            <div className="w-40 h-40">
              <img
                src={displayGroupImage}
                alt={group.name}
                className="w-full h-full object-contain drop-shadow-md"
              />
            </div>
          </div>

          {/* 群組名稱輸入 */}
          <div className="mb-6">
            {/* 標題 - 左邊橘色條 */}
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-6 bg-primary-500 rounded-full" />
              <label className="text-base font-bold text-neutral-800">
                群組名稱 <span className="text-red-500">*</span>
              </label>
            </div>

            {/* 輸入欄位 */}
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Add value"
              className="h-14 rounded-xl text-base border-neutral-200 bg-white"
              readOnly={!isOwner}
            />

            {/* 非擁有者提示 */}
            {!isOwner && (
              <p className="text-sm text-neutral-400 mt-2">
                只有群組擁有者可以修改名稱
              </p>
            )}
          </div>
        </div>

        {/* 按鈕固定在底部 */}
        <div className="shrink-0 px-6 py-4 bg-white border-t border-neutral-100">
          <Button
            className="w-full bg-primary-500 hover:bg-primary-600 text-white rounded-xl h-14 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleSave}
            disabled={!canSave || isLoading}
          >
            {isLoading ? '套用中...' : '套用'}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
};
