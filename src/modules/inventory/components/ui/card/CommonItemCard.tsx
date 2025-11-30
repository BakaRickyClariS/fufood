import React from 'react';

type CommonItemCardProps = {
  name: string;
  image: string;
  value: number;
  label?: string;
};

const CommonItemCard: React.FC<CommonItemCardProps> = ({
  name,
  image,
  value,
  label = '上次購買',
}) => (
  <div className="bg-white rounded-[20px] px-3 py-2 flex items-center gap-3 border border-neutral-200">
    <div className="w-14 h-14 rounded-full overflow-hidden shrink-0 bg-gray-100">
      <img src={image} alt={name} className="w-full h-full object-cover" />
    </div>
    <div className="flex flex-col justify-center self-end gap-1 flex-1">
      <h3 className="text-base font-bold text-neutral-900">{name}</h3>
      <div className="flex items-center gap-1">
        <span className="text-[10px] text-[#EE5D50] font-medium bg-[#FFECEB] px-3 py-1 rounded-full">
          {label}
        </span>
        <span className="text-base font-bold ml-0.5">{value}</span>
      </div>
    </div>
  </div>
);

export default CommonItemCard;
