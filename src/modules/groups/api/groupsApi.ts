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

// ============================================================
// 錯誤處理工具
// ============================================================

/**
 * 自訂 API 錯誤類別，提供更詳細的錯誤資訊
 */
class GroupsApiError extends Error {
  public readonly endpoint: string;
  public readonly method: string;
  public readonly statusCode?: number;
  public readonly originalError: unknown;

  constructor(
    message: string,
    endpoint: string,
    method: string,
    originalError: unknown,
    statusCode?: number,
  ) {
    super(message);
    this.name = 'GroupsApiError';
    this.endpoint = endpoint;
    this.method = method;
    this.statusCode = statusCode;
    this.originalError = originalError;
  }

  /**
   * 輸出格式化的錯誤訊息到 Console
   */
  logError = (): void => {
    console.group(`🔴 [Groups API 錯誤] ${this.method} ${this.endpoint}`);
    console.error('錯誤訊息:', this.message);
    if (this.statusCode) {
      console.error('HTTP 狀態碼:', this.statusCode);
    }
    console.error('原始錯誤:', this.originalError);
    console.groupEnd();
  };
}

/**
 * 從錯誤物件中提取 HTTP 狀態碼
 */
const extractStatusCode = (error: unknown): number | undefined => {
  if (error instanceof Error && 'status' in error) {
    return (error as Error & { status: number }).status;
  }
  // 嘗試從錯誤訊息中解析狀態碼
  const match = String(error).match(/(\d{3})/);
  return match ? parseInt(match[1], 10) : undefined;
};

/**
 * 包裝 API 呼叫，統一處理錯誤
 */
const wrapApiCall = async <T>(
  method: string,
  endpoint: string,
  apiCall: () => Promise<T>,
): Promise<T> => {
  console.log(`🔵 [Groups API] ${method} ${endpoint}`);

  try {
    const result = await apiCall();
    console.log(`🟢 [Groups API] ${method} ${endpoint} 成功`, result);
    return result;
  } catch (error) {
    const statusCode = extractStatusCode(error);
    const message =
      error instanceof Error ? error.message : '未知錯誤';

    const apiError = new GroupsApiError(
      message,
      endpoint,
      method,
      error,
      statusCode,
    );
    apiError.logError();

    throw apiError;
  }
};

// ============================================================
// API 方法
// ============================================================

export const groupsApi = {
  /**
   * 取得所有群組（冰箱）
   * GET /api/v1/refrigerators
   */
  getAll: async (): Promise<Group[]> => {
    if (USE_MOCK) {
      console.log('🟡 [Groups API] 使用 Mock 資料 - getAll');
      await new Promise((resolve) => setTimeout(resolve, 500));
      return mockGroups;
    }

    return wrapApiCall('GET', API_BASE, async () => {
      const response = await backendApi.get<Group[] | { data: Group[] }>(API_BASE);
      
      // 處理可能的回應格式：直接陣列 或 { data: [...] }
      if (Array.isArray(response)) {
        return response;
      }
      if (response && typeof response === 'object' && 'data' in response) {
        return response.data;
      }
      
      console.warn('⚠️ [Groups API] 非預期的回應格式:', response);
      return [];
    });
  },

  /**
   * 取得單一群組（冰箱）
   * GET /api/v1/refrigerators/{id}
   */
  getById: async (id: string): Promise<Group> => {
    const endpoint = `${API_BASE}/${id}`;

    if (USE_MOCK) {
      console.log('🟡 [Groups API] 使用 Mock 資料 - getById:', id);
      await new Promise((resolve) => setTimeout(resolve, 500));
      const group = mockGroups.find((g) => g.id === id);
      if (!group) throw new Error(`群組不存在 (id: ${id})`);
      return group;
    }

    return wrapApiCall('GET', endpoint, async () => {
      const response = await backendApi.get<Group | { data: Group }>(endpoint);
      
      // 處理可能的回應格式
      if (response && typeof response === 'object' && 'data' in response) {
        return (response as { data: Group }).data;
      }
      return response as Group;
    });
  },

  /**
   * 取得群組成員
   * GET /api/v1/refrigerators/{groupId}/members
   */
  getMembers: async (groupId: string): Promise<GroupMember[]> => {
    const endpoint = `${API_BASE}/${groupId}/members`;

    if (USE_MOCK) {
      console.log('🟡 [Groups API] 使用 Mock 資料 - getMembers:', groupId);
      await new Promise((resolve) => setTimeout(resolve, 300));
      const group = mockGroups.find((g) => g.id === groupId);
      if (group && group.members) return group.members;
      return mockMembers;
    }

    return wrapApiCall('GET', endpoint, async () => {
      const response = await backendApi.get<GroupMember[] | { data: GroupMember[] }>(endpoint);
      
      // 處理可能的回應格式
      if (Array.isArray(response)) {
        return response;
      }
      if (response && typeof response === 'object' && 'data' in response) {
        return response.data;
      }
      
      console.warn('⚠️ [Groups API] 非預期的成員回應格式:', response);
      return [];
    });
  },

  /**
   * 建立群組（冰箱）
   * POST /api/v1/refrigerators
   * 
   * @param data - 群組資料 { name: string }
   */
  create: async (data: CreateGroupForm): Promise<Group> => {
    if (USE_MOCK) {
      console.log('🟡 [Groups API] 使用 Mock 資料 - create:', data);
      await new Promise((resolve) => setTimeout(resolve, 500));
      return {
        id: Math.random().toString(36).substr(2, 9),
        name: data.name,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Group;
    }

    console.log('📤 [Groups API] 建立群組請求資料:', data);

    return wrapApiCall('POST', API_BASE, async () => {
      const response = await backendApi.post<Group | { data: Group }>(API_BASE, data);
      
      // 處理可能的回應格式
      if (response && typeof response === 'object' && 'data' in response) {
        return (response as { data: Group }).data;
      }
      return response as Group;
    });
  },

  /**
   * 更新群組（冰箱）
   * PUT /api/v1/refrigerators/{id}
   * 
   * @param id - 群組 ID
   * @param data - 更新資料 { name?: string }
   */
  update: async (id: string, data: UpdateGroupForm): Promise<Group> => {
    const endpoint = `${API_BASE}/${id}`;

    if (USE_MOCK) {
      console.log('🟡 [Groups API] 使用 Mock 資料 - update:', id, data);
      await new Promise((resolve) => setTimeout(resolve, 500));
      const group = mockGroups.find((g) => g.id === id);
      if (!group) throw new Error(`群組不存在 (id: ${id})`);
      return { ...group, ...data, updatedAt: new Date() } as Group;
    }

    console.log('📤 [Groups API] 更新群組請求資料:', { id, data });

    return wrapApiCall('PUT', endpoint, async () => {
      const response = await backendApi.put<Group | { data: Group }>(endpoint, data);
      
      // 處理可能的回應格式
      if (response && typeof response === 'object' && 'data' in response) {
        return (response as { data: Group }).data;
      }
      return response as Group;
    });
  },

  /**
   * 刪除群組（冰箱）
   * DELETE /api/v1/refrigerators/{id}
   */
  delete: async (id: string): Promise<void> => {
    const endpoint = `${API_BASE}/${id}`;

    if (USE_MOCK) {
      console.log('🟡 [Groups API] 使用 Mock 資料 - delete:', id);
      await new Promise((resolve) => setTimeout(resolve, 500));
      return;
    }

    console.log('📤 [Groups API] 刪除群組:', id);

    return wrapApiCall('DELETE', endpoint, () => backendApi.delete<void>(endpoint));
  },

  /**
   * 邀請成員加入群組（冰箱）
   * POST /api/v1/refrigerators/{groupId}/members
   */
  inviteMember: async (
    groupId: string,
    data: InviteMemberForm,
  ): Promise<void> => {
    const endpoint = `${API_BASE}/${groupId}/members`;

    if (USE_MOCK) {
      console.log('🟡 [Groups API] 使用 Mock 資料 - inviteMember:', groupId, data);
      await new Promise((resolve) => setTimeout(resolve, 500));
      return;
    }

    console.log('📤 [Groups API] 邀請成員:', { groupId, data });

    return wrapApiCall('POST', endpoint, () => backendApi.post<void>(endpoint, data));
  },

  /**
   * 加入群組（冰箱）
   * POST /api/v1/refrigerators/{groupId}/members
   */
  join: async (groupId: string, data: JoinGroupForm): Promise<void> => {
    const endpoint = `${API_BASE}/${groupId}/members`;

    if (USE_MOCK) {
      console.log('🟡 [Groups API] 使用 Mock 資料 - join:', groupId, data);
      await new Promise((resolve) => setTimeout(resolve, 500));
      return;
    }

    console.log('📤 [Groups API] 加入群組:', { groupId, data });

    return wrapApiCall('POST', endpoint, () => backendApi.post<void>(endpoint, data));
  },

  /**
   * 離開群組（冰箱）
   * DELETE /api/v1/refrigerators/{groupId}/members/{memberId}
   */
  leave: async (groupId: string, memberId: string): Promise<void> => {
    const endpoint = `${API_BASE}/${groupId}/members/${memberId}`;

    if (USE_MOCK) {
      console.log('🟡 [Groups API] 使用 Mock 資料 - leave:', groupId, memberId);
      await new Promise((resolve) => setTimeout(resolve, 500));
      return;
    }

    console.log('📤 [Groups API] 離開群組:', { groupId, memberId });

    return wrapApiCall('DELETE', endpoint, () => backendApi.delete<void>(endpoint));
  },

  /**
   * 移除成員
   * DELETE /api/v1/refrigerators/{groupId}/members/{memberId}
   */
  removeMember: async (groupId: string, memberId: string): Promise<void> => {
    const endpoint = `${API_BASE}/${groupId}/members/${memberId}`;

    if (USE_MOCK) {
      console.log('🟡 [Groups API] 使用 Mock 資料 - removeMember:', groupId, memberId);
      await new Promise((resolve) => setTimeout(resolve, 500));
      return;
    }

    console.log('📤 [Groups API] 移除成員:', { groupId, memberId });

    return wrapApiCall('DELETE', endpoint, () => backendApi.delete<void>(endpoint));
  },

  /**
   * 更新成員權限
   * PATCH /api/v1/refrigerators/{groupId}/members/{memberId}
   */
  updateMemberRole: async (
    groupId: string,
    memberId: string,
    role: GroupMember['role'],
  ): Promise<void> => {
    const endpoint = `${API_BASE}/${groupId}/members/${memberId}`;

    if (USE_MOCK) {
      console.log('🟡 [Groups API] 使用 Mock 資料 - updateMemberRole:', groupId, memberId, role);
      await new Promise((resolve) => setTimeout(resolve, 500));
      return;
    }

    console.log('📤 [Groups API] 更新成員權限:', { groupId, memberId, role });

    return wrapApiCall('PATCH', endpoint, () =>
      backendApi.patch<void>(endpoint, { role }),
    );
  },

  /**
   * 搜尋好友
   * GET /api/v1/users/friends?q={query}
   */
  searchFriends: async (query: string): Promise<import('../types/group.types').Friend[]> => {
    const endpoint = `/api/v1/users/friends?q=${encodeURIComponent(query)}`;

    if (USE_MOCK) {
      console.log('🟡 [Groups API] 使用 Mock 資料 - searchFriends:', query);
      await new Promise((resolve) => setTimeout(resolve, 500));
      // Mock search result
      if (!query) return [];
      const allFriends = [
        { id: 'f1', name: 'Ricky', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ricky', lineId: 'ricky_123' },
        { id: 'f2', name: '_ricky.yang', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Yang', lineId: 'yang_456' },
        { id: 'f3', name: 'Alice', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice', lineId: 'alice_789' },
      ];
      return allFriends.filter(f => f.name.toLowerCase().includes(query.toLowerCase()) || f.lineId?.toLowerCase().includes(query.toLowerCase()));
    }

    return wrapApiCall('GET', endpoint, async () => {
      const response = await backendApi.get<any>(endpoint);
      if (response && response.data) return response.data;
      return Array.isArray(response) ? response : [];
    });
  },

  /**
   * 取得邀請碼
   * POST /api/v1/refrigerators/{id}/invite-code
   */
  getInviteCode: async (groupId: string): Promise<import('../types/group.types').InviteCodeResponse> => {
    const endpoint = `${API_BASE}/${groupId}/invite-code`;

    if (USE_MOCK) {
      console.log('🟡 [Groups API] 使用 Mock 資料 - getInviteCode:', groupId);
      await new Promise((resolve) => setTimeout(resolve, 500));
      return {
        code: `INV-${Math.floor(Math.random() * 10000)}`,
        expiry: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        qrUrl: `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://fufood.app/join?g=${groupId}`,
      };
    }

    return wrapApiCall('POST', endpoint, async () => {
      const response = await backendApi.post<any>(endpoint, {});
      if (response && response.data) return response.data;
      return response;
    });
  },
};

// 匯出錯誤類別供外部使用
export { GroupsApiError };
