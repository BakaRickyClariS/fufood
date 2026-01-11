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
    const message = error instanceof Error ? error.message : '未知錯誤';

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

/**
 * 嘗試真實 API，失敗時 fallback 到 mock 資料
 * 當 USE_MOCK 開啟時，會先嘗試真實 API，只有在失敗時才使用 mock 資料
 */
const tryRealApiWithMockFallback = async <T>(
  method: string,
  endpoint: string,
  realApiCall: () => Promise<T>,
  mockFallback: () => Promise<T>,
): Promise<T> => {
  // 如果 mock 未開啟，直接使用真實 API
  if (!USE_MOCK) {
    return wrapApiCall(method, endpoint, realApiCall);
  }

  // Mock 開啟時：優先嘗試真實 API，失敗才 fallback 到 mock
  console.log(`🔵 [Groups API] ${method} ${endpoint} (優先嘗試真實 API)`);

  try {
    const result = await realApiCall();
    console.log(`🟢 [Groups API] ${method} ${endpoint} 真實 API 成功`, result);
    return result;
  } catch (error) {
    console.warn(
      `🟠 [Groups API] ${method} ${endpoint} 真實 API 失敗，fallback 到 Mock 資料`,
    );
    console.warn('失敗原因:', error instanceof Error ? error.message : error);

    // Fallback 到 mock 資料
    const mockResult = await mockFallback();
    console.log(
      `🟡 [Groups API] ${method} ${endpoint} 使用 Mock 資料`,
      mockResult,
    );
    return mockResult;
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
    return tryRealApiWithMockFallback(
      'GET',
      API_BASE,
      // 真實 API 呼叫
      async () => {
        const response = await backendApi.get<Group[] | { data: Group[] }>(
          API_BASE,
        );

        let groups: Group[] = [];
        // 處理可能的回應格式：直接陣列 或 { data: [...] }
        if (Array.isArray(response)) {
          groups = response;
        } else if (
          response &&
          typeof response === 'object' &&
          'data' in response
        ) {
          groups = response.data;
        } else {
          console.warn('⚠️ [Groups API] 非預期的回應格式:', response);
          return [];
        }

        // 資料轉換：處理每個群組的成員資料
        // 如果列表 API 沒有回傳成員資料，我們需要對每個群組呼叫 getById 來取得詳細資訊
        // 這是因為使用者指出只有 getById (現有的冰箱 API) 才有完整資料

        try {
          const groupsWithDetails = await Promise.all(
            groups.map(async (basicGroup) => {
              try {
                // 並行呼叫 getById 取得詳細資料（包含成員）
                const detailGroup = await groupsApi.getById(basicGroup.id);
                return detailGroup;
              } catch (error) {
                console.warn(
                  `取得群組詳細資料失敗 (id: ${basicGroup.id})`,
                  error,
                );
                // 如果失敗，回傳基本資料，並確保 members 為空陣列以免出錯
                return {
                  ...basicGroup,
                  members: basicGroup.members || [],
                };
              }
            }),
          );

          return groupsWithDetails;
        } catch (error) {
          console.error('批次取得群組詳細資料失敗', error);
          // 如果整個 Promise.all 失敗（理論上 map 裡的 catch 會接住，但以防萬一）
          // 回傳基本列表
          return groups.map((g) => ({ ...g, members: g.members || [] }));
        }
      },
      // Mock fallback
      async () => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        return mockGroups;
      },
    );
  },

  /**
   * 取得單一群組（冰箱）
   * GET /api/v1/refrigerators/{id}
   */
  getById: async (id: string): Promise<Group> => {
    const endpoint = `${API_BASE}/${id}`;

    return tryRealApiWithMockFallback(
      'GET',
      endpoint,
      // 真實 API 呼叫
      async () => {
        const response = await backendApi.get<Group | { data: Group }>(
          endpoint,
        );

        let groupData: Group;
        // 處理可能的回應格式
        if (response && typeof response === 'object' && 'data' in response) {
          groupData = (response as { data: Group }).data;
        } else {
          groupData = response as Group;
        }

        // 資料轉換：處理成員資料
        if (groupData.members && Array.isArray(groupData.members)) {
          groupData.members = groupData.members.map((member) => ({
            ...member,
            avatar: member.profilePictureUrl || member.avatar || '',
            role:
              member.role ||
              (groupData.ownerId === member.id ? 'owner' : 'member'),
          }));
        }

        return groupData;
      },
      // Mock fallback
      async () => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        const group = mockGroups.find((g) => g.id === id);
        if (!group) throw new Error(`群組不存在 (id: ${id})`);
        return group;
      },
    );
  },

  /**
   * 取得群組成員
   * GET /api/v1/refrigerators/{groupId}/members (實際使用 getById 從群組資訊中取得)
   */
  getMembers: async (groupId: string): Promise<GroupMember[]> => {
    // 雖然函式名稱是 getMembers，但在新 API 架構下，成員資訊包含在群組資訊中
    // 因此這裡直接呼叫 getById，然後提取 members 欄位

    return tryRealApiWithMockFallback(
      'GET',
      `${API_BASE}/${groupId}`, // 使用 getById 的 endpoint 作為參考
      // 真實 API 呼叫
      async () => {
        try {
          const group = await groupsApi.getById(groupId);
          return group.members || [];
        } catch (error) {
          console.error('取得群組成員失敗:', error);
          throw error;
        }
      },
      // Mock fallback
      async () => {
        await new Promise((resolve) => setTimeout(resolve, 300));
        const group = mockGroups.find((g) => g.id === groupId);
        if (group && group.members) return group.members;
        return mockMembers;
      },
    );
  },

  /**
   * 建立群組（冰箱）
   * POST /api/v1/refrigerators
   *
   * @param data - 群組資料 { name: string }
   */
  create: async (data: CreateGroupForm): Promise<Group> => {
    console.log('📤 [Groups API] 建立群組請求資料:', data);

    return tryRealApiWithMockFallback(
      'POST',
      API_BASE,
      // 真實 API 呼叫
      async () => {
        const response = await backendApi.post<Group | { data: Group }>(
          API_BASE,
          data,
        );

        // 處理可能的回應格式
        if (response && typeof response === 'object' && 'data' in response) {
          return (response as { data: Group }).data;
        }
        return response as Group;
      },
      // Mock fallback
      async () => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        return {
          id: Math.random().toString(36).substr(2, 9),
          name: data.name,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as Group;
      },
    );
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
    console.log('� [Groups API] 更新群組請求資料:', { id, data });

    return tryRealApiWithMockFallback(
      'PUT',
      endpoint,
      // 真實 API 呼叫
      async () => {
        const response = await backendApi.put<Group | { data: Group }>(
          endpoint,
          data,
        );

        // 處理可能的回應格式
        if (response && typeof response === 'object' && 'data' in response) {
          return (response as { data: Group }).data;
        }
        return response as Group;
      },
      // Mock fallback
      async () => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        const group = mockGroups.find((g) => g.id === id);
        if (!group) throw new Error(`群組不存在 (id: ${id})`);
        return { ...group, ...data, updatedAt: new Date() } as Group;
      },
    );
  },

  /**
   * 刪除群組（冰箱）
   * DELETE /api/v1/refrigerators/{id}
   */
  delete: async (id: string): Promise<void> => {
    const endpoint = `${API_BASE}/${id}`;
    console.log('� [Groups API] 刪除群組:', id);

    return tryRealApiWithMockFallback(
      'DELETE',
      endpoint,
      // 真實 API 呼叫
      () => backendApi.delete<void>(endpoint),
      // Mock fallback
      async () => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        return;
      },
    );
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
    console.log('� [Groups API] 邀請成員:', { groupId, data });

    return tryRealApiWithMockFallback(
      'POST',
      endpoint,
      // 真實 API 呼叫
      () => backendApi.post<void>(endpoint, data),
      // Mock fallback
      async () => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        return;
      },
    );
  },

  /**
   * 加入群組（冰箱）
   * POST /api/v1/refrigerator_memberships
   */
  join: async (_groupId: string, data: JoinGroupForm): Promise<void> => {
    // Note: groupId is not used in the new endpoint but kept for compatibility with call signature if needed,
    // though the caller should probably just pass the token.
    // For now we assume existing callers might pass groupId but we ignore it for the endpoint.
    const endpoint = `/api/v1/refrigerator_memberships`;
    console.log(' [Groups API] 加入群組:', { data });

    return tryRealApiWithMockFallback(
      'POST',
      endpoint,
      // 真實 API 呼叫
      () => backendApi.post<void>(endpoint, data),
      // Mock fallback
      async () => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        return;
      },
    );
  },

  /**
   * 成員自行退出冰箱群組
   * DELETE /api/v1/refrigerator/{refrigeratorId}/leave
   *
   * 注意：擁有者不能退出自己的群組
   */
  leaveGroup: async (groupId: string): Promise<void> => {
    const endpoint = `/api/v1/refrigerator/${groupId}/leave`;
    console.log('🚪 [Groups API] 退出群組:', groupId);

    return tryRealApiWithMockFallback(
      'DELETE',
      endpoint,
      // 真實 API 呼叫
      () => backendApi.delete<void>(endpoint),
      // Mock fallback
      async () => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        return;
      },
    );
  },

  /**
   * @deprecated 請使用 leaveGroup（自己退出）或 removeMemberByOwner（擁有者移除）
   * 離開群組（冰箱）
   */
  leave: async (groupId: string, memberId: string): Promise<void> => {
    console.warn(
      '⚠️ leave 方法已棄用，請使用 leaveGroup 或 removeMemberByOwner',
    );
    const endpoint = `${API_BASE}/${groupId}/members/${memberId}`;
    console.log('📤 [Groups API] 離開群組:', { groupId, memberId });

    return tryRealApiWithMockFallback(
      'DELETE',
      endpoint,
      () => backendApi.delete<void>(endpoint),
      async () => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        return;
      },
    );
  },

  /**
   * 擁有者移除冰箱成員
   * DELETE /api/v1/refrigerator/{refrigeratorId}/memberships/{memberId}
   *
   * 注意：只有冰箱擁有者可以移除成員
   */
  removeMember: async (groupId: string, memberId: string): Promise<void> => {
    const endpoint = `/api/v1/refrigerator/${groupId}/memberships/${memberId}`;
    console.log('❌ [Groups API] 移除成員:', { groupId, memberId });

    return tryRealApiWithMockFallback(
      'DELETE',
      endpoint,
      // 真實 API 呼叫
      () => backendApi.delete<void>(endpoint),
      // Mock fallback
      async () => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        return;
      },
    );
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
    console.log(' [Groups API] 更新成員權限:', { groupId, memberId, role });

    return tryRealApiWithMockFallback(
      'PATCH',
      endpoint,
      // 真實 API 呼叫
      () => backendApi.patch<void>(endpoint, { role }),
      // Mock fallback
      async () => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        return;
      },
    );
  },

  /**
   * 搜尋好友
   * GET /api/v1/users/friends?q={query}
   */
  searchFriends: async (
    query: string,
  ): Promise<import('../types/group.types').Friend[]> => {
    const endpoint = `/api/v1/users/friends?q=${encodeURIComponent(query)}`;

    return tryRealApiWithMockFallback(
      'GET',
      endpoint,
      // 真實 API 呼叫
      async () => {
        const response = await backendApi.get<any>(endpoint);
        if (response && response.data) return response.data;
        return Array.isArray(response) ? response : [];
      },
      // Mock fallback
      async () => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        // Mock search result
        if (!query) return [];
        const allFriends = [
          {
            id: 'f1',
            name: 'Ricky',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ricky',
            lineId: 'ricky_123',
          },
          {
            id: 'f2',
            name: '_ricky.yang',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Yang',
            lineId: 'yang_456',
          },
          {
            id: 'f3',
            name: 'Alice',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
            lineId: 'alice_789',
          },
        ];
        return allFriends.filter(
          (f) =>
            f.name.toLowerCase().includes(query.toLowerCase()) ||
            f.lineId?.toLowerCase().includes(query.toLowerCase()),
        );
      },
    );
  },

  /**
   * 產生邀請（QR Code 邀請功能）
   * POST /api/v1/refrigerators/{id}/invitations
   *
   * @returns 包含 token 和前端邀請連結的回應
   */
  createInvitation: async (
    groupId: string,
  ): Promise<import('../types/group.types').InviteCodeResponse> => {
    const endpoint = `${API_BASE}/${groupId}/invitations`;

    return tryRealApiWithMockFallback(
      'POST',
      endpoint,
      // 真實 API 呼叫
      async () => {
        const response = await backendApi.post<{
          data: import('../types/group.types').InvitationResponse;
        }>(endpoint, {});
        const data = response?.data || response;

        // 組合前端邀請連結
        const inviteUrl = data.token
          ? `${window.location.origin}/invite/${data.token}`
          : undefined;

        return {
          token: data.token ?? undefined,
          inviteUrl,
          expiresAt: data.expiresAt,
        };
      },
      // Mock fallback
      async () => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        const mockToken = `mock_${Math.random().toString(36).substring(2, 15)}`;
        return {
          token: mockToken,
          inviteUrl: `${window.location.origin}/invite/${mockToken}`,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        };
      },
    );
  },

  /**
   * 取得邀請資訊（驗證邀請 token）
   * GET /api/v1/invitations/{token}
   *
   * @param token - 邀請 token
   * @returns 邀請詳情，包含群組和邀請者資訊
   */
  getInvitation: async (
    token: string,
  ): Promise<import('../types/group.types').InvitationResponse> => {
    const endpoint = `/api/v1/invitations/${token}`;

    return wrapApiCall('GET', endpoint, async () => {
      const response = await backendApi.get<{
        data: import('../types/group.types').InvitationResponse;
      }>(endpoint);
      const data = response?.data || response;
      return data as import('../types/group.types').InvitationResponse;
    });
  },

  /**
   * @deprecated 請使用 createInvitation 替代
   * 取得邀請碼（舊版）
   */
  getInviteCode: async (
    groupId: string,
  ): Promise<import('../types/group.types').InviteCodeResponse> => {
    console.warn('⚠️ getInviteCode 已棄用，請使用 createInvitation');
    return groupsApi.createInvitation(groupId);
  },
};

// 匯出錯誤類別供外部使用
export { GroupsApiError };
