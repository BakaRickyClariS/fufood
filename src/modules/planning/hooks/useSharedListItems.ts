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
import { useAuth } from '@/modules/auth';
import { groupsApi } from '@/modules/groups/api';
import type { CreateSharedListItemInput } from '../types';

export const useSharedListItems = (
  listId: string | undefined,
  refrigeratorId?: string,
) => {
  const dispatch = useDispatch<AppDispatch>();
  const items = useSelector(selectCurrentListItems);
  const isLoading = useSelector(selectShoppingListLoading);
  const { user } = useAuth();

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

    // 發送推播通知 (批次)
    // 發送推播通知 (批次)
    try {
      if (inputs.length > 0 && refrigeratorId) {
        let targetUserIds: string[] = [];
        try {
          const members = await groupsApi.getMembers(refrigeratorId);
          targetUserIds = members.map(m => m.id);
        } catch (fetchErr) {
          console.warn(`Failed to fetch members for group ${refrigeratorId}:`, fetchErr);
          if (user?.id) targetUserIds = [user.id];
        }

        if (targetUserIds.length > 0) {
          const firstItemName = inputs[0].name;
          const count = inputs.length;
          const message = count > 1 
            ? `已新增 ${firstItemName} 等 ${count} 項到採買清單`
            : `已新增 ${firstItemName} 到採買清單`;

          import('@/api/services/notification').then(({ notificationService }) => {
            notificationService.sendNotification({
              type: 'shopping',
              title: '採買清單更新',
              body: message,
              userIds: targetUserIds,
              groupId: undefined, // 避免 400 錯誤
              action: {
                type: 'shopping-list',
                payload: {
                  listId: listId
                }
              }
            }).catch(err => console.error('Failed to send notification:', err));
          });
        }
      }
    } catch (notifyError) {
       console.error('Notification error:', notifyError);
    }
  };

  const handleCreateItem = async (input: CreateSharedListItemInput) => {
    if (!listId) throw new Error('No list ID provided');
    const result = await dispatch(
      createListItem({ listId, input }),
    ).unwrap();

    // 發送推播通知 (單筆)
    // 發送推播通知 (單筆)
    try {
      if (refrigeratorId) {
        let targetUserIds: string[] = [];
        try {
          const members = await groupsApi.getMembers(refrigeratorId);
          targetUserIds = members.map(m => m.id);
        } catch (fetchErr) {
          console.warn(`Failed to fetch members for group ${refrigeratorId}:`, fetchErr);
          if (user?.id) targetUserIds = [user.id];
        }

        if (targetUserIds.length > 0) {
          import('@/api/services/notification').then(({ notificationService }) => {
            notificationService.sendNotification({
              type: 'shopping',
              title: '採買清單更新',
              body: `已新增 ${input.name} 到採買清單`,
              userIds: targetUserIds,
              groupId: undefined, // 避免 400 錯誤
              action: {
                type: 'shopping-list',
                payload: {
                  listId: listId
                }
              }
            }).catch(err => console.error('Failed to send notification:', err));
          });
        }
      }
    } catch (notifyError) {
      console.error('Notification error:', notifyError);
    }

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
