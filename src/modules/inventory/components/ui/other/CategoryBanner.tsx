import React from 'react';
import type { CategoryItem } from '@/modules/inventory/constants/categories';

type CategoryBannerProps = {
  category: CategoryItem;
};

const CategoryBanner: React.FC<CategoryBannerProps> = ({ category }) => {
  return (
    <div className="flex items-center justify-between w-full h-full min-h-[124px] relative overflow-hidden px-3 py-4">
      <div className="flex flex-col w-full z-10 pl-2">
        <h2 className="text-base font-bold text-neutral-900 mb-3">
          {category.slogan}
        </h2>
        <div className="flex flex-col text-xs text-neutral-500 space-y-0.5 border-l-3 border-neutral-600 pl-2">
          {category.description.map((line, index) => (
            <p key={index}>{line}</p>
          ))}
        </div>
      </div>

      <div className="relative w-2/5 max-h-32">
        <img
          src={category.img}
          alt={category.title}
          className="w-full h-full object-contain object-center transform scale-500 translate-x-[-30%] translate-y-[-100%]"
        />
      </div>
    </div>
  );
};

export default CategoryBanner;
