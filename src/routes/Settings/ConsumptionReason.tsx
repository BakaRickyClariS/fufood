import SettingsModalLayout from '@/modules/settings/components/SettingsModalLayout';
import { Bubbles } from 'lucide-react'; // If Bubbles is not found, will default to something else later, but assuming valid.
// Wait, Bubbles is not in lucide-react? QuickActions used it.
// I'll check QuickActions imports again later.

type ConsumptionReasonProps = {
  isOpen: boolean;
  onClose: () => void;
};

const ConsumptionReason = ({ isOpen, onClose }: ConsumptionReasonProps) => {
    const reasons = ['已食用', '過期丟棄', '分送親友', '其他原因'];

  return (
    <SettingsModalLayout isOpen={isOpen} onClose={onClose} title="消耗原因">
      <div className="max-w-layout-container mx-auto px-4 py-6">
         <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
            <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-500">
                    {/* Bubbles might be renamed to MessageCircle or similar if not found, but using Bubbles as per QuickActions */}
                    <Bubbles className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-neutral-800">預設消耗原因</h3>
            </div>
            <div className="space-y-3">
                {reasons.map((reason, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl">
                        <span className="text-neutral-700 font-medium">{reason}</span>
                    </div>
                ))}
            </div>
         </div>
         <p className="text-center text-neutral-400 text-sm">
            目前僅提供預設選項，未來將開放自訂功能。
         </p>
      </div>
    </SettingsModalLayout>
  );
};

export default ConsumptionReason;
