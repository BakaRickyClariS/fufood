import type { FC } from 'react';
import { Button } from '@/shared/components/ui/button';
import type { Group } from '../../types/group.types';

type GroupCardProps = {
  group: Group;
  onEditMembers?: (group: Group) => void;
  onEditGroup?: (group: Group) => void;
};

/**
 * 群組卡片組件
 */
export const GroupCard: FC<GroupCardProps> = ({
  group,
  onEditMembers,
  onEditGroup,
}) => (
  <div
    className={`rounded-3xl p-4 border border-stone-100 shadow-sm ${group.color}`}
  >
    <div className="flex justify-between items-start mb-4">
      <div>
        <h3 className="text-lg font-bold text-[#EE5D50]">{group.name}</h3>
        <p className="text-xs text-stone-500 mt-1">管理員 {group.admin}</p>
      </div>
      {/* Character Placeholder */}
      <div
        className={`w-24 h-24 ${group.characterColor} rounded-full opacity-80 -mt-2 -mr-2`}
      />
    </div>

    {/* 成員區域 */}
    <div className="flex items-center gap-1 mb-4">
      <span className="text-xs text-stone-500 mr-2">
        成員 ({group.members.length})
      </span>
      <div className="flex -space-x-2">
        {group.members.map((member) => (
          <div
            key={member.id}
            className={`w-8 h-8 rounded-full border-2 border-white ${member.avatar}`}
          />
        ))}
      </div>
    </div>

    {/* 操作按鈕 */}
    <div className="flex flex-col gap-3">
      <Button
        className="w-full bg-[#EE5D50] hover:bg-[#D94A3D] text-white h-10 rounded-xl text-sm"
        onClick={() => onEditMembers?.(group)}
      >
        編輯成員
      </Button>
      <Button
        variant="outline"
        className="w-full border-stone-200 text-stone-700 h-10 rounded-xl text-sm bg-white hover:bg-stone-50"
        onClick={() => onEditGroup?.(group)}
      >
        修改群組內容
      </Button>
    </div>
  </div>
);
