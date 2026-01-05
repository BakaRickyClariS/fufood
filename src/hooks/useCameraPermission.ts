import { useState, useEffect, useCallback } from 'react';

type PermissionState = 'granted' | 'denied' | 'prompt' | 'unknown';

export const useCameraPermission = () => {
  const [permission, setPermission] = useState<PermissionState>('unknown');
  const [isLoading, setIsLoading] = useState(true);

  const checkPermission = useCallback(async () => {
    try {
      let apiState: PermissionState | null = null;

      // 1. 嘗試使用 Permissions API
      if (navigator.permissions && navigator.permissions.query) {
        try {
          const result = await navigator.permissions.query({
            name: 'camera' as any,
          });
          apiState = result.state;
          setPermission(result.state);

          result.onchange = () => {
            setPermission(result.state);
          };
        } catch (e) {
          // 瀏覽器不支援 'camera' 權限查詢，繼續使用 fallback
          console.warn(
            "Permissions API does not support 'camera' query, using fallback.",
            e,
          );
        }
      }

      // 2. Fallback: enumerateDevices (當 API 不支援或狀態為 prompt 時檢查)
      // 如果已有 label，代表其實是 granted
      if (!apiState || apiState === 'prompt') {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const hasCameraLabel = devices.some(
          (d) => d.kind === 'videoinput' && d.label.length > 0,
        );

        if (hasCameraLabel) {
          setPermission('granted');
        } else {
          setPermission(apiState || 'prompt');
        }
      }
    } catch (error) {
      console.warn('Check camera permission error:', error);
      setPermission('prompt');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  const requestPermission = useCallback(async () => {
    setIsLoading(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      // Granted
      setPermission('granted');
      // Stop immediately
      stream.getTracks().forEach((track) => track.stop());
    } catch (error) {
      console.error('Request camera permission denied:', error);
      setPermission('denied');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { permission, isLoading, requestPermission };
};
