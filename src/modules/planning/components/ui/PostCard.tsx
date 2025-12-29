import { useState } from 'react';
import type { SharedListPost } from '@/modules/planning/types';
import {
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  Pencil,
  Trash2,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/shared/components/ui/dropdown-menu';

type PostCardProps = {
  post: SharedListPost;
  onEdit?: (post: SharedListPost) => void;
  onDelete?: (postId: string) => void;
};

export const PostCard = ({ post, onEdit, onDelete }: PostCardProps) => {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const getTimeAgo = (dateString: string) => {
    // 簡單實作，實際應使用 date-fns
    const diff = Date.now() - new Date(dateString).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}分鐘`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}小時`;
    return `${Math.floor(hours / 24)}天`;
  };

  const toggleItem = (itemId: string) => {
    setExpandedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId],
    );
  };

  return (
    <div className="bg-white mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 px-4 pt-4">
        <div className="flex items-center gap-3">
          <img
            src={post.authorAvatar}
            alt={post.authorName}
            className="w-[42px] h-[42px] rounded-full bg-neutral-100 object-cover"
          />
          <div>
            <div className="font-bold text-sm">{post.authorName}</div>
            <div className="text-xs text-neutral-400">
              {getTimeAgo(post.createdAt)}
            </div>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="text-neutral-400 p-1 hover:bg-neutral-50 rounded-full transition-colors">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-32">
            <DropdownMenuItem
              onClick={() => onEdit?.(post)}
              className="gap-2 text-neutral-600 font-medium"
            >
              <Pencil className="w-4 h-4" />
              編輯
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete?.(post.id)}
              className="gap-2 text-red-500 font-medium focus:text-red-500 focus:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
              刪除
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Content */}
      <div className="mb-0">
        {/* Shopping Items */}
        <div className="space-y-0 text-neutral-800">
          {post.items.map((item) => {
            const hasImage = !!item.imageUrl;
            const isExpanded = expandedItems.includes(item.id);

            return (
              <div
                key={item.id}
                className="py-3 px-4 border-b border-neutral-100 last:border-0"
              >
                <div
                  className={`flex justify-between items-center ${
                    hasImage ? 'cursor-pointer select-none' : ''
                  }`}
                  onClick={() => hasImage && toggleItem(item.id)}
                >
                  <span className="text-base font-medium">{item.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-base">
                      {item.quantity}
                      {item.unit}
                    </span>
                    {hasImage ? (
                      <div className="text-neutral-400">
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </div>
                    ) : (
                      <div className="w-5 h-5" /> // Alignment spacer
                    )}
                  </div>
                </div>

                {/* Expandable Image Area */}
                {hasImage && isExpanded && (
                  <div className="mt-3">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-auto rounded-xl object-cover"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
