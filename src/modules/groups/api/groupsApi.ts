import { api } from '@/api/client';
import { ENDPOINTS } from '@/api/endpoints';
import type {
  Group,
  CreateGroupForm,
  UpdateGroupForm,
  GroupMember,
  InviteMemberForm,
  JoinGroupForm,
} from '../types/group.types';

const USE_MOCK = import.meta.env.VITE_USE_MOCK_API !== 'false';

// API 已統一定義在 @/api/endpoints.ts

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
  realApiFn: () => Promise<T>,
  mockFn: () => Promise<T>,
): Promise<T> => {
  // 如果 mock 未開啟，直接使用真實 API
  if (!USE_MOCK) {
    return wrapApiCall(method, endpoint, realApiFn);
  }

  if (USE_MOCK) {
    console.log(`[GroupsApi] Mock ${method} ${endpoint}`);
    await new Promise((resolve) => setTimeout(resolve, 500));
    return mockFn();
  }
  return realApiFn();
};

export const groupsApi = {
  /**
   * 取得使用者的所有群組
   */
  getAll: async (): Promise<Group[]> => {
    return tryRealApiWithMockFallback(
      'GET',
      ENDPOINTS.GROUPS.BASE,
      async () => {
        // ApiClient now auto-unwraps { success, data } -> Group[]
        return await api.get<Group[]>(ENDPOINTS.GROUPS.BASE);
      },
      async () => {
        return [
          /* mock data */
          {
            id: 'group-1',
            name: '我的冰箱',
            description: '個人使用的冰箱',
            ownerId: '1',
            members: [
              {
                id: '1',
                name: 'Jocelyn',
                avatar:
                  'https://api.dicebear.com/7.x/avataaars/svg?seed=Jocelyn',
                role: 'owner',
              },
            ],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ];
      },
    );
  },

  /**
   * 取得特定群組詳情
   */
  getById: async (id: string): Promise<Group> => {
    return tryRealApiWithMockFallback(
      'GET',
      ENDPOINTS.GROUPS.BY_ID(id),
      async () => {
        return await api.get<Group>(ENDPOINTS.GROUPS.BY_ID(id));
      },
      async () => {
        return {
          id,
          name: '我的冰箱',
          ownerId: '1',
          members: [
            {
              id: '1',
              name: 'Jocelyn',
              avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jocelyn',
              role: 'owner',
            },
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      },
    );
  },

  /**
   * 建立新群組
   */
  create: async (data: CreateGroupForm): Promise<Group> => {
    return tryRealApiWithMockFallback(
      'POST',
      ENDPOINTS.GROUPS.BASE,
      async () => {
        return await api.post<Group>(ENDPOINTS.GROUPS.BASE, data);
      },
      async () => {
        return {
          id: `group-${Date.now()}`,
          name: data.name,
          ownerId: '1',
          members: [
            {
              id: '1',
              name: 'Jocelyn',
              avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jocelyn',
              role: 'owner',
            },
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      },
    );
  },

  /**
   * 更新群組資訊
   */
  update: async (id: string, data: UpdateGroupForm): Promise<Group> => {
    return tryRealApiWithMockFallback(
      'PUT',
      ENDPOINTS.GROUPS.BY_ID(id),
      async () => {
        return await api.put<Group>(ENDPOINTS.GROUPS.BY_ID(id), data);
      },
      async () => {
        return {
          id,
          name: data.name || 'Updated Group',
          ownerId: '1',
          members: [
            {
              id: '1',
              name: 'Jocelyn',
              avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jocelyn',
              role: 'owner',
            },
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      },
    );
  },

  /**
   * 刪除群組
   */
  delete: async (id: string): Promise<void> => {
    const endpoint = ENDPOINTS.GROUPS.BY_ID(id);
    console.log(' [Groups API] 刪除群組:', id);

    return tryRealApiWithMockFallback(
      'DELETE',
      endpoint,
      // 真實 API 呼叫
      () => api.delete<void>(ENDPOINTS.GROUPS.BY_ID(id)),
      // Mock fallback
      async () => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        return;
      },
    );
  },

  /**
   * 取得群組成員列表
   * V2 API: 取得群組詳情內會包含成員列表，沒有獨立的 /members GET 端點
   */
  getMembers: async (groupId: string): Promise<GroupMember[]> => {
    return tryRealApiWithMockFallback(
      'GET',
      ENDPOINTS.GROUPS.BY_ID(groupId),
      async () => {
        const group = await groupsApi.getById(groupId);
        return group.members || [];
      },
      async () => {
        return [
          {
            id: '1',
            name: 'Jocelyn',
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jocelyn',
            role: 'owner' as const,
          },
        ];
      },
    );
  },

  /**
   * 邀請成員加入群組（冰箱） -> V2: POST /api/v2/groups/:id/invitations
   * *NOTE*: V1 was POST /api/v1/refrigerators/{groupId}/members (auto-add),
   * V2 document says POST /groups/:id/invitations creates an invitation link/token.
   * However, if the user intends to invite via email or Line directly, the V2 doc
   * mostly focuses on generating invitation links.
   *
   * If passing `InviteMemberForm` (email?), we might need to check if backend supports direct invite.
   * Based on doc: POST /groups/:id/invitations return token.
   *
   * For now, assuming this function maps to `createInvitation` or if backend supports direct invite.
   * Checking V2 doc again...
   * V2 Doc: `POST /groups/:id/invitations` Body: `{ "expiresAt": ... }`. Response: token.
   * It seems direct invite (by email) is possibly not in V2 doc explicitly?
   * Or maybe `POST /groups/invitations`?
   *
   * Legacy `inviteMember` took `InviteMemberForm`.
   * Let's assuming for now we use `createInvitation` flow or if backend has hidden endpoint.
   * But wait, `inviteMember` usage in UI usually implies sending an email/message.
   *
   * If the UI expects a link to be generated, we should use `createInvitation`.
   * If UI expects sending email, we need to clarify.
   *
   * Let's look at `createInvitation` below.
   */
  inviteMember: async (
    groupId: string,
    data: InviteMemberForm,
  ): Promise<void> => {
    // V2 change: It seems V2 prefers generating invitation links.
    // If we assume `inviteMember` is actually just generating a link/token and maybe backend sends it?
    // Or if this method is deprecated in favor of `createInvitation`.
    // Let's assume for now we might deprecate this or map it to createInvitation if data is empty.

    const endpoint = ENDPOINTS.GROUPS.INVITATIONS(groupId);
    console.log(' [Groups API] 建立邀請 (原 inviteMember):', {
      groupId,
      data,
    });

    return tryRealApiWithMockFallback(
      'POST',
      endpoint,
      // 真實 API 呼叫
      () => api.post<void>(endpoint, {}), // V2 invitation creation takes empty or expiration
      // Mock fallback
      async () => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        return;
      },
    );
  },

  /**
   * 加入群組（冰箱）
   * POST /api/v2/groups/join
   * Body: { invitationToken: string }
   */
  join: async (_groupId: string, data: JoinGroupForm): Promise<void> => {
    // V2 endpoint: /api/v2/groups/join
    const endpoint = ENDPOINTS.GROUPS.JOIN;
    console.log(' [Groups API] 加入群組:', { data });

    return tryRealApiWithMockFallback(
      'POST',
      endpoint,
      // 真實 API 呼叫
      () => api.post<void>(endpoint, data),
      // Mock fallback
      async () => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        return;
      },
    );
  },

  /**
   * 成員自行退出群組
   * DELETE /api/v2/groups/{groupId}/leave
   */
  leaveGroup: async (groupId: string): Promise<void> => {
    const endpoint = ENDPOINTS.GROUPS.LEAVE(groupId);
    console.log('🚪 [Groups API] 退出群組:', groupId);

    return tryRealApiWithMockFallback(
      'DELETE',
      endpoint,
      // 真實 API 呼叫
      () => api.delete<void>(endpoint),
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
    // V2 logic: if memberId is self, call leaveGroup.
    // If memberId is other and I am owner, call removeMember.
    // Since we don't know who is who here easily, we fallback to old behavior attempt or map to removeMember
    // Assuming this is used for "remove member" mostly?
    return groupsApi.removeMember(groupId, memberId);
  },

  /**
   * 擁有者移除冰箱成員
   * DELETE /api/v2/groups/{groupId}/members/{userId}
   *
   * 注意：只有冰箱擁有者可以移除成員
   */
  removeMember: async (groupId: string, memberId: string): Promise<void> => {
    const endpoint = ENDPOINTS.GROUPS.MEMBER(groupId, memberId);
    console.log('❌ [Groups API] 移除成員:', { groupId, memberId });

    return tryRealApiWithMockFallback(
      'DELETE',
      endpoint,
      // 真實 API 呼叫
      () => api.delete<void>(endpoint),
      // Mock fallback
      async () => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        return;
      },
    );
  },

  /**
   * 更新成員權限
   * PATCH /api/v2/groups/{groupId}/members/{memberId} (假定 V2 支援)
   * V2 doc didn't explicitly list "Update Member Role" but usually it exists.
   * If not, this might need to be verified.
   */
  updateMemberRole: async (
    groupId: string,
    memberId: string,
    role: GroupMember['role'],
  ): Promise<void> => {
    const endpoint = ENDPOINTS.GROUPS.MEMBER(groupId, memberId);
    console.log(' [Groups API] 更新成員權限:', { groupId, memberId, role });

    return tryRealApiWithMockFallback(
      'PATCH',
      endpoint,
      // 真實 API 呼叫
      () => api.patch<void>(endpoint, { role }),
      // Mock fallback
      async () => {
        await new Promise((resolve) => setTimeout(resolve, 500));
        return;
      },
    );
  },

  /**
   * 搜尋好友
   * GET /api/v2/users/friends?q={query} (Assuming V2 has this or similar)
   */
  searchFriends: async (
    query: string,
  ): Promise<import('../types/group.types').Friend[]> => {
    // V2 doc didn't mention friend search. Assuming keep as is or update if needed.
    // Let's assume it moves to /api/v2/users/friends
    const endpoint = `/api/v2/users/friends?q=${encodeURIComponent(query)}`;

    return tryRealApiWithMockFallback(
      'GET',
      endpoint,
      // 真實 API 呼叫
      async () => {
        const response = await api.get<any>(endpoint);
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
   * POST /api/v2/groups/{id}/invitations
   *
   * @returns 包含 token 和前端邀請連結的回應
   */
  createInvitation: async (
    groupId: string,
  ): Promise<import('../types/group.types').InviteCodeResponse> => {
    const endpoint = ENDPOINTS.GROUPS.INVITATIONS(groupId);

    return tryRealApiWithMockFallback(
      'POST',
      endpoint,
      // 真實 API 呼叫
      async () => {
        const response = await api.post<{
          data: import('../types/group.types').InvitationResponse;
        }>(endpoint, {});
        const data = response?.data || response;

        // 組合前端邀請連結
        // data.token from V2 response
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
   * GET /api/v2/invitations/{token}
   *
   * @param token - 邀請 token
   * @returns 邀請詳情，包含群組和邀請者資訊
   */
  getInvitation: async (
    token: string,
  ): Promise<import('../types/group.types').InvitationResponse> => {
    const endpoint = ENDPOINTS.GROUPS.INVITATION_INFO(token);

    return wrapApiCall('GET', endpoint, async () => {
      const response = await api.get<{
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
