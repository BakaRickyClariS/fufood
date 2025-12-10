import { Info } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { LAYOUT_CONFIGS } from '@/modules/inventory/types/layoutTypes';
import {
  selectCurrentLayout,
  setLayout,
} from '@/modules/inventory/store/inventorySlice';
import { inventoryApi } from '@/modules/inventory/api';
import { Button } from '@/shared/components/ui/button';
import type { LayoutType } from '@/modules/inventory/types/layoutTypes';
import { useEffect } from 'react';

const LayoutAppearanceSection = () => {
  const dispatch = useDispatch();
  const currentLayout = useSelector(selectCurrentLayout);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await inventoryApi.getSettings();
        if (response.data.settings.layoutType) {
          dispatch(setLayout(response.data.settings.layoutType));
        }
      } catch (error) {
        console.error('Failed to fetch layout settings:', error);
      }
    };
    fetchSettings();
  }, [dispatch]);

  const handleApplyLayout = async () => {
    // 這裡我們假設 Redux 狀態已經被選擇更新
    try {
      // 1. 更新後端/LocalStorage
      await inventoryApi.updateSettings({ layoutType: currentLayout });
      // 2. 顯示成功訊息 (可選)
    } catch (error) {
      console.error('Failed to update layout settings', error);
    }
  };

  const handleSelectLayout = (layoutId: LayoutType) => {
    dispatch(setLayout(layoutId));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-bold text-neutral-900">庫存外觀</h2>
        <Info className="w-4 h-4 text-neutral-400" />
      </div>

      <div className="bg-white rounded-[20px] p-6 space-y-6">
        <div className="grid grid-cols-3 gap-3">
          {LAYOUT_CONFIGS.map((config) => {
            const isSelected = currentLayout === config.id;
            return (
              <div
                key={config.id}
                className="flex flex-col items-center  cursor-pointer group"
                onClick={() => handleSelectLayout(config.id)}
              >
                <div
                  className={`
                    relative w-full h-[156px] rounded-xl overflow-hidden transition-all duration-200
                  `}
                >
                  <img
                    src={isSelected ? config.imageActive : config.imageDefault}
                    alt={config.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                {/* Radio Indicator - Moved outside and below image */}
                <div className="flex flex-col items-center gap-2 mt-4">
                  <span
                    className={`text-sm font-medium ${isSelected ? 'text-[#F58274]' : 'text-neutral-600'}`}
                  >
                    {config.name}
                  </span>
                  <div
                    className={`
                      w-5 h-5 rounded-full border flex items-center justify-center transition-colors border-2
                      ${isSelected ? 'bg-[#F58274] border-[#F58274]' : 'bg-white border-neutral-400'}
                    `}
                  >
                    {isSelected && (
                      <div className="w-3.5 h-3.5 bg-primary-400 rounded-full border-white border-2" />
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <Button
          className="w-full bg-[#F58274] hover:bg-[#E07063] text-white rounded-xl h-12 text-base font-bold shadow-sm active:scale-95 transition-transform"
          onClick={handleApplyLayout}
        >
          套用
        </Button>
      </div>
    </div>
  );
};

export default LayoutAppearanceSection;
