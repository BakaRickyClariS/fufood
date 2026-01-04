/**
 * Groups (Refrigerators) TanStack Query Hooks
 *
 * 提供群組（冰箱）模組的快取和狀態管理
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { identity } from '@/shared/utils/identity';
import { groupsApi } from './groupsApi';
import type {
  CreateGroupForm,
  UpdateGroupForm,
  InviteMemberForm,
  JoinGroupForm,
  GroupMember,
} from '../types/group.types';

// Query Keys
export const groupKeys = {
  all: ['groups'] as const,
  lists: () => [...groupKeys.all, 'list'] as const,
  details: () => [...groupKeys.all, 'detail'] as const,
  detail: (id: string) => [...groupKeys.details(), id] as const,
  members: (groupId: string) => [...groupKeys.all, 'members', groupId] as const,
};

/**
 * 取得所有群組（冰箱）
 */
export const useGroupsQuery = () => {
  // 使用共用模組檢查是否可以發送認證請求
  const shouldQuery = identity.canMakeAuthenticatedRequest();

  return useQuery({
    queryKey: groupKeys.lists(),
    queryFn: () => groupsApi.getAll(),
    enabled: shouldQuery,
    staleTime: 1000 * 60 * 5, // 5 分鐘
  });
};

/**
 * 取得單一群組（冰箱）
 */
export const useGroupQuery = (id: string) => {
  return useQuery({
    queryKey: groupKeys.detail(id),
    queryFn: () => groupsApi.getById(id),
    enabled: !!id,
  });
};

/**
 * 取得群組成員
 */
export const useGroupMembersQuery = (groupId: string) => {
  return useQuery({
    queryKey: groupKeys.members(groupId),
    queryFn: () => groupsApi.getMembers(groupId),
    enabled: !!groupId,
  });
};

/**
 * 建立群組 Mutation
 */
export const useCreateGroupMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateGroupForm) => groupsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupKeys.lists() });
    },
  });
};

/**
 * 更新群組 Mutation
 */
export const useUpdateGroupMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateGroupForm }) =>
      groupsApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: groupKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: groupKeys.lists() });
    },
  });
};

/**
 * 刪除群組 Mutation
 */
export const useDeleteGroupMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => groupsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupKeys.lists() });
    },
  });
};

/**
 * 邀請成員 Mutation
 */
export const useInviteMemberMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      groupId,
      data,
    }: {
      groupId: string;
      data: InviteMemberForm;
    }) => groupsApi.inviteMember(groupId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: groupKeys.members(variables.groupId),
      });
    },
  });
};

/**
 * 加入群組 Mutation
 */
export const useJoinGroupMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ groupId, data }: { groupId: string; data: JoinGroupForm }) =>
      groupsApi.join(groupId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupKeys.lists() });
    },
  });
};

/**
 * 成員自行退出群組 Mutation
 * 使用正確的 API 路徑 DELETE /api/v1/refrigerator/{id}/leave
 */
export const useLeaveGroupMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (groupId: string) => groupsApi.leaveGroup(groupId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupKeys.lists() });
    },
  });
};

/**
 * 移除成員 Mutation
 */
export const useRemoveMemberMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      groupId,
      memberId,
    }: {
      groupId: string;
      memberId: string;
    }) => groupsApi.removeMember(groupId, memberId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: groupKeys.members(variables.groupId),
      });
      queryClient.invalidateQueries({
        queryKey: groupKeys.lists(),
      });
      queryClient.invalidateQueries({
        queryKey: groupKeys.detail(variables.groupId),
      });
    },
  });
};

/**
 * 更新成員權限 Mutation
 */
export const useUpdateMemberRoleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      groupId,
      memberId,
      role,
    }: {
      groupId: string;
      memberId: string;
      role: GroupMember['role'];
    }) => groupsApi.updateMemberRole(groupId, memberId, role),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: groupKeys.members(variables.groupId),
      });
    },
  });
};
