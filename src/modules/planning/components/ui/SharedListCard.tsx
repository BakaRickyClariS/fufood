import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';

import type { SharedList } from '@/modules/planning/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';

import { COVER_IMAGES } from '@/modules/planning/constants/coverImages';

type SharedListCardProps = {
  list: SharedList;
  onEdit?: (list: SharedList) => void;
  onDelete?: (list: SharedList) => void;
};

export const SharedListCard = ({
  list,
  onEdit,
  onDelete,
}: SharedListCardProps) => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleCardClick = () => {
    // 選單開啟時不導航
    if (isMenuOpen) return;
    navigate(`/planning/list/${list.id}`);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(list);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(list);
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
      onClick={handleCardClick}
      className="relative w-full h-[135px] rounded-2xl overflow-hidden shadow-md cursor-pointer active:scale-[0.98] transition-transform"
    >
      {/* 背景圖 */}
      <img
        src={list.coverPhotoPath || COVER_IMAGES[0]}
        alt={list.title}
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* 漸層遮罩 (模糊漸層 + 黑色漸層) */}
      <div
        className="absolute inset-0 backdrop-blur-md"
        style={{ maskImage: 'linear-gradient(to top, black, transparent)' }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

      {/* 左上角日期標籤 */}
      <div className="absolute top-3 left-3 bg-white/60 backdrop-blur-sm rounded-full px-4 py-2 flex flex-row items-center justify-center gap-1.5 font-bold text-neutral-900 shadow-sm">
        <span className="text-sm">{getDayOfWeek(list.startsAt)}</span>
        <span className="text-xl">{getDayOfMonth(list.startsAt)}</span>
      </div>

      {/* 右上角三點選單按鈕 */}
      <div className="absolute top-3 right-3">
        <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <DropdownMenuTrigger asChild>
            <button
              onClick={(e) => e.stopPropagation()}
              className="w-9 h-9 rounded-full bg-white/50 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-white transition-colors"
            >
              <MoreHorizontal className="w-5 h-5 text-neutral-700" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-36">
            <DropdownMenuItem onClick={handleEdit} className="cursor-pointer">
              <Pencil className="w-4 h-4" />
              <span>編輯</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleDelete}
              variant="destructive"
              className="cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>刪除</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* 左下角標題 */}
      <div className="absolute bottom-4 left-4 text-white font-semibold text-lg drop-shadow-md">
        {list.title}
      </div>
    </div>
  );
};
