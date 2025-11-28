import React from 'react';

type MemberAvatarProps = {
  img?: string; // 頭像圖片
  name: string; // 成員名稱
  isActive?: boolean; // 是否選取（紅色外框）
  isInvite?: boolean; // 是否是「邀請成員」
  onClick?: () => void;
};

const MemberAvatar: React.FC<MemberAvatarProps> = ({
  img,
  name,
  isActive = false,
  isInvite = false,
  onClick,
}) => (
  <div
    className="flex flex-col items-center cursor-pointer min-w-15"
    onClick={onClick}
  >
    <div
      className={`
          flex items-center justify-center w-full max-h-20 aspect-square rounded-full bg-white transition-all p-0.5
          ${isActive ? 'border-2 border-[#FF6A6A]' : ''}
        `}
    >
      {isInvite ? (
        <div className="flex items-center justify-center w-full h-full rounded-full aspect-square overflow-hidden border border-neutral-200">
          <span className="text-3xl text-neutral-500 aspect-square">+</span>
        </div>
      ) : (
        <div className="w-full h-full rounded-full aspect-square overflow-hidden border border-neutral-500">
          <img src={img} alt={name} className="w-full h-full  object-cover" />
        </div>
      )}
    </div>

    <p className="text-xs mt-2 text-neutral-700">{name}</p>
  </div>
);

export default MemberAvatar;
