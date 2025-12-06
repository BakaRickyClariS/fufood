import type { SharedListPost } from '@/modules/planning/types';
import { MessageCircle, Heart, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

type PostCardProps = {
  post: SharedListPost;
  onToggleLike: (postId: string) => Promise<void> | void;
};

export const PostCard = ({ post, onToggleLike }: PostCardProps) => {
  const getTimeAgo = (dateString: string) => {
    // 簡單實作，實際應使用 date-fns
    const diff = Date.now() - new Date(dateString).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes}分鐘`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}小時`;
    return `${Math.floor(hours / 24)}天`;
  };

  return (
    <div className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-neutral-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <img 
            src={post.authorAvatar} 
            alt={post.authorName} 
            className="w-10 h-10 rounded-full bg-neutral-100"
          />
          <div>
            <div className="font-bold text-sm">{post.authorName}</div>
            <div className="text-xs text-neutral-400">{getTimeAgo(post.createdAt)}</div>
          </div>
        </div>
        <button className="text-neutral-400">•••</button>
      </div>

      {/* Content */}
      <div className="mb-3">
        {post.content && <p className="text-sm mb-3">{post.content}</p>}
        
        {/* Shopping Items */}
        <div className="space-y-2 mb-3">
          {post.items.map(item => (
            <div key={item.id} className="flex justify-between text-sm py-1 border-b border-dashed border-neutral-100 last:border-0">
              <span>{item.name}</span>
              <span className="font-medium">{item.quantity}{item.unit}</span>
            </div>
          ))}
        </div>

        {/* Images Grid */}
        {post.images.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
             {post.images.map((img, idx) => (
               <img 
                key={idx} 
                src={img} 
                alt="Post" 
                className="w-full h-48 object-cover rounded-lg flex-shrink-0" 
              />
             ))}
          </div>
        )}
      </div>

      {/* Footer / Actions */}
      <div className="flex items-center justify-between pt-2">
         {/* 左側互動區 */}
         <div className="flex gap-4">
           {/* 留言 */}
           <button className="flex items-center gap-1 text-neutral-500">
             <MessageCircle className="w-5 h-5" />
             <span className="text-sm font-medium">{post.commentsCount}</span>
           </button>
            {/* 按讚 */}
           <button onClick={() => onToggleLike(post.id)} className="flex items-center gap-1">
             <Heart className={cn("w-5 h-5 transition-colors", post.isLiked ? "fill-red-400 text-red-400" : "text-neutral-500")} />
             <span className="text-sm font-medium text-neutral-500">{post.likesCount}</span>
           </button>
         </div>
         {/* 右側加入購物清單 (模擬) */}
         <button className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-500">
           <Plus className="w-5 h-5" />
         </button>
      </div>
    </div>
  );
};
