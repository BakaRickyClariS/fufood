/**
 * Inventory TanStack Query Hooks
 *
 * 提供庫存模組的快取和狀態管理
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryApi } from './index';
import type {
  GetInventoryRequest,
  AddFoodItemRequest,
  UpdateFoodItemRequest,
  UpdateInventorySettingsRequest,
} from '../types';

// Query Keys
export const inventoryKeys = {
  all: ['inventory'] as const,
  lists: () => [...inventoryKeys.all, 'list'] as const,
  list: (params?: GetInventoryRequest) =>
    [...inventoryKeys.lists(), params] as const,
  details: () => [...inventoryKeys.all, 'detail'] as const,
  detail: (id: string, refrigeratorId?: string) =>
    [...inventoryKeys.details(), id, refrigeratorId] as const,
  summary: (refrigeratorId?: string) =>
    [...inventoryKeys.all, 'summary', refrigeratorId] as const,
  categories: (refrigeratorId?: string) =>
    [...inventoryKeys.all, 'categories', refrigeratorId] as const,
  settings: (refrigeratorId?: string) =>
    [...inventoryKeys.all, 'settings', refrigeratorId] as const,
};

/**
 * 取得庫存列表
 */
export const useInventoryQuery = (params?: GetInventoryRequest) => {
  return useQuery({
    queryKey: inventoryKeys.list(params),
    queryFn: () => inventoryApi.getInventory(params),
    enabled: !!params?.refrigeratorId, // 確保有 ID 才查詢
    staleTime: 1000 * 60 * 5, // 5 分鐘
  });
};

/**
 * 取得單一食材詳情
 */
export const useInventoryItemQuery = (id: string, refrigeratorId?: string) => {
  return useQuery({
    queryKey: inventoryKeys.detail(id, refrigeratorId),
    queryFn: () => inventoryApi.getItem(id, refrigeratorId),
    enabled: !!id && !!refrigeratorId, // 確保有 ID 才查詢
  });
};

/**
 * 取得庫存摘要
 */
export const useInventorySummaryQuery = (refrigeratorId?: string) => {
  return useQuery({
    queryKey: inventoryKeys.summary(refrigeratorId),
    queryFn: () => inventoryApi.getSummary(refrigeratorId),
    enabled: !!refrigeratorId, // 確保有 ID 才查詢
    staleTime: 1000 * 60 * 5,
  });
};

/**
 * 取得類別列表
 */
export const useInventoryCategoriesQuery = (refrigeratorId?: string) => {
  return useQuery({
    queryKey: inventoryKeys.categories(refrigeratorId),
    queryFn: () => inventoryApi.getCategories(refrigeratorId),
    enabled: !!refrigeratorId, // 確保有 ID 才查詢
    staleTime: 1000 * 60 * 30, // 30 分鐘（類別不常變動）
  });
};

/**
 * 取得庫存設定
 */
export const useInventorySettingsQuery = (refrigeratorId?: string) => {
  return useQuery({
    queryKey: inventoryKeys.settings(refrigeratorId),
    queryFn: () => inventoryApi.getSettings(refrigeratorId),
    enabled: !!refrigeratorId, // 確保有 ID 才查詢
  });
};

/**
 * 新增食材 Mutation
 */
export const useAddInventoryItemMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AddFoodItemRequest) =>
      inventoryApi.addItem(data, data.groupId),
    onSuccess: (_, variables) => {
      // 使庫存列表和摘要失效，觸發重新取得
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: inventoryKeys.summary(variables.groupId),
      });
    },
  });
};

/**
 * 更新食材 Mutation
 */
export const useUpdateInventoryItemMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
      refrigeratorId,
    }: {
      id: string;
      data: UpdateFoodItemRequest;
      refrigeratorId?: string;
    }) => inventoryApi.updateItem(id, data, refrigeratorId),
    onSuccess: (_, variables) => {
      // 使特定食材和列表失效
      queryClient.invalidateQueries({
        queryKey: inventoryKeys.detail(variables.id, variables.refrigeratorId),
      });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() });
    },
  });
};

/**
 * 刪除食材 Mutation
 */
export const useDeleteInventoryItemMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      refrigeratorId,
    }: {
      id: string;
      refrigeratorId?: string;
    }) => inventoryApi.deleteItem(id, refrigeratorId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: inventoryKeys.summary(variables.refrigeratorId),
      });
    },
  });
};

/**
 * 批次刪除食材 Mutation
 */
export const useBatchDeleteInventoryMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      ids,
      refrigeratorId,
    }: {
      ids: string[];
      refrigeratorId?: string;
    }) => inventoryApi.batchDelete({ ids }, refrigeratorId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: inventoryKeys.summary(variables.refrigeratorId),
      });
    },
  });
};

/**
 * 更新庫存設定 Mutation
 */
export const useUpdateInventorySettingsMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      data,
      refrigeratorId,
    }: {
      data: UpdateInventorySettingsRequest;
      refrigeratorId?: string;
    }) => inventoryApi.updateSettings(data, refrigeratorId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: inventoryKeys.settings(variables.refrigeratorId),
      });
    },
  });
};

/**
 * 消耗食材 Mutation
 */
export const useConsumeItemMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
      refrigeratorId,
    }: {
      id: string;
      data: { quantity: number; reasons: string[]; customReason?: string };
      refrigeratorId?: string;
    }) => inventoryApi.consumeItem(id, data, refrigeratorId),
    onSuccess: (_, variables) => {
      // 使特定食材和列表失效
      queryClient.invalidateQueries({
        queryKey: inventoryKeys.detail(variables.id, variables.refrigeratorId),
      });
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: inventoryKeys.summary(variables.refrigeratorId),
      });
    },
  });
};
