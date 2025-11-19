import { Card } from '@/components/ui/card';

type CategoryCardProps = {
  title: string;
  bgColor?: string; // ex: "bg-[#FFE5E2]"
  img: string; // local image path
  boxShadow?: string; // ex: "shadow-[0_8px_15px_-3px_rgba(0,0,0,0.1)]"
  borderColor?: string; // ex: "border-neutral-100"
};

const CategoryCard: React.FC<CategoryCardProps> = ({
  title,
  bgColor = 'bg-white',
  boxShadow = '',
  img,
}) => {
  return (
    <Card
      className={`flex flex-row items-start justify-between p-4 rounded-2xl border-2 relative overflow-hidden h-full border-[#848484]/20 ${boxShadow} ${bgColor}`}
    >
      <div className="flex flex-col w-full">
        <p className="text-base font-semibold text-neutral-900">{title}</p>
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
      {/* <img
        src={img}
        alt={title}
        className=" absolute
    bottom-0
    right-0
    max-h-full
    rotate-[10deg]
    translate-x-1/5
    translate-y-1/4
    w-auto
    object-contain
    z-0
    pointer-events-none"
      /> */}
    </Card>
  );
};

export default CategoryCard;
