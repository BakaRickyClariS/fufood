import { useState } from 'react';
import { ChevronDown, MessageCircle } from 'lucide-react';
import SettingsModalLayout from '@/modules/settings/components/SettingsModalLayout';
import { Button } from '@/shared/components/ui/button';

type FAQItem = {
  question: string;
  answer: string;
};

const FAQS: FAQItem[] = [
  {
    question: '如何掃描發票存入食材？',
    answer:
      '點擊底部導覽列的相機按鈕，選擇「掃描發票」，對準發票 QR Code 即可自動辨識並匯入食材。',
  },
  {
    question: '食材快過期會有提醒嗎？',
    answer:
      '有的，系統預設會在食材過期前 3 天發送推播通知。您可以在「設定 > 推播通知」中調整提醒設定。',
  },
  {
    question: '如何邀請家人共用冰箱？',
    answer:
      '請至首頁左上角切換群組，選擇「建立群組」或是在現有群組中點擊「邀請成員」，將邀請連結傳送給家人即可。',
  },
  {
    question: 'AI 食譜生成的次數有限制嗎？',
    answer:
      '免費版每日可生成 3 次食譜。升級至進階版後，即可享有無限次數生成的服務。',
  },
];

type HelpCenterProps = {
  isOpen: boolean;
  onClose: () => void;
};

const HelpCenter = ({ isOpen, onClose }: HelpCenterProps) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <SettingsModalLayout
      isOpen={isOpen}
      onClose={onClose}
      title="問題與幫助"
    >

      <div className="max-w-layout-container mx-auto px-4 py-6 space-y-6">
        {/* Contact Support CTA */}
        <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
          <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3 text-primary-600">
            <MessageCircle className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-neutral-800 mb-1">
            遇到問題了嗎？
          </h3>
          <p className="text-sm text-neutral-500 mb-4">
            我們的客服團隊隨時為您服務
          </p>
          <Button className="w-full">聯絡客服</Button>
        </div>

        {/* FAQ List */}
        <div>
          <h3 className="text-lg font-bold text-neutral-800 mb-4 px-2">
            常見問題
          </h3>
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {FAQS.map((faq, index) => (
              <div
                key={index}
                className={`border-b border-neutral-100 last:border-0`}
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full text-left px-5 py-4 flex items-center justify-between hover:bg-neutral-50 transition-colors"
                >
                  <span className="font-medium text-neutral-800 pr-4">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-neutral-400 transition-transform duration-200 ${
                      openIndex === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <div
                  className={`px-5 text-sm text-neutral-600 leading-relaxed bg-neutral-50 overflow-hidden transition-all duration-300 ease-in-out ${
                    openIndex === index
                      ? 'max-h-40 py-4 border-t border-neutral-100'
                      : 'max-h-0'
                  }`}
                >
                  {faq.answer}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SettingsModalLayout>
  );
};

export default HelpCenter;
