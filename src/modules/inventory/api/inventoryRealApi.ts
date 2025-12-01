import type { InventoryApi } from './inventoryApi';
import type { 
  GetInventoryRequest, 
  GetInventoryResponse, 
  AddFoodItemRequest, 
  AddFoodItemResponse, 
  UpdateFoodItemRequest, 
  UpdateFoodItemResponse, 
  DeleteFoodItemResponse, 
  BatchOperationRequest,
  FoodItem,
  CategoryInfo,
  InventoryStats
} from '../types';

export const createRealInventoryApi = (): InventoryApi => {
  const baseURL = import.meta.env.VITE_RECIPE_API_URL || '';

  const getItems = async (params?: GetInventoryRequest): Promise<GetInventoryResponse> => {
    const query = new URLSearchParams();
    if (params?.groupId) query.append('groupId', params.groupId);
    if (params?.category) query.append('category', params.category);
    if (params?.status) query.append('status', params.status);
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());

    const response = await fetch(`${baseURL}/inventory?${query.toString()}`);
    if (!response.ok) throw new Error('Failed to fetch inventory');
    return response.json();
  };

  const getItem = async (id: string): Promise<FoodItem> => {
    const response = await fetch(`${baseURL}/inventory/${id}`);
    if (!response.ok) throw new Error('Failed to fetch item');
    return response.json();
  };

  const addItem = async (data: AddFoodItemRequest): Promise<AddFoodItemResponse> => {
    const response = await fetch(`${baseURL}/inventory`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to add item');
    return response.json();
  };

  const updateItem = async (id: string, data: UpdateFoodItemRequest): Promise<UpdateFoodItemResponse> => {
    const response = await fetch(`${baseURL}/inventory/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update item');
    return response.json();
  };

  const deleteItem = async (id: string): Promise<DeleteFoodItemResponse> => {
    const response = await fetch(`${baseURL}/inventory/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete item');
    return response.json();
  };

  const batchOperation = async (data: BatchOperationRequest): Promise<{ success: boolean }> => {
    const response = await fetch(`${baseURL}/inventory/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Batch operation failed');
    return response.json();
  };

  const getStats = async (groupId?: string): Promise<InventoryStats> => {
    const query = groupId ? `?groupId=${groupId}` : '';
    const response = await fetch(`${baseURL}/inventory/stats${query}`);
    if (!response.ok) throw new Error('Failed to fetch stats');
    return response.json();
  };

  const getCategories = async (): Promise<CategoryInfo[]> => {
    const response = await fetch(`${baseURL}/inventory/categories`);
    if (!response.ok) throw new Error('Failed to fetch categories');
    return response.json();
  };

  return {
    getItems,
    getItem,
    addItem,
    updateItem,
    deleteItem,
    batchOperation,
    getStats,
    getCategories
  };
};
