import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ChevronLeft, Camera, Bell } from 'lucide-react';
import { useSharedLists } from '@/modules/planning/hooks/useSharedLists';
import { CoverImagePicker } from '@/modules/planning/components/ui/CoverImagePicker';
import { COVER_IMAGES } from '@/modules/planning/constants/coverImages';

const CreateSharedList = () => {
  const navigate = useNavigate();
  const { createList } = useSharedLists();
  const [name, setName] = useState('');
  const [scheduledDate, setScheduledDate] = useState(
    new Date().toISOString().split('T')[0],
  );
  const [notifyEnabled, setNotifyEnabled] = useState(true);
  const [coverImage, setCoverImage] = useState(COVER_IMAGES[0]);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 模擬群組 ID
  const GROUP_ID = 'group_001';

  const handleSubmit = async () => {
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await createList({
        name,
        scheduledDate: new Date(scheduledDate).toISOString(),
        coverImageUrl: coverImage,
        notifyEnabled,
        groupId: GROUP_ID,
      });
      navigate('/planning');
    } catch (error) {
      console.error(error);
      toast.error('建立失敗，請稍後再試');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white px-4 py-3 flex items-center gap-3 border-b border-neutral-100">
        <button onClick={() => navigate(-1)} className="p-1">
          <ChevronLeft className="w-6 h-6 text-neutral-700" />
        </button>
        <h1 className="text-lg font-bold text-neutral-800">建立清單</h1>
      </header>

      <div className="p-4 space-y-6">
        {/* 建立時間 (Display Only) */}
        <div>
          <label className="block text-xs font-medium text-neutral-500 mb-1">
            建立時間
          </label>
          <div className="w-full px-3 py-3 bg-neutral-50 rounded-xl text-neutral-400 text-sm">
            {new Date().toLocaleString()}
          </div>
        </div>

        {/* 清單名稱 */}
        <div>
          <label className="block text-sm font-bold text-neutral-800 mb-2">
            清單名稱
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="輸入清單名稱 (例如: 週末採購)"
            className="w-full px-4 py-3 bg-neutral-50 rounded-xl border border-transparent focus:bg-white focus:border-red-400 focus:outline-none transition-colors"
          />
        </div>

        {/* 預計採買日期 */}
        <div>
          <label className="block text-sm font-bold text-neutral-800 mb-2">
            預計採買日期
          </label>
          <input
            type="date"
            value={scheduledDate}
            onChange={(e) => setScheduledDate(e.target.value)}
            className="w-full px-4 py-3 bg-neutral-50 rounded-xl border border-transparent focus:bg-white focus:border-red-400 focus:outline-none transition-colors"
          />
        </div>

        {/* 通知開關 */}
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-neutral-600" />
            <span className="text-sm font-bold text-neutral-800">開啟通知</span>
          </div>
          <button
            onClick={() => setNotifyEnabled(!notifyEnabled)}
            className={`w-12 h-6 rounded-full p-1 transition-colors ${notifyEnabled ? 'bg-red-400' : 'bg-neutral-200'}`}
          >
            <div
              className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${notifyEnabled ? 'translate-x-6' : 'translate-x-0'}`}
            />
          </button>
        </div>

        {/* 封面照片選擇 */}
        <div>
          <label className="block text-sm font-bold text-neutral-800 mb-2">
            封面照片
          </label>
          <div className="relative aspect-video rounded-xl overflow-hidden bg-neutral-100 mb-3">
            <img
              src={coverImage}
              alt="Cover"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/20" />
            <button
              onClick={() => setIsPickerOpen(true)}
              className="absolute bottom-3 right-3 bg-white/90 backdrop-blur text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-1 shadow-sm active:scale-95 transition-transform"
            >
              <Camera className="w-3 h-3" /> 更換照片
            </button>
          </div>
        </div>
      </div>

      {/* 底部按鈕 */}
      <div className="mt-8 p-4 bg-white border-t border-neutral-100">
        <button
          onClick={handleSubmit}
          disabled={!name.trim() || isSubmitting}
          className="w-full py-3.5 bg-red-400 text-white rounded-xl font-bold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all"
        >
          {isSubmitting ? '建立中...' : '建立'}
        </button>
      </div>

      {/* 封面選擇器 */}
      <CoverImagePicker
        open={isPickerOpen}
        onOpenChange={setIsPickerOpen}
        selectedImage={coverImage}
        onSelect={setCoverImage}
      />
    </div>
  );
};

export default CreateSharedList;
