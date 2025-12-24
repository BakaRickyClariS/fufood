import React from 'react';
import { X } from 'lucide-react';

type SelectedIngredientTagsProps = {
  items: string[];
  onRemove: (item: string) => void;
  // onOpenFilter is handled externally in AIQueryPage
};

export const SelectedIngredientTags: React.FC<SelectedIngredientTagsProps> = ({
  items,
  onRemove,
}) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-1 px-1 custom-scrollbar hide-scrollbar">
      {items.map((item) => (
        <div
          key={item}
          className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#FDE6E3] text-[#F58274] animate-in fade-in zoom-in duration-200"
        >
          <span className="text-sm font-medium">{item}</span>
          <button
            onClick={() => onRemove(item)}
            className="hover:bg-[#F58274]/10 rounded-full p-0.5 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
