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
import { selectAllGroups } from '@/modules/groups/store/groupsSlice';
import type { CreateSharedListItemInput } from '../types';

export const useSharedListItems = (
  listId: string | undefined,
  refrigeratorId?: string,
) => {
  const dispatch = useDispatch<AppDispatch>();
  const items = useSelector(selectCurrentListItems);
  const isLoading = useSelector(selectShoppingListLoading);
  const { user } = useAuth();

  // 取得群組名稱和操作者資訊
  const allGroups = useSelector(selectAllGroups);
  const currentGroup = refrigeratorId
    ? allGroups.find((g) => g.id === refrigeratorId)
    : null;
  const groupName = currentGroup?.name || '我的冰箱';
  const emailPrefix = user?.email ? user.email.split('@')[0] : '使用者';
  const actorName = user?.displayName || user?.name || emailPrefix;
  const actorId = user?.id;

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

    // 發送推播通知（使用 groupId 發送給群組所有成員，與清單建立一致）
    try {
      if (inputs.length > 0 && refrigeratorId) {
        const firstItemName = inputs[0].name;
        const count = inputs.length;
        const title =
          count > 1
            ? `${firstItemName} 等 ${count} 項商品加入採買行列！`
            : `${firstItemName} 加入採買行列！`;
        const body =
          count > 1
            ? `採買小隊報告！${count} 項新任務已登錄，壓大家快來看看！`
            : `採買小隊報告！${firstItemName} 已加入購物清單，收到請回報！`;

        console.log('🔔 [Shopping List Item Notification] Metadata:', {
          groupName,
          actorName,
          actorId,
          groupId: refrigeratorId,
        });

        const { notificationsApiImpl } = await import(
          '@/modules/notifications/api/notificationsApiImpl'
        );
        await notificationsApiImpl.sendNotification({
          groupId: refrigeratorId, // 使用 groupId 發送給群組所有成員
          type: 'shopping',
          subType: 'list',
          title,
          body,
          groupName,
          actorName,
          actorId,
          group_name: groupName,
          actor_name: actorName,
          actor_id: actorId,
          action: {
            type: 'shopping-list',
            payload: {
              listId: listId,
            },
          },
        });
      }
    } catch (notifyError) {
      console.error('Notification error:', notifyError);
    }
  };

  const handleCreateItem = async (input: CreateSharedListItemInput) => {
    if (!listId) throw new Error('No list ID provided');
    const result = await dispatch(createListItem({ listId, input })).unwrap();

    // 發送推播通知（使用 groupId 發送給群組所有成員，與清單建立一致）
    try {
      if (refrigeratorId) {
        console.log('🔔 [Shopping List Item Notification] Metadata:', {
          groupName,
          actorName,
          actorId,
          groupId: refrigeratorId,
        });

        const { notificationsApiImpl } = await import(
          '@/modules/notifications/api/notificationsApiImpl'
        );
        await notificationsApiImpl.sendNotification({
          groupId: refrigeratorId, // 使用 groupId 發送給群組所有成員
          type: 'shopping',
          subType: 'list',
          title: `${input.name} 加入採買行列！`,
          body: `採買小隊報告！${input.name} 已加入購物清單，收到請回報！`,
          groupName,
          actorName,
          actorId,
          group_name: groupName,
          actor_name: actorName,
          actor_id: actorId,
          action: {
            type: 'shopping-list',
            payload: {
              listId: listId,
            },
          },
        });
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
    await dispatch(updateListItem({ listId, itemId, input })).unwrap();
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
