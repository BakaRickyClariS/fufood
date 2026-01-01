import { router } from '@/routes';
import { RouterProvider } from 'react-router-dom';
import { registerSW } from 'virtual:pwa-register';
import { SWPrompt } from '@/shared/components/feedback/SWPrompt';
import { useEffect, useRef, useState } from 'react';
import { requestNotificationPermission } from '@/lib/firebase';
import { SplashScreen } from '@/shared/components/SplashScreen';
import { gsap } from 'gsap';
import { Toaster } from 'sonner';

const App: React.FC = () => {
  const [needRefresh, setNeedRefresh] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const splashRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const updateSW =
    useRef<(reloadPage?: boolean) => Promise<void> | void>(undefined);

  useEffect(() => {
    // 推播通知初始設定
    const initPushNotification = async () => {
      // 僅在生產環境或明確啟用時請求權限，避免開發時頻繁跳出
      // 這裡暫時每次都執行，方便測試
      const token = await requestNotificationPermission();
      if (token) {
        // TODO: Send token to backend
        console.log('Push Token obtained:', token);
      }
    };
    initPushNotification();

    // Foreground message listener
    import('@/lib/firebase').then(({ onMessageListener }) => {
      onMessageListener((payload: any) => {
        if (payload?.notification) {
          const { title, body } = payload.notification;
          import('sonner').then(({ toast }) => {
            toast.success(title || 'Fufood 通知', {
              description: body,
            });
          });
        }
      });
    });

    updateSW.current = registerSW({
      onNeedRefresh() {
        setNeedRefresh(true);
      },
    });

    // 載入畫面控制
    const timer = setTimeout(() => {
      const tl = gsap.timeline();

      if (splashRef.current) {
        tl.to(splashRef.current, {
          opacity: 0,
          duration: 0.5,
          ease: 'power2.inOut',
          onComplete: () => {
            setShowSplash(false);
          },
        });
      }

      // 內容淡入
      if (contentRef.current) {
        // 在 Splash 淡出開始後 0.1 秒開始淡入內容
        tl.to(
          contentRef.current,
          {
            opacity: 1,
            duration: 0.5,
            ease: 'power2.out',
          },
          '<0.1', // 稍微重疊動畫
        );
      }
    }, 2000); // 顯示至少 2 秒

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {showSplash && (
        <div ref={splashRef}>
          <SplashScreen />
        </div>
      )}

      <div ref={contentRef} style={{ opacity: 0 }}>
        <RouterProvider router={router} />
      </div>
      <Toaster position="top-center" richColors />
      <SWPrompt
        show={needRefresh}
        onUpdate={() => {
          updateSW.current?.();
        }}
        onClose={() => setNeedRefresh(false)}
      />
    </>
  );
};

export default App;
