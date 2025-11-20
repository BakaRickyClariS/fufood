import React from 'react';
import type { CategoryItem } from '@/routes/Inventory/categories';

type CategoryBannerProps = {
  category: CategoryItem;
};

const CategoryBanner: React.FC<CategoryBannerProps> = ({ category }) => {
  return (
    <div className="flex items-center justify-between w-full h-full relative overflow-hidden">
      <div className="flex flex-col z-10 pl-2">
        <h2 className="text-xl font-bold text-neutral-900 mb-1">{category.title.split(' ')[0]}</h2>
        <div className="flex flex-col text-xs text-neutral-500 space-y-0.5">
          <p className="font-bold text-neutral-700 mb-1">{category.slogan}</p>
          {category.description.map((line, index) => (
            <p key={index}>{line}</p>
          ))}
        </div>
      </div>
      
      <div className="relative w-32 h-32 -mr-6 -mb-6">
         <img
          src={category.img}
          alt={category.title}
          className="w-full h-full object-contain object-center transform scale-125 translate-y-2"
        />
      </div>
    </div>
  );
};

export default CategoryBanner;
