import { Card } from '@/shared/components/ui/card';

type InventoryCardProps = {
  title: string;
  value: number;
  bgColor?: string; // ex: "bg-[#FFE5E2]"
  img: string; // local image path
  boxShadow?: string; // ex: "shadow-[0_8px_15px_-3px_rgba(0,0,0,0.1)]"
  borderColor?: string; // ex: "border-neutral-100"
  isLoading?: boolean;
  className?: string;
};

const InventoryCard: React.FC<InventoryCardProps> = ({
  title,
  value,
  bgColor = 'bg-white',
  boxShadow = '',
  img,
  isLoading = false,
  className = '',
}) => (
  <Card
    className={`flex flex-row items-center justify-between px-4 py-3 rounded-[20px] border-none relative overflow-hidden h-full ${boxShadow} ${bgColor} ${className}`}
  >
    <div className="flex flex-col w-full z-10 gap-1">
      {isLoading ? (
        <div className="h-12 w-24 bg-neutral-200 rounded animate-pulse mb-2" />
      ) : (
        <p className="text-[36px] leading-none font-bold text-primary-800 tracking-tight">
          {value}
        </p>
      )}
      <p className="text-base font-semibold text-neutral-500">{title}</p>
    </div>

    <img
      src={img}
      alt={title}
      className="absolute right-0 bottom-0 h-24 w-auto object-contain z-0 pointer-events-none"
    />
  </Card>
);

export default InventoryCard;
