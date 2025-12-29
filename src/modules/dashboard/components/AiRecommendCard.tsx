import { useState } from 'react';

import { Card } from '@/shared/components/ui/card';
import aiImg from '@/assets/images/dashboard/ai-banner.png';
import { AIQueryModal } from '@/modules/ai/components/AIQueryModal';

const AiRecommendCard = () => {
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  return (
    <>
      <Card className="mt-5 px-5 py-6 rounded-2xl bg-linear-to-br from-[#FFD3CC] to-[#FFC4B8] shadow-[0_6px_14px_-2px_rgba(0,0,0,0.12)] border-none max-w-layout-container mx-auto relative overflow-hidden">
        <div className="max-w-[55%]">
          <p className="text-neutral-800 font-semibold text-lg leading-snug">
            推薦最剛好的料理， 每天都有新靈感！
          </p>

          <button
            onClick={() => setIsAiModalOpen(true)}
            className="mt-4 bg-primary-500 text-white rounded-full px-4 py-2 text-sm font-semibold hover:bg-primary-600 transition-colors"
          >
            問問 FuFood.AI
          </button>
        </div>

        <img
          src={aiImg}
          className="absolute right-2 bottom-0 w-32 object-contain"
          alt="AI assistant illustration"
        />
      </Card>

      <AIQueryModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
      />
    </>
  );
};

export default AiRecommendCard;
