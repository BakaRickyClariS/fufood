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

  // 標籤樣式與標籤文字的映射物件
  const TAG_CONFIG: Record<string, { style: string; label: string }> = {
    // SubType mappings
    generate: { style: 'bg-[#FDE047] text-[#854D0E]', label: '生成' },
    stock: { style: 'bg-[#BEF264] text-[#3F6212]', label: '庫存' },
    consume: { style: 'bg-[#FCA5A5] text-[#991B1B]', label: '消耗' },
    stockin: { style: 'bg-[#F87171] text-white', label: '入庫' },
    share: { style: 'bg-[#BAE6FD] text-[#0369A1]', label: '共享' },
    list: { style: 'bg-[#60A5FA] text-white', label: '清單' },
    self: {
      style: 'bg-white border border-gray-200 text-gray-700',
      label: '本人',
    },
    member: { style: 'bg-gray-300 text-gray-800', label: '成員' },
    // Type fallbacks
    inventory: { style: 'bg-[#BEF264] text-[#3F6212]', label: '庫存' },
    group: { style: 'bg-gray-300 text-gray-800', label: '成員' },
    shopping: { style: 'bg-[#60A5FA] text-white', label: '清單' },
    recipe: { style: 'bg-[#FDE047] text-[#854D0E]', label: '生成' },
    user: {
      style: 'bg-white border border-gray-200 text-gray-700',
      label: '本人',
    },
    system: { style: 'bg-gray-100 text-gray-700', label: '系統' },
  };

  const DEFAULT_TAG = { style: 'bg-gray-200 text-gray-700', label: '通知' };

  const getTagConfig = (
    type: NotificationType,
    subType?: NotificationSubType | string,
  ) => {
    const normalizedSubType = subType?.toLowerCase();
    // 優先使用 subType，fallback 到 type
    return (
      TAG_CONFIG[normalizedSubType || ''] || TAG_CONFIG[type] || DEFAULT_TAG
    );
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

  const { style: tagStyle, label: tagLabel } = getTagConfig(type, subType);

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

        <h3 className="text-sm font-bold text-gray-900 mb-1 leading-tight line-clamp-1">
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
