import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/modules/auth';
import { useUpdateProfileMutation } from '@/modules/settings/api/queries';
import { Button } from '@/shared/components/ui/button';
import SimpleHeader from '@/modules/settings/components/SimpleHeader';
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

const EditDietaryPreference = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const updateProfileMutation = useUpdateProfileMutation();

  // Local state for preference form
  const [preferences, setPreferences] = useState<DietaryPreference>({
    cookingFrequency: '3-4',
    prepTime: '15-30',
    seasoningLevel: 'moderate',
    restrictions: ['none'],
  });

  const [isDirty, setIsDirty] = useState(false);

  // Initialize with user data
  useEffect(() => {
    if (user?.dietaryPreference) {
      setPreferences(user.dietaryPreference);
    }
  }, [user]);

  const handleChange = (
    key: keyof DietaryPreference,
    value: string | string[],
  ) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: value,
    }));
    setIsDirty(true);
  };

  const handleSave = () => {
    // 將 dietaryPreference 內容轉換成 preference 標籤陣列
    // 注意：後端 API 的 preference 是字串陣列，需要進行格式轉換
    const preferenceLabels = [
      preferences.cookingFrequency,
      preferences.prepTime,
      preferences.seasoningLevel,
      ...preferences.restrictions.filter((r) => r !== 'none'),
    ];

    updateProfileMutation.mutate(
      {
        data: {
          name: user?.name || '', // 從 user 物件取得當前名稱
          preference: preferenceLabels,
        },
      },
      {
        onSuccess: () => {
          navigate(-1);
        },
        onError: (error) => {
          console.error('Update dietary preferences failed', error);
        },
      },
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <SimpleHeader title="編輯飲食喜好" onBack={() => navigate(-1)} />

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
          className="w-full mt-8"
          disabled={!isDirty || updateProfileMutation.isPending}
        >
          {updateProfileMutation.isPending ? '儲存中...' : '儲存'}
        </Button>
      </div>
    </div>
  );
};

export default EditDietaryPreference;
