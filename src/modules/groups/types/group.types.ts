/**
 * 群組成員型別
 */
export type GroupMember = {
  id: string;
  name: string;
  avatar: string; // 前端顯示用，對應 profilePictureUrl
  profilePictureUrl?: string; // 後端回傳原始欄位
  lineId?: string;
  role: 'owner' | 'member';
  createdAt?: string;
  updatedAt?: string;
};

/**
 * 群組型別
 */
export type Group = {
  id: string;
  name: string;
  ownerId?: string; // 群組擁有人 ID
  admin?: string; // 舊欄位，暫時保留相容
  members?: GroupMember[];
  imageUrl?: string;
  plan?: 'free' | 'premium';
  createdAt?: Date | string;
  updatedAt?: Date | string;
};

/**
 * 群組建立表單型別（對應後端 POST /api/v2/groups）
 */
export type CreateGroupForm = {
  name: string;
  colour?: string; // 選填，冰箱顏色
};

/**
 * 群組更新表單型別（對應後端 PUT /api/v2/groups/:id）
 */
export type UpdateGroupForm = {
  name?: string;
};

/**
 * 成員邀請表單型別
 */
export type InviteMemberForm = {
  email: string;
  role?: GroupMember['role'];
};

export type JoinGroupForm = {
  invitationToken: string;
};

export type Friend = {
  id: string;
  name: string;
  avatar: string;
  lineId?: string;
};

/**
 * 邀請建立者資訊
 */
export type InvitationCreator = {
  id: string;
  lineId?: string;
  name: string;
  profilePictureUrl?: string;
  subscriptionTier?: string;
};

/**
 * 邀請 API 回應型別（對應後端 GET /api/v2/invitations/{token} 或類似機制）
 */
export type InvitationResponse = {
  id: string;
  token: string;
  groupId: string;
  groupName?: string;
  invitedById: string;
  inviterName?: string;
  expiresAt: string;
  // 保留舊欄位以防萬一，但標記為可選
  createdAt?: string;
  updatedAt?: string;
};

/**
 * 邀請碼回應型別（前端使用）
 */
export type InviteCodeResponse = {
  // 新 API 格式
  token?: string;
  inviteUrl?: string;
  expiresAt?: string;
  // 舊 API 格式（保留相容性）
  code?: string;
  expiry?: string;
};

export interface GroupModalView {
  type: 'home' | 'settings' | 'create' | 'edit' | 'members' | 'invite'; // Added invite
  data?: any;
}
