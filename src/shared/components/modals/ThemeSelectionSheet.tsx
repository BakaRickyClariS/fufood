/**
 * 主題選擇底部彈出面板
 * 使用 GSAP 實現從下方滑入/滑出動畫，樣式與 HomeModal 一致
 * 使用 Redux 持久化狀態，重整時保持打開狀態
 */

import { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { useDispatch, useSelector } from 'react-redux';
import { Check, ChevronRight } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { cn } from '@/shared/utils/styleUtils';
import { THEMES, type Theme } from '@/shared/constants/themes';
import LineIconGreen from '@/assets/images/settings/line-green.svg';
import {
  updateThemeSelection,
  closeThemeSelection,
  selectThemeSelectionSelectedId,
  selectThemeSelectionUserName,
  selectThemeSelectionSkipAnimation,
  setSkipAnimation,
} from '@/store/slices/themeSelectionSlice';

type ThemeSelectionSheetProps = {
  /** 是否開啟面板 */
  isOpen: boolean;
  /** 關閉面板回呼 */
  onClose: () => void;
  /** 確認選擇回呼 (themeId, userName?) */
  onConfirm: (themeId: number, userName?: string) => Promise<void> | void;
  /** 當前已選中的主題 ID */
  currentThemeId?: number;
  /** 是否為首次登入模式（顯示用戶名欄位） */
  isFirstLogin?: boolean;
  /** 預設用戶名 */
  defaultUserName?: string;
};

/** 下滑關閉閾值 */
const DRAG_THRESHOLD = 200;

/**
 * 主題選擇底部彈出面板
 */
export const ThemeSelectionSheet = ({
  isOpen,
  onClose,
  onConfirm,
  currentThemeId,
  isFirstLogin = true, // 預設開啟，之後用戶可以在需要的地方關閉
  defaultUserName = '',
}: ThemeSelectionSheetProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Redux
  const dispatch = useDispatch();
  const storedSelectedId = useSelector(selectThemeSelectionSelectedId);
  const storedUserName = useSelector(selectThemeSelectionUserName);
  const skipAnimation = useSelector(selectThemeSelectionSkipAnimation);

  // Track if we've restored from Redux
  const wasOpenRef = useRef(false);

  // 延遲渲染狀態（等 splash screen 結束）
  const [shouldRender, setShouldRender] = useState(!skipAnimation);

  const [selectedId, setSelectedId] = useState<number | null>(
    currentThemeId ?? null,
  );
  const [userName, setUserName] = useState(defaultUserName);
  const [isLoading, setIsLoading] = useState(false);

  // 下滑關閉用
  const dragStartY = useRef<number | null>(null);

  // 如果是恢復狀態，延遲 2.5 秒後才渲染 modal
  useEffect(() => {
    if (skipAnimation && isOpen) {
      const timer = setTimeout(() => {
        setShouldRender(true);
        dispatch(setSkipAnimation(false));
      }, 2500); // splash 2秒 + 淡出 0.5秒
      return () => clearTimeout(timer);
    } else if (isOpen) {
      setShouldRender(true);
    }
  }, [isOpen, skipAnimation, dispatch]);

  // 從 Redux 恢復狀態（頁面重整時）
  useEffect(() => {
    if (isOpen && !wasOpenRef.current) {
      // 如果有儲存的狀態，使用它
      if (storedSelectedId !== null) {
        setSelectedId(storedSelectedId);
      } else if (currentThemeId) {
        setSelectedId(currentThemeId);
      }

      if (storedUserName) {
        setUserName(storedUserName);
      } else if (defaultUserName) {
        setUserName(defaultUserName);
      }
    }
    wasOpenRef.current = isOpen;
  }, [
    isOpen,
    storedSelectedId,
    storedUserName,
    currentThemeId,
    defaultUserName,
  ]);

  // 同步選擇狀態到 Redux
  useEffect(() => {
    if (isOpen) {
      dispatch(
        updateThemeSelection({
          selectedThemeId: selectedId ?? undefined,
          userName,
        }),
      );
    }
  }, [isOpen, selectedId, userName, dispatch]);

  // 鎖定背景滾動
  useEffect(() => {
    if (isOpen) {
      // 鎖定背景滾動
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.top = `-${window.scrollY}px`;
    } else {
      // 解除鎖定
      const scrollY = document.body.style.top;
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
      window.scrollTo(0, parseInt(scrollY || '0') * -1);
    }

    return () => {
      // 清理
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.top = '';
    };
  }, [isOpen]);

  // 使用 useGSAP 管理動畫
  const { contextSafe } = useGSAP(
    () => {
      if (isOpen && shouldRender) {
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
    { scope: containerRef, dependencies: [isOpen, shouldRender] },
  );

  const handleClose = contextSafe(() => {
    const tl = gsap.timeline({
      onComplete: () => {
        // 動畫完成後才清除狀態
        dispatch(closeThemeSelection());
        setShouldRender(false);
        onClose();
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

  const handleConfirm = async () => {
    if (!selectedId) return;

    try {
      setIsLoading(true);
      await onConfirm(selectedId, isFirstLogin ? userName : undefined);

      // 關閉動畫
      const tl = gsap.timeline({
        onComplete: onClose,
      });
      tl.to(modalRef.current, {
        y: '100%',
        opacity: 0,
        duration: 0.3,
        ease: 'power2.in',
      });
      tl.to(
        overlayRef.current,
        { opacity: 0, duration: 0.3, ease: 'power2.in' },
        '-=0.3',
      );
    } catch (error) {
      console.error('[ThemeSelectionSheet] Confirm failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 下滑關閉 - Touch Events（依賴 CSS touch-action: none 阻止瀏覽器下拉刷新）
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

  if (!isOpen || !shouldRender) return null;

  return createPortal(
    <div
      ref={containerRef}
      className="fixed inset-0 flex items-end pointer-events-auto z-[110]"
    >
      {/* Backdrop */}
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal Content - 高度限制 50% / 最高 625px，固定靠底部 */}
      <div
        ref={modalRef}
        className="relative w-full bg-white max-w-layout-container mx-auto rounded-t-3xl overflow-hidden flex flex-col shadow-2xl"
        style={{ maxHeight: 'min(50vh, 625px)', touchAction: 'none' }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* 下滑提示條 - 加入 touch-action: none 防止瀏覽器下拉刷新 */}
        <div
          className="flex justify-center py-3 shrink-0"
          style={{ touchAction: 'none' }}
        >
          <div className="w-10 h-1 bg-neutral-300 rounded-full" />
        </div>

        {/* Content - 可滾動區域 */}
        <div className="px-6 space-y-6 overflow-y-auto flex-1 select-none">
          {/* 選擇頭貼區塊 */}
          <div className="mb-6">
            {/* 標題 - 左邊橘色條 */}
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-6 bg-primary-500 rounded-full" />
              <h2 className="text-lg font-bold text-neutral-800">選擇頭貼</h2>
            </div>

            {/* 主題選擇區 - 3 欄 */}
            <div className="grid grid-cols-3 gap-3">
              {THEMES.map((theme: Theme) => (
                <button
                  key={theme.id}
                  type="button"
                  className={cn(
                    'relative aspect-square rounded-2xl overflow-hidden border-2 transition-all duration-200 bg-neutral-50',
                    selectedId === theme.id
                      ? 'border-primary-500'
                      : 'border-neutral-200 hover:border-neutral-300',
                  )}
                  onClick={() => setSelectedId(theme.id)}
                >
                  <img
                    src={theme.avatar}
                    alt={`頭貼 ${theme.id}`}
                    className="w-full h-full object-cover scale-150 translate-y-5"
                  />
                  {selectedId === theme.id && (
                    <div className="absolute top-2 left-2 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center shadow-md">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* 建立用戶名區塊 - 僅首次登入時顯示 */}
          {isFirstLogin && (
            <div className="mb-6">
              {/* 標題 - 左邊橘色條 */}
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-6 bg-primary-500 rounded-full" />
                <h2 className="text-lg font-bold text-neutral-800">
                  建立用戶名
                </h2>
              </div>

              {/* 輸入欄位 */}
              <div className="relative">
                <Input
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Add value"
                  className="h-14 rounded-xl pr-32 text-base border-neutral-200 bg-white select-text"
                />
                {/* 已綁定LINE帳戶標記 */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5 bg-success-50 px-2 py-2 rounded-full">
                  <img src={LineIconGreen} alt="LINE" className="w-4 h-4" />
                  <span className="text-xs text-neutral-600 font-medium">
                    已綁定LINE帳戶
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 套用按鈕 - 固定在底部 */}
        <div className="shrink-0 px-6 py-4 bg-white border-t border-neutral-100">
          <Button
            className="w-full bg-primary-500 hover:bg-primary-600 text-white rounded-xl h-14 text-lg font-bold shadow-sm disabled:bg-primary-200 disabled:opacity-100 transition-colors"
            onClick={handleConfirm}
            disabled={
              !selectedId ||
              isLoading ||
              (isFirstLogin && !userName.trim()) ||
              (selectedId === currentThemeId &&
                (!isFirstLogin || userName === defaultUserName))
            }
          >
            {isLoading ? '套用中...' : '套用'}
          </Button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

/**
 * 目前角色區塊元件
 * 顯示當前選擇的主題角色，點擊可變更
 */
type CurrentThemeCardProps = {
  /** 當前主題 */
  theme: Theme;
  /** 點擊變更按鈕回呼 */
  onChangeClick: () => void;
};

export const CurrentThemeCard = ({
  theme,
  onChangeClick,
}: CurrentThemeCardProps) => {
  return (
    <div
      onClick={onChangeClick}
      className="bg-white rounded-2xl p-4 cursor-pointer hover:bg-neutral-50 transition-colors"
    >
      <div className="flex items-center gap-4">
        {/* 角色頭像 */}
        <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-neutral-100 shrink-0">
          <img
            src={theme.avatar}
            alt={theme.name}
            className="w-full h-full object-cover scale-110"
          />
        </div>

        {/* 角色資訊 */}
        <div className="flex-1">
          <h3 className="text-base font-bold text-neutral-800">目前角色</h3>
          <p className="text-sm text-neutral-500">{theme.name}</p>
        </div>

        {/* 變更按鈕 */}
        <div className="flex items-center gap-1 text-primary-500 font-medium text-sm">
          變更
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};

export default ThemeSelectionSheet;
