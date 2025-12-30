import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import type { SharedListItem, CreateSharedListItemInput } from '../types';
import { sharedListApi } from '../services/api/sharedListApi';

export const useSharedListItems = (listId: string | undefined) => {
  const [items, setItems] = useState<SharedListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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

  // 批量建立 (因為 Post 可能包含多個 items)
  const createItems = async (inputs: CreateSharedListItemInput[]) => {
    if (!listId) return;
    setIsLoading(true);
    try {
      const promises = inputs.map((input) =>
        sharedListApi.createSharedListItem(listId, input),
      );
      const newItems = await Promise.all(promises);
      setItems((prev) => [...newItems, ...prev]);
      return newItems;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to create items';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const createItem = async (input: CreateSharedListItemInput) => {
    if (!listId) return;
    setIsLoading(true);
    try {
      const newItem = await sharedListApi.createSharedListItem(listId, input);
      setItems((prev) => [newItem, ...prev]);
      return newItem;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to create item';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteItem = async (itemId: string) => {
    try {
      await sharedListApi.deleteSharedListItem(itemId);
      setItems((prev) => prev.filter((item) => item.id !== itemId));
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to delete item';
      toast.error(msg);
      throw err;
    }
  };

  const updateItem = async (
    itemId: string,
    input: Partial<CreateSharedListItemInput>,
  ) => {
    try {
      await sharedListApi.updateSharedListItem(itemId, input);
      setItems((prev) =>
        prev.map((item) => (item.id === itemId ? { ...item, ...input } : item)),
      );
      // 因為 updateSharedListItem 只回傳 void，這裡樂觀更新或重新 fetch
      // 若需要完整資料需重新 fetch，但為了效能先這樣
      fetchItems(); 
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update item';
      toast.error(msg);
      throw err;
    }
  };

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return {
    items,
    isLoading,
    error,
    refetch: fetchItems,
    createItem,
    createItems,
    updateItem,
    deleteItem,
  };
};
