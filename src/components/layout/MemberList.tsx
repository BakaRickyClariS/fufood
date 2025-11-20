import MemberAvatar from '../ui/MemberAvatar';
import jocelynImg from '@/assets/images/inventory/members-jo.png';
import rickyImg from '@/assets/images/inventory/members-ri.png';
import zoeImg from '@/assets/images/inventory/members-zo.png';
import type React from 'react';

const members = [
  { name: 'Jocelyn', img: jocelynImg, active: true },
  { name: 'Ricky', img: rickyImg },
  { name: 'Zoe', img: zoeImg },
];

const MemberList: React.FC = () => {
  return (
    <div className="flex items-center gap-6 px-3 py-4 ">
      <MemberAvatar name="邀請成員" isInvite />
      {members.map((m) => (
        <MemberAvatar
          key={m.name}
          name={m.name}
          img={m.img}
          isActive={m.active}
        />
      ))}
    </div>
  );
};

export default MemberList;
