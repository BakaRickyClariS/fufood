import type {
  Group,
  CreateGroupForm,
  UpdateGroupForm,
  GroupMember,
  InviteMemberForm,
} from '../../types/group.types';
import { MOCK_GROUPS, MOCK_MEMBERS } from './mock/groupsMockData';

const USE_MOCK = import.meta.env.VITE_USE_MOCK_API !== 'false';

export const groupsApi = {
  /**
   * 取得所有群組
   */
  getAll: async (): Promise<Group[]> => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return MOCK_GROUPS;
    }

    // TODO: 真實 API
    const response = await fetch('/api/groups');
    if (!response.ok) throw new Error('無法取得群組列表');
    return response.json();
  },

  /**
   * 取得群組成員
   */
  getMembers: async (groupId: string): Promise<GroupMember[]> => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      return MOCK_MEMBERS;
    }

    // TODO: 真實 API
    const response = await fetch(`/api/groups/${groupId}/members`);
    if (!response.ok) throw new Error('無法取得成員列表');
    return response.json();
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
        admin: 'Jocelyn',
        members: [],
        plan: 'free',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    // TODO: 真實 API
    const response = await fetch('/api/groups', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('建立群組失敗');
    return response.json();
  },

  /**
   * 更新群組
   */
  update: async (id: string, data: UpdateGroupForm): Promise<Group> => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const group = MOCK_GROUPS.find((g) => g.id === id);
      if (!group) throw new Error('群組不存在');
      return { ...group, ...data, updatedAt: new Date() };
    }

    // TODO: 真實 API
    const response = await fetch(`/api/groups/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('更新群組失敗');
    return response.json();
  },

  /**
   * 刪除群組
   */
  delete: async (id: string): Promise<void> => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return;
    }

    // TODO: 真實 API
    const response = await fetch(`/api/groups/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('刪除群組失敗');
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

    // TODO: 真實 API
    const response = await fetch(`/api/groups/${groupId}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('邀請成員失敗');
  },

  /**
   * 移除成員
   */
  removeMember: async (groupId: string, memberId: string): Promise<void> => {
    if (USE_MOCK) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return;
    }

    // TODO: 真實 API
    const response = await fetch(`/api/groups/${groupId}/members/${memberId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('移除成員失敗');
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

    // TODO: 真實 API
    const response = await fetch(`/api/groups/${groupId}/members/${memberId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    });
    if (!response.ok) throw new Error('更新權限失敗');
  },
};
