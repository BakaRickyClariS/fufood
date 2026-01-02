/**
 * Device Utility Functions
 *
 * 平台偵測工具，用於識別裝置類型和功能支援
 */

/**
 * 偵測是否為 iOS 裝置
 */
export const isIOS = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
};

/**
 * 偵測是否為 Android 裝置
 */
export const isAndroid = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  return /android/i.test(navigator.userAgent);
};

/**
 * 偵測是否為 iOS PWA（已安裝到主畫面）
 */
export const isIOSPWA = (): boolean => {
  if (typeof window === 'undefined') return false;

  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as any).standalone === true;

  return isIOS() && isStandalone;
};

/**
 * 偵測是否為任意 PWA（已安裝到主畫面）
 */
export const isPWA = (): boolean => {
  if (typeof window === 'undefined') return false;

  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as any).standalone === true
  );
};

/**
 * 偵測是否支援 FCM 推播
 *
 * iOS Safari 不支援 FCM 的 Service Worker，需使用 In-App Polling
 */
export const supportsFCMPush = (): boolean => {
  if (typeof window === 'undefined') return false;

  // iOS 不支援 FCM 推播（需要 APNs 配置）
  if (isIOS()) return false;

  // 檢查基本的 Push API 支援
  return (
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
};

/**
 * 偵測裝置平台類型
 */
export const detectPlatform = (): 'ios' | 'android' | 'web' => {
  if (isIOS()) return 'ios';
  if (isAndroid()) return 'android';
  return 'web';
};
