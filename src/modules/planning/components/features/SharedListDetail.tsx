import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useSharedListDetail } from '@/modules/planning/hooks/useSharedLists';
import { usePosts } from '@/modules/planning/hooks/usePosts';
import { PostCard } from '../ui/PostCard';
import { FloatingActionButton } from '@/shared/components/ui/FloatingActionButton';

type SharedListDetailProps = {
  listId?: string;
};

export const SharedListDetail = ({ listId }: SharedListDetailProps) => {
  const navigate = useNavigate();
  const { list, isLoading: listLoading } = useSharedListDetail(listId);
  const { posts, isLoading: postsLoading } = usePosts(listId);

  if (!listId) return <div>List ID required</div>;
  if (listLoading) return <div className="p-8 text-center text-neutral-400">載入中...</div>;
  if (!list) return <div className="p-8 text-center text-neutral-400">找不到清單</div>;

  return (
    <div className="min-h-screen bg-neutral-50 pb-24">
       {/* List Header */}
       <div className="relative h-48 bg-white">
         <img src={list.coverImageUrl} alt={list.name} className="w-full h-full object-cover" />
         <div className="absolute inset-0 bg-black/30" />
         
         {/* Top Bar */}
         <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between">
           <button onClick={() => navigate('/planning')} className="w-10 h-10 rounded-full bg-black/20 backdrop-blur flex items-center justify-center text-white active:scale-95 transition-transform">
             <ChevronLeft className="w-6 h-6" />
           </button>
           
           <div className={`px-3 py-1 rounded-full text-xs font-bold backdrop-blur
             ${list.status === 'in-progress' ? 'bg-green-400/80 text-white' : 
               list.status === 'pending-purchase' ? 'bg-yellow-400/80 text-white' : 'bg-neutral-400/80 text-white'}`}>
             {list.status === 'in-progress' ? '進行中' : list.status === 'pending-purchase' ? '待採買' : '已完成'}
           </div>
         </div>

         {/* Title Area */}
         <div className="absolute bottom-0 left-0 right-0 p-4 text-white bg-gradient-to-t from-black/60 to-transparent">
            <h1 className="text-2xl font-bold mb-1">{list.name}</h1>
            <p className="text-sm opacity-90">{new Date(list.scheduledDate).toLocaleDateString()} 預計採買</p>
         </div>
       </div>

       {/* Posts Feed */}
       <div className="p-4">
         {postsLoading ? (
            <div className="text-center py-8 text-neutral-400">載入貼文中...</div>
         ) : posts.length === 0 ? (
            <div className="text-center py-12 text-neutral-400 bg-white rounded-xl border border-dashed border-neutral-200">
               <p>還沒有貼文，新增第一則貼文吧！</p>
            </div>
         ) : (
            posts.map(post => <PostCard key={post.id} post={post} />)
         )}
       </div>

       <FloatingActionButton onClick={() => navigate(`/planning/list/${listId}/post/create`)} />
    </div>
  );
};
