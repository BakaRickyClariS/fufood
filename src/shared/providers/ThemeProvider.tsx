/**
 * 主題 Provider
 * 管理應用程式的主題狀態，包含主題選擇、儲存與同步
 *
 * 設計變更：
 * - 主題 ID 儲存在 User Profile 的 avatar (profilePictureUrl) 欄位
 * - 不再使用 localStorage 儲存主題設定
 * - 透過 useGetUserProfileQuery 取得當前主題
 * - 透過 useUpdateProfileMutation 更新主題
 */

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import { useAuth } from '@/modules/auth';
import { useGetUserProfileQuery } from '@/modules/auth/api/queries';
import { useUpdateProfileMutation } from '@/modules/auth/api/mutations';
import {
  THEMES,
  getThemeById,
  DEFAULT_THEME_ID,
  parseThemeIdFromAvatar,
  type Theme,
} from '@/shared/constants/themes';

/**
 * Theme Context 值型別
 */
type ThemeContextValue = {
  /** 當前主題 ID */
  currentThemeId: number;
  /** 當前主題物件 */
  currentTheme: Theme;
  /** 所有可用主題 */
  themes: Theme[];
  /** 設定主題（同步到後端 Profile） */
  setTheme: (themeId: number) => Promise<void>;
  /** 是否應該顯示主題選擇 Modal（首次登入） */
  shouldShowThemeModal: boolean;
  /** 關閉主題選擇 Modal（套用預設值） */
  dismissThemeModal: () => void;
  /** 是否正在載入 */
  isLoading: boolean;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

type ThemeProviderProps = {
  children: ReactNode;
};

/**
 * 主題 Provider 元件
 */
export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const { user } = useAuth();

  // 取得 Profile 資料
  const { data: profileData, isLoading: isProfileLoading } =
    useGetUserProfileQuery();

  // 更新 Profile Mutation
  const updateProfile = useUpdateProfileMutation();

  // 本地狀態：是否已手動關閉 Modal (本次 session)
  const [isDismissed, setIsDismissed] = useState(false);

  // 計算當前主題 ID
  const currentThemeId = useMemo(() => {
    // 1. 如果有 Profile 資料，優先解析 avatar
    if (profileData?.avatar) {
      return parseThemeIdFromAvatar(profileData.avatar);
    }
    // 2. 如果沒有 Profile 資料（未登入或載入中），回傳預設值
    return DEFAULT_THEME_ID;
  }, [profileData]);

  /**
   * 判斷是否為初次登入：
   * - 用戶已登入
   * - Profile 的 avatar 為空或無法解析出有效主題
   * - 或者是明確的空字串 (新註冊用戶)
   * - 尚未在本次 session 中關閉過 modal
   *
   * 注意：parseThemeIdFromAvatar 若失敗會回傳 DEFAULT_THEME_ID，
   * 但我們想區分 "未設定" 和 "已設定但為預設值"。
   * 所以這裡直接檢查 avatar 字串。
   */
  const isFirstLogin = useMemo(() => {
    if (!user || !profileData) return false;

    // 如果 avatar 為空字串或 null/undefined，視為初次登入
    const isAvatarEmpty = !profileData.avatar || profileData.avatar === '';

    // 雙重檢查：如果解析出來是預設值，且 avatar 原始值不是 "1" (假設主題 1 的 ID 是 "1")
    // 這可能表示 avatar 是空的或者是無效值
    const isDefaultButNotSet =
      currentThemeId === DEFAULT_THEME_ID &&
      profileData.avatar !== String(DEFAULT_THEME_ID);

    return isAvatarEmpty || (isDefaultButNotSet && isAvatarEmpty);
  }, [user, profileData, currentThemeId]);

  /**
   * 設定主題並同步更新 Profile
   */
  const setTheme = useCallback(
    async (themeId: number) => {
      // 驗證 themeId 有效性
      if (themeId < 1 || themeId > THEMES.length) {
        console.warn(`[ThemeProvider] Invalid themeId: ${themeId}`);
        return;
      }

      try {
        // 呼叫 API 更新 Profile
        // 根據約定，將 themeId (string) 存入 profilePictureUrl
        await updateProfile.mutateAsync({
          avatar: String(themeId),
        });

        setIsDismissed(true);
        console.log(
          `[ThemeProvider] Theme updated to ${themeId} via Profile API`,
        );
      } catch (error) {
        console.error('[ThemeProvider] Failed to update theme:', error);
        // 這裡可以考慮加入 toast 通知錯誤
      }
    },
    [updateProfile],
  );

  /**
   * 關閉主題選擇 Modal
   */
  const dismissThemeModal = useCallback(() => {
    setIsDismissed(true);
  }, []);

  const value: ThemeContextValue = useMemo(
    () => ({
      currentThemeId,
      currentTheme: getThemeById(currentThemeId),
      themes: THEMES,
      setTheme,
      // 只有在是初次登入且尚未關閉時顯示
      shouldShowThemeModal: isFirstLogin && !isDismissed,
      dismissThemeModal,
      isLoading: isProfileLoading || updateProfile.isPending,
    }),
    [
      currentThemeId,
      setTheme,
      isFirstLogin,
      isDismissed,
      dismissThemeModal,
      isProfileLoading,
      updateProfile.isPending,
    ],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

/**
 * 使用主題的 Hook
 * @throws 若在 ThemeProvider 外使用會拋出錯誤
 */
export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
