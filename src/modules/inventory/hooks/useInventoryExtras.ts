import { useState, useEffect, useCallback } from 'react';
import { inventoryApi } from '../api';
import type { FoodItem } from '../types';

export const useInventoryExtras = () => {
  const [frequentItems, setFrequentItems] = useState<FoodItem[]>([]);
  const [expiredItems, setExpiredItems] = useState<FoodItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchFrequentItems = useCallback(async (limit = 10) => {
    setIsLoading(true);
    try {
      const response = await inventoryApi.getFrequentItems(limit);
      setFrequentItems(response.data.items);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch frequent items'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchExpiredItems = useCallback(async (page = 1, limit = 20) => {
    setIsLoading(true);
    try {
      const response = await inventoryApi.getExpiredItems(page, limit);
      setExpiredItems(response.data.items);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch expired items'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial fetch could be done here if needed, or by consumer
  }, []);

  return {
    frequentItems,
    expiredItems,
    isLoading,
    error,
    fetchFrequentItems,
    fetchExpiredItems,
  };
};
