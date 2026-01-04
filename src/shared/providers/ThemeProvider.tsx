/**
 * 主題 Provider
 * 管理應用程式的主題狀態，包含主題選擇、儲存與同步
 *
 * 判斷初次登入條件：使用後端 Profile API 的 avatar 欄位
 * - 若 avatar 為空字串，則視為初次登入，顯示主題選擇面板
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
import {
  THEMES,
  getThemeById,
  DEFAULT_THEME_ID,
  type Theme,
} from '@/shared/constants/themes';

/** localStorage 儲存 key（僅用於暫存選擇的主題 ID） */
const THEME_ID_KEY = 'selectedThemeId';

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
  /** 設定主題（儲存到 localStorage 與後端） */
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
 * 從 localStorage 取得已儲存的主題 ID
 */
const getSavedThemeId = (): number => {
  const saved = localStorage.getItem(THEME_ID_KEY);
  if (saved) {
    const parsed = parseInt(saved, 10);
    if (!isNaN(parsed) && parsed >= 1 && parsed <= THEMES.length) {
      return parsed;
    }
  }
  return DEFAULT_THEME_ID;
};

/**
 * 主題 Provider 元件
 */
export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const { user } = useAuth();

  // 取得最新的 Profile 資料來判斷是否為初次登入
  const { data: profileData } = useGetUserProfileQuery();

  const [currentThemeId, setCurrentThemeId] = useState(getSavedThemeId);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  /**
   * 判斷是否為初次登入：
   * - 用戶已登入
   * - Profile 的 avatar 或 name 欄位為空
   * - 尚未在本次 session 中關閉過 modal
   */
  const isFirstLogin = useMemo(() => {
    if (!user || !profileData) return false;
    // avatar 或 name 為空表示用戶尚未完成初次設定
    const isAvatarEmpty = !profileData.avatar || profileData.avatar === '';
    const isNameEmpty = !profileData.name || profileData.name.trim() === '';
    return isAvatarEmpty || isNameEmpty;
  }, [user, profileData]);

  /**
   * 設定主題並儲存到 localStorage
   */
  const setTheme = useCallback(async (themeId: number) => {
    // 驗證 themeId 有效性
    if (themeId < 1 || themeId > THEMES.length) {
      console.warn(`[ThemeProvider] Invalid themeId: ${themeId}`);
      return;
    }

    setIsLoading(true);

    try {
      // 儲存到 localStorage
      localStorage.setItem(THEME_ID_KEY, String(themeId));

      setCurrentThemeId(themeId);
      setIsDismissed(true);

      console.log(`[ThemeProvider] Theme ${themeId} saved to localStorage`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * 關閉主題選擇 Modal
   * 這只會設定本次 session 的狀態，下次登入若 avatar 仍為空則仍會顯示
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
      shouldShowThemeModal: isFirstLogin && !isDismissed,
      dismissThemeModal,
      isLoading,
    }),
    [
      currentThemeId,
      setTheme,
      isFirstLogin,
      isDismissed,
      dismissThemeModal,
      isLoading,
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
