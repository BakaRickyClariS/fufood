import { Card } from '@/components/ui/card';
import { Heart } from 'lucide-react';

interface RecipeCardProps {
  cover: string;
  tag?: string;
  category: string;
  title: string;
  servings: number;
  time: number;
}

const RecipeCard: React.FC<RecipeCardProps> = ({
  cover,
  tag,
  category,
  title,
  servings,
  time,
}) => {
  return (
    <Card className="overflow-hidden rounded-2xl shadow-[0_6px_14px_-2px_rgba(0,0,0,0.12)] border-none bg-white">
      {/* 封面圖 */}
      <div className="relative">
        <img src={cover} className="w-full h-36 object-cover" />

        {/* 熱門 Tag */}
        {tag && (
          <span className="absolute top-2 left-2 bg-primary-400 text-white text-xs px-2 py-1 rounded-md">
            {tag}
          </span>
        )}

        {/* 愛心 icon */}
        <button className="absolute top-2 right-2 bg-black/40 rounded-full p-1">
          <Heart size={18} className="text-white" />
        </button>

        {/* 類別 Tag */}
        <span className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-0.5 rounded-md">
          {category}
        </span>
      </div>

      {/* 文字內容 */}
      <div className="px-3 py-3">
        <h3 className="text-neutral-900 font-semibold">{title}</h3>

        <div className="flex items-center text-sm mt-1 text-neutral-500">
          <span className="flex items-center mr-4">👤 {servings} 人份</span>
          <span className="flex items-center">⏱ {time} 分鐘</span>
        </div>
      </div>
    </Card>
  );
};

export default RecipeCard;
