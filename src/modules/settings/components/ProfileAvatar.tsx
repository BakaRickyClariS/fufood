/**
 * ProfileAvatar - 頭像顯示元件
 *
 * 顯示用戶 LINE 大頭貼（大圈圈），帶有 LINE 圖示徽章（左下角）
 * 和可選的藍色標記徽章（右上角）
 */

import LineIcon from '@/assets/images/settings/line.svg';

type ProfileAvatarProps = {
  /** LINE 大頭貼 URL（顯示在大圈圈） */
  lineProfilePictureUrl?: string | null;
  alt: string;
  /** 右上角徽章文字（例如 "Z"） */
  badge?: string;
  /** 是否顯示 LINE 圖示 */
  showLineIcon?: boolean;
};

const ProfileAvatar = ({
  lineProfilePictureUrl,
  alt,
  showLineIcon = true,
}: ProfileAvatarProps) => {
  return (
    <div className="relative inline-block">
      {/* 頭像外圈 - 三層結構 */}
      {/* 1. 最外層紅色邊框 + 2. 中間白色間隙 (padding) */}
      <div className="w-32 h-32 rounded-full border-[3px] border-primary-400 p-1 bg-white">
        {/* 3. 最內層灰色邊框 + 圖片容器 */}
        <div className="w-full h-full rounded-full border border-neutral-500 overflow-hidden bg-neutral-100">
          {lineProfilePictureUrl ? (
            <img
              src={lineProfilePictureUrl}
              alt={alt}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-primary-300 text-4xl font-bold bg-primary-50">
              {alt.charAt(0)}
            </div>
          )}
        </div>
      </div>

      {/* 左下角 LINE 圖示 */}
      {showLineIcon && (
        <div className="absolute bottom-0 left-0 w-9 h-9 rounded-full flex items-center justify-center bg-[#3ACE01]">
          <img src={LineIcon} alt="LINE" className="w-5 h-5" />
        </div>
      )}
    </div>
  );
};

export default ProfileAvatar;
