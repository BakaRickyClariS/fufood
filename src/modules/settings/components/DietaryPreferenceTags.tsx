import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import type { UserProfile } from '@/modules/settings/types/settings.types';
import {
  COOKING_FREQUENCY_OPTIONS,
  PREP_TIME_OPTIONS,
  SEASONING_LEVEL_OPTIONS,
  DIETARY_RESTRICTION_OPTIONS,
} from '@/modules/settings/constants/dietaryOptions';

type DietaryPreferenceTagsProps = {
  preference?: UserProfile['dietaryPreference'];
};

const DietaryPreferenceTags = ({ preference }: DietaryPreferenceTagsProps) => {
  if (!preference) {
    return (
      <div className="bg-white rounded-3xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-4 bg-primary-500 rounded-full" />
          <h3 className="text-lg font-bold text-neutral-800">飲食喜好</h3>
        </div>
        <Link
          to="/settings/dietary-preference"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-dashed border-neutral-300 text-neutral-500 text-sm hover:border-primary-500 hover:text-primary-500 transition-colors"
        >
          <Plus className="w-4 h-4" />
          建立飲食喜好
        </Link>
      </div>
    );
  }

  // Helper to find label
  const getLabel = (
    options: { value: string; label: string }[],
    value: string,
  ) => options.find((o) => o.value === value)?.label;

  const tags = [
    preference.cookingFrequency &&
      `烹飪頻率：${getLabel(COOKING_FREQUENCY_OPTIONS, preference.cookingFrequency) || preference.cookingFrequency}`,
    preference.prepTime &&
      `備餐時間：${getLabel(PREP_TIME_OPTIONS, preference.prepTime) || preference.prepTime}`,
    preference.seasoningLevel &&
      `調味強度：${getLabel(SEASONING_LEVEL_OPTIONS, preference.seasoningLevel) || preference.seasoningLevel}`,
    ...(preference.restrictions || []).map(
      (r) =>
        `特殊限制：${getLabel(DIETARY_RESTRICTION_OPTIONS, r) || r}`,
    ),
  ].filter(Boolean) as string[];

  return (
    <div className="bg-white rounded-3xl p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-1 h-4 bg-primary-500 rounded-full" />
        <h3 className="text-lg font-bold text-neutral-800">飲食喜好</h3>
      </div>
      
      <div className="flex flex-wrap gap-2 mb-4">
        {tags.map((tag, index) => (
          <span
            key={index}
            className="px-4 py-2 bg-primary-100 text-primary-700 text-sm font-medium rounded-2xl"
          >
            {tag}
          </span>
        ))}
      </div>

      <Link
        to="/settings/dietary-preference"
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-dashed border-neutral-300 text-neutral-500 text-sm hover:border-primary-500 hover:text-primary-500 transition-colors"
      >
        <Plus className="w-4 h-4" />
        建立飲食喜好
      </Link>
    </div>
  );
};

export default DietaryPreferenceTags;
