import { useState, useEffect, useCallback, useRef } from 'react';
import { getToken } from 'firebase/messaging';
import { toast } from 'sonner';
import { aiApi } from '@/api/client';
import { messaging, onMessageListener } from '@/lib/firebase';

// Firebase 相關
const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

type UseFCMOptions = {
  /** 當前使用者 ID */
  userId: string | null;
  /** 是否自動請求權限（預設 false，避免太突兀） */
  autoRequest?: boolean;
  /** 收到前景訊息時的回調 */
  onMessageReceived?: (payload: any) => void;
};

type UseFCMReturn = {
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
};

/**
 * FCM (Firebase Cloud Messaging) 推播通知管理 Hook
 *
 * @example
 * ```tsx
 * const { permission, requestPermission, isLoading } = useFCM({
 *   userId: currentUser?.id,
 *   onMessageReceived: (payload) => {
 *     console.log('收到通知:', payload);
 *   }
 * });
 * ```
 */
export const useFCM = ({
  userId,
  autoRequest = false,
  onMessageReceived,
}: UseFCMOptions): UseFCMReturn => {
  const [token, setToken] = useState<string | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default',
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);

  // 避免重複請求權限
  const permissionRequestedRef = useRef(false);
  // 避免重複自動取得 Token
  const tokenFetchedRef = useRef(false);

  // 檢查瀏覽器支援
  const isSupported =
    typeof window !== 'undefined' &&
    typeof Notification !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window;

  /**
   * 註冊 Token 到後端
   * 注意：這裡需要明確傳入真正的 userId，因為 aiApi 預設會用 identity.getUserId()
   * 但那個函式回傳的是群組 ID，不是用戶 ID
   */
  const registerTokenToBackend = useCallback(
    async (fcmToken: string): Promise<boolean> => {
      if (!userId) {
        console.warn('[useFCM] 無法註冊 Token：userId 為空');
        return false;
      }

      try {
        // 明確傳入 X-User-Id header，覆蓋 aiApi 預設的群組 ID
        await aiApi.post(
          '/notifications/token',
          {
            fcmToken,
            platform: detectPlatform(),
          },
          {
            headers: {
              'X-User-Id': userId, // 使用真正的用戶 ID
            },
          },
        );

        console.log('[useFCM] ✅ Token 已註冊到後端，userId:', userId);
        setIsRegistered(true);
        return true;
      } catch (err) {
        console.error('[useFCM] ❌ 後端 Token 註冊失敗:', err);
        // 不阻塞流程，只是記錄錯誤
        return false;
      }
    },
    [userId],
  );

  /**
   * 請求通知權限並取得 FCM Token
   */
  const requestPermission = useCallback(async (): Promise<string | null> => {
    if (!isSupported) {
      setError('您的瀏覽器不支援推播通知');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      // 1. 請求通知權限
      const permissionResult = await Notification.requestPermission();
      setPermission(permissionResult);

      if (permissionResult !== 'granted') {
        setError('您已拒絕通知權限');
        return null;
      }

      // 2. Firebase messaging (Static)
      // const { messaging } = await import('@/lib/firebase'); // REMOVED dynamic import

      if (!messaging) {
        setError('Firebase Messaging 初始化失敗');
        return null;
      }

      // 3. 等待 Service Worker 準備就緒
      // 在獲取 Token 前，先檢查並清理舊的/預設的 Firebase Service Worker
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const reg of registrations) {
        if (reg.scope.includes('firebase-cloud-messaging-push-scope')) {
          console.log('[useFCM] 清理舊的 Firebase SW:', reg.scope);
          await reg.unregister();
        }
      }

      const registration = await navigator.serviceWorker.ready;

      // 4. 取得 FCM Token
      const fcmToken = await getToken(messaging, {
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: registration,
      });

      if (!fcmToken) {
        setError('無法取得 FCM Token');
        return null;
      }

      console.log('[useFCM] ✅ FCM Token:', fcmToken.substring(0, 30) + '...');
      setToken(fcmToken);

      // 5. 註冊到後端（背景執行，不阻塞）
      if (userId) {
        registerTokenToBackend(fcmToken);
      }

      return fcmToken;
    } catch (err: any) {
      console.error('[useFCM] ❌ FCM 初始化失敗:', err);
      setError(err.message || 'FCM 初始化失敗');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, userId, registerTokenToBackend]);

  /**
   * 監聽前景訊息
   */
  useEffect(() => {
    if (!isSupported || permission !== 'granted') return;

    let unsubscribe: (() => void) | undefined;

    const setupListener = async () => {
      try {
        // const { onMessageListener } = await import('@/lib/firebase'); // REMOVED dynamic import

        onMessageListener((payload: any) => {
          console.log('[useFCM] 📩 收到前景訊息:', payload);

          // 呼叫自訂回調
          onMessageReceived?.(payload);

          // 顯示通知
          if (payload?.notification) {
            const { title, body } = payload.notification;

            // 1. 顯示 Toast 通知（App 內）
            toast.success(title || 'FuFood 通知', {
              description: body,
            });

            // 2. 同時彈出系統通知（像背景一樣）
            if (Notification.permission === 'granted') {
              new Notification(title || 'FuFood 通知', {
                body: body,
                icon: '/pwa-192x192.png',
                data: payload.data,
              });
            }
          }
        });
      } catch (err) {
        console.error('[useFCM] 前景訊息監聽設定失敗:', err);
      }
    };

    setupListener();

    return () => {
      unsubscribe?.();
    };
  }, [isSupported, permission, onMessageReceived]);

  /**
   * 自動請求權限（當 permission === 'default' 時）
   */
  useEffect(() => {
    if (
      autoRequest &&
      userId &&
      permission === 'default' &&
      !permissionRequestedRef.current &&
      isSupported
    ) {
      permissionRequestedRef.current = true;
      // 延遲 3 秒避免太突兀
      const timer = setTimeout(() => {
        console.log('[useFCM] 自動請求通知權限...');
        requestPermission();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [autoRequest, userId, permission, isSupported, requestPermission]);

  /**
   * 當權限已經是 granted 但還沒有 token 時，自動取得 Token
   * 這處理了用戶之前已授權但 Token 過期/更新的情況
   */
  useEffect(() => {
    if (
      autoRequest &&
      userId &&
      permission === 'granted' &&
      !token &&
      !isLoading &&
      !tokenFetchedRef.current &&
      isSupported
    ) {
      tokenFetchedRef.current = true;
      console.log('[useFCM] 權限已授權，自動取得 Token...');
      requestPermission();
    }
  }, [
    autoRequest,
    userId,
    permission,
    token,
    isLoading,
    isSupported,
    requestPermission,
  ]);

  /**
   * userId 變更時重新註冊 Token
   */
  useEffect(() => {
    if (userId && token && !isRegistered) {
      registerTokenToBackend(token);
    }
  }, [userId, token, isRegistered, registerTokenToBackend]);

  /**
   * 登出時解除註冊 Token
   */
  const unregisterToken = useCallback(async (): Promise<boolean> => {
    if (!userId || !token) {
      console.warn('[useFCM] 無法解除註冊 Token：userId 或 token 為空');
      return false;
    }

    try {
      // 明確傳入 X-User-Id header，使用真正的用戶 ID
      await aiApi.delete('/notifications/token', {
        body: { fcmToken: token },
        headers: {
          'X-User-Id': userId,
        },
      });

      console.log('[useFCM] ✅ Token 已從後端刪除，userId:', userId);
      setIsRegistered(false);
      return true;
    } catch (err) {
      console.error('[useFCM] ❌ 後端 Token 刪除失敗:', err);
      return false;
    }
  }, [userId, token]);

  return {
    token,
    permission,
    isLoading,
    error,
    requestPermission,
    unregisterToken,
    isSupported,
    isRegistered,
  };
};

/**
 * 偵測裝置平台
 */
const detectPlatform = (): 'web' | 'ios' | 'android' => {
  const userAgent = navigator.userAgent.toLowerCase();

  if (/iphone|ipad|ipod/.test(userAgent)) {
    return 'ios';
  }
  if (/android/.test(userAgent)) {
    return 'android';
  }
  return 'web';
};

export default useFCM;
