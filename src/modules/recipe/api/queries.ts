/**
 * Recipe TanStack Query Hooks
 *
 * 提供食譜模組的快取和狀態管理
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { recipeApi } from '../services';
import type { RecipeCategory } from '../types';

// Query Keys
export const recipeKeys = {
  all: ['recipes'] as const,
  lists: () => [...recipeKeys.all, 'list'] as const,
  list: (params?: { category?: RecipeCategory; favorite?: boolean }) =>
    [...recipeKeys.lists(), params] as const,
  details: () => [...recipeKeys.all, 'detail'] as const,
  detail: (id: string) => [...recipeKeys.details(), id] as const,
  favorites: () => [...recipeKeys.all, 'favorites'] as const,
  mealPlans: () => [...recipeKeys.all, 'mealPlans'] as const,
};

/**
 * 取得食譜列表
 */
export const useRecipesQuery = (params?: {
  category?: RecipeCategory;
  favorite?: boolean;
}) => {
  return useQuery({
    queryKey: recipeKeys.list(params),
    queryFn: () => recipeApi.getRecipes(params),
    staleTime: 1000 * 60 * 5, // 5 分鐘
  });
};

/**
 * 取得單一食譜詳情
 */
export const useRecipeQuery = (id: string) => {
  return useQuery({
    queryKey: recipeKeys.detail(id),
    queryFn: () => recipeApi.getRecipeById(id),
    enabled: !!id,
  });
};

/**
 * 取得收藏食譜列表
 */
export const useFavoriteRecipesQuery = () => {
  return useQuery({
    queryKey: recipeKeys.favorites(),
    queryFn: () => recipeApi.getFavorites(),
    staleTime: 1000 * 60 * 5,
  });
};

/**
 * 取得餐期計畫
 */
export const useMealPlansQuery = () => {
  return useQuery({
    queryKey: recipeKeys.mealPlans(),
    queryFn: () => recipeApi.getMealPlans(),
    staleTime: 1000 * 60 * 5,
  });
};

/**
 * 切換收藏狀態 Mutation
 */
export const useToggleFavoriteMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      shouldFavorite,
    }: {
      id: string;
      shouldFavorite?: boolean;
    }) => recipeApi.toggleFavorite(id, shouldFavorite),
    onSuccess: (_, variables) => {
      // 使食譜詳情和收藏列表失效
      queryClient.invalidateQueries({
        queryKey: recipeKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: recipeKeys.favorites() });
      queryClient.invalidateQueries({ queryKey: recipeKeys.lists() });
    },
  });
};

/**
 * 確認烹煮 Mutation
 */
export const useCookRecipeMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: recipeApi.confirmCook,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: recipeKeys.detail(variables.recipeId),
      });
    },
  });
};

/**
 * 新增餐期計畫 Mutation
 */
export const useAddMealPlanMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: recipeApi.addMealPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recipeKeys.mealPlans() });
    },
  });
};

/**
 * 刪除餐期計畫 Mutation
 */
export const useDeleteMealPlanMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: recipeApi.deleteMealPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recipeKeys.mealPlans() });
    },
  });
};
