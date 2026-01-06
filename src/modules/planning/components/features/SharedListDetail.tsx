import { useState, useMemo, useRef } from 'react';
import { ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useSharedListDetail } from '@/modules/planning/hooks/useSharedLists';
import { useSharedListItems } from '@/modules/planning/hooks/useSharedListItems';
import { useGroupMembers } from '@/modules/groups/hooks/useGroupMembers';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { PostCard } from '../ui/PostCard';
import { PostFormFeature } from './CreatePost';
import { FloatingActionButton } from '@/shared/components/ui/FloatingActionButton';
import {
  SlideModalLayout,
  type SlideModalLayoutRef,
} from '@/shared/components/layout/SlideModalLayout';
import type { SharedListItem, SharedListPost } from '@/modules/planning/types';

type SharedListDetailProps = {
  listId?: string | null;
  /** Modal 模式控制 */
  isOpen?: boolean;
  onClose?: () => void;
  /** 導航到編輯頁的回呼 */
  onNavigateToEdit?: (listId: string) => void;
};

export const SharedListDetail = ({
  listId,
  isOpen = true,
  onClose,
  onNavigateToEdit: _onNavigateToEdit,
}: SharedListDetailProps) => {
  const layoutRef = useRef<SlideModalLayoutRef>(null);
  const { user: currentUser } = useAuth();
  const { list, isLoading: listLoading } = useSharedListDetail(
    listId || undefined,
  );
  const {
    items,
    isLoading: itemsLoading,
    deleteItem,
  } = useSharedListItems(listId || undefined, list?.refrigeratorId);
  const { members } = useGroupMembers(
    list?.refrigeratorId || '',
    currentUser
      ? {
          name: currentUser.displayName || 'Me',
          avatar: currentUser.avatar || '',
          id: currentUser.id,
        }
      : undefined,
  );

  const [showItemForm, setShowItemForm] = useState(false);
  const [editingItem, setEditingItem] = useState<SharedListItem | null>(null);
  const [editingItems, setEditingItems] = useState<SharedListItem[]>([]);

  // Group items by creatorId to simulate posts
  const posts = useMemo(() => {
    if (!items || items.length === 0) return [];

    const groupedPosts: SharedListPost[] = [];
    let currentCreatorId = '';
    let currentPost: SharedListPost | null = null;

    // Sort items by createdAt desc first to ensure order
    const sortedItems = [...items].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    sortedItems.forEach((item) => {
      if (item.creatorId !== currentCreatorId) {
        if (currentPost) {
          groupedPosts.push(currentPost);
        }

        let authorName = 'Unknown User';
        let authorAvatar = '';

        const creator = members.find((m) => m.id === item.creatorId);

        if (creator) {
          authorName = creator.name;
          authorAvatar = creator.avatar;
        } else if (currentUser && item.creatorId === currentUser.id) {
          authorName = currentUser.displayName || 'Me';
          authorAvatar = currentUser.avatar || '';
        }

        currentCreatorId = item.creatorId;
        currentPost = {
          id: `post_${item.id}`,
          listId: listId!,
          authorId: item.creatorId,
          authorName,
          authorAvatar,
          content: '',
          images: [],
          items: [item],
          createdAt: item.createdAt,
        };
      } else {
        if (currentPost) {
          currentPost.items.push(item);
        }
      }
    });

    if (currentPost) {
      groupedPosts.push(currentPost);
    }

    return groupedPosts;
  }, [items, members, listId, currentUser]);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setEditingItems([]);
    setShowItemForm(true);
  };

  const handleCloseForm = () => {
    setShowItemForm(false);
    setEditingItem(null);
    setEditingItems([]);
  };

  const handleClose = () => {
    if (layoutRef.current) {
      layoutRef.current.close();
    } else {
      onClose?.();
    }
  };

  // 如果 listId 為空且非開啟狀態，不渲染
  if (!listId && !isOpen) return null;

  const statusConfig = {
    'in-progress': {
      text: '進行中',
      bgClass: 'bg-success-300',
    },
    completed: {
      text: '已完成',
      bgClass: 'bg-neutral-400',
    },
  } as const;

  const currentStatus = list
    ? (statusConfig[list.status as keyof typeof statusConfig] ?? {
        text: '進行中',
        bgClass: 'bg-success-300',
      })
    : { text: '進行中', bgClass: 'bg-success-300' };

  // 自訂 Header（覆蓋背景圖）
  const customHeader = list ? (
    <div className="relative bg-white rounded-b-2xl overflow-hidden z-10 mb-6">
      <img
        src={list.coverPhotoPath || ''}
        alt={list.title}
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-white/40 backdrop-blur-xs" />

      <div className="relative z-10">
        <div className="p-4 flex items-center justify-between">
          <button
            onClick={handleClose}
            className="w-10 h-10 flex items-center justify-center text-neutral-700 active:scale-95 transition-transform"
          >
            <ChevronLeft className="w-8 h-8 font-bold" />
          </button>
          <h2 className="text-lg font-bold text-neutral-700 tracking-wide">
            共享清單
          </h2>
          <div className="w-10" />
        </div>

        <div className="px-4 pb-4 pt-5 flex justify-between items-end">
          <div className="flex flex-col gap-2">
            <h1 className="text-lg font-semibold text-neutral-700 tracking-wide">
              {list.title}
            </h1>
            <div
              className={`text-white text-sm w-[67px] h-[32px] rounded-[20px] font-bold flex items-center justify-center ${currentStatus.bgClass}`}
            >
              {currentStatus.text}
            </div>
          </div>

          <div className="bg-white/70 backdrop-blur rounded-2xl p-3 min-w-[70px] flex flex-col items-center justify-center shadow-lg">
            <span className="text-xs font-medium text-neutral-600">
              {new Date(list.startsAt).toLocaleDateString('zh-TW', {
                weekday: 'short',
              })}
            </span>
            <span className="text-xl font-bold text-neutral-700">
              {new Date(list.startsAt).getDate()}
            </span>
          </div>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <SlideModalLayout
      ref={layoutRef}
      isOpen={isOpen}
      onClose={onClose || (() => {})}
      showHeader={false}
      customHeader={customHeader}
      bgClassName="bg-neutral-100"
      className="pb-24"
    >
      {/* Loading 狀態 */}
      {listLoading ? (
        <div className="p-8 text-center text-neutral-400">載入中...</div>
      ) : !list ? (
        <div className="p-8 text-center text-neutral-400">找不到清單</div>
      ) : (
        <>
          {/* Posts Feed */}
          <div className="px-4 space-y-4">
            {itemsLoading ? (
              <div className="text-center py-8 text-neutral-400">
                載入項目中...
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-12 text-neutral-400 bg-white rounded-xl border border-dashed border-neutral-200">
                <p>目前還沒有項目，新增你的第一筆採買清單吧！</p>
              </div>
            ) : (
              posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onEdit={(post) => {
                    setEditingItems(post.items);
                    setShowItemForm(true);
                  }}
                  onDelete={async (postId) => {
                    const post = posts.find((p) => p.id === postId);
                    if (
                      post &&
                      confirm('確定要刪除這則貼文（包含所有項目）嗎？')
                    ) {
                      try {
                        await Promise.all(
                          post.items.map((item) => deleteItem(item.id)),
                        );
                        toast.success('貼文已刪除');
                      } catch (error) {
                        console.error('Failed to delete post', error);
                        toast.error('刪除失敗');
                      }
                    }
                  }}
                />
              ))
            )}
          </div>

          <FloatingActionButton
            onClick={handleOpenCreate}
            className="bg-primary-400 hover:bg-primary-500"
          />

          {showItemForm && (
            <PostFormFeature
              listId={listId || ''}
              mode={editingItem || editingItems.length > 0 ? 'edit' : 'create'}
              initialData={editingItem}
              initialItems={editingItems}
              onClose={handleCloseForm}
            />
          )}
        </>
      )}
    </SlideModalLayout>
  );
};
