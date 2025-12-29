/**
 * 群組成員型別
 */
export type GroupMember = {
  id: string;
  name: string;
  avatar: string;
  role: 'owner' | 'member';
};

/**
 * 群組型別
 */
export type Group = {
  id: string;
  name: string;
  admin?: string;
  members?: GroupMember[];
  imageUrl?: string;
  plan?: 'free' | 'premium';
  createdAt?: Date;
  updatedAt?: Date;
};

/**
 * 群組建立表單型別（對應後端 POST /api/v1/refrigerators）
 */
export type CreateGroupForm = {
  name: string;
  colour?: string;  // 選填，冰箱顏色
};

/**
 * 群組更新表單型別（對應後端 PUT /api/v1/refrigerators/:id）
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
 * 邀請 API 回應型別（對應後端 GET /api/v1/invitations/{token}）
 */
export type InvitationResponse = {
  id: string;
  token: string;
  refrigeratorId: string;
  refrigeratorName?: string;
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
