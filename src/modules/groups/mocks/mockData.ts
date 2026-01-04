import Group01 from '@/assets/images/group/01-group.png';
import Group02 from '@/assets/images/group/02-group.png';
import Group03 from '@/assets/images/group/03-group.png';

// User Avatars from auth folder
import avatar1 from '@/assets/images/auth/Avatar-1.png';
import avatar2 from '@/assets/images/auth/Avatar-2.png';
import avatar3 from '@/assets/images/auth/Avatar-3.png';

import type { Group, GroupMember } from '../types/group.types';

export const mockAvatars = {
  jocelyn: avatar1,
  ricky: avatar2,
  zoe: avatar3,
};

export const mockMembers: GroupMember[] = [
  { id: '1', name: 'Jocelyn', role: 'owner', avatar: avatar1 },
  { id: '2', name: 'Zoe', role: 'member', avatar: avatar2 },
  { id: '3', name: 'Ricky', role: 'member', avatar: avatar3 },
];

export const mockGroups: Group[] = [
  {
    id: '1',
    name: 'My Home',
    admin: 'Jocelyn',
    members: mockMembers,
    imageUrl: Group01,
    plan: 'free',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    name: 'R Home',
    admin: 'Ricky',
    members: mockMembers,
    imageUrl: Group02,
    plan: 'free',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    name: 'Z Home',
    admin: 'Zoe',
    members: mockMembers,
    imageUrl: Group03,
    plan: 'free',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];
