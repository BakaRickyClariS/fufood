import type { FoodItem } from '@/modules/inventory/types';
import { useExpiryCheck } from '@/modules/inventory/hooks';

import { Bell, BellRing } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { toggleLowStockAlert } from '@/modules/inventory/store/inventorySlice';

type FoodCardProps = {
  item: FoodItem;
  onClick?: () => void;
};

const FoodCard: React.FC<FoodCardProps> = ({ item, onClick }) => {
  const { status } = useExpiryCheck(item);
  const dispatch = useDispatch();

  // Status colors & Labels
  const getStatusStyles = () => {
    switch (status) {
      case 'expired':
        return {
          borderColor: 'border-[var(--color-danger-400)]',
          shadow: 'shadow-[0_0_15px_-3px_rgba(250,111,111,0.4)]', // Approximation of danger-400 alpha
          tagBg: 'bg-[var(--color-danger-400)]',
          tagText: '已過期',
          // Gradient from bottom (color) to top (transparent)
          // Using strict CSS variables in arbitrary values for gradient colors might be tricky regarding opacity.
          // Let's us rgba or hex approximation if var doesn't work with opacity modifier, BUT user asked for vars.
          // Tailwind 4 supports `from-[var(--color-foo)]/50`.
          overlay: 'bg-gradient-to-t from-[var(--color-danger-400)]/90 via-[var(--color-danger-400)]/30 to-transparent'
        };
      case 'expiring-soon':
        return {
          borderColor: 'border-[var(--color-warning-400)]',
          shadow: 'shadow-[0_0_15px_-3px_rgba(253,209,57,0.4)]', // Approximation of warning-400 alpha
          tagBg: 'bg-[var(--color-warning-400)]',
          tagText: '即將過期',
          overlay: 'bg-gradient-to-t from-[var(--color-warning-400)]/90 via-[var(--color-warning-400)]/30 to-transparent'
        };
      case 'low-stock':
        return {
          borderColor: 'border-transparent',
          shadow: 'shadow-md',
          tagBg: null,
          tagText: null,
          overlay: 'bg-gradient-to-t from-black/90 via-black/20 to-transparent'
        };
      default:
        return {
          borderColor: 'border-transparent',
          shadow: 'shadow-md',
          tagBg: null,
          tagText: null,
          overlay: 'bg-gradient-to-t from-black/90 via-black/20 to-transparent'
        };
    }
  };

  const styles = getStatusStyles();

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick?.();
    }
  };

  const handleToggleAlert = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(toggleLowStockAlert(item.id));
  };

  return (
    <div
      className={`relative w-full aspect-3/4 rounded-2xl overflow-hidden cursor-pointer transition-transform active:scale-95 border-2 ${styles.borderColor} ${styles.shadow}`}
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
    >
      {/* Background Image */}
      <img
        src={item.imageUrl}
        alt={item.name}
        className="absolute inset-0 w-full h-full object-cover"
      />
      
      {/* Top Left Status Tag */}
      {styles.tagText && (
        <div className={`absolute top-0 left-0 px-3 py-1.5 rounded-br-xl ${styles.tagBg} z-20`}>
          <span className="text-xs font-bold text-neutral-900 tracking-wide">
            {styles.tagText}
          </span>
        </div>
      )}

      {/* Low Stock Alert Button */}
      <button
        onClick={handleToggleAlert}
        className="absolute top-2 right-2 z-20 w-8 h-8 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center border border-white/50 shadow-sm transition-colors hover:bg-white/50"
      >
        {item.lowStockAlert ? (
          <BellRing className="w-5 h-5 text-yellow-300 fill-yellow-300" />
        ) : (
          <Bell className="w-5 h-5 text-white" />
        )}
      </button>

      {/* Content */}
      <div className="absolute inset-x-0 bottom-0 p-4 flex flex-col gap-2">
        {/* Gradient Overlay */}
        <div className={`absolute inset-0 ${styles.overlay} backdrop-blur-[1px] z-0`} />
        {/* Header: Name and Quantity */}
        <div className="flex justify-between items-end text-lg text-white z-10">
          <h3 className="tracking-wide font-medium">{item.name}</h3>
          <span className="tracking-widest font-bold text-2xl">{item.quantity}</span>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-white/80 my-1 z-10" />

        {/* Dates */}
        <div className="space-y-2 text-white z-10">
          {/* Purchase Date */}
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-[#7D6E58]/90 rounded-full text-[10px] backdrop-blur-sm shrink-0">
              歸納
            </span>
            <span className="text-white text-base tracking-wider font-light">
              {item.purchaseDate}
            </span>
          </div>

          {/* Expiry Date */}
          <div className="flex items-center gap-2 z-10">
            <span
              className="px-2 py-1 bg-[#A87B7B]/90 rounded-full text-[10px] backdrop-blur-sm shrink-0"
            >
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
