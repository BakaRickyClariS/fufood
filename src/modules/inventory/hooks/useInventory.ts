import { useState, useEffect, useCallback } from 'react';
import { inventoryApi } from '../api';
import type {
  FoodItem,
  AddFoodItemRequest,
  UpdateFoodItemRequest,
} from '../types';

export const useInventory = (groupId?: string) => {
  const [items, setItems] = useState<FoodItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await inventoryApi.getInventory({ groupId });
      setItems(response.items);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('Failed to fetch inventory'),
      );
    } finally {
      setIsLoading(false);
    }
  }, [groupId]);

  const addItem = async (data: AddFoodItemRequest) => {
    setIsLoading(true);
    try {
      await inventoryApi.addItem(data);
      await fetchItems(); // Refresh list
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to add item'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateItem = async (id: string, data: UpdateFoodItemRequest) => {
    setIsLoading(true);
    try {
      await inventoryApi.updateItem(id, data);
      await fetchItems(); // Refresh list
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update item'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteItem = async (id: string) => {
    setIsLoading(true);
    try {
      await inventoryApi.deleteItem(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete item'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const batchDelete = async (ids: string[]) => {
    setIsLoading(true);
    try {
      await inventoryApi.batchDelete({
        ids: ids,
      });
      await fetchItems(); // Refresh list
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('Failed to batch delete items'),
      );
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return {
    items,
    isLoading,
    error,
    addItem,
    updateItem,
    deleteItem,
    batchDelete,
    refetch: fetchItems,
  };
};
