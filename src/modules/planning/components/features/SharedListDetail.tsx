import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronDown } from 'lucide-react';
import { useSharedListDetail } from '@/modules/planning/hooks/useSharedLists';
import { usePosts } from '@/modules/planning/hooks/usePosts';
import { useComments } from '@/modules/planning/hooks/useComments';
import { PostCard } from '../ui/PostCard';
import { CommentsModal } from '../ui/CommentsModal';
import { FloatingActionButton } from '@/shared/components/ui/FloatingActionButton';

type SharedListDetailProps = {
  listId?: string;
};

export const SharedListDetail = ({ listId }: SharedListDetailProps) => {
  const navigate = useNavigate();
  const { list, isLoading: listLoading } = useSharedListDetail(listId);
  const { posts, isLoading: postsLoading, toggleLike } = usePosts(listId);
  
  // Comments Modal State
  const [activePostId, setActivePostId] = useState<string | null>(null);
  const { comments, addComment } = useComments(activePostId);

  if (!listId) return <div>List ID required</div>;
  if (listLoading)
    return <div className="p-8 text-center text-neutral-400">載入中...</div>;
  if (!list)
    return <div className="p-8 text-center text-neutral-400">找不到清單</div>;

  const statusConfig = {
    'in-progress': { text: '進行中', className: 'bg-success-500 text-white' },
    'pending-purchase': {
      text: '待採買',
      className: 'bg-yellow-400/80 text-white',
    },
    completed: { text: '已完成', className: 'bg-neutral-400/80 text-white' },
  } as const;

  const currentStatus = statusConfig[
    list.status as keyof typeof statusConfig
  ] ?? { text: '未知狀態', className: 'bg-neutral-400/80 text-white' };

  return (
    <div className="min-h-screen bg-neutral-50 pb-24">
      {/* List Header - 用內容推開高度 */}
      <div className="relative bg-white rounded-b-[32px] overflow-hidden shadow-sm z-10">
        {/* 背景圖 - 絕對定位填滿 */}
        <img
          src={list.coverImageUrl}
          alt={list.name}
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* 遮罩層 */}
        <div className="absolute inset-0 bg-white/30 backdrop-blur-xs" />

        {/* 內容區域 - 相對定位，推開高度 */}
        <div className="relative z-10">
          {/* Top Navbar Area */}
          <div className="p-4 flex items-center justify-between">
            <button
              onClick={() => navigate('/planning')}
              className="w-10 h-10 flex items-center justify-center text-neutral-700 active:scale-95 transition-transform"
            >
              <ChevronLeft className="w-8 h-8 font-bold" />
            </button>
            <h2 className="text-lg font-bold text-neutral-700 tracking-wide">共享清單</h2>
            <div className="w-10" /> {/* Spacer for centering */}
          </div>

          {/* Header Content */}
          <div className="px-4 pb-4 pt-5 flex justify-between items-end">
            {/* Left: Status & Title */}
            <div className="flex flex-col gap-2">
              <div
                className={`w-fit px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md ${currentStatus.className}`}
              >
                {currentStatus.text}
              </div>
              <h1 className="text-2xl font-bold text-neutral-700 tracking-wide">
                {list.name}
              </h1>
            </div>

            {/* Right: Date Card */}
            <div className="bg-white/90 backdrop-blur rounded-2xl p-3 min-w-[70px] flex flex-col items-center justify-center shadow-lg">
              <span className="text-xs font-medium text-neutral-600">
                {new Date(list.scheduledDate).toLocaleDateString('zh-TW', {
                  weekday: 'short',
                })}
              </span>
              <span className="text-xl font-bold text-neutral-700">
                {new Date(list.scheduledDate).getDate()}
              </span>
            </div>
          </div>

          {/* Bottom Arrow */}
          <div className="pb-3 flex justify-center text-neutral-500">
            <ChevronDown className="w-6 h-6 animate-bounce" />
          </div>
        </div>
      </div>

      {/* Posts Feed */}
      <div className="p-4">
        {postsLoading ? (
          <div className="text-center py-8 text-neutral-400">載入貼文中...</div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 text-neutral-400 bg-white rounded-xl border border-dashed border-neutral-200">
            <p>目前還沒有貼文，分享你的第一筆清單吧！</p>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onToggleLike={(postId) => void toggleLike(postId)}
              onOpenComments={setActivePostId}
            />
          ))
        )}
      </div>

      <FloatingActionButton
        onClick={() => navigate(`/planning/list/${listId}/post/create`)}
      />

      {/* Comments Modal */}
      <CommentsModal
        isOpen={!!activePostId}
        onClose={() => setActivePostId(null)}
        postId={activePostId || ''}
        comments={comments}
        onSubmitComment={(content) => void addComment(content)}
      />
    </div>
  );
};
