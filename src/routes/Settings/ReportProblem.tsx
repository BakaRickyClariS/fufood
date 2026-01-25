import { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
import { Camera } from 'lucide-react';
import SettingsModalLayout from '@/modules/settings/components/SettingsModalLayout';
import { Button } from '@/shared/components/ui/button';

type ReportProblemProps = {
  isOpen: boolean;
  onClose: () => void;
};

const ReportProblem = ({ isOpen, onClose }: ReportProblemProps) => {
  // const navigate = useNavigate(); // remove
  // const { user } = useAuth(); // User unused for now

  const [formData, setFormData] = useState({
    type: 'bug',
    description: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock submit logic
    console.log('Report submitted:', formData);
    alert('感謝您的回報！我們會盡快處理。');
    onClose();
  };

  return (
    <SettingsModalLayout
      isOpen={isOpen}
      onClose={onClose}
      title="回報問題"
    >

      <form
        onSubmit={handleSubmit}
        className="max-w-layout-container mx-auto px-4 py-6 space-y-6"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-neutral-800">
              問題類型
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'bug', label: '功能異常' },
                { id: 'suggestion', label: '功能建議' },
                { id: 'visual', label: '介面問題' },
              ].map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, type: type.id })}
                  className={`py-2 px-3 rounded-xl text-sm font-medium border transition-all ${
                    formData.type === type.id
                      ? 'bg-primary-50 border-primary-500 text-primary-700'
                      : 'bg-white border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-neutral-800">
              問題描述
            </label>
            <textarea
              required
              rows={5}
              placeholder="請詳細描述您遇到的狀況，例如：在什麼頁面、做了什麼操作、出現什麼錯誤訊息..."
              className="w-full p-4 rounded-xl border border-neutral-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary-500 text-sm"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-neutral-800">
              上傳截圖 (選填)
            </label>
            <div className="border-2 border-dashed border-neutral-200 rounded-xl p-8 flex flex-col items-center justify-center text-neutral-400 bg-white hover:bg-neutral-50 transition-colors cursor-pointer">
              <div className="w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center mb-2">
                <Camera className="w-5 h-5 text-neutral-500" />
              </div>
              <span className="text-sm">點擊上傳圖片</span>
            </div>
          </div>
        </div>

        <div className="pt-4">
          <Button type="submit" className="w-full" size="lg">
            送出回報
          </Button>
          <p className="text-xs text-center text-neutral-400 mt-4 px-4">
            系統將會同時傳送您的裝置資訊與 App 版本 (v1.1.0)
            以協助工程師排查問題。
          </p>
        </div>
      </form>
    </SettingsModalLayout>
  );
};

export default ReportProblem;
