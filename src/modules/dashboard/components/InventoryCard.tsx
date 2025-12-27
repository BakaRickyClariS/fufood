import { Card } from '@/shared/components/ui/card';

type InventoryCardProps = {
  title: string;
  value: number;
  bgColor?: string; // ex: "bg-[#FFE5E2]"
  img: string; // local image path
  boxShadow?: string; // ex: "shadow-[0_8px_15px_-3px_rgba(0,0,0,0.1)]"
  borderColor?: string; // ex: "border-neutral-100"
  isLoading?: boolean;
};

const InventoryCard: React.FC<InventoryCardProps> = ({
  title,
  value,
  bgColor = 'bg-white',
  boxShadow = '',
  borderColor = 'border-neutral-100',
  img,
  isLoading = false,
}) => (
  <Card
    className={`flex flex-row items-center justify-between px-5 py-4 rounded-2xl border-2 relative overflow-hidden h-36 ${borderColor} ${boxShadow} ${bgColor}`}
  >
    <div className="flex flex-col w-full z-10">
      <p className="text-lg font-semibold text-primary-900">{title}</p>
      {isLoading ? (
        <div className="mt-1 h-9 w-16 bg-neutral-200 rounded animate-pulse" />
      ) : (
        <p className="mt-1 text-4xl font-bold text-neutral-900">{value}</p>
      )}
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
    z-0
    pointer-events-none"
    />
  </Card>
);

export default InventoryCard;
