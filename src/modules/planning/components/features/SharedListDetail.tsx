import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useSharedListDetail } from '@/modules/planning/hooks/useSharedLists';
import { usePosts } from '@/modules/planning/hooks/usePosts';
import { PostCard } from '../ui/PostCard';
import { PostFormFeature } from './CreatePost';
import { FloatingActionButton } from '@/shared/components/ui/FloatingActionButton';
import type { SharedListPost } from '@/modules/planning/types';


type SharedListDetailProps = {
  listId?: string;
};

export const SharedListDetail = ({ listId }: SharedListDetailProps) => {
  const navigate = useNavigate();
  const { list, isLoading: listLoading } = useSharedListDetail(listId);
  const { posts, isLoading: postsLoading, deletePost } = usePosts(listId);

  const [showPostForm, setShowPostForm] = useState(false);
  const [editingPost, setEditingPost] = useState<SharedListPost | null>(null);

  const handleOpenCreate = () => {
    setEditingPost(null);
    setShowPostForm(true);
  };

  const handleEdit = (post: SharedListPost) => {
    setEditingPost(post);
    setShowPostForm(true);
  };

  const handleCloseForm = () => {
    setShowPostForm(false);
    setEditingPost(null);
  };

  const handleDelete = async (postId: string) => {
    if (confirm('確定要刪除這則貼文嗎？')) {
      await deletePost(postId);
      toast.success('貼文已刪除');
    }
  };

  if (!listId) return <div>List ID required</div>;
  if (listLoading)
    return <div className="p-8 text-center text-neutral-400">載入中...</div>;
  if (!list)
    return <div className="p-8 text-center text-neutral-400">找不到清單</div>;

  const statusConfig = {
    'in-progress': {
      text: '進行中',
      bgClass: 'bg-success-500',
    },
    'pending-purchase': {
      text: '待採買',
      bgClass: 'bg-yellow-400',
    },
    completed: {
      text: '已完成',
      bgClass: 'bg-neutral-400',
    },
  } as const;

  const currentStatus = statusConfig[
    list.status as keyof typeof statusConfig
  ] ?? {
    text: '未知狀態',
    bgClass: 'bg-neutral-400',
  };

  return (
    <div className="min-h-screen bg-neutral-200 pb-24">
      {/* List Header - 用內容推開高度 */}
      <div className="relative bg-white rounded-b-2xl overflow-hidden z-10 mb-6">
        {/* 背景圖 - 絕對定位填滿 */}
        <img
          src={list.coverImageUrl}
          alt={list.name}
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* 遮罩層 */}
        <div className="absolute inset-0 bg-white/40 backdrop-blur-xs" />

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
                className={`text-white text-sm w-[67px] h-[32px] rounded-tr-[20px] rounded-br-[20px] rounded-bl-[20px] rounded-tl-none font-bold flex items-center justify-center ${currentStatus.bgClass}`}
              >
                {currentStatus.text}
              </div>
              <h1 className="text-2xl font-bold text-neutral-700 tracking-wide">
                {list.name}
              </h1>
            </div>

            {/* Right: Date Card */}
            <div className="bg-white/70 backdrop-blur rounded-2xl p-3 min-w-[70px] flex flex-col items-center justify-center shadow-lg">
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
        </div>
      </div>

      {/* Posts Feed */}
      <div className="">
        {postsLoading ? (
          <div className="text-center py-8 text-neutral-400">載入貼文中...</div>
        ) : posts.length === 0 ? (
          <div className="mx-4 text-center py-12 text-neutral-400 bg-white rounded-xl border border-dashed border-neutral-200">
            <p>目前還沒有貼文，分享你的第一筆清單吧！</p>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      <FloatingActionButton
        onClick={handleOpenCreate}
        className="bg-[#EE5D50] hover:bg-[#E54D40]"
      />

      {/* Post Form Overlay */}
      {showPostForm && (
        <PostFormFeature
          listId={listId}
          mode={editingPost ? 'edit' : 'create'}
          initialData={editingPost}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
};
