import { Button } from '@/shared/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronDown } from 'lucide-react';

const MOCK_GROUPS = [
  {
    id: '1',
    name: 'My Home',
    admin: 'Jocelyn',
    members: [
      { id: 1, avatar: 'bg-red-200' },
      { id: 2, avatar: 'bg-orange-200' },
      { id: 3, avatar: 'bg-amber-200' },
    ],
    color: 'bg-red-100',
    characterColor: 'bg-red-400',
  },
  {
    id: '2',
    name: 'R Home',
    admin: 'Ricky',
    members: [
      { id: 4, avatar: 'bg-blue-200' },
      { id: 5, avatar: 'bg-indigo-200' },
      { id: 6, avatar: 'bg-violet-200' },
    ],
    color: 'bg-white',
    characterColor: 'bg-red-400',
  },
  {
    id: '3',
    name: 'Z Home',
    admin: 'Zoe',
    members: [
      { id: 7, avatar: 'bg-green-200' },
      { id: 8, avatar: 'bg-emerald-200' },
      { id: 9, avatar: 'bg-teal-200' },
    ],
    color: 'bg-white',
    characterColor: 'bg-red-400',
  },
];

const GroupSettings = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-stone-50">
      {/* Header */}
      <div className="bg-white p-4 flex items-center justify-between sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="p-2">
          <ChevronLeft className="w-6 h-6 text-stone-600" />
        </button>
        <h1 className="text-lg font-medium text-stone-800">群組設定</h1>
        <div className="w-10" /> {/* Spacer for centering */}
      </div>

      <div className="p-4 flex flex-col gap-6">
        {/* Create Group Button */}
        <Button 
          className="w-full bg-[#EE5D50] hover:bg-[#D94A3D] text-white h-12 text-base rounded-xl shadow-sm"
        >
          建立群組
        </Button>

        {/* Groups List */}
        <div className="flex flex-col gap-4">
          <h2 className="text-sm text-stone-500 font-medium">群組</h2>
          
          {MOCK_GROUPS.map((group) => (
            <div key={group.id} className={`rounded-3xl p-4 border border-stone-100 shadow-sm ${group.color}`}>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className={`text-lg font-bold ${group.id === '1' ? 'text-[#EE5D50]' : 'text-[#EE5D50]'}`}>{group.name}</h3>
                  <p className="text-xs text-stone-500 mt-1">管理員 {group.admin}</p>
                </div>
                {/* Character Placeholder */}
                <div className={`w-24 h-24 ${group.characterColor} rounded-full opacity-80 -mt-2 -mr-2`} />
              </div>

              <div className="flex items-center gap-1 mb-4">
                <span className="text-xs text-stone-500 mr-2">成員 ({group.members.length})</span>
                <div className="flex -space-x-2">
                  {group.members.map((member) => (
                    <div key={member.id} className={`w-8 h-8 rounded-full border-2 border-white ${member.avatar}`} />
                  ))}
                </div>
              </div>

              {group.id === '1' ? (
                <div className="flex flex-col gap-3">
                  <Button 
                    className="w-full bg-[#EE5D50] hover:bg-[#D94A3D] text-white h-10 rounded-xl text-sm"
                    onClick={() => navigate('/group/members')}
                  >
                    編輯成員
                  </Button>
                  <Button 
                    variant="outline"
                    className="w-full border-stone-200 text-stone-700 h-10 rounded-xl text-sm bg-white"
                  >
                    修改群組內容
                  </Button>
                </div>
              ) : (
                <div className="flex justify-center mt-2">
                   <ChevronDown className="w-6 h-6 text-stone-400" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GroupSettings;
