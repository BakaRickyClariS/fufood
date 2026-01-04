/**
 * 主題 Provider
 * 管理應用程式的主題狀態，包含主題選擇、儲存與同步
 * 
 * 注意：主題 ID 目前儲存在 localStorage 而非 Profile API，
 * 因為後端 avatar 欄位可能有格式限制。
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
import {
  THEMES,
  getThemeById,
  DEFAULT_THEME_ID,
  type Theme,
} from '@/shared/constants/themes';

/** localStorage 儲存 key */
const HAS_SELECTED_THEME_KEY = 'hasSelectedTheme';
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
  /** 設定主題（儲存到 localStorage） */
  setTheme: (themeId: number) => Promise<void>;
  /** 是否應該顯示主題選擇 Modal（首次登入） */
  shouldShowThemeModal: boolean;
  /** 關閉主題選擇 Modal（不儲存選擇） */
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

  const [currentThemeId, setCurrentThemeId] = useState(getSavedThemeId);
  const [hasSelectedTheme, setHasSelectedTheme] = useState(
    () => localStorage.getItem(HAS_SELECTED_THEME_KEY) === 'true'
  );
  const [isLoading, setIsLoading] = useState(false);

  /**
   * 設定主題並儲存到 localStorage
   */
  const setTheme = useCallback(
    async (themeId: number) => {
      // 驗證 themeId 有效性
      if (themeId < 1 || themeId > THEMES.length) {
        console.warn(`[ThemeProvider] Invalid themeId: ${themeId}`);
        return;
      }

      setIsLoading(true);
      
      try {
        // 儲存到 localStorage
        localStorage.setItem(THEME_ID_KEY, String(themeId));
        localStorage.setItem(HAS_SELECTED_THEME_KEY, 'true');
        
        setCurrentThemeId(themeId);
        setHasSelectedTheme(true);
        
        console.log(`[ThemeProvider] Theme ${themeId} saved to localStorage`);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * 關閉主題選擇 Modal（不儲存選擇，使用預設主題）
   */
  const dismissThemeModal = useCallback(() => {
    localStorage.setItem(HAS_SELECTED_THEME_KEY, 'true');
    setHasSelectedTheme(true);
  }, []);

  const value: ThemeContextValue = useMemo(
    () => ({
      currentThemeId,
      currentTheme: getThemeById(currentThemeId),
      themes: THEMES,
      setTheme,
      shouldShowThemeModal: !hasSelectedTheme && !!user,
      dismissThemeModal,
      isLoading,
    }),
    [
      currentThemeId,
      setTheme,
      hasSelectedTheme,
      user,
      dismissThemeModal,
      isLoading,
    ]
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

