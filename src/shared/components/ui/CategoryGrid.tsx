import { useRef } from 'react';
import { ArrowRight } from 'lucide-react';

export type Category<TId extends string = string> = {
  id: TId;
  label: string;
  icon: string; // 圖示 URL 或 emoji
};

export type CategoryGridProps<TId extends string = string> = {
  categories: Category<TId>[];
  selectedId?: TId;
  onCategoryClick?: (id: TId | undefined) => void;
  className?: string;
  title?: string;
  /** 是否顯示滾動按鈕，預設為 false */
  showScrollButton?: boolean;
  /** 是否允許取消選取（再次點擊已選取項目時），預設為 true */
  allowDeselect?: boolean;
};

export const CategoryGrid = <TId extends string = string>({ 
  categories, 
  selectedId,
  onCategoryClick, 
  className = '',
  title,
  showScrollButton = false,
  allowDeselect = true
}: CategoryGridProps<TId>) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 150, behavior: 'smooth' });
    }
  };

  const handleClick = (id: TId) => {
    if (allowDeselect && selectedId === id) {
      onCategoryClick?.(undefined);
    } else {
      onCategoryClick?.(id);
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {title && (
        <div className="flex items-center justify-between px-4">
          <h2 className="text-lg font-bold text-gray-800">{title}</h2>
          {showScrollButton && (
            <button 
              onClick={scrollRight}
              className="p-1.5 rounded-full border border-gray-200 hover:bg-gray-50 active:bg-gray-100 transition-colors"
              aria-label="Scroll right"
            >
              <ArrowRight className="w-4 h-4 text-gray-600" />
            </button>
          )}
        </div>
      )}
      
      <div 
        ref={scrollContainerRef}
        className="overflow-x-auto pb-2 px-4"
      >
        <div className="flex gap-4">
          {categories.map((category) => {
            const isSelected = selectedId === category.id;
            return (
              <button
                key={category.id}
                onClick={() => handleClick(category.id)}
                className="flex flex-col items-center gap-2 min-w-[72px] flex-shrink-0 group"
              >
                <div 
                  className={`
                    w-16 h-16 rounded-full overflow-hidden flex items-center justify-center 
                    transition-all duration-200
                    ${isSelected ? 'ring-2 ring-primary-500 ring-offset-2' : ''}
                  `}
                  style={{
                    backgroundColor: isSelected ? 'var(--color-primary-200)' : 'transparent'
                  }}
                >
                  <img 
                    src={category.icon} 
                    alt={category.label}
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className={`
                  text-xs font-medium transition-colors
                  ${isSelected ? 'text-primary-600' : 'text-gray-600'}
                `}>
                  {category.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
