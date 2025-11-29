/**
 * 群組成員型別
 */
export type GroupMember = {
  id: string;
  name: string;
  avatar: string;
  role: 'owner' | 'organizer' | 'member';
};

/**
 * 群組型別
 */
export type Group = {
  id: string;
  name: string;
  admin: string;
  members: GroupMember[];
  color: string;
  characterColor: string;
  plan: 'free' | 'premium';
  createdAt: Date;
  updatedAt: Date;
};

/**
 * 群組建立表單型別
 */
export type CreateGroupForm = Pick<Group, 'name' | 'color' | 'characterColor'>;

/**
 * 群組更新表單型別
 */
export type UpdateGroupForm = Partial<Pick<Group, 'name' | 'color' | 'characterColor'>>;

/**
 * 成員邀請表單型別
 */
export type InviteMemberForm = {
  email: string;
  role?: GroupMember['role'];
};

/**
 * Modal 狀態型別
 */
export type GroupModalView = 'list' | 'create' | 'edit' | 'members';
