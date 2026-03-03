import { useContext } from 'react';
import { FCMContext, type FCMContextValue } from '../providers/FCMProvider';

/**
 * 取得 FCM 推播通知的狀態和方法
 *
 * @example
 * ```tsx
 * const { permission, requestPermission, isLoading } = useFCMContext();
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
