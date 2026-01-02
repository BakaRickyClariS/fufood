import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { useFCM } from '@/hooks/useFCM';
import { useAuth } from '@/modules/auth/hooks/useAuth';
import { useNotificationPolling } from '@/modules/notifications/hooks';
import { isIOS, supportsFCMPush } from '@/shared/utils/deviceUtils';

type FCMContextValue = {
  /** FCM Token */
  token: string | null;
  /** 通知權限狀態 */
  permission: NotificationPermission;
  /** 是否正在載入 */
  isLoading: boolean;
  /** 錯誤訊息 */
  error: string | null;
  /** 請求權限並取得 Token */
  requestPermission: () => Promise<string | null>;
  /** 登出時解除註冊 Token */
  unregisterToken: () => Promise<boolean>;
  /** 瀏覽器是否支援推播 */
  isSupported: boolean;
  /** Token 是否已註冊到後端 */
  isRegistered: boolean;
  /** 是否為 iOS 裝置（使用 In-App Polling） */
  isIOSDevice: boolean;
};

const FCMContext = createContext<FCMContextValue | null>(null);

type FCMProviderProps = {
  children: ReactNode;
  /** 是否自動請求權限（預設 true，登入後自動請求） */
  autoRequest?: boolean;
  /** 收到前景訊息時的回調 */
  onMessageReceived?: (payload: any) => void;
};

/**
 * FCM Provider - 提供推播通知功能給整個應用程式
 *
 * - Android/Desktop: 使用 FCM 推播
 * - iOS: 使用 In-App Polling（每 30 秒刷新）
 *
 * @example
 * ```tsx
 * // 在 App.tsx 或 main.tsx 中使用
 * <FCMProvider autoRequest>
 *   <App />
 * </FCMProvider>
 * ```
 */
export const FCMProvider = ({
  children,
  autoRequest = true,
  onMessageReceived,
}: FCMProviderProps) => {
  const { user, isAuthenticated } = useAuth();

  // 偵測是否為 iOS 裝置
  const isIOSDevice = useMemo(() => isIOS(), []);
  const canUseFCM = useMemo(() => supportsFCMPush(), []);

  // iOS 不使用 FCM，跳過自動請求
  const fcm = useFCM({
    userId: isAuthenticated ? (user?.id ?? null) : null,
    autoRequest: autoRequest && isAuthenticated && canUseFCM,
    onMessageReceived,
  });

  // iOS 啟用 In-App Polling
  useNotificationPolling({
    enabled: isAuthenticated && isIOSDevice,
    interval: 30000, // 30 秒
  });

  // 組合 Context 值，iOS 上 isSupported 改為 false
  const contextValue = useMemo<FCMContextValue>(
    () => ({
      ...fcm,
      isSupported: canUseFCM,
      isIOSDevice,
    }),
    [fcm, canUseFCM, isIOSDevice],
  );

  return (
    <FCMContext.Provider value={contextValue}>{children}</FCMContext.Provider>
  );
};

/**
 * 取得 FCM 推播通知的狀態和方法
 *
 * @example
 * ```tsx
 * const { permission, requestPermission, isLoading, isIOSDevice } = useFCMContext();
 *
 * if (isIOSDevice) {
 *   return <p>iOS 使用 In-App 通知</p>;
 * }
 *
 * if (permission === 'default') {
 *   return <button onClick={requestPermission}>開啟通知</button>;
 * }
 * ```
 */
export const useFCMContext = (): FCMContextValue => {
  const context = useContext(FCMContext);

  if (!context) {
    throw new Error('useFCMContext must be used within a FCMProvider');
  }

  return context;
};

export default FCMProvider;
