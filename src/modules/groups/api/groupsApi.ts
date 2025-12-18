import { backendApi } from '@/api/client';
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

// API 基底路徑
const API_BASE = '/api/v1/refrigerators';

export const groupsApi = {
  /**
   * 取得所有群組（冰箱）
   */
  getAll: async (): Promise<Group[]> => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return mockGroups;
    }
    return backendApi.get<Group[]>(API_BASE);
  },

  /**
   * 取得單一群組（冰箱）
   */
  getById: async (id: string): Promise<Group> => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const group = mockGroups.find((g) => g.id === id);
      if (!group) throw new Error('群組不存在');
      return group;
    }
    return backendApi.get<Group>(`${API_BASE}/${id}`);
  },

  /**
   * 取得群組成員
   */
  getMembers: async (groupId: string): Promise<GroupMember[]> => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      const group = mockGroups.find((g) => g.id === groupId);
      if (group && group.members) return group.members;
      return mockMembers;
    }
    return backendApi.get<GroupMember[]>(`${API_BASE}/${groupId}/members`);
  },

  /**
   * 建立群組（冰箱）
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
    return backendApi.post<Group>(API_BASE, data);
  },

  /**
   * 更新群組（冰箱）
   */
  update: async (id: string, data: UpdateGroupForm): Promise<Group> => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const group = mockGroups.find((g) => g.id === id);
      if (!group) throw new Error('群組不存在');
      return { ...group, ...data, updatedAt: new Date() } as Group;
    }
    return backendApi.put<Group>(`${API_BASE}/${id}`, data);
  },

  /**
   * 刪除群組（冰箱）
   */
  delete: async (id: string): Promise<void> => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return;
    }
    return backendApi.delete<void>(`${API_BASE}/${id}`);
  },

  /**
   * 邀請成員加入群組（冰箱）
   */
  inviteMember: async (
    groupId: string,
    data: InviteMemberForm,
  ): Promise<void> => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return;
    }
    return backendApi.post<void>(`${API_BASE}/${groupId}/members`, data);
  },

  /**
   * 加入群組（冰箱）
   */
  join: async (groupId: string, data: JoinGroupForm): Promise<void> => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return;
    }
    return backendApi.post<void>(`${API_BASE}/${groupId}/members`, data);
  },

  /**
   * 離開群組（冰箱）
   */
  leave: async (groupId: string, memberId: string): Promise<void> => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return;
    }
    return backendApi.delete<void>(`${API_BASE}/${groupId}/members/${memberId}`);
  },

  /**
   * 移除成員
   */
  removeMember: async (groupId: string, memberId: string): Promise<void> => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return;
    }
    return backendApi.delete<void>(`${API_BASE}/${groupId}/members/${memberId}`);
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
    return backendApi.patch<void>(`${API_BASE}/${groupId}/members/${memberId}`, {
      role,
    });
  },
};
