import { useNavigate } from 'react-router-dom';

import type { SharedListItem } from '@/modules/planning/types';

type SharedListCardProps = {
  list: SharedListItem;
};

export const SharedListCard = ({ list }: SharedListCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/planning/list/${list.id}`);
  };

  const getDayOfMonth = (dateString: string) => {
    const date = new Date(dateString);
    return date.getDate();
  };

  const getDayOfWeek = (dateString: string) => {
    const date = new Date(dateString);
    const days = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'];
    return days[date.getDay()];
  };

  return (
    <div
      onClick={handleClick}
      className="relative w-full h-32 rounded-xl overflow-hidden shadow-sm cursor-pointer active:scale-98 transition-transform mb-4"
    >
      {/* 背景圖 */}
      <img
        src={list.coverImageUrl}
        alt={list.name}
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* 漸層遮罩 */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

      {/* 標題 */}
      <div className="absolute bottom-3 left-4 text-white font-medium text-lg">
        {list.name}
      </div>

      {/* 日期標籤 */}
      <div className="absolute bottom-3 right-4 bg-red-100 text-red-500 rounded-xl px-3 py-1 flex flex-col items-center justify-center min-w-[3.5rem] shadow-sm">
        <span className="text-xs font-medium text-red-400">
          {getDayOfWeek(list.scheduledDate)}
        </span>
        <span className="text-lg font-bold leading-none">
          {getDayOfMonth(list.scheduledDate)}
        </span>
      </div>
    </div>
  );
};
