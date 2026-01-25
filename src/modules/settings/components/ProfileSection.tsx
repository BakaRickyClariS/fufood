import { ChevronRight, Plus } from 'lucide-react';
import type { UserProfile } from '@/modules/settings/types/settings.types';
import LineIconGreen from '@/assets/images/settings/line-green.svg';
import {
  COOKING_FREQUENCY_OPTIONS,
  PREP_TIME_OPTIONS,
  SEASONING_LEVEL_OPTIONS,
  DIETARY_RESTRICTION_OPTIONS,
} from '@/modules/settings/constants/dietaryOptions';

type ProfileSectionProps = {
  user: UserProfile;
  onNavigate: (key: string) => void;
};

const ProfileSection = ({ user, onNavigate }: ProfileSectionProps) => {
  // Helper to find label for dietary preference
  const getLabel = (
    options: { value: string; label: string }[],
    value: string,
  ) => options.find((o) => o.value === value)?.label;

  const preference = user.dietaryPreference;
  
  const tags = preference
    ? [
        preference.cookingFrequency &&
          `烹飪頻率：${getLabel(COOKING_FREQUENCY_OPTIONS, preference.cookingFrequency) || preference.cookingFrequency}`,
        preference.prepTime &&
          `備餐時間：${getLabel(PREP_TIME_OPTIONS, preference.prepTime) || preference.prepTime}`,
        preference.seasoningLevel &&
          `調味強度：${getLabel(SEASONING_LEVEL_OPTIONS, preference.seasoningLevel) || preference.seasoningLevel}`,
        ...(preference.restrictions || []).map(
          (r) => `特殊限制：${getLabel(DIETARY_RESTRICTION_OPTIONS, r) || r}`,
        ),
      ].filter(Boolean) as string[]
    : [];

  return (
    <div className="bg-white rounded-3xl overflow-hidden">
      {/* 上半部：個人檔案 - 點擊整塊跳轉 */}
      <div 
        onClick={() => onNavigate('profile')} 
        className="block px-6 pt-4 pb-2 border-b border-neutral-100 hover:bg-neutral-50 transition-colors cursor-pointer"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* 左側：頭像 (恢復原本樣式：w-16 h-16 rounded-full border-2 border-primary-100) */}
            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary-100 shrink-0">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-primary-50 flex items-center justify-center text-primary-400 text-2xl font-semibold">
                  {(user.name || '').charAt(0)}
                </div>
              )}
            </div>

            {/* 中間：名字與標籤 */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <h2 className="text-xs font-semibold text-neutral-600">{user.name}</h2>
              </div>
              
              {/* LINE 已綁定標記 - 僅當有 lineId 時顯示 */}
              {user.lineId && (
                <div className="inline-flex items-center gap-1.5 bg-success-50 px-2 py-1.5 rounded-full w-fit">
                  <img src={LineIconGreen} alt="LINE" className="w-3 h-3" />
                  <span className="text-[10px] text-neutral-600 font-semibold leading-none">已綁定</span>
                </div>
              )}
            </div>
          </div>

          {/* 右側：個人檔案 > */}
          <div className="flex items-center gap-1 text-primary-500">
            <span className="text-xs font-semibold">個人檔案</span>
            <ChevronRight className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 下半部：飲食喜好 pt-6 (24px) */}
      <div className="px-6 pb-6 pt-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-4 bg-primary-500 rounded-full" />
          <h3 className="text-base font-semibold text-neutral-800">飲食喜好</h3>
        </div>

        {tags.length > 0 ? (
          <>
            <div className="flex flex-wrap gap-2 mb-4">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="px-4 py-2 bg-primary-100 text-primary-700 text-xs font-semibold rounded-2xl"
                >
                  {tag}
                </span>
              ))}
            </div>
            <div
              onClick={() => onNavigate('dietary-preference')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-dashed border-neutral-300 text-neutral-500 text-sm font-semibold hover:border-primary-500 hover:text-primary-500 transition-colors cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              建立飲食喜好
            </div>
          </>
        ) : (
          <div
            onClick={() => onNavigate('dietary-preference')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-dashed border-neutral-300 text-neutral-500 text-xs font-semibold hover:border-primary-500 hover:text-primary-500 transition-colors cursor-pointer"
          >
            <Plus className="w-3 h-3" />
            建立飲食喜好
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileSection;
