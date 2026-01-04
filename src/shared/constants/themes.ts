/**
 * 主題常數檔案
 * 定義所有主題的圖片對應關係
 */

// 匯入所有大頭貼圖片
import Avatar1 from '@/assets/images/auth/Avatar-1.png';
import Avatar2 from '@/assets/images/auth/Avatar-2.png';
import Avatar3 from '@/assets/images/auth/Avatar-3.png';
import Avatar4 from '@/assets/images/auth/Avatar-4.png';
import Avatar5 from '@/assets/images/auth/Avatar-5.png';
import Avatar6 from '@/assets/images/auth/Avatar-6.png';
import Avatar7 from '@/assets/images/auth/Avatar-7.png';
import Avatar8 from '@/assets/images/auth/Avatar-8.png';

// 匯入所有首頁橫幅圖片
import Home01 from '@/assets/images/group/01-home.png';
import Home02 from '@/assets/images/group/02-home.png';
import Home03 from '@/assets/images/group/03-home.png';
import Home04 from '@/assets/images/group/04-home.png';
import Home05 from '@/assets/images/group/05-home.png';
import Home06 from '@/assets/images/group/06-home.png';
import Home07 from '@/assets/images/group/07-home.png';
import Home08 from '@/assets/images/group/08-home.png';

// 匯入所有群組卡片圖片
import Group01 from '@/assets/images/group/01-group.png';
import Group02 from '@/assets/images/group/02-group.png';
import Group03 from '@/assets/images/group/03-group.png';
import Group04 from '@/assets/images/group/04-group.png';
import Group05 from '@/assets/images/group/05-group.png';
import Group06 from '@/assets/images/group/06-group.png';
import Group07 from '@/assets/images/group/07-group.png';
import Group08 from '@/assets/images/group/08-group.png';

/**
 * 主題型別定義
 */
export type Theme = {
  id: number;
  name: string;
  avatar: string;      // 大頭貼
  homeBanner: string;  // Dashboard 橫幅
  groupImage: string;  // 群組卡片圖片
};

/**
 * 所有可用主題列表
 */
export const THEMES: Theme[] = [
  { id: 1, name: '阿福', avatar: Avatar1, homeBanner: Home01, groupImage: Group01 },
  { id: 2, name: '綠精靈', avatar: Avatar2, homeBanner: Home02, groupImage: Group02 },
  { id: 3, name: '雲端精靈', avatar: Avatar3, homeBanner: Home03, groupImage: Group03 },
  { id: 4, name: '食譜助手', avatar: Avatar4, homeBanner: Home04, groupImage: Group04 },
  { id: 5, name: '冰箱', avatar: Avatar5, homeBanner: Home05, groupImage: Group05 },
  { id: 6, name: '卓伊', avatar: Avatar6, homeBanner: Home06, groupImage: Group06 },
  { id: 7, name: '瑞奇', avatar: Avatar7, homeBanner: Home07, groupImage: Group07 },
  { id: 8, name: '喬斯林', avatar: Avatar8, homeBanner: Home08, groupImage: Group08 },
];

/**
 * 預設主題 ID
 */
export const DEFAULT_THEME_ID = 1;

/**
 * 根據主題 ID 取得主題
 * @param id 主題 ID
 * @returns 對應的主題，若找不到則回傳預設主題
 */
export const getThemeById = (id: number): Theme =>
  THEMES.find((t) => t.id === id) || THEMES[0];

/**
 * 從 avatar 字串解析主題 ID
 * @param avatar Profile API 回傳的 avatar 欄位
 * @returns 主題 ID，解析失敗則回傳預設值
 */
export const parseThemeIdFromAvatar = (avatar?: string | null): number => {
  if (!avatar) return DEFAULT_THEME_ID;
  const parsed = parseInt(avatar, 10);
  if (isNaN(parsed) || parsed < 1 || parsed > THEMES.length) {
    return DEFAULT_THEME_ID;
  }
  return parsed;
};
