import React from 'react';

type CommonItemCardProps = {
  name: string;
  image: string;
  value: number;
  label?: string;
  onClick?: () => void;
};

const CommonItemCard: React.FC<CommonItemCardProps> = ({
  name,
  image,
  value,
  label = '上次購買',
  onClick,
}) => (
  <div
    className="bg-white rounded-[20px] px-3 py-2 flex items-center justify-between gap-2 border border-neutral-200 cursor-pointer hover:border-neutral-300 transition-colors shadow-sm"
    onClick={onClick}
  >
    <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 bg-gray-100">
      <img src={image} alt={name} className="w-full h-full object-cover" />
    </div>
    <div className="flex flex-col items-end gap-1 flex-1 min-w-0">
      <h3 className="text-base font-bold text-neutral-900 truncate max-w-full">
        {name}
      </h3>
      <div className="flex items-center gap-1">
        <span className="text-[10px] text-neutral-500 border border-neutral-200 px-2 py-0.5 rounded-full whitespace-nowrap">
          {label}
        </span>
        <span className="text-base font-bold text-neutral-500 min-w-[1.4rem] text-center block">
          {value}
        </span>
      </div>
    </div>
  </div>
);

export default CommonItemCard;
