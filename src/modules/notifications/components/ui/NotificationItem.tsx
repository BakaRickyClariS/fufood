/**
 * 通知項目元件
 */
import { useRef } from 'react';
import { ChevronRight, Check } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import type {
  NotificationType,
  NotificationCategory,
  NotificationSubType,
} from '../../types';

export type NotificationItemProps = {
  id: string;
  type: NotificationType;
  subType?: NotificationSubType;
  title: string;
  message: string; // 後端使用 message 而非 description
  isRead?: boolean;
  onClick?: () => void;
  category: NotificationCategory;
  isEditMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: () => void;
  groupName?: string;
  actorName?: string;
  createdAt?: string;
};

export const NotificationItem = ({
  type,
  subType,
  title,
  message,
  isRead,
  onClick,
  category,
  isEditMode,
  isSelected,
  onToggleSelect,
  groupName,
  actorName,
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

  const getTagStyle = (
    type: NotificationType,
    subType?: import('../../types').NotificationSubType | string,
  ) => {
    // Normalize subType to handle snake_case from backend
    const normalizedSubType = subType?.toLowerCase();

    if (normalizedSubType) {
      switch (normalizedSubType) {
        case 'generate':
          return 'bg-[#FDE047] text-[#854D0E]'; // Yellow
        case 'stock':
          return 'bg-[#BEF264] text-[#3F6212]'; // Lime Green
        case 'consume':
          return 'bg-[#FCA5A5] text-[#991B1B]'; // Pink/Red
        case 'stockin': // lowercase from DB
          return 'bg-[#F87171] text-white'; // Red
        case 'share':
          return 'bg-[#BAE6FD] text-[#0369A1]'; // Light Blue
        case 'list':
          return 'bg-[#60A5FA] text-white'; // Blue
        case 'self':
          return 'bg-white border border-gray-200 text-gray-700'; // White
        case 'member':
          return 'bg-gray-300 text-gray-800'; // Grey
      }
    }

    // Fallback based on main type if subType is missing
    switch (type) {
      case 'inventory':
        return 'bg-[#BEF264] text-[#3F6212]';
      case 'group':
        return 'bg-gray-300 text-gray-800';
      case 'shopping':
        return 'bg-[#60A5FA] text-white';
      case 'recipe':
        return 'bg-[#FDE047] text-[#854D0E]';
      case 'user':
        return 'bg-white border border-gray-200 text-gray-700';
      case 'system':
        return 'bg-gray-100 text-gray-700';
      default:
        // Fallback for any unknown type - still show a default style
        return 'bg-gray-200 text-gray-700';
    }
  };

  const getTagLabel = (
    type: NotificationType,
    subType?: import('../../types').NotificationSubType | string,
  ) => {
    // Normalize subType to handle different cases from backend
    const normalizedSubType = subType?.toLowerCase();

    if (normalizedSubType) {
      switch (normalizedSubType) {
        case 'generate':
          return '生成';
        case 'stock':
          return '庫存';
        case 'consume':
          return '消耗';
        case 'stockin': // lowercase from DB
          return '入庫';
        case 'share':
          return '共享';
        case 'list':
          return '清單';
        case 'self':
          return '本人';
        case 'member':
          return '成員';
      }
    }

    switch (type) {
      case 'inventory':
        return '庫存';
      case 'group':
        return '成員';
      case 'shopping':
        return '清單';
      case 'recipe':
        return '生成';
      case 'user':
        return '本人';
      case 'system':
        return '系統';
      default:
        return '通知'; // Fallback for any unknown type
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

  // Display Logic
  const displayGroupName = isOfficial
    ? 'FuFood Official'
    : groupName || (type === 'user' ? 'My Fridge' : ''); // Fallback if missing

  const tagLabel = getTagLabel(type, subType);
  const tagStyle = getTagStyle(type, subType);

  return (
    <div
      className={`flex items-center gap-3 p-4 bg-white border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors cursor-pointer ${unreadClass}`}
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

      {/* Tag Section - Hidden for Official */}
      {!isOfficial && (
        <div
          className={`shrink-0 px-2 py-1 rounded-full text-xs font-bold w-12 text-center ${tagStyle}`}
        >
          {tagLabel}
        </div>
      )}

      <div className="flex-1 min-w-0" ref={contentRef}>
        {/* Top Row: Group Name + Actor Name */}
        {(displayGroupName || actorName) && (
          <div className="text-xs text-gray-500 font-medium mb-0.5">
            {displayGroupName && `[${displayGroupName}]`}
            {displayGroupName && actorName && ' • '}
            {actorName}
          </div>
        )}

        <h3 className="text-sm font-bold text-gray-900 mb-1 leading-tight">
          {title}
        </h3>

        {/* Message Body */}
        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
          {message}
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
