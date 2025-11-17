import { Card } from '@/components/ui/card';

type InventoryCardProps = {
  title: string;
  value: number;
  bgColor?: string; // ex: "bg-[#FFE5E2]"
  img: string; // local image path
  boxShadow?: string; // ex: "shadow-[0_8px_15px_-3px_rgba(0,0,0,0.1)]"
  borderColor?: string; // ex: "border-neutral-100"
};

const InventoryCard: React.FC<InventoryCardProps> = ({
  title,
  value,
  bgColor = 'bg-white',
  boxShadow = '',
  borderColor = 'border-neutral-100',
  img,
}) => {
  return (
    <Card
      className={`flex flex-row items-center justify-between px-5 py-4 rounded-2xl border-2 relative overflow-hidden h-36 ${borderColor} ${boxShadow} ${bgColor}`}
    >
      <div className="flex flex-col w-full">
        <p className="text-lg font-semibold text-primary-900">{title}</p>
        <p className="mt-1 text-4xl font-bold text-neutral-900">{value}</p>
      </div>

      <img
        src={img}
        alt={title}
        className=" absolute
    bottom-0
    right-0
    max-h-full
    w-auto
    object-contain
    translate-x-1/8   /* 讓圖片稍微往外延伸，看起來更像設計稿 */
    z-0
    pointer-events-none"
      />
    </Card>
  );
};

export default InventoryCard;
