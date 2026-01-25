import { useMemo } from 'react';
import type { FoodItem, InventoryStatus } from '../types';

export const useExpiryCheck = (item: FoodItem) => {
  return useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expiry = new Date(item.expiryDate);
    expiry.setHours(0, 0, 0, 0);

    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const isExpired = diffDays < 0;
    const isExpiringSoon = diffDays >= 0 && diffDays <= 3;

    let status: InventoryStatus = 'normal';
    if (isExpired) status = 'expired';
    else if (isExpiringSoon) status = 'expiring-soon';
    else if (item.lowStockAlert && item.quantity <= item.lowStockThreshold)
      status = 'low-stock';

    return {
      isExpired,
      isExpiringSoon,
      daysUntilExpiry: diffDays,
      status,
    };
  }, [
    item.expiryDate,
    item.quantity,
    item.lowStockAlert,
    item.lowStockThreshold,
  ]);
};
