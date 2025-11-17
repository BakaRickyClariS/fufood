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
}) => {
  return (
    <div
      className="flex flex-col items-center cursor-pointer min-w-20"
      onClick={onClick}
    >
      <div
        className={`
          flex items-center justify-center w-full max-h-20 aspect-square rounded-full bg-white 
          shadow-sm transition-all 
          ${isActive ? 'border-2 border-[#FF6A6A]' : 'border border-neutral-200'}
        `}
      >
        {isInvite ? (
          <span className="text-3xl text-neutral-500">+</span>
        ) : (
          <img
            src={img}
            alt={name}
            className="w-full h-full rounded-full object-cover"
          />
        )}
      </div>

      <p className="text-xs mt-2 text-neutral-700">{name}</p>
    </div>
  );
};

export default MemberAvatar;
