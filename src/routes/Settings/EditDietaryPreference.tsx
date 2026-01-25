import { useRef, useEffect, useState } from 'react';
import { useAuth } from '@/modules/auth';
import { useUpdateProfileMutation } from '@/modules/settings/api/queries';
import { Button } from '@/shared/components/ui/button';
import SettingsModalLayout, { type SettingsModalLayoutRef } from '@/modules/settings/components/SettingsModalLayout';
import ChipGroup from '@/modules/settings/components/ChipGroup';
import {
  COOKING_FREQUENCY_OPTIONS,
  PREP_TIME_OPTIONS,
  SEASONING_LEVEL_OPTIONS,
  DIETARY_RESTRICTION_OPTIONS,
} from '@/modules/settings/constants/dietaryOptions';
import type {
  CookingFrequency,
  PrepTime,
  SeasoningLevel,
  DietaryRestriction,
  DietaryPreference,
} from '@/modules/settings/types/settings.types';

// 允許各欄位為 undefined（未選狀態）
// type EditableDietaryPreference 已移除，直接使用 DietaryPreference

const EditDietaryPreference = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  // const navigate = useNavigate(); // remove
  const { user } = useAuth();
  const updateProfileMutation = useUpdateProfileMutation();
  const layoutRef = useRef<SettingsModalLayoutRef>(null);

  // Local state for preference form - 初始為空（未選狀態）
  const [preferences, setPreferences] = useState<DietaryPreference>({
    cookingFrequency: undefined,
    prepTime: undefined,
    seasoningLevel: undefined,
    restrictions: [],
  });

  const [isDirty, setIsDirty] = useState(false);

  // Initialize with user data
  useEffect(() => {
    if (user?.dietaryPreference) {
      setPreferences(user.dietaryPreference);
    } else {
      // 如果沒有喜好資料，重設為空狀態
      setPreferences({
        cookingFrequency: undefined,
        prepTime: undefined,
        seasoningLevel: undefined,
        restrictions: [],
      });
    }
  }, [user]);

  const handleChange = (
    key: keyof DietaryPreference,
    value: string | string[] | undefined,
  ) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: value,
    }));
    setIsDirty(true);
  };

  const handleSave = () => {
    // 將 dietaryPreference 內容轉換成 preference 標籤陣列
    // 只加入有選擇的值，過濾掉 undefined 和 'none'
    const preferenceLabels: string[] = [];
    
    if (preferences.cookingFrequency) {
      preferenceLabels.push(preferences.cookingFrequency);
    }
    if (preferences.prepTime) {
      preferenceLabels.push(preferences.prepTime);
    }
    if (preferences.seasoningLevel) {
      preferenceLabels.push(preferences.seasoningLevel);
    }
    // 過濾掉 'none' 的限制
    preferences.restrictions
      .filter((r) => r !== 'none')
      .forEach((r) => preferenceLabels.push(r));

    updateProfileMutation.mutate(
      {
        data: {
          name: user?.name || '', // 從 user 物件取得當前名稱
          preferences: preferenceLabels,
        },
      },
      {
        onSuccess: () => {
          // 使用 layoutRef 觸發動畫關閉，而非直接 onClose
          layoutRef.current?.close();
        },
        onError: (error) => {
          console.error('Update dietary preferences failed', error);
        },
      },
    );
  };

  return (
    <SettingsModalLayout
      ref={layoutRef}
      isOpen={isOpen}
      onClose={onClose}
      title="編輯飲食喜好"
    >

      <div className="max-w-layout-container mx-auto px-4 py-6 space-y-8">
        {/* 烹飪基礎 */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-neutral-800 flex items-center gap-2">
            <div className="w-1 h-4 bg-primary-500 rounded-full" />
            烹飪基礎
          </h2>

          <div className="space-y-3">
            <label className="text-sm font-medium text-neutral-600">
              1-1 烹飪頻率
            </label>
            <ChipGroup
              options={COOKING_FREQUENCY_OPTIONS}
              value={preferences.cookingFrequency}
              onChange={(val) =>
                handleChange('cookingFrequency', val as CookingFrequency)
              }
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-neutral-600">
              1-2 備餐時間
            </label>
            <ChipGroup
              options={PREP_TIME_OPTIONS}
              value={preferences.prepTime}
              onChange={(val) => handleChange('prepTime', val as PrepTime)}
            />
          </div>
        </div>

        {/* 調味習慣 */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-neutral-800 flex items-center gap-2">
            <div className="w-1 h-4 bg-primary-500 rounded-full" />
            調味習慣
          </h2>

          <div className="space-y-3">
            <label className="text-sm font-medium text-neutral-600">
              2-1 調味強度
            </label>
            <ChipGroup
              options={SEASONING_LEVEL_OPTIONS}
              value={preferences.seasoningLevel}
              onChange={(val) =>
                handleChange('seasoningLevel', val as SeasoningLevel)
              }
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-neutral-600">
              2-2 特殊限制 (可複選)
            </label>
            <ChipGroup
              multiple
              options={DIETARY_RESTRICTION_OPTIONS}
              value={preferences.restrictions}
              onChange={(val) =>
                handleChange('restrictions', val as DietaryRestriction[])
              }
            />
          </div>
        </div>

        <Button
          onClick={handleSave}
          className="w-full mt-8 py-3 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-300 disabled:opacity-100"
          disabled={!isDirty || updateProfileMutation.isPending}
        >
          {updateProfileMutation.isPending ? '儲存中...' : '儲存'}
        </Button>
      </div>
    </SettingsModalLayout>
  );
};

export default EditDietaryPreference;
