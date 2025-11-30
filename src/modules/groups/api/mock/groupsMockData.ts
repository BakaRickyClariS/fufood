import type { Group, GroupMember } from '../../types/group.types';

export const MOCK_MEMBERS: GroupMember[] = [
  { id: '1', name: 'Jocelyn (你)', role: 'owner', avatar: 'bg-red-200' },
  { id: '2', name: 'Zoe', role: 'organizer', avatar: 'bg-orange-200' },
  { id: '3', name: 'Ricky', role: 'organizer', avatar: 'bg-amber-200' },
];

export const MOCK_GROUPS: Group[] = [
  {
    id: '1',
    name: 'My Home',
    admin: 'Jocelyn',
    members: MOCK_MEMBERS,
    color: 'bg-red-100',
    characterColor: 'bg-red-400',
    plan: 'free',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    name: 'JJ Home',
    admin: 'JJ',
    members: [{ id: '4', name: 'JJ', role: 'owner', avatar: 'bg-blue-200' }],
    color: 'bg-blue-100',
    characterColor: 'bg-blue-400',
    plan: 'free',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    name: 'Ricky Home',
    admin: 'Ricky',
    members: [
      { id: '3', name: 'Ricky', role: 'owner', avatar: 'bg-amber-200' },
    ],
    color: 'bg-amber-100',
    characterColor: 'bg-amber-400',
    plan: 'premium',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];
