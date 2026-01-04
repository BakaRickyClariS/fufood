import SettingsModalLayout from '@/modules/settings/components/SettingsModalLayout';
import { Button } from '@/shared/components/ui/button';
import lineGreenIcon from '@/assets/images/settings/line-green.svg';

type LineBindingProps = {
  isOpen: boolean;
  onClose: () => void;
};

import { useAuth } from '@/modules/auth';

const LineBinding = ({ isOpen, onClose }: LineBindingProps) => {
  const { user } = useAuth();
  const isLinked = !!user?.lineId;

  return (
    <SettingsModalLayout isOpen={isOpen} onClose={onClose} title="LINE 綁定">
      <div className="max-w-layout-container w-full mx-auto px-4 py-8 flex flex-col items-center text-center">
         <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${
           isLinked ? 'bg-neutral-100' : 'bg-[#06C755]/10'
         }`}>
            <img 
              src={lineGreenIcon} 
              alt="LINE" 
              className={`w-10 h-10 ${isLinked ? 'grayscale opacity-50' : ''}`} 
            />
         </div>
         <h2 className="text-xl font-bold text-neutral-800 mb-2">
           {isLinked ? '已綁定 LINE 帳號' : '綁定 LINE 帳號'}
         </h2>
         <p className="text-neutral-500 mb-8">
           {isLinked 
             ? '您的帳號已成功連結 LINE，可使用 LINE 快速登入。' 
             : '綁定 LINE 帳號後，您可以使用 LINE 快速登入，並接收即時通知。'}
         </p>
         <Button
           className={`w-full h-12 rounded-xl text-lg font-bold shadow-md ${
             isLinked 
               ? 'bg-neutral-200 text-neutral-500 hover:bg-neutral-200' 
               : 'bg-[#06C755] hover:bg-[#05b34c] text-white'
           }`}
           onClick={() => !isLinked && alert('LINE 綁定功能尚未實作')}
           disabled={isLinked}
         >
           {isLinked ? '已綁定' : '立即綁定'}
         </Button>
      </div>
    </SettingsModalLayout>
  );
};

export default LineBinding;
