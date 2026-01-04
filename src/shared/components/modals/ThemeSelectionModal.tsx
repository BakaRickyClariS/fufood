/**
 * 主題選擇 Modal
 * 顯示 8 個主題大頭貼供用戶選擇
 */

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Check } from 'lucide-react';
import { cn } from '@/shared/utils/styleUtils';
import { THEMES, type Theme } from '@/shared/constants/themes';

type ThemeSelectionModalProps = {
  /** 是否開啟 Modal */
  isOpen: boolean;
  /** 關閉 Modal 回呼 */
  onClose: () => void;
  /** 確認選擇回呼，傳入選中的主題 ID */
  onConfirm: (themeId: number) => Promise<void> | void;
  /** 是否為首次登入模式（隱藏關閉按鈕） */
  isFirstLogin?: boolean;
  /** 當前已選中的主題 ID（用於編輯模式） */
  currentThemeId?: number;
};

/**
 * 主題選擇 Modal 元件
 */
export const ThemeSelectionModal = ({
  isOpen,
  onClose,
  onConfirm,
  isFirstLogin = false,
  currentThemeId,
}: ThemeSelectionModalProps) => {
  const [selectedId, setSelectedId] = useState<number | null>(
    currentThemeId ?? null
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    if (!selectedId) return;

    try {
      setIsLoading(true);
      await onConfirm(selectedId);
      onClose();
    } catch (error) {
      console.error('[ThemeSelectionModal] Confirm failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    // 首次登入模式下不允許關閉
    if (!open && isFirstLogin) return;
    if (!open) onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-w-[340px] rounded-3xl p-6"
        // 首次登入模式隱藏關閉按鈕
        onPointerDownOutside={(e) => {
          if (isFirstLogin) e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          if (isFirstLogin) e.preventDefault();
        }}
      >
        <DialogHeader className="text-center">
          <DialogTitle className="text-xl font-bold text-primary-700">
            {isFirstLogin ? '歡迎加入！選擇你的主題' : '切換主題'}
          </DialogTitle>
          <DialogDescription className="text-sm text-neutral-500">
            選擇一個主題來個人化你的體驗
          </DialogDescription>
        </DialogHeader>

        {/* 主題選擇區 */}
        <div className="grid grid-cols-3 gap-3 py-4">
          {THEMES.map((theme: Theme) => (
            <button
              key={theme.id}
              type="button"
              className={cn(
                'relative aspect-square rounded-2xl overflow-hidden border-2 transition-all duration-200',
                selectedId === theme.id
                  ? 'border-primary-500 ring-2 ring-primary-300 scale-105'
                  : 'border-neutral-200 hover:border-neutral-300 hover:scale-102'
              )}
              onClick={() => setSelectedId(theme.id)}
            >
              <img
                src={theme.avatar}
                alt={`主題 ${theme.id}`}
                className="w-full h-full object-cover scale-125 translate-y-2"
              />
              {selectedId === theme.id && (
                <div className="absolute top-1.5 left-1.5 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center shadow-md">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
            </button>
          ))}
        </div>

        {/* 確認按鈕 */}
        <Button
          className="w-full bg-primary-500 hover:bg-primary-600 text-white h-12 rounded-xl text-base font-bold shadow-sm transition-all active:scale-[0.98]"
          onClick={handleConfirm}
          disabled={!selectedId || isLoading}
        >
          {isLoading ? '套用中...' : '確認選擇'}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default ThemeSelectionModal;
