import { Button } from '@/shared/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const MOCK_MEMBERS = [
  { id: 1, name: 'Jocelyn (你)', role: '擁有者', avatar: 'bg-red-200' },
  { id: 2, name: 'Zoe', role: '組織者', avatar: 'bg-orange-200' },
  { id: 3, name: 'Ricky', role: '組織者', avatar: 'bg-amber-200' },
];

const GroupMembers = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-stone-50">
      {/* Header */}
      <div className="bg-white p-4 flex items-center justify-between sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="p-2">
          <ChevronLeft className="w-6 h-6 text-stone-600" />
        </button>
        <h1 className="text-lg font-medium text-stone-800">編輯成員</h1>
        <div className="w-10" /> {/* Spacer */}
      </div>

      <div className="p-4 flex flex-col gap-6">
        {/* Group Info Card */}
        <div className="bg-white rounded-3xl p-6 relative overflow-hidden shadow-sm">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-1 bg-[#E8DCC6] px-2 py-1 rounded-md text-xs text-[#8B5E3C] font-medium mb-2">
              <span>Free</span>
            </div>
            <h2 className="text-xl font-bold text-[#EE5D50] mb-1">My Home</h2>
            <p className="text-sm text-stone-500">管理員 Jocelyn</p>
          </div>
          
          {/* Character Illustration (Placeholder) */}
          <div className="absolute right-[-20px] bottom-[-20px] w-40 h-40 bg-red-400 rounded-full opacity-80" />
          <div className="absolute right-[60px] bottom-[20px] w-24 h-24 bg-red-300 rounded-full opacity-90" />
        </div>

        {/* Members List */}
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-stone-500 font-medium">成員 {MOCK_MEMBERS.length}</span>
            <button className="text-sm text-[#EE5D50] font-medium">刪除成員</button>
          </div>

          <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
            {MOCK_MEMBERS.map((member, index) => (
              <div key={member.id} className={`flex items-center justify-between p-4 ${index !== MOCK_MEMBERS.length - 1 ? 'border-b border-stone-100' : ''}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full ${member.avatar}`} />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-stone-800">{member.name}</span>
                    <span className="text-xs text-stone-400">{member.role}</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-stone-300" />
              </div>
            ))}
          </div>
        </div>

        {/* Invite Button */}
        <div className="mt-auto">
          <Button 
            className="w-full bg-[#EE5D50] hover:bg-[#D94A3D] text-white h-12 text-base rounded-xl shadow-sm"
          >
            邀請好友
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GroupMembers;
