import { useState, useEffect, useCallback } from 'react';
import { inventoryApi } from '../api';
import type { InventoryStats, FoodItem } from '../types';

export const useInventoryStats = (items: FoodItem[]) => {
  const [stats, setStats] = useState<InventoryStats>({
    totalItems: 0,
    expiredCount: 0,
    expiringSoonCount: 0,
    lowStockCount: 0,
    byCategory: {
      fruit: 0,
      frozen: 0,
      bake: 0,
      milk: 0,
      seafood: 0,
      meat: 0,
      others: 0,
    },
  });

  const calculateStats = useCallback(() => {
    const newStats: InventoryStats = {
      totalItems: items.length,
      expiredCount: 0,
      expiringSoonCount: 0,
      lowStockCount: 0,
      byCategory: {
        fruit: 0,
        frozen: 0,
        bake: 0,
        milk: 0,
        seafood: 0,
        meat: 0,
        others: 0,
      },
    };

    const today = new Date();
    const threeDaysLater = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);

    items.forEach((item) => {
      const expiry = new Date(item.expiryDate);

      if (expiry < today) newStats.expiredCount++;
      if (expiry >= today && expiry <= threeDaysLater)
        newStats.expiringSoonCount++;
      if (item.lowStockAlert && item.quantity <= item.lowStockThreshold)
        newStats.lowStockCount++;

      if (newStats.byCategory[item.category] !== undefined) {
        newStats.byCategory[item.category]++;
      }
    });

    setStats(newStats);
  }, [items]);

  useEffect(() => {
    calculateStats();
  }, [calculateStats]);

  // Optional: Fetch from API if needed (include=stats)
  const fetchStats = async (groupId?: string) => {
    try {
      const apiStats = await inventoryApi.getInventory({
        groupId,
        include: 'stats',
        limit: 1,
      });
      if (apiStats.data.stats) {
        setStats(apiStats.data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  return {
    stats,
    refreshStats: fetchStats,
  };
};
