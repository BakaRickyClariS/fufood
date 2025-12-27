import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ChevronLeft, Camera, CalendarDays, CalendarCheck } from 'lucide-react';
import { useSharedLists } from '@/modules/planning/hooks/useSharedLists';
import { CoverImagePicker } from '@/modules/planning/components/ui/CoverImagePicker';
import { COVER_IMAGES } from '@/modules/planning/constants/coverImages';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

const CreateSharedList = () => {
  const navigate = useNavigate();
  const { createList } = useSharedLists();
  const containerRef = useRef<HTMLDivElement>(null);
  const [name, setName] = useState('');
  const [scheduledDate, setScheduledDate] = useState(
    new Date().toISOString().split('T')[0],
  );
  const [notifyEnabled, setNotifyEnabled] = useState(true);
  const [coverImage, setCoverImage] = useState('');
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 模擬群組 ID
  const GROUP_ID = 'group_001';

  useGSAP(
    () => {
      gsap.from(containerRef.current, {
        x: '100%',
        duration: 0.5,
        ease: 'power2.out',
      });
    },
    { scope: containerRef },
  );

  const handleBack = () => {
    gsap.to(containerRef.current, {
      x: '100%',
      duration: 0.3,
      ease: 'power2.in',
      onComplete: () => {
        navigate('/planning', { viewTransition: true });
      },
    });
  };

  const handleSubmit = async () => {
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await createList({
        name,
        scheduledDate: new Date(scheduledDate).toISOString(),
        coverImageUrl: coverImage || COVER_IMAGES[0], // Fallback if needed, or allow empty?
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
    <div ref={containerRef} className="min-h-screen bg-neutral-100">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white px-4 py-3 flex items-center gap-3 border-b border-neutral-100 shadow-sm">
        <button onClick={handleBack} className="p-1">
          <ChevronLeft className="w-6 h-6 text-neutral-700" />
        </button>
        <h1 className="text-base font-bold text-neutral-800">建立清單</h1>
      </header>

      <div className="px-4 pt-6 space-y-6">
        {/* 建立時間 (Display Only) */}
        <div className="bg-white rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-6 bg-primary-default rounded-full" />
            <h2 className="text-base font-bold text-neutral-800">
              清單建立時間
            </h2>
          </div>
          <div className="w-full px-4 py-3 bg-primary-light rounded-2xl flex items-center justify-between">
            <div className="p-1">
              <CalendarCheck className="w-6 h-6 text-primary-default" />
            </div>
            <div className="text-right">
              <div className="text-base font-semibold text-primary-default tracking-wide font-mono">
                {new Date()
                  .toLocaleDateString('zh-TW', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                  })
                  .replace(/\//g, '/')}
              </div>
              <div className="text-base font-semibold text-primary-default tracking-wide font-mono">
                {new Date().toLocaleTimeString('zh-TW', {
                  hour12: false,
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          </div>
        </div>

        {/* 清單資訊 */}
        <div className="bg-white rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-6 bg-primary-default rounded-full" />
            <h2 className="text-base font-bold text-neutral-800">清單資訊</h2>
          </div>

          {/* 清單名稱 */}
          <div>
            <label className="block text-sm font-semibold text-neutral-600 mb-2">
              清單名 <span className="text-primary-default">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Add value"
              className="w-full px-4 py-3 bg-white rounded-xl border border-neutral-300 text-neutral-800 placeholder:text-neutral-300 focus:border-primary-default focus:ring-1 focus:ring-primary-default focus:outline-none transition-all"
            />
          </div>

          {/* 預計採買日期 */}
          <div>
            <label className="block text-sm font-semibold text-neutral-600 mb-2">
              預計採買日期 <span className="text-primary-default">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                placeholder="Add value"
                className="w-full px-4 py-3 bg-white rounded-xl border border-neutral-300 text-neutral-800 text-left focus:border-primary-default focus:ring-1 focus:ring-primary-default focus:outline-none transition-all appearance-none [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer relative z-10"
                style={{ minHeight: '48px' }}
              />
              <CalendarDays className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-800 pointer-events-none z-20" />
            </div>
          </div>

          {/* 通知開關 */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-sm font-bold text-neutral-800">開啟通知</span>
            <button
              onClick={() => setNotifyEnabled(!notifyEnabled)}
              className={`w-12 h-7 rounded-full p-1 transition-colors duration-200 ease-in-out ${notifyEnabled ? 'bg-primary-default' : 'bg-neutral-200'}`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform duration-200 ease-in-out ${notifyEnabled ? 'translate-x-5' : 'translate-x-0'}`}
              />
            </button>
          </div>
        </div>

        {/* 封面照片選擇 */}
        <div className="bg-white rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1 h-6 bg-primary-default rounded-full" />
            <h2 className="text-base font-bold text-neutral-800">清單封面照</h2>
          </div>

          {coverImage ? (
            <div className="relative aspect-video rounded-xl overflow-hidden bg-neutral-100 mb-3 group">
              <img
                src={coverImage}
                alt="Cover"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/20" />
              <button
                onClick={() => setIsPickerOpen(true)}
                className="absolute bottom-3 right-3 bg-white/90 backdrop-blur text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-1 active:scale-95 transition-transform"
              >
                <Camera className="w-3 h-3" /> 更換照片
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsPickerOpen(true)}
              className="w-fit px-5 py-3 rounded-xl border border-neutral-200 flex items-center justify-center gap-2 text-neutral-800 font-bold bg-white active:scale-95 transition-all text-base hover:bg-neutral-50"
            >
              <span className="text-2xl font-light leading-none pb-1">+</span>
              選擇照片
            </button>
          )}
        </div>
      </div>

      {/* 底部按鈕 */}
      <div className="my-6 px-4  border-t border-neutral-100">
        <button
          onClick={handleSubmit}
          disabled={!name.trim() || isSubmitting}
          className="w-full py-3.5 bg-primary-default text-white rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all"
        >
          {isSubmitting ? '儲存中...' : '儲存'}
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
