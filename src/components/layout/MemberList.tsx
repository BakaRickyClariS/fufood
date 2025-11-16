import MemberAvatar from '../ui/MemberAvatar';
import jocelynImg from '@/assets/images/inventory/members-jo.png';
import rickyImg from '@/assets/images/inventory/members-ri.png';
import zoeImg from '@/assets/images/inventory/members-zo.png';

const members = [
  { name: 'Jocelyn', img: jocelynImg, active: true },
  { name: 'Ricky', img: rickyImg },
  { name: 'Zoe', img: zoeImg },
];

const MemberList: React.FC = () => {
  return (
    <div className="px-4 mt-4">
      <div
        className="bg-white rounded-3xl px-4 py-4 shadow-[0_6px_14px_-2px_rgba(0,0,0,0.06)] 
        relative overflow-hidden"
      >
        {/* 背景光暈（模糊紅光） */}
        <div
          className="absolute left-1/2 top-1/3 -translate-x-1/2 w-64 h-40 bg-red-100 
          opacity-40 blur-3xl rounded-full"
        ></div>

        <div className="flex items-center gap-6 relative z-10 overflow-x-auto no-scrollbar py-2">
          {/* 邀請成員 */}
          <MemberAvatar name="邀請成員" isInvite />

          {/* 其他成員 */}
          {members.map((m) => (
            <MemberAvatar
              key={m.name}
              name={m.name}
              img={m.img}
              isActive={m.active}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default MemberList;
