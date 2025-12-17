import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/modules/auth';
import ComponentHeader from '@/modules/settings/components/SimpleHeader';
import { Button } from '@/shared/components/ui/button';
import brownShield from '@/assets/images/settings/brown.png';
import silverShield from '@/assets/images/settings/silver.png';

const PLANS = [
  {
    id: 'free',
    name: 'Free基礎入門',
    price: '$0元/月',
    image: brownShield,
    features: [
      '群組管理：3 個',
      '共享採買清單：5 筆',
      '雲端庫存空間：100 GB',
      '智慧通知服務：LINE即時通知',
      '群組成員：3位',
      'AI 功能：食材辨識與食譜推薦',
    ],
    titleColor: 'text-[#A05E44]',
    borderColor: 'border-[#F68072]',
  },
  {
    id: 'premium',
    name: 'Pro專業家庭',
    price: '$200元/月',
    image: silverShield,
    features: [
      '群組管理：5 個',
      '共享採買清單：10 筆',
      '雲端庫存空間：1TB',
      '智慧通知服務：LINE即時通知',
      '群組成員：5位',
      'AI 功能：食材辨識與食譜推薦',
    ],
    titleColor: 'text-[#A05E44]',
    borderColor: 'border-neutral-200',
  },
];

const Subscription = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Mock current tier if not present, assume 'free' for now as default
  const currentTier = user?.membershipTier || 'free';

  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-24 font-['Noto_Sans_TC']">
      <ComponentHeader title="會員方案" onBack={() => navigate(-1)} />

      <div className="max-w-layout-container mx-auto px-4 py-6 space-y-4">
        
        {PLANS.map((plan) => {
          const isCurrent = currentTier === plan.id;
          
          return (
            <div
              key={plan.id}
              className={`relative bg-white rounded-3xl p-6 shadow-sm border-2 ${
                isCurrent ? plan.borderColor : 'border-neutral-200'
              }`}
            >
              {isCurrent && (
                <div className="absolute top-0 left-0 bg-[#F68072] text-white text-xs font-bold px-3 py-1.5 rounded-tl-2xl rounded-br-2xl shadow-sm z-10">
                  目前方案
                </div>
              )}

              <div className="flex items-start gap-4">
                {/* Left: Icon & Price */}
                <div className="flex flex-col items-center justify-center w-28 shrink-0 mt-4">
                  <img 
                    src={plan.image} 
                    alt={plan.name} 
                    className="w-20 h-auto object-contain mb-3 drop-shadow-sm"
                  />
                  <h3 className={`text-base font-bold ${plan.titleColor} text-center leading-tight mb-1`}>
                    {plan.name}
                  </h3>
                  <div className="text-lg font-medium text-neutral-700">
                    {plan.price}
                  </div>
                </div>

                {/* Right: Features */}
                <div className="flex-1 py-1">
                  <ul className="space-y-1.5">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="text-sm text-neutral-600 flex items-start">
                        <span className="mr-1.5 font-bold text-neutral-400">•</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-sm border-t border-neutral-100 max-w-[430px] mx-auto w-full">
           <Button 
            className="w-full bg-[#F68072] hover:bg-[#E57366] text-white h-12 rounded-xl text-lg font-bold shadow-md"
           >
             變動方案
           </Button>
        </div>

      </div>
    </div>
  );
};

export default Subscription;
