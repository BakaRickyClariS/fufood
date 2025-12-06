import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Image as ImageIcon } from 'lucide-react';
import { usePosts } from '@/modules/planning/hooks/usePosts';
import { ShoppingItemEditor } from '../ui/ShoppingItemEditor';
import type { ShoppingItem } from '@/modules/planning/types';
import { COVER_IMAGES } from '@/modules/planning/constants/coverImages';

type CreatePostFeatureProps = {
  listId?: string;
};

export const CreatePostFeature = ({ listId }: CreatePostFeatureProps) => {
  const navigate = useNavigate();
  const { createPost } = usePosts(listId);
  
  const [content, setContent] = useState('');
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock 圖片選擇 (隨機選一張)
  const addMockImage = () => {
    if (selectedImages.length >= 3) return;
    const randomImg = COVER_IMAGES[Math.floor(Math.random() * COVER_IMAGES.length)];
    setSelectedImages([...selectedImages, randomImg]);
  };

  const handleSubmit = async () => {
    if (!listId) return;
    if (content.length > 40) {
      alert('說明文字不能超過 40 字');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await createPost({
        listId,
        content,
        images: selectedImages,
        items,
      });
      navigate(-1);
    } catch (err) {
      console.error(err);
      alert('發布失敗');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!listId) return <div>Invalid List ID</div>;

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white px-4 py-3 flex items-center justify-between border-b border-neutral-100">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1">
            <ChevronLeft className="w-6 h-6 text-neutral-700" />
          </button>
          <h1 className="text-lg font-bold text-neutral-800">新增貼文</h1>
        </div>
      </header>

      <div className="p-4 space-y-6">
        {/* Photo Upload */}
        <div className="flex gap-3 overflow-x-auto pb-2">
           <button 
             onClick={addMockImage}
             disabled={selectedImages.length >= 3}
             className="w-24 h-24 rounded-xl bg-neutral-50 border border-dashed border-neutral-300 flex flex-col items-center justify-center gap-1 text-neutral-400 flex-shrink-0 active:bg-neutral-100"
           >
             <ImageIcon className="w-6 h-6" />
             <span className="text-xs">新增照片</span>
           </button>
           
           {selectedImages.map((img, idx) => (
             <div key={idx} className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
               <img src={img} alt="Selected" className="w-full h-full object-cover" />
               <button 
                 onClick={() => setSelectedImages(selectedImages.filter((_, i) => i !== idx))}
                 className="absolute top-1 right-1 w-5 h-5 bg-black/50 rounded-full text-white flex items-center justify-center text-xs"
               >
                 ×
               </button>
             </div>
           ))}
        </div>

        {/* Content Input */}
        <div>
           <textarea
             value={content}
             onChange={(e) => setContent(e.target.value)}
             placeholder="這東西超好用！大家要不要一起買？(限40字)"
             rows={3}
             className="w-full p-3 bg-neutral-50 rounded-xl border border-transparent focus:bg-white focus:border-red-400 focus:outline-none resize-none"
           />
           <div className={`text-right text-xs mt-1 ${content.length > 40 ? 'text-red-500' : 'text-neutral-400'}`}>
             {content.length}/40
           </div>
        </div>

        {/* Shopping Items */}
        <ShoppingItemEditor items={items} onChange={setItems} />
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-neutral-100">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || (content.length === 0 && items.length === 0)}
          className="w-full py-3.5 bg-red-400 text-white rounded-xl font-bold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed active:scale-98 transition-all"
        >
          {isSubmitting ? '發布中...' : '分享發布'}
        </button>
      </div>
    </div>
  );
};
