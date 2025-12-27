/**
 * 通知項目元件
 */
import { useRef } from 'react';
import { ChevronRight, Check } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import type { NotificationType, NotificationCategory } from '../../types';

export interface NotificationItemProps {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  isRead?: boolean;
  onClick?: () => void;
  // New props
  category: NotificationCategory;
  isEditMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: () => void;
}

export const NotificationItem = ({
  type,
  title,
  description,
  isRead,
  onClick,
  category,
  isEditMode,
  isSelected,
  onToggleSelect,
}: NotificationItemProps) => {
  const checkboxRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Checkbox animation
  useGSAP(() => {
    if (isEditMode) {
      gsap.fromTo(
        checkboxRef.current,
        { x: -40, opacity: 0, width: 0 },
        { x: 0, opacity: 1, width: 'auto', duration: 0.3, ease: 'power2.out' },
      );
    }
  }, [isEditMode]);

  const getTagStyle = (type: NotificationType) => {
    switch (type) {
      case 'stock':
        return 'bg-red-100 text-red-700';
      case 'shared':
        return 'bg-red-100 text-red-700';
      case 'system':
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getTagLabel = (type: NotificationType) => {
    switch (type) {
      case 'stock':
        return '庫存';
      case 'shared':
        return '共享';
      case 'system':
        return '系統';
      default:
        return '';
    }
  };

  const isOfficial = type === 'system';
  const showArrow = category === 'stock' && !isEditMode;

  // 未讀樣式：如果是食材管家且未讀，使用漸層背景
  const unreadClass = !isRead
    ? category === 'stock'
      ? 'notification-unread-gradient'
      : 'bg-blue-50/30'
    : '';

  return (
    <div
      className={`flex items-start gap-3 p-4 bg-white border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors cursor-pointer ${unreadClass}`}
      onClick={isEditMode ? onToggleSelect : onClick}
    >
      {isEditMode && (
        <div
          ref={checkboxRef}
          className="shrink-0 flex items-center self-center pr-2 overflow-hidden"
        >
          <div
            className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
              isSelected
                ? 'bg-primary-400 border-primary-400'
                : 'border-gray-300 bg-white'
            }`}
          >
            {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
          </div>
        </div>
      )}

      {!isOfficial && (
        <div
          className={`shrink-0 px-2 py-1 rounded-full text-xs font-bold w-12 text-center self-center ${getTagStyle(type)}`}
        >
          {getTagLabel(type)}
        </div>
      )}

      <div className="flex-1 min-w-0" ref={contentRef}>
        <h3 className="text-sm font-bold text-gray-900 mb-1 leading-tight">
          {title}
        </h3>
        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
          {description}
        </p>
      </div>

      {showArrow && (
        <div className="shrink-0 self-center">
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </div>
      )}
    </div>
  );
};
