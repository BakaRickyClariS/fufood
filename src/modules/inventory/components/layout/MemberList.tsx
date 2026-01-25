import jocelynImg from '@/assets/images/inventory/members-jo.webp';
import rickyImg from '@/assets/images/inventory/members-ri.webp';
import zoeImg from '@/assets/images/inventory/members-zo.webp';
import type React from 'react';

const members = [
  { name: 'Jocelyn', img: jocelynImg },
  { name: 'Ricky', img: rickyImg },
  { name: 'Zoe', img: zoeImg },
];

const MemberList: React.FC = () => (
  <div className="w-full bg-white py-6 flex flex-col items-center justify-center shadow-sm">
    <div className="flex items-center justify-center -space-x-6 mb-3">
      {members.map((m) => (
        <div
          key={m.name}
          className="relative w-20 h-20 rounded-full overflow-hidden bg-white border-[3px] border-neutral-500"
        >
          <img
            src={m.img}
            alt={m.name}
            className="w-full h-full object-cover"
          />
        </div>
      ))}
    </div>
    <h2 className="text-lg font-bold text-neutral-900">家人共享</h2>
  </div>
);

export default MemberList;
