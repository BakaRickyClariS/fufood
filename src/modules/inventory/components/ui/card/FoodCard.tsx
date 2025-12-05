import type { FoodItem } from '@/modules/inventory/types';
import { useExpiryCheck } from '@/modules/inventory/hooks';

type FoodCardProps = {
  item: FoodItem;
  onClick?: () => void;
};

const FoodCard: React.FC<FoodCardProps> = ({ item, onClick }) => {
  const { status } = useExpiryCheck(item);
  
  // Status colors
  const getStatusColor = () => {
    switch (status) {
      case 'expired': return 'bg-red-500/90';
      case 'expiring-soon': return 'bg-orange-500/90';
      case 'low-stock': return 'bg-yellow-500/90';
      default: return 'bg-[#A87B7B]/90';
    }
  };

  return (
    <div
      className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden shadow-md cursor-pointer transition-transform active:scale-95"
      onClick={onClick}
    >
      {/* Background Image */}
      <img
        src={item.imageUrl}
        alt={item.name}
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Content */}
      <div className="absolute inset-x-0 bottom-0 p-4 flex flex-col gap-2">
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/90 backdrop-blur-[1px] z-0" />
        {/* Header: Name and Quantity */}
        <div className="flex justify-between items-end text-lg text-white z-10">
          <h3 className="tracking-wide font-medium">{item.name}</h3>
          <span className="tracking-widest font-bold">{item.quantity} {item.unit}</span>
        </div>

        {/* Divider */}
        <div className="w-full h-[2px] bg-white/80 my-1 z-10" />

        {/* Dates */}
        <div className="space-y-2 text-white z-10">
          {/* Added Date */}
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-[#7D6E58]/90 rounded-full text-[10px] backdrop-blur-sm">
              歸納
            </span>
            <span className="text-white text-base tracking-wider font-light">
              {item.purchaseDate}
            </span>
          </div>

          {/* Expiry Date */}
          <div className="flex items-center gap-2 z-10">
            <span className={`px-2 py-1 ${getStatusColor()} text-[10px] rounded-full backdrop-blur-sm transition-colors duration-300`}>
              過期
            </span>
            <span className="text-base tracking-wider font-light">
              {item.expiryDate}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodCard;
