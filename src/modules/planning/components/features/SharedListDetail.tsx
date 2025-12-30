import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useSharedListDetail } from '@/modules/planning/hooks/useSharedLists';
import { useSharedListItems } from '@/modules/planning/hooks/useSharedListItems';
// import { PostCard } from '../ui/PostCard'; // Remove PostCard
import { PostFormFeature } from './CreatePost';
import { FloatingActionButton } from '@/shared/components/ui/FloatingActionButton';
import type { SharedListItem } from '@/modules/planning/types';
import { Pencil, Trash2 } from 'lucide-react';

type SharedListDetailProps = {
  listId?: string;
};

export const SharedListDetail = ({ listId }: SharedListDetailProps) => {
  const navigate = useNavigate();
  const { list, isLoading: listLoading } = useSharedListDetail(listId);
  const { items, isLoading: itemsLoading, deleteItem } = useSharedListItems(listId);

  const [showItemForm, setShowItemForm] = useState(false);
  const [editingItem, setEditingItem] = useState<SharedListItem | null>(null);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setShowItemForm(true);
  };

  const handleEdit = (item: SharedListItem) => {
    setEditingItem(item);
    setShowItemForm(true);
  };

  const handleCloseForm = () => {
    setShowItemForm(false);
    setEditingItem(null);
  };

  const handleDelete = async (itemId: string) => {
    if (confirm('確定要刪除這個項目嗎？')) {
      await deleteItem(itemId);
      toast.success('項目已刪除');
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
    completed: {
      text: '已完成',
      bgClass: 'bg-neutral-400',
    },
  } as const;

  const currentStatus = statusConfig[
    list.status as keyof typeof statusConfig
  ] ?? {
    text: '進行中', // Fallback to in-progress if unknown or previously pending-purchase
    bgClass: 'bg-success-500',
  };

  return (
    <div className="min-h-screen bg-neutral-200 pb-24">
      {/* List Header - 用內容推開高度 */}
      <div className="relative bg-white rounded-b-2xl overflow-hidden z-10 mb-6">
        {/* 背景圖 - 絕對定位填滿 */}
        <img
          src={list.coverPhotoPath || ''}
          alt={list.title}
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
            <h2 className="text-lg font-bold text-neutral-700 tracking-wide">
              共享清單
            </h2>
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
                {list.title}
              </h1>
            </div>

            {/* Right: Date Card */}
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

      {/* Items Feed */}
      <div className="px-4 space-y-4">
        {itemsLoading ? (
          <div className="text-center py-8 text-neutral-400">載入項目中...</div>
        ) : items.length === 0 ? (
          <div className="text-center py-12 text-neutral-400 bg-white rounded-xl border border-dashed border-neutral-200">
            <p>目前還沒有項目，新增你的第一筆採買清單吧！</p>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm"
            >
              <div className="flex items-center gap-4">
                {item.photoPath && (
                  <img
                    src={item.photoPath}
                    alt={item.name}
                    className="w-16 h-16 rounded-xl object-cover bg-neutral-100"
                  />
                )}
                <div>
                  <h3 className="font-bold text-neutral-800 text-lg">
                    {item.name}
                  </h3>
                  <p className="text-neutral-500 font-medium">
                    {item.quantity} {item.unit}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                 <button
                   onClick={() => handleEdit(item)}
                   className="p-2 text-neutral-400 hover:text-primary-default hover:bg-neutral-50 rounded-full transition-colors"
                 >
                   <Pencil className="w-5 h-5" />
                 </button>
                 <button
                   onClick={() => handleDelete(item.id)}
                   className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                 >
                   <Trash2 className="w-5 h-5" />
                 </button>
              </div>
            </div>
          ))
        )}
      </div>

      <FloatingActionButton
        onClick={handleOpenCreate}
        className="bg-[#EE5D50] hover:bg-[#E54D40]"
      />

      {/* Post Form Overlay */}
      {showItemForm && (
        <PostFormFeature
          listId={listId}
          mode={editingItem ? 'edit' : 'create'}
          initialData={editingItem}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
};
