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
import { getGroupLimit } from '@/modules/groups/constants/membershipLimits';
import { toast } from 'sonner';

type GroupFormProps = {
  open: boolean;
  onClose: () => void;
  /** 編輯時傳入 group，建立時傳入 null */
  group: Group | null;
  onBack?: () => void;
  /** 模式：create 建立新群組，edit 編輯現有群組 */
  mode?: 'create' | 'edit';
};

/** 下滑關閉閾值 */
const DRAG_THRESHOLD = 200;

/**
 * 編輯/建立群組表單（從下方彈出的 BottomSheet 樣式）
 * - 使用 GSAP 實現從下方滑入/滑出動畫
 * - 使用 createPortal 確保 Modal 在最上層
 * - 支援下滑手勢關閉
 * - 支援「建立」與「編輯」兩種模式
 */
export const GroupForm: FC<GroupFormProps> = ({
  open,
  onClose,
  group,
  onBack,
  mode = 'edit',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const { user } = useAuth();
  const { currentTheme } = useTheme();
  const {
    updateGroup,
    createGroup,
    switchGroup,
    isGroupsLoading: isLoading,
    groups,
  } = useGroupModal();

  // 下滑關閉用
  const dragStartY = useRef<number | null>(null);

  // 表單狀態
  const [name, setName] = useState('');

  // 判斷是否為建立模式
  const isCreateMode = mode === 'create';

  // 判斷自己是否為 owner，若是則顯示自己的主題群組圖片
  const isOwner = group?.ownerId === user?.id;

  // 顯示圖片邏輯：
  // 1. 建立模式：顯示當前使用者的主題圖片
  // 2. 編輯模式且為擁有者：顯示當前主題圖片 (假設擁有者看自己的群組)
  // 3. 編輯模式非擁有者：顯示預設主題圖片 (或後端回傳的 imageUrl，但目前 API 似乎沒回傳 imageUrl 而是前端根據 owner theme 判斷?)
  // 目前邏輯維持原樣：如果是 Owner 就顯示 currentTheme.groupImage
  // 修正：Create Mode 也應該顯示 currentTheme.groupImage
  const displayGroupImage =
    isCreateMode || isOwner
      ? currentTheme.groupImage
      : getThemeById(DEFAULT_THEME_ID).groupImage;

  // 初始化表單
  useEffect(() => {
    if (open) {
      if (isCreateMode) {
        setName('');
      } else if (group) {
        setName(group.name);
      }
    }
  }, [open, group, isCreateMode]);

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

  // 處理儲存（編輯模式）
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

  // 處理建立（建立模式）
  const handleCreate = async () => {
    if (!name.trim()) return;

    // 檢查群組數量限制
    const limit = getGroupLimit(user?.membershipTier);
    if (groups.length >= limit) {
      toast.error(`您的會員方案最多只能建立/加入 ${limit} 個群組`);
      return;
    }

    try {
      const newGroup = await createGroup({
        name: name.trim(),
        colour: 'blue', // 預設顏色
      });

      console.log('✅ 群組建立結果:', newGroup);

      if (newGroup && newGroup.id) {
        // 切換到新群組
        switchGroup(newGroup.id);
        toast.success('群組建立成功');
        handleClose();
        return;
      }

      // 如果 API 成功但沒有回傳 id，也關閉
      console.warn('⚠️ 群組建立成功但未取得 id');
      handleClose();
    } catch (error) {
      console.error('❌ 群組建立失敗:', error);
      toast.error('建立群組失敗');
    }
  };

  // 處理提交
  const handleSubmit = () => {
    if (isCreateMode) {
      handleCreate();
    } else {
      handleSave();
    }
  };

  // 判斷是否可以儲存
  const canSave = isCreateMode
    ? name.trim().length > 0
    : isOwner && name.trim() && name.trim() !== group?.name;

  // 渲染條件：建立模式時不需要 group
  if (!open) return null;
  if (!isCreateMode && !group) return null;

  return createPortal(
    <div
      ref={containerRef}
      className="fixed inset-0 flex items-end pointer-events-auto z-[110]"
    >
      {/* Backdrop - 不關閉底層，僅覆蓋 */}
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal Content */}
      <div
        ref={modalRef}
        className="relative w-full bg-white max-w-layout-container mx-auto rounded-t-3xl overflow-hidden flex flex-col shadow-2xl"
        style={{ maxHeight: 'min(60vh, 600px)', touchAction: 'none' }}
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
          {/* 標題 - 左邊橘色條 */}
          <div className="flex items-center gap-2 mb-4 mt-2">
            <div className="w-1 h-6 bg-primary-500 rounded-full" />
            <h2 className="text-lg font-bold text-neutral-800">
              {isCreateMode ? '建立群組' : '編輯群組'}
            </h2>
          </div>

          {/* 群組圖片 */}
          <div className="flex justify-center mb-4">
            <div className="w-32 h-32">
              <img
                src={displayGroupImage}
                alt={isCreateMode ? '新群組' : group?.name}
                className="w-full h-full object-contain drop-shadow-md"
              />
            </div>
          </div>

          {/* 已移除圖片選擇區塊 */}

          {/* 群組名稱輸入 */}
          <div className="mb-6">
            {/* 標題 */}
            <div className="flex items-center gap-2 mb-3">
              <label className="text-base font-bold text-neutral-800">
                群組名稱 <span className="text-red-500">*</span>
              </label>
            </div>

            {/* 輸入欄位 */}
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={isCreateMode ? '輸入群組名稱' : 'Add value'}
              className="py-2 rounded-lg text-sm border-neutral-200 bg-white"
              readOnly={!isCreateMode && !isOwner}
            />

            {/* 非擁有者提示 */}
            {!isCreateMode && !isOwner && (
              <p className="text-sm text-neutral-400 mt-2">
                只有群組擁有者可以修改名稱
              </p>
            )}
          </div>
        </div>

        {/* 按鈕固定在底部 */}
        <div className="shrink-0 px-6 py-4 bg-white border-t border-neutral-100">
          <Button
            className="w-full bg-primary-500 hover:bg-primary-600 text-white rounded-lg h-14 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleSubmit}
            disabled={!canSave || isLoading}
          >
            {isLoading
              ? isCreateMode
                ? '建立中...'
                : '套用中...'
              : isCreateMode
                ? '建立群組'
                : '套用'}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
};
