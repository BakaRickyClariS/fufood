import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '@/store';
import {
  fetchListItems,
  createListItem,
  createListItems,
  updateListItem,
  deleteListItem,
  selectCurrentListItems,
  selectShoppingListLoading,
} from '@/store/slices/shoppingListSlice';
import type { CreateSharedListItemInput } from '../types';

export const useSharedListItems = (listId: string | undefined) => {
  const dispatch = useDispatch<AppDispatch>();
  const items = useSelector(selectCurrentListItems);
  const isLoading = useSelector(selectShoppingListLoading);

  const fetchItems = useCallback(() => {
    if (listId) {
      dispatch(fetchListItems(listId));
    }
  }, [listId, dispatch]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleCreateItems = async (inputs: CreateSharedListItemInput[]) => {
    if (!listId) throw new Error('No list ID provided');
    await dispatch(createListItems({ listId, inputs })).unwrap();
  };

  const handleCreateItem = async (input: CreateSharedListItemInput) => {
    if (!listId) throw new Error('No list ID provided');
    const result = await dispatch(
      createListItem({ listId, input }),
    ).unwrap();
    return result;
  };

  const handleUpdateItem = async (
    itemId: string,
    input: Partial<CreateSharedListItemInput>,
  ) => {
    if (!listId) throw new Error('No list ID provided');
    await dispatch(
      updateListItem({ listId, itemId, input }),
    ).unwrap();
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!listId) throw new Error('No list ID provided');
    await dispatch(deleteListItem({ listId, itemId })).unwrap();
  };

  return {
    items,
    isLoading,
    error: null, // Error is handled in slice, could expose if needed
    refetch: fetchItems,
    createItem: handleCreateItem,
    createItems: handleCreateItems,
    updateItem: handleUpdateItem,
    deleteItem: handleDeleteItem,
  };
};
