import { useState, useCallback, useEffect } from 'react';
import { sharedListApi } from '../services/api/sharedListApi';
import type { SharedListItem, CreateSharedListItemInput } from '../types';

export const useSharedListItems = (listId: string | undefined) => {
  const [items, setItems] = useState<SharedListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    if (!listId) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await sharedListApi.getSharedListItems(listId);
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch items');
    } finally {
      setIsLoading(false);
    }
  }, [listId]);

  const createItem = async (input: CreateSharedListItemInput) => {
    if (!listId) throw new Error('No list ID provided');
    try {
      const newItem = await sharedListApi.createSharedListItem(listId, input);
      setItems((prev) => [...prev, newItem]);
      return newItem;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to create item');
    }
  };

  const updateItem = async (
    itemId: string,
    input: Partial<CreateSharedListItemInput>,
  ) => {
    try {
      await sharedListApi.updateSharedListItem(itemId, input);
      // Optimistic or Refetch? Let's just refetch for consistency or manual update
      setItems((prev) =>
        prev.map((item) =>
          item.id === itemId
            ? { ...item, ...input, updatedAt: new Date().toISOString() }
            : item,
        ),
      );
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to update item');
    }
  };

  const deleteItem = async (itemId: string) => {
    try {
      await sharedListApi.deleteSharedListItem(itemId);
      setItems((prev) => prev.filter((item) => item.id !== itemId));
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to delete item');
    }
  };

  useEffect(() => {
    if (listId) {
      fetchItems();
    }
  }, [fetchItems, listId]);

  return {
    items,
    isLoading,
    error,
    refetch: fetchItems,
    createItem,
    updateItem,
    deleteItem,
  };
};
