import { ChevronRight } from 'lucide-react';

export type NotificationType = 'stock' | 'shared' | 'system';

export interface NotificationItemProps {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  isRead?: boolean;
  date?: string; // Optional if we group by date outside
  onClick?: () => void;
}

export const NotificationItem = ({
  type,
  title,
  description,
  onClick,
}: NotificationItemProps) => {
  const getTagStyle = (type: NotificationType) => {
    switch (type) {
      case 'stock':
        return 'bg-red-100 text-red-700';
      case 'shared':
        return 'bg-red-100 text-red-700'; // Design shows shared also uses reddish tone but maybe lighter? Stick to design visually.
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
        return '系統'; // Assuming 'system' for official announcements if needed, though design doesn't show explicit tag for all
      default:
        return '';
    }
  };

  // Special handling for official announcements which might not have the tag pill
  const isOfficial = type === 'system';

  return (
    <div
      className="flex items-start gap-3 p-4 bg-white border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors cursor-pointer"
      onClick={onClick}
    >
      {!isOfficial && (
        <div
          className={`
          shrink-0 px-2 py-1 rounded-full text-xs font-bold w-12 text-center
          ${getTagStyle(type)}
        `}
        >
          {getTagLabel(type)}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-bold text-gray-900 mb-1 leading-tight">
          {title}
        </h3>
        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
          {description}
        </p>
      </div>

      <div className="shrink-0 self-center">
        <ChevronRight className="w-5 h-5 text-gray-400" />
      </div>
    </div>
  );
};
