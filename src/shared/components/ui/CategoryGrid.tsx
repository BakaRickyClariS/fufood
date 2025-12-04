import { ChevronRight } from 'lucide-react';

type Category = {
  id: string;
  label: string;
  icon: string; // 圖示 URL 或 emoji
};

type CategoryGridProps = {
  categories: Category[];
  onCategoryClick?: (id: string) => void;
  className?: string;
  title?: string;
};

export const CategoryGrid = ({ 
  categories, 
  onCategoryClick, 
  className = '',
  title 
}: CategoryGridProps) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {title && (
        <div className="flex items-center justify-between px-4">
          <h2 className="text-lg font-bold text-neutral-900">{title}</h2>
          <button className="p-1 rounded-full hover:bg-gray-100 transition-colors">
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      )}
      
      <div className="overflow-x-auto pb-4 px-4">
        <div className="flex gap-4">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onCategoryClick?.(category.id)}
              className="flex flex-col items-center gap-2 min-w-[72px]"
            >
              <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center overflow-hidden shadow-sm border border-gray-100">
                <img 
                  src={category.icon} 
                  alt={category.label}
                  className="w-10 h-10 object-contain"
                />
              </div>
              <span className="text-sm text-neutral-600 font-medium">
                {category.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
