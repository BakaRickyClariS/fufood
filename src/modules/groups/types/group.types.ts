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
  inviteCode: string;
};

export interface Friend {
  id: string;
  name: string;
  avatar: string;
  lineId?: string;
}

export interface InviteCodeResponse {
  code: string;
  expiry: string;
  qrUrl?: string;
}

export interface GroupModalView {
  type:
    | 'home'
    | 'settings'
    | 'create'
    | 'edit'
    | 'members'
    | 'invite'; // Added invite
  data?: any;
}
