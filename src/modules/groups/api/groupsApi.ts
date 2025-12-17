import { apiClient } from '@/lib/apiClient';
import type {
  Group,
  CreateGroupForm,
  UpdateGroupForm,
  GroupMember,
  InviteMemberForm,
  JoinGroupForm,
} from '../types/group.types';
import { mockGroups, mockMembers } from '../mocks/mockData';

const USE_MOCK = import.meta.env.VITE_USE_MOCK_API !== 'false';

export const groupsApi = {
  /**
   * 取得所有群組
   */
  getAll: async (): Promise<Group[]> => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return mockGroups;
    }
    return apiClient.get<Group[]>('/groups');
  },

  /**
   * 取得單一群組
   */
  getById: async (id: string): Promise<Group> => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const group = mockGroups.find((g) => g.id === id);
      if (!group) throw new Error('群組不存在');
      return group;
    }
    return apiClient.get<Group>(`/groups/${id}`);
  },

  /**
   * 取得群組成員
   */
  getMembers: async (groupId: string): Promise<GroupMember[]> => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      // In a real mock, we might want to filter by groupId, but current mock data structure embeds members in group.
      // Or we can return the global mockMembers list if it's shared.
      // Based on previous code, it returned a global list.
      // We should try to find members from the group first.
      const group = mockGroups.find((g) => g.id === groupId);
      if (group && group.members) return group.members;
      return mockMembers;
    }
    return apiClient.get<GroupMember[]>(`/groups/${groupId}/members`);
  },

  /**
   * 建立群組
   */
  create: async (data: CreateGroupForm): Promise<Group> => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return {
        id: Math.random().toString(36).substr(2, 9),
        ...data,
        admin: data.admin || 'Unknown',
        members: [],
        plan: 'free',
        createdAt: new Date(),
        updatedAt: new Date(),
        color: data.color || 'bg-white',
        characterColor: data.characterColor || 'bg-blue-200',
      } as Group;
    }
    return apiClient.post<Group>('/groups', data);
  },

  /**
   * 更新群組
   */
  update: async (id: string, data: UpdateGroupForm): Promise<Group> => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const group = mockGroups.find((g) => g.id === id);
      if (!group) throw new Error('群組不存在');
      return { ...group, ...data, updatedAt: new Date() } as Group;
    }
    return apiClient.put<Group>(`/groups/${id}`, data);
  },

  /**
   * 刪除群組
   */
  delete: async (id: string): Promise<void> => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return;
    }
    return apiClient.delete<void>(`/groups/${id}`);
  },

  /**
   * 邀請成員
   */
  inviteMember: async (
    groupId: string,
    data: InviteMemberForm,
  ): Promise<void> => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return;
    }
    return apiClient.post<void>(`/groups/${groupId}/invite`, data);
  },

  /**
   * 加入群組
   */
  join: async (groupId: string, data: JoinGroupForm): Promise<void> => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return;
    }
    return apiClient.post<void>(`/groups/${groupId}/join`, data);
  },

  /**
   * 離開群組
   */
  leave: async (groupId: string): Promise<void> => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return;
    }
    return apiClient.delete<void>(`/groups/${groupId}/leave`);
  },

  /**
   * 移除成員
   */
  removeMember: async (groupId: string, memberId: string): Promise<void> => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return;
    }
    return apiClient.delete<void>(`/groups/${groupId}/remove/${memberId}`);
  },

  /**
   * 更新成員權限
   */
  updateMemberRole: async (
    groupId: string,
    memberId: string,
    role: GroupMember['role'],
  ): Promise<void> => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return;
    }
    return apiClient.patch<void>(`/groups/${groupId}/members/${memberId}`, {
      role,
    });
  },
};
