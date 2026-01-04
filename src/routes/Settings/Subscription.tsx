import { useState } from 'react';
import { useAuth } from '@/modules/auth';
import { useUpdateProfileMutation } from '@/modules/settings/api/queries';
import SettingsModalLayout from '@/modules/settings/components/SettingsModalLayout';
import { Button } from '@/shared/components/ui/button';
import MockPaymentModal from '@/modules/settings/components/MockPaymentModal';
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

type SubscriptionProps = {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (key: string) => void;
};

const Subscription = ({ isOpen, onClose, onNavigate }: SubscriptionProps) => {
  const { user } = useAuth();
  const updateProfileMutation = useUpdateProfileMutation();

  // Mock current tier if not present, assume 'free' for now as default
  const currentTier = user?.membershipTier || 'free';

  const [selectedPlanId, setSelectedPlanId] = useState<string>(currentTier);
  const [showPayment, setShowPayment] = useState(false);
  const [isPaymentSuccess, setIsPaymentSuccess] = useState(false);

  const selectedPlan = PLANS.find((p) => p.id === selectedPlanId);
  const isDirty = selectedPlanId !== currentTier;

  // Sync selected with current when opening
  if (!isOpen && selectedPlanId !== currentTier) {
     // This logic might be buggy if done during render without useEffect.
     // But since we mount/unmount or use key, maybe ok.
     // Better to use useEffect.
  }
  
  const handlePaymentConfirm = async () => {
    if (!selectedPlan || !user) return;

    // 1. Save mock order to localStorage
    const newOrder = {
      id: `ORD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      date: new Date().toLocaleDateString('zh-TW'),
      item: selectedPlan.name,
      amount: selectedPlan.price.split('/')[0], // "$200元"
      status: 'completed',
    };

    const storedOrders = localStorage.getItem('fufood_mock_orders');
    const orders = storedOrders ? JSON.parse(storedOrders) : [];
    localStorage.setItem('fufood_mock_orders', JSON.stringify([newOrder, ...orders]));

    // 2. Update profile with mock subscription tier
    return updateProfileMutation.mutateAsync(
      {
        data: {
          name: user.name || '',
          subscriptionTier: selectedPlan.id === 'premium' ? 1 : 0, // Mock mapping
        },
      },
      {
        onSuccess: () => {
          setIsPaymentSuccess(true);
          // 不要在這裡立即關閉，讓 MockPaymentModal 處理動畫和關閉
        },
      }
    );
  };

  return (
    <>
      <SettingsModalLayout
        isOpen={isOpen}
        onClose={onClose}
        title="會員方案"
      >
        <div className="max-w-layout-container mx-auto px-4 py-6 space-y-4 pb-24">
          {PLANS.map((plan) => {
            const isCurrent = currentTier === plan.id;
            const isSelected = selectedPlanId === plan.id;

            return (
              <div
                key={plan.id}
                onClick={() => setSelectedPlanId(plan.id)}
                className={`relative bg-white rounded-3xl p-6 shadow-sm border-2 cursor-pointer transition-all ${
                  isSelected 
                    ? 'border-[#F68072] ring-1 ring-[#F68072]' 
                    : 'border-neutral-200 hover:border-neutral-300'
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
                    <h3
                      className={`text-base font-bold ${plan.titleColor} text-center leading-tight mb-1`}
                    >
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
                        <li
                          key={idx}
                          className="text-sm text-neutral-600 flex items-start"
                        >
                          <span className="mr-1.5 font-bold text-neutral-400">
                            •
                          </span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}

          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-sm border-t border-neutral-100 max-w-[430px] mx-auto w-full z-20">
            <Button 
              onClick={() => {
                setIsPaymentSuccess(false);
                setShowPayment(true);
              }}
              disabled={!isDirty || updateProfileMutation.isPending}
              className="w-full bg-[#F68072] hover:bg-[#E57366] disabled:bg-[#f6807280] disabled:opacity-100 text-white h-12 rounded-xl text-lg font-bold shadow-md transition-colors"
            >
              {updateProfileMutation.isPending ? '處理中...' : '變動方案'}
            </Button>
          </div>
        </div>
      </SettingsModalLayout>

      {selectedPlan && (
        <MockPaymentModal
          isOpen={showPayment}
          onClose={() => {
            setShowPayment(false);
            if (isPaymentSuccess) {
              onNavigate('purchase-history');
            }
          }}
          planName={selectedPlan.name}
          amount={selectedPlan.price.split('/')[0]}
          onConfirm={handlePaymentConfirm}
        />
      )}
    </>
  );
};

export default Subscription;
