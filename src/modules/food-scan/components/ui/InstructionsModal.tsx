import React from 'react';
import { Check } from 'lucide-react';
import noticeImg from '@/assets/images/food-scan/notice.png';

type InstructionsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  dontShowAgain: boolean;
  onDontShowAgainChange: (checked: boolean) => void;
};

const InstructionsModal: React.FC<InstructionsModalProps> = ({
  isOpen,
  onClose,
  dontShowAgain,
  onDontShowAgainChange,
}) => {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6">
      <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl animate-in fade-in zoom-in duration-300">
        <h2 className="text-xl font-bold text-center mb-6 text-slate-800">
          注意事項
        </h2>

        <div className="flex justify-center mb-6">
          <div className="w-40 h-40 flex items-center justify-center">
            <img src={noticeImg} alt="Instructions" className="w-full h-full object-contain" />
          </div>
        </div>

        <div className="space-y-4 mb-8">
          {[
            '請在光線充足處掃描',
            '請對準食材並保持手機穩定',
            '請避免包裝反光',
            '一次請掃描一樣食材',
          ].map((text, i) => (
            <div key={i} className="flex items-center gap-3 text-slate-600">
              <Check size={18} className="text-red-500 flex-shrink-0" />
              <span className="text-sm font-medium">{text}</span>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3.5 rounded-xl transition-colors mb-4 shadow-lg shadow-red-500/30"
        >
          我知道了
        </button>

        <label className="flex items-center gap-2 justify-center cursor-pointer group">
          <input
            type="checkbox"
            checked={dontShowAgain}
            onChange={(e) => onDontShowAgainChange(e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 text-red-500 focus:ring-red-500"
          />
          <span className="text-slate-400 text-sm group-hover:text-slate-500 transition-colors">
            下次不再顯示提醒
          </span>
        </label>
      </div>
    </div>
  );
};

export default InstructionsModal;
